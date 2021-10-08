import React, {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import MarkerClusterer from "@google/markerclustererplus";
import GoogleMapReact from "google-map-react";
import { fitBounds } from 'google-map-react/utils';
import Marker, {Types as MarkerTypes} from "./Marker";
import {Key} from "../key";
import Cluster from "./Cluster";

export default function SimpleMapUsingGoogleApi({allMarkers,typesFilter,starFilter,...props}) {
    const defaultCenter = useRef([35.6540969,139.6284394]);//{lat: 23.5998365, lng: 120.9780656}
    const defaultZoom = useRef(3);
    const [showingMarkers, setShowingMarkers] = useState([]);

    const googleMapRef = useRef();//儲存map instance
    const googleRef = useRef();//儲存map class
    const markerClusterRef = useRef();//儲存叢集顯示器

    //定義 所有資料or篩選器 有更動時做的事
    useEffect(()=>{
        //因useEffect會在mount(即第一次render)時執行一次
        //故要判斷：當ajax有回傳資料，且Google地圖有加載後，才將資料放入地圖顯示
        if (allMarkers.length){
            //製作Marker
            let typesFilterValue = typesFilter.reduce((value,typeValue)=>(value | typeValue),0);
            let googleMarkers = allMarkers.filter((marker)=>{
                let isPassTypesFilter = (marker.classification & typesFilterValue) > 0;
                return isPassTypesFilter && !(marker.star > starFilter);
            }).map((marker)=>{
                //將資料轉為Marker
                let googleMarker = new googleRef.current.Marker({
                    position: {lat: marker.latitude, lng: marker.longitude},
                    icon: {
                        url: MarkerTypes[marker.icon_name].icon_url,
                        scaledSize: new googleRef.current.Size(30,50),
                    }
                });
                googleMarker.customData = marker;
                return googleMarker;
            });

            //將叢集顯示器清空後加入Marker，確保沒有重複資料
            markerClusterRef.current.clearMarkers();
            markerClusterRef.current.addMarkers(googleMarkers);
            console.log('after addMarkers',markerClusterRef.current.getMaxZoom());
            //將畫面自動fit Marker，若無Marker則去初始點
            // if (googleMarkers.length){
            //     markerCluster.current.fitMapToMarkers();
            // }else {
            //     googleMapRef.current.panTo(defaultCenter.current);
            //     googleMapRef.current.setZoom(defaultZoom.current);
            // }

            // // 計算邊界
            // let bounds = markers.reduce((bounds,marker)=>{
            //     let position = marker.getPosition();
            //     if (bounds.nw.lat==null || position.lat() > bounds.nw.lat){
            //         bounds.nw.lat = position.lat();
            //     }
            //     if (bounds.nw.lng==null || position.lng() < bounds.nw.lng){
            //         bounds.nw.lng = position.lng();
            //     }
            //     if (bounds.se.lat==null || position.lat() < bounds.se.lat){
            //         bounds.se.lat = position.lat();
            //     }
            //     if (bounds.se.lng==null || position.lng() > bounds.se.lng){
            //         bounds.se.lng = position.lng();
            //     }
            //     return bounds;
            // },{
            //     nw: {lat: null, lng: null},
            //     se: {lat: null, lng: null,}
            // });
            // // 獲取地圖顯示長寬
            // let size = {
            //     width: googleMapRef.current.getDiv().clientWidth,
            //     height: googleMapRef.current.getDiv().clientHeight,
            // };
            // // 利用google-map-react/utils中提供的工具函式獲取中心點&縮放大小
            // const {center, zoom} = fitBounds(bounds, size);
            // setCenter(center);
            // setZoom(zoom);
        } 
    },[allMarkers,typesFilter,starFilter]);//有依賴值，當依賴值有變化時(ex.篩選器有更動)則執行

    //當Google Api有成功加載後執行
    const handleGoogleApiLoaded = ({map, maps})=>{
        googleMapRef.current = map;
        googleRef.current = maps;
        markerClusterRef.current = (new MarkerClusterer(map,[],{
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        }));
        props.onApiLoad();
    };
    return (
        // Important! Always set the container height explicitly
        <div style={{height: '100vh', width: '100%'}}>
            <GoogleMapReact
                bootstrapURLKeys={{key: Key}}
                defaultCenter={defaultCenter.current}
                defaultZoom={defaultZoom.current}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={ handleGoogleApiLoaded }
            >
            </GoogleMapReact>
        </div>
    );
}