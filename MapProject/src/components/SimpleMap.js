import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import MarkerClusterer from "@google/markerclustererplus";
import GoogleMapReact from "google-map-react";
import { fitBounds as baseFitBounds } from 'google-map-react/utils';
import Marker, { Types as MarkerTypes } from "./Marker";
import { Key } from "../key";
import Cluster from "./Cluster";
import { PageContext, PAGES } from "../App";
import { Dropdown, DropdownButton, Button, ButtonGroup } from "react-bootstrap";
import { createPortal } from "react-dom";
import getMarkerPositionLiteral from "../utils/getMarkerPositionLiteral";

function myFitBounds(googleBounds, googleMapRef) {
    let bounds = {
        ne: googleBounds.getNorthEast().toJSON(),
        sw: googleBounds.getSouthWest().toJSON(),
    };
    let size = {
        width: googleMapRef.current.getDiv().clientWidth,
        height: googleMapRef.current.getDiv().clientHeight,
    };
    return baseFitBounds(bounds, size);
}

const LocationDropdown = React.memo(({ location, onLocationSelect, target }) => {
    const dropdownButton = (
        <DropdownButton id="location-dropdown" variant="outline-dark" size='sm'
            title={location || '快速前往'} onSelect={onLocationSelect}
        >
            <Dropdown.Item eventKey="東京">東京</Dropdown.Item>
            <Dropdown.Item eventKey="大阪">大阪</Dropdown.Item>
            <Dropdown.Item eventKey="福岡、九州">福州、九州</Dropdown.Item>
            <Dropdown.Item eventKey="北海道">北海道</Dropdown.Item>
            <Dropdown.Item eventKey="四國">四國</Dropdown.Item>
            <Dropdown.Item eventKey="沖繩">沖繩</Dropdown.Item>
            <Dropdown.Item eventKey="東北">東北</Dropdown.Item>
        </DropdownButton>
    );
    return target ? createPortal(dropdownButton, target) : <></>;
});

export default React.memo(function SimpleMap({ onRouteClick,markers, onLocationSelect, onApiLoad, onShowDetailClick, ...props }) {
    const nowPage = useContext(PageContext);
    const [center, setCenter] = useState({ lat: 23.5998365, lng: 120.9780656 });// [35.6540969,139.6284394]東京
    const [zoom, setZoom] = useState(3);

    const [showingMarkers, setShowingMarkers] = useState([]);
    const [openingMarkerId, setOpeningMarkerId] = useState(null);

    const googleMapRef = useRef();//儲存map instance
    const googleRef = useRef();//儲存map class
    const markerClusterRef = useRef();//儲存叢集顯示器


    const [choicepoint, setChoicePoint] = useState([]);//儲存所有要路線規劃的座標
    const [choicecount, setChoiceCount] = useState(0);
    let directionsService = useRef();
    let directionsDisplay = useRef();
    const [line, setLine] = useState([]);

    

    useEffect(() => {
        const googleMarkers = markers.map((marker) => {
            let googleMarker = new googleRef.current.Marker({
                visible: false,
                position: getMarkerPositionLiteral(marker),
                icon: {
                    url: MarkerTypes[marker.icon_name].icon_url,
                    scaledSize: new googleRef.current.Size(30, 50),
                }
            });
            googleMarker.customData = marker;
            return googleMarker;
        });
        if (googleMarkers.length) {
            markerClusterRef.current.clearMarkers();
            markerClusterRef.current.addMarkers(googleMarkers);
        }
    }, [markers]);

    /******* 定義各項事件 ******/
    //當Google Api有成功加載後，儲存api，並獲取原始資料
    const handleGoogleApiLoaded = useCallback(({ map, maps }) => {
        googleMapRef.current = map;
        googleRef.current = maps;
        markerClusterRef.current = (() => {
            let mc = new MarkerClusterer(map, [], {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });
            let styles = mc.getStyles().map((style) => ({ ...style, className: 'd-none' }));//取得內建的style，並加入CSS class: d-none
            mc.setStyles(styles);//設定新的style
            mc.addListener('clusteringend', (mc) => {
                setShowingMarkers([...mc.getClusters()]);
            });
            return mc;
        })();
        onApiLoad();
    }, [onApiLoad]);
    //當點擊地圖時，關閉所有InfoWindow
    const handleClick = useCallback(() => {
        console.log('GoogleMapReact onMapClick');
        setOpeningMarkerId(null);
    }, []);
    //當點擊Marker時，移動到該Marker，並開關InfoWindow
    const handleMarkerClick = useCallback((marker) => {
        if (nowPage === PAGES.MAP) {
            setOpeningMarkerId((prev) => {
                return (prev === marker.id) ? null : marker.id;
            });

            const newCenter = (() => {
                let latLng = new googleRef.current.LatLng(marker.latitude, marker.longitude);
                let scale = 1 << zoom;
                let markerPoint = googleMapRef.current.getProjection().fromLatLngToPoint(latLng);
                let newCenterPixel = { x: markerPoint.x * scale, y: markerPoint.y * scale - 150 };
                let newCenterPoint = new googleRef.current.Point(newCenterPixel.x / scale, newCenterPixel.y / scale);
                return googleMapRef.current.getProjection().fromPointToLatLng(newCenterPoint);
            })();//google.map.LatLng
            setCenter(newCenter.toJSON());
        }
        if (nowPage === PAGES.PLANNING) {

            //PAGES.PLANNING
            setChoicePoint((prev) => {

                let lastPoint = prev[prev.length - 1];
                let newpoint = { lat: marker.latitude, lng: marker.longitude };
                const isAddToChoicePoint = prev.every((latLng, index, originArray) => {
                    if (latLng.lat === marker.latitude && latLng.lng === marker.longitude) {
                        let prevRouteUnique = true;
                        if (index !== 0) {
                            if (index === originArray.length - 1) {
                                prevRouteUnique = false;
                            } else {
                                let prevlatLng = originArray[index - 1];
                                if (prevlatLng.lat === lastPoint.lat && prevlatLng.lng === lastPoint.lng) {
                                    if (latLng.lat === marker.latitude && latLng.lng === marker.longitude) {
                                        prevRouteUnique = false;
                                    }
                                }
                                if (prevlatLng.lat === marker.latitude && prevlatLng.lng === marker.longitude) {
                                    if (latLng.lat === lastPoint.lat && latLng.lng === lastPoint.lng) {
                                        prevRouteUnique = false;
                                    }
                                }
                            }

                        }
                        let nextRouteUnique = true;
                        if (index !== originArray.length - 1) {

                            let nextlatLng = originArray[index + 1];
                            if (nextlatLng.lat === lastPoint.lat && nextlatLng.lng === lastPoint.lng) {
                                if (latLng.lat === marker.latitude && latLng.lng === marker.longitude) {
                                    nextRouteUnique = false;
                                }
                            }
                            if (nextlatLng.lat === marker.latitude && nextlatLng.lng === marker.longitude) {
                                if (latLng.lat === lastPoint.lat && latLng.lng === lastPoint.lng) {
                                    nextRouteUnique = false;
                                }
                            }
                        }
                        if (index === 0) {
                            if (index === originArray.length - 1) {
                                nextRouteUnique = false;
                            } else {
                                let nextlatLng = originArray[index + 1];
                                if (nextlatLng.lat === lastPoint.lat && nextlatLng.lng === lastPoint.lng) {
                                    if (latLng.lat === marker.latitude && latLng.lng === marker.longitude) {
                                        nextRouteUnique = false;
                                    }
                                }
                                if (nextlatLng.lat === marker.latitude && nextlatLng.lng === marker.longitude) {
                                    if (latLng.lat === lastPoint.lat && latLng.lng === lastPoint.lng) {
                                        nextRouteUnique = false;
                                    }
                                }
                            }
                        }
                        return prevRouteUnique && nextRouteUnique;
                    } else {
                        return true;
                    }
                });
                if (isAddToChoicePoint) {

                    prev.push({ lat: marker.latitude, lng: marker.longitude });
                    renderRoutePlanning(lastPoint, newpoint);
                }

                return prev;


            });

        }

    }, [zoom, nowPage]);
    //長壓marker
    //長壓marker
    const handleDoubleCliCk = useCallback((marker) => {


        console.log(line.length)
        let deletIndex = 0;
        if (choicepoint.length > 0 && line.length > 0) {
            for (let i = choicepoint.length - 1; i > -1; i--) {
                console.log(i)
                if (marker.latitude === choicepoint[i].lat && marker.longitude === choicepoint[i].lng) {
                    deletIndex = i
                    break;
                }
            }
            for (let i = line.length - 1; i >= deletIndex - 1; i--) {
                console.log("i" + i)
                if (i >= 0) {
                    for (let j = 0; j < line[i].line.length; j++) {
                        console.log("j" + j)
                        line[i].line[j].setMap(null)
                        googleRef.current.event.trigger(line[i].line[j], "delete")
                    }
                }


            }
        }

        let newchoice = choicepoint.slice(0, deletIndex)
        setChoicePoint(newchoice);

        let newLine = line.slice(0, deletIndex - 1)
        setLine(newLine)


    }, [choicepoint, line])
    //當點擊Cluster時，縮放並移動到該Cluster (透過更新State)
    const handleClusterClick = useCallback((cluster) => {
        const { center: nextCenter, zoom: nextZoom } = myFitBounds(cluster.getBounds(), googleMapRef);
        setCenter(nextCenter);
        setZoom(nextZoom);
    }, []);
    //當使用者手動縮放or移動地圖時，更新State
    const handleChange = useCallback(({ center: nextCenter, zoom: nextZoom }) => {
        if (nextCenter) setCenter(nextCenter);
        if (nextZoom) setZoom(nextZoom);
    }, []);
    const handleZoomAnimationStart = useCallback(() => {
        setOpeningMarkerId(null);
        setShowingMarkers([]);
    }, []);
    //快速前往按鈕的select事件由SimpleMap負責監聽
    const handleLocationSelect = useCallback((selectedLocation, e) => {
        let googleBounds = markers.reduce((bounds, marker) => {
            //bounds: google.map.LatLngBounds
            if (marker.region === selectedLocation) {
                bounds.extend(getMarkerPositionLiteral(marker));
            }
            return bounds;
        }, new googleRef.current.LatLngBounds());
        if (googleBounds.isEmpty()) {
            setCenter({ lat: 23.5998365, lng: 120.9780656 });
            setZoom(3);
        } else {
            const { center: nextCenter, zoom: nextZoom } = myFitBounds(googleBounds, googleMapRef);
            setCenter(nextCenter);
            setZoom(nextZoom);
        }
        onLocationSelect(selectedLocation, e);
    }, [markers, onLocationSelect]);

    //顯示Cluster & Marker
    const renderClustersAndMarkers = useMemo(() => {
        return showingMarkers.map((cluster) => {
            let lat = cluster.getCenter().lat();
            let lng = cluster.getCenter().lng();
            if (cluster.getSize() === 1) {
                let marker = cluster.getMarkers()[0].customData;
                return (
                    <Marker lat={lat} lng={lng} marker={marker}
                        onClick={handleMarkerClick} onShowDetailClick={onShowDetailClick}
                        showInfoWindow={openingMarkerId === marker.id}
                        key={`marker-${marker.id}`}
                    />
                );
            }
            return (
                <Cluster lat={lat} lng={lng} cluster={cluster} key={`cluster-${cluster.getCenter().toString()}`}
                    onClick={handleClusterClick}
                />
            );
        });
    }, [handleClusterClick, handleMarkerClick, onShowDetailClick, openingMarkerId, showingMarkers]);


    //顯示路線規劃的Cluster & Marker
    const renderClustersAndMarkers_Route = useMemo(() => {
        if (showingMarkers.length) {
            const counter = () => {
                let i = choicecount + 1;
                setChoiceCount(i);
            }
            //將cluster資料轉成React Component
            return showingMarkers.map((cluster) => {
                let lat = cluster.getCenter().lat();
                let lng = cluster.getCenter().lng();
                if (cluster.getSize() === 1) {
                    let marker = cluster.getMarkers()[0].customData;
                    return <Marker lat={lat} lng={lng} marker={marker}
                        onClick={handleMarkerClick} onShowDetailClick={onShowDetailClick}
                        showInfoWindow={openingMarkerId === marker.id}
                        key={`marker-${marker.name}`}
                        counter={counter}
                        choicepoint={choicepoint}
                        handleDoubleCliCk={handleDoubleCliCk}
                    />;
                }
                return (

                    <Cluster lat={lat} lng={lng} cluster={cluster} key={`cluster-${cluster.getCenter().toString()}`}
                        onClick={handleClusterClick}
                    />
                );
            });
        }
    }, [handleClusterClick, showingMarkers, nowPage, choicepoint, choicecount]);
    const renderRoutePlanning = (lastpoint, newpoint) => {

        const rendererOptions = {
            suppressMarkers: true,
            preserveViewport: true
        }
        directionsService.current = new googleRef.current.DirectionsService();
        directionsDisplay.current = new googleRef.current.DirectionsRenderer(rendererOptions);
        directionsDisplay.current.setMap(googleMapRef.current);
        console.log(directionsDisplay)

        if (choicepoint.length >= 2) {

            const request = {
                origin: { lat: lastpoint.lat, lng: lastpoint.lng },
                destination: { lat: newpoint.lat, lng: newpoint.lng },
                travelMode: 'DRIVING',
                optimizeWaypoints: true
            };

            // 繪製路線
            directionsService.current.route(request, function (result, status) {
                if (status == 'OK') {
                    // 回傳路線上每個步驟的細節
                    //directionsDisplay.current.setDirections(result);
                    let infowindows = new googleRef.current.InfoWindow({
                        content: `距離:${result.routes[0].legs[0].distance.text}<br/>預計時間:${result.routes[0].legs[0].duration.text}`,
                    });
                    let lines = [];
                    for (let i = 0; i <= result.routes[0].overview_path.length - 2; i++) {
                        const polylineCoordinates = [
                            { lat: result.routes[0].overview_path[i].lat(), lng: result.routes[0].overview_path[i].lng() },
                            { lat: result.routes[0].overview_path[i + 1].lat(), lng: result.routes[0].overview_path[i + 1].lng() }
                        ]
                        const polylinepath = new googleRef.current.Polyline({
                            path: polylineCoordinates,
                            geodesic: true,
                            strokeColor: '#46A3FF',
                            strokeWeight: 4,
                            strokeOpacity: 1.0
                        });
                        polylinepath.setMap(googleMapRef.current);

                        googleRef.current.event.addListener(polylinepath, 'click', (event) => {
                            let pos = {
                                lat: result.routes[0].overview_path[((result.routes[0].overview_path.length - 1) / 2).toFixed(0)].lat(),
                                lng: result.routes[0].overview_path[((result.routes[0].overview_path.length - 1) / 2).toFixed(0)].lng()
                            }
                            infowindows.setPosition(pos)
                            infowindows.open(googleMapRef.current);
                        })
                        googleRef.current.event.addListener(polylinepath, 'delete', (event) => {

                            infowindows.close();
                        })
                        lines.push(polylinepath);
                    }
                    setLine((prev) => {
                        prev.push({ line: lines });
                        return prev;
                    })


                }
            });



        }




    }


    const handlePlanning = () => {
        props.onPlanning();
        setOpeningMarkerId(null);
    }
    const handleHome = () => {
        setChoicePoint([])
        props.onHomeClick();
        if (line.length > 0) {
            for (let i = 0; i < line.length; i++) {
                console.log("i" + i)
                if (i >= 0) {
                    for (let j = 0; j < line[i].line.length; j++) {
                        console.log("j" + j)
                        line[i].line[j].setMap(null)
                        googleRef.current.event.trigger(line[i].line[j], "delete")
                    }
                }


            }
        }

        setLine([])

    }

    return (
        // Important! Always set the container height explicitly
        <>
            <LocationDropdown location={props.location} onLocationSelect={handleLocationSelect}
                target={document.getElementById('location-dropdown-col')}
            />
            <div className={nowPage === PAGES.MAP || nowPage === PAGES.PLANNING ? '' : 'd-none'} style={{ height: '100vh', width: '100%' }}>
                {nowPage === PAGES.MAP ?

                    <Button variant='info' onClick={handlePlanning} size='sm'
                        style={{
                            position: "fixed",
                            right: "0px",
                            bottom: "20px",
                            zIndex: "1",

                        }}>
                        路線規劃
                    </Button> :
                    <>
                    <ButtonGroup style={{width: "100%", height: "7%", position: "fixed", right: "0px", bottom: "0px", zIndex: "1"}}>
                        <Button variant='secondary' size='sm' onClick={onRouteClick}>
                            選擇清單
                        </Button>
                        <Button variant='secondary' onClick={handleHome} size='sm'>
                            返回地圖
                        </Button>
                    </ButtonGroup>
                    </>
                }
                <GoogleMapReact
                    bootstrapURLKeys={{ key: Key }}
                    center={center}
                    zoom={zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={handleGoogleApiLoaded}
                    onChange={handleChange}
                    onClick={handleClick}
                    onZoomAnimationStart={handleZoomAnimationStart}
                    options={{
                        disableDefaultUI: true,
                        clickableIcons: false
                    }}
                >
                    {nowPage === PAGES.PLANNING ? renderClustersAndMarkers_Route : renderClustersAndMarkers}
                </GoogleMapReact>
            </div>
        </>
    );
});