'use client';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import Chart from 'chart.js/auto';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_KEY;
const geonamesUser = process.env.NEXT_PUBLIC_GEONAMES_USER;
const openWeatherApi = process.env.NEXT_PUBLIC_OPENWEATHER_API;
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapOverlay({ onAirData }) {
  const [center, setCenter] = useState(defaultCenter);
  const [query, setQuery] = useState('');
  const [trafficRoutes, setTrafficRoutes] = useState([]);
  const [populationHistory, setPopulationHistory] = useState([]);
  const mapRef = useRef(null);
  const tileOverlayRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const fetchAirQuality = async (lat, lon) => {
    try {
      const airRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApi}`
      );
      const airData = await airRes.json();
      if (airData?.list?.length > 0 && onAirData) {
        onAirData(airData.list[0].components);
      }
    } catch (err) {
      console.error('Error fetching air quality:', err);
    }
  };

  const fetchTomTomTraffic = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.tomtom.com/traffic/services/4/incidentDetails/s3/10/json?point=${lat},${lon}&radius=3000&key=${tomtomKey}`
      );
      const data = await res.json();

      if (data?.incidents) {
        const routes = data.incidents.map((incident) => {
          const coords = incident.geometry?.coordinates || [];
          const severity = incident.properties?.severity || 1;

          const color = severity >= 3 ? '#FF0000' : severity === 2 ? '#FFA500' : '#FFFF00';

          return {
            path: coords.map(coord => ({ lat: coord[1], lng: coord[0] })),
            color,
          };
        });
        setTrafficRoutes(routes);
      }
    } catch (err) {
      console.error('Error fetching traffic data:', err);
    }
  };

  const fetchPopulation = async (city) => {
    try {
      const res = await fetch(`https://secure.geonames.org/searchJSON?q=${city}&maxRows=1&username=${geonamesUser}`);
      const data = await res.json();
      if (data?.geonames?.length > 0) {
        const pop = data.geonames[0].population;
        const simulatedHistory = [
          { year: 2000, population: Math.round(pop * 0.6) },
          { year: 2005, population: Math.round(pop * 0.7) },
          { year: 2010, population: Math.round(pop * 0.8) },
          { year: 2015, population: Math.round(pop * 0.9) },
          { year: 2020, population: pop },
        ];
        setPopulationHistory(simulatedHistory);
        renderPopulationChart(simulatedHistory);
      }
    } catch (err) {
      console.error('Error fetching population data:', err);
    }
  };

  const renderPopulationChart = (data) => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: data.map(d => d.year),
        datasets: [{
          label: 'Population',
          data: data.map(d => d.population),
          borderColor: '#36A2EB',
          fill: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCenter = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setCenter(newCenter);
        fetchAirQuality(lat, lon);
        fetchTomTomTraffic(lat, lon);
        fetchPopulation(display_name.split(',')[0]);

        if (mapRef.current && tileOverlayRef.current) {
          mapRef.current.overlayMapTypes.clear();
          mapRef.current.overlayMapTypes.insertAt(0, tileOverlayRef.current);
        }
      } else {
        alert('Location not found!');
      }
    } catch (err) {
      console.error('Error during search:', err);
      alert('Something went wrong. Try again.');
    }
  };

  const onLoad = useCallback(map => {
    mapRef.current = map;

    const tileOverlay = new window.google.maps.ImageMapType({
      name: 'TomTomTraffic',
      tileSize: new window.google.maps.Size(256, 256),
      maxZoom: 22,
      getTileUrl: function(coord, zoom) {
        return `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/${zoom}/${coord.x}/${coord.y}.png?key=${tomtomKey}`;
      },
    });

    tileOverlayRef.current = tileOverlay;
    map.overlayMapTypes.insertAt(0, tileOverlay);
  }, []);

  return (
    <>
      <div style={{ position: 'absolute', top: 10, right: 20, zIndex: 10 }}>
        <input
          type="text"
          placeholder="Search city or place..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ padding: '8px', width: '250px', fontSize: '16px' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px' }}>Go</button>
      </div>

      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, background: '#fff', padding: '10px', borderRadius: '10px' }}>
        <canvas ref={chartRef} width={400} height={200}></canvas>
      </div>

      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lon = e.latLng.lng();
            const newCenter = { lat, lng: lon };
            setCenter(newCenter);
            fetchAirQuality(lat, lon);
            fetchTomTomTraffic(lat, lon);

            if (mapRef.current && tileOverlayRef.current) {
              mapRef.current.overlayMapTypes.clear();
              mapRef.current.overlayMapTypes.insertAt(0, tileOverlayRef.current);
            }
          }}
        >
          <Marker position={center} />
          {trafficRoutes.map((route, idx) => (
            <Polyline
              key={idx}
              path={route.path}
              options={{ strokeColor: route.color, strokeOpacity: 0.8, strokeWeight: 4 }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </>
  );
}
