import React, {useMemo, useState} from 'react';

export default React.memo(function Cluster({cluster, onClick}) {
    const [isIconLoad, setIsIconLoad] = useState(false);
    const clusterIconStyle = useMemo(() => {
        let mc = cluster.getMarkerClusterer();
        let iconInfo = mc.getCalculator()(cluster.getMarkers(), mc.getStyles().length);
        return mc.getStyles()[iconInfo.index - 1];

    }, [cluster]);
    const wrapperStyle = {
        cursor: 'pointer',
        userSelect: 'none',
        width: `${clusterIconStyle.width}px`,
        height: `${clusterIconStyle.height}px`,
        transform: 'translate(-50%, -50%)',
        display: isIconLoad ? '' : 'none'
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onClick(cluster);
    };
    return (
        <div style={wrapperStyle} onClick={handleClick}>
            <img className='w-100 h-100' style={{objectFit: 'contain'}}
                 alt={cluster.getSize()} src={clusterIconStyle.url}
                 onLoad={()=>setIsIconLoad(true)}
            />
            <div className='position-absolute w-100 h-100 d-flex justify-content-center align-items-center'
                 style={{top: 0, left: 0}}
            >
                <span className='font-weight-bold'>{cluster.getSize()}</span>
            </div>
        </div>
    );
});