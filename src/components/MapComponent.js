import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ports from '../data/ports';
import ControlBoard from './ControlBoard';
import shipData from '../data/shipData';
import './ShipPopup.css';
import COUNTRYCODES from '../data/IsoCountryCode'
let initMap;

mapboxgl.accessToken = 'pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw';

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [localTime, setLocalTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [showLocalTime, setShowLocalTime] = useState(false);
  const [showDayNightEffect, setShowDayNightEffect] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('dark-v11');


  const getLocalTimeAndTimezone = async (lng, lat) => {
    const url = `https://api.mapbox.com/v4/examples.4ze9z6tv/tilequery/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
  
    if (data && data.features && data.features.length > 0 && data.features[0].properties) {
      const userTimezone = data.features[0].properties.TZID;
      const now = new Date().toLocaleString('en-US', {
        timeZone: userTimezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
  
      return { now, userTimezone };
    } else {
      console.error('Unexpected API response:', data);
      return { now: '', userTimezone: '' };
    }
  };

  const isDayTime = (timezone) => {
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

    const [hours, minutes, seconds] = currentTime.split(':');
    const currentHour = parseInt(hours, 10);

    return currentHour >= 6 && currentHour < 18;
  };

  const updateMapStyle = (map, timezone) => {
    if (map && map.isStyleLoaded()) {
      const isDay = isDayTime(timezone);

      map.setPaintProperty('clusters', 'circle-color', isDay ? 'yellow' : 'navy');
      map.setPaintProperty('cluster-count', 'text-color', isDay ? 'black' : 'white');
      map.setPaintProperty('unclustered-point', 'circle-color', isDay ? 'orange' : 'purple');
    }
  };

  const handleStyleChange = (event) => {
    const selectedStyle = event.target.value;
    setSelectedStyle(selectedStyle)
  };

  useEffect(() => {
    const initMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${selectedStyle}`,
      center: [12.550343, 55.665957],
      zoom: 3,
      attributionControl: false,
    },[selectedStyle]);

    setMap(initMap);

    initMap.on('load', () => {
      setMapLoaded(true);

      initMap.addSource('ships', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: shipData.map((ship) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [ship.location_longitude, ship.location_latitude],
            },
            properties: {
              ship_name: ship.site_name,
            },
          })),
        },
      });

      initMap.addLayer({
        id: 'ships',
        type: 'circle',
        source: 'ships',
        paint: {
          'circle-color': 'red',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

     


      initMap.on('click', 'ships', (e) => {
        const coordinates = e.features[0].geometry.coordinates;
        const shipName = e.features[0].properties.ship_name;
        const time = e.features[0].properties.time;
      
        new mapboxgl.Popup({
          className: 'ship-popup', // Add the custom CSS class
        })
          .setLngLat(coordinates)
          .setHTML(`
            <div>
              <h4>${shipName}</h4>
              <p>Latitude: ${coordinates[1]}</p>
              <p>Longitude: ${coordinates[0]}</p>
            </div>
          `)
          .addTo(initMap);
      });

      initMap.addSource('ports', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: ports.map((port) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [port.geo_location_longitude, port.geo_location_latitude],
            },
            properties: {
              port_name: port.port_name,
            },
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      initMap.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'ports',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        },
      });

      initMap.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'ports',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      initMap.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'ports',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

      initMap.on('click', 'clusters', (e) => {
        const features = initMap.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties.cluster_id;
        initMap.getSource('ports').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          initMap.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
      });

      initMap.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates;
        const portName = e.features[0].properties.port_name;

        new mapboxgl.Popup({
          className: 'port-popup', 
        })
          .setLngLat(coordinates)
          .setHTML(`
            <div>
              <h4>${portName}</h4>
              <p>Latitude: ${coordinates[1]}</p>
              <p>Longitude: ${coordinates[0]}</p>
            </div>
          `)
          .addTo(initMap);
      });

      initMap.on('mouseenter', 'clusters', () => {
        initMap.getCanvas().style.cursor = 'pointer';
      });
      initMap.on('mouseleave', 'clusters', () => {
        initMap.getCanvas().style.cursor = '';
      });
    });

    initMap.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lng, lat });
      if (showLocalTime) {
        fetchLocalTimeAndTimezone(lng, lat);
      }
    });

    if (showDayNightEffect === true) {
      const nightCountries = getNightCountry();
    
      // initMap.( () => {
        initMap.addLayer({
          id: 'night-layer',
          type: 'fill',
          source: {
            type: 'vector',
            url: 'mapbox://mapbox.boundaries-3'
          },
          'source-layer': 'admin',
          paint: {
            'fill-color': '#FF0000',
            'fill-opacity': 0.5
          },
          filter: ['in', 'ISO_3166_1_alpha_3',...(nightCountries)]
        });
      // });
    } else {
      if (initMap.getLayer('night-layer')) {
        initMap.removeLayer('night-layer');
      }
    }


    return () => initMap.remove();
  }, [showLocalTime, selectedStyle, showDayNightEffect]);

  useEffect(() => {
    if (map && timezone && showDayNightEffect) {
      updateMapStyle(map, timezone);
    }
  }, [map, timezone, showDayNightEffect]);


  const fetchLocalTimeAndTimezone = async (lng, lat) => {
    try {
      const { now, userTimezone } = await getLocalTimeAndTimezone(lng, lat);
      setLocalTime(now);
      setTimezone(userTimezone);
      if (map && showDayNightEffect) {
        updateMapStyle(map, userTimezone);
      }
    } catch (error) {
      console.error('Error fetching local time and timezone:', error);
    }
  };

  const handleShowLocalTimeChange = (e) => {
    setShowLocalTime(e.target.checked);
  };

  function getSunriseTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0, 0); 
}

function getSunsetTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0); 
}

function getTimezoneOffset(countryCode) {
    if (countryCode === "USA") {
        return -4; // Assuming Eastern Time (EDT) is UTC-4
    } else if (countryCode === "GBR") {
        return 1; // Assuming British Summer Time (BST) is UTC+1
    } else {
        return 0; // Default to UTC
    }
}


function getNightCountry() {
  return COUNTRYCODES.filter((countryCode) => {
    let now = new Date();
    now.setUTCHours(now.getUTCHours() + getTimezoneOffset(countryCode));
    let sunset = getSunsetTime(now);
    let sunrise = getSunriseTime(now);

    if (now >= sunset || now <= sunrise) {
      return true;
    } else {
      return false;
    }
  });
}

  const handleShowDayNightEffectChange = (e) => {
    setShowDayNightEffect(e.target.checked);
  };

  return (
    <div>
      <div ref={mapContainerRef} style={{ height: '500px' }} />
      <ControlBoard
        localTime={localTime}
        timezone={timezone}
        showLocalTime={showLocalTime}
        handleShowLocalTimeChange={handleShowLocalTimeChange}
        showDayNightEffect={showDayNightEffect}
        handleShowDayNightEffectChange={handleShowDayNightEffectChange}
        selectedStyle = {selectedStyle}
        handleStyleChange={handleStyleChange}
      />
    </div>
  );
};

export default MapComponent;
