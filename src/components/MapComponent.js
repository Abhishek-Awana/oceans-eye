

// ADDING MAKER USING THE JSON DATA
// import React, { useRef, useEffect, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import ports from '../data/ports';

// mapboxgl.accessToken = 'pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw';

// const MapComponent = () => {
//   const mapContainerRef = useRef(null);
//   const [map, setMap] = useState(null);
//   const [markers, setMarkers] = useState([]);
//   const [markersVisible, setMarkersVisible] = useState(false);

//   useEffect(() => {
//     const initMap = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/light-v11',
//       center: [12.550343, 55.665957],
//       zoom: 8,
//     });

//     setMap(initMap);

//     // Clean up the map instance on component unmount
//     return () => initMap.remove();
//   }, []);

//   useEffect(() => {
//     if (map) {
//       if (markersVisible) {
//         var newMarkers = ports.map((port) => {
//           const marker = new mapboxgl.Marker()
//             .setLngLat([port.geo_location_longitude, port.geo_location_latitude])
//             .setPopup(new mapboxgl.Popup().setText(port.port_name))
//             .addTo(map);
//           return marker;
//         });
//         setMarkers(newMarkers);
//       } else {
//         markers.forEach((marker) => marker.remove());
//         setMarkers([]);
//       }
//     }
//   }, [map, markersVisible, ports]);
  
// // 
//   const toggleMarkers = () => {
//     setMarkersVisible((prevState) => {
//       if (prevState) {
//         markers.forEach((marker) => marker.remove());
//         setMarkers([]);
//       }
//       return !prevState;
//     });
//   };

//   return (
//     <div>
//       <div ref={mapContainerRef} style={{ height: '500px' }} />
//       <button onClick={toggleMarkers}>
//         {markersVisible ? 'Hide Markers' : 'Show Markers'}
//       </button>
//     </div>
//   );
// };

// export default MapComponent;

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ports from '../data/ports';
import ControlBoard from './ControlBoard';

mapboxgl.accessToken = 'pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw';

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [markersVisible, setMarkersVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [localTime, setLocalTime] = useState('');
  const [timezone, setTimezone] = useState('');

  const getLocalTimeAndTimezone = async (lng, lat) => {
    const url = `https://api.mapbox.com/v4/examples.4ze9z6tv/tilequery/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    const userTimezone = data.features[0].properties.TZID;
    const now = new Date().toLocaleString('en-US', {
      timeZone: userTimezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

    return { now, userTimezone };
  };

  useEffect(() => {
    const initMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [12.550343, 55.665957],
      zoom: 8,
    });

    setMap(initMap);

    initMap.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lng, lat });
    });

    return () => initMap.remove();
  }, []);

  useEffect(() => {
    const fetchLocalTimeAndTimezone = async () => {
      if (selectedLocation) {
        const { lng, lat } = selectedLocation;
        const { now, userTimezone } = await getLocalTimeAndTimezone(lng, lat);
        setLocalTime(now);
        setTimezone(userTimezone);
      } else {
        setLocalTime('');
        setTimezone('');
      }
    };

    fetchLocalTimeAndTimezone();
  }, [selectedLocation]);

  useEffect(() => {
    if (map) {
      if (markersVisible) {
        var newMarkers = ports.map((port) => {
          const marker = new mapboxgl.Marker()
            .setLngLat([port.geo_location_longitude, port.geo_location_latitude])
            .setPopup(new mapboxgl.Popup().setText(port.port_name))
            .addTo(map);
            map.addLayer({
              id: 'park-volcanoes',
              type: 'circle',
              source: 'national-park',
              paint: {
                'circle-radius': 6,
                'circle-color': '#B42222'
              }
            });
          return marker;
        });
        setMarkers(newMarkers);
      } else {
        markers.forEach((marker) => marker.remove());
        setMarkers([]);
      }
    }
  }, [map, markersVisible, ports]);

  const toggleMarkers = () => {
    setMarkersVisible((prevState) => {
      if (prevState) {
        markers.forEach((marker) => marker.remove());
        setMarkers([]);
      }
      return !prevState;
    });
  };

  return (
    <div>
      <div ref={mapContainerRef} style={{ height: '500px' }} />
      <button onClick={toggleMarkers}>
        {markersVisible ? 'Hide Markers' : 'Show Markers'}
      </button>
      <ControlBoard localTime={localTime} timezone={timezone} />
    </div>
  );
};

export default MapComponent;