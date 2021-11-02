import React, {useCallback, useMemo, useState} from 'react';
import SimpleMap from "./components/SimpleMap";
import CollapseNavbar from "./components/CollapseNavbar";
import FilterModal from "./components/FilterModal";
import {Types as MarkerTypes} from "./components/Marker";
import LoadingMask from "./components/LoadingMask";
import PagesModal from "./components/PagesModal";
import List from "./components/List";
import RouteList from "./components/RouteList";
import axios from "axios";
import MarkerPage from "./components/MarkerPage";
import SimpleMapUsingGoogleApi from "./components/SimpleMapUsingGoogleApi";
import 'bootstrap/dist/css/bootstrap.min.css';

export const PAGES = {
    MAP: 'map',
    DETAIL: 'detail',
    LIST: 'list',
    PLANNING: 'planning',
    RECOMMEND: 'recommend'
};
export const PageContext = React.createContext(PAGES.MAP);

// App
function App() {
    const [isLoad, setIsLoad] = useState(false);

    const [page, setPage] = useState(PAGES.MAP);//現在頁面
    const [showNavbar, setShowNavbar] = useState(false);//Navbar顯示狀態

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [starFilter, setStarFilter] = useState(3);
    const [typesFilter, setTypesFilter] = useState(()=>{
        return Object.values(MarkerTypes).map((type)=>type.value);
    });
    const [location, setLocation] = useState(null);//現在地點

    const [allMarkers, setAllMarkers] = useState([]);
    const [markerDiplayed, setMarkerDiplayed] = useState(null);//詳細頁面中的Marker

    const [showPagesModal, setShowPagesModal] = useState(false);

    const [showRouteList, setShowRouteList] = useState(false);

    //處理Navbar事件
    const handleFilterClick = useCallback(()=>setShowFilterModal(true),[]);
    const handlePagesClick = useCallback(()=>setShowPagesModal(true),[]);
    //處理FilterModal事件
    const handleFilterSave = useCallback(({typesFilter: newTypes, starFilter: newStar})=>{
        setTypesFilter(newTypes);
        setStarFilter(newStar);
        setShowFilterModal(false);
    },[]);
    //處理PagesModal事件
    const handlePageSelect = useCallback((page)=>{
        setShowPagesModal(false);
        setPage(page);
    },[]);
    //處理SimpleMap事件
    const handleApiLoad = useCallback(()=>{
        axios.get('https://www.plynet.com.tw/travelMap/Japan/東京')
            .then((resp)=>{
                console.log(resp.data[2]);//可至console查看資料結構
                setAllMarkers(resp.data); //儲存所有資料至state
                setIsLoad(true);
            })
        ;
    },[]);
    const handleLocationSelect = useCallback((location,e)=>{
        setLocation(location);
    },[]);
    //處理List事件
    const handleShowDetailClick = useCallback((marker)=>{
        setMarkerDiplayed(marker);
        setPage(PAGES.DETAIL);
    },[]);
    const handlePlanning = useCallback(()=>{
        //setShowPagesModal(false);
        setPage(PAGES.PLANNING);
    },[])
    //路線規劃
    const routePlanning = useCallback((marker)=>{
        console.log(marker);
    },[])
    const typesFilterValue = useMemo(() => {
        return typesFilter.reduce((value, typeValue) => (value | typeValue), 0);
    }, [typesFilter]);
    const filteredMarkers = useMemo(()=>{
        return allMarkers.filter((marker) => {
            let isPassTypesFilter = (marker.classification & typesFilterValue) > 0;
            return isPassTypesFilter && !(marker.star > starFilter);
        });
    },[allMarkers, starFilter, typesFilterValue]);
    return (
        <>
            <LoadingMask show={!isLoad}/>
            <CollapseNavbar show={showNavbar} location={location}
                            onCollapseClick={useCallback(()=>setShowNavbar((prev)=>(!prev)),[])}
                            onFilterClick={handleFilterClick}
                            onPagesClick={handlePagesClick}
                            onHomeClick={useCallback(()=>setPage(PAGES.MAP),[])}
            />
            <FilterModal show={showFilterModal} onHide={useCallback(()=>setShowFilterModal(false),[])}
                         onFilterSave={handleFilterSave}
                         typesFilterValue={typesFilterValue} starFilter={starFilter}
            />
            <PagesModal show={showPagesModal} onHide={useCallback(()=>setShowPagesModal(false),[])}
                        onPageSelect={handlePageSelect}
            />
            <RouteList show={showRouteList} 
                       
            />
            <PageContext.Provider value={page}>
                <SimpleMap markers={filteredMarkers} onApiLoad={handleApiLoad}
                           location={location} onShowDetailClick={handleShowDetailClick}
                           onLocationSelect={handleLocationSelect}
                           onPlanning={handlePlanning} onMarkerClick_Route={routePlanning}
                           onHomeClick={useCallback(()=>setPage(PAGES.MAP),[])}
                           onRouteClick={useCallback(()=>setShowRouteList((prev)=>(!prev)),[])}
                />
                <List markers={filteredMarkers} location={location} showNavbar={showNavbar}
                      onShowDetailClick={handleShowDetailClick}
                />
                <MarkerPage marker={markerDiplayed} showNavbar={showNavbar}/>
            </PageContext.Provider>
        </>
    );
}

export default App;