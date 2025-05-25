import React, { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import MapView, { Marker, LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const UNIVERSIDAD_COORDS = {
  latitude: 4.87103,
  longitude: -74.0425,
};
interface MapComponentProps {
    viaje: Viaje | null;
    puntosAceptados?: Punto[];
    
  }
  

// Estilo silver para el mapa (Google Maps style)
const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c0c0c0"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#a9bca1"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e3dede"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#a2caf0"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    }
  ];

interface Viaje {
  direccion: string;
}

interface Punto {
  idCliente: string;
  direccion: string;
}

interface MapComponentProps {
  viaje: Viaje | null;
  puntosAceptados?: Punto[];
}

export default function MapComponent({ viaje, puntosAceptados = [] }: MapComponentProps) {
  const [direccionCoords, setDireccionCoords] = useState<LatLng | null>(null);
  const [puntosCoords, setPuntosCoords] = useState<Record<string, LatLng>>({});
  const mapRef = useRef<MapView>(null);

  

  const GOOGLE_API_KEY = 'AIzaSyB0ex9gl00soXNo5bAY1yubQvWpJXr5HqY';

  // Geocodifica la dirección principal del viaje
  useEffect(() => {
    const geocodeDireccion = async (direccion: string) => {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          direccion + ', Chía, Cundinamarca, Colombia'
        )}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setDireccionCoords({ latitude: lat, longitude: lng });
        } else {
          Alert.alert('Error', 'No se pudo obtener la ubicación de la dirección principal');
        }
      } catch (error) {
        console.error('Error geocodificando dirección principal:', error);
        Alert.alert('Error', 'Hubo un problema al geocodificar la dirección principal');
      }
    };

    if (viaje?.direccion) {
      geocodeDireccion(viaje.direccion);
    }
  }, [viaje]);

  useEffect(() => {
    console.log('Puntos aceptados:', puntosAceptados);
  }, [puntosAceptados]);
  

  // Geocodifica los puntos aceptados
  useEffect(() => {
    const geocodePuntosAceptados = async () => {
      const nuevosCoords: Record<string, LatLng> = {};

      for (const punto of puntosAceptados) {
        if (!puntosCoords[punto.idCliente]) {
          try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              punto.direccion + ', Chía, Cundinamarca, Colombia'
            )}&key=${GOOGLE_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results[0]) {
              const { lat, lng } = data.results[0].geometry.location;
              nuevosCoords[punto.idCliente] = { latitude: lat, longitude: lng };
            } else {
              console.warn(`No se pudo obtener ubicación para punto ${punto.idCliente}`);
            }
          } catch (error) {
            console.error(`Error geocodificando punto ${punto.idCliente}:`, error);
          }
        }
      }

      if (Object.keys(nuevosCoords).length > 0) {
        setPuntosCoords((prev) => ({ ...prev, ...nuevosCoords }));
      }
    };

    if (puntosAceptados.length > 0) {
      geocodePuntosAceptados();
    }
  }, [puntosAceptados]);

  // Ajusta la vista para mostrar todos los marcadores
  useEffect(() => {
    if (direccionCoords && mapRef.current) {
      // Coords para fitToCoordinates: origen, destino y todos los puntos aceptados que ya tienen coords
      const puntosValidos = Object.values(puntosCoords);
      const allPoints = [direccionCoords, UNIVERSIDAD_COORDS, ...puntosValidos];

      if (allPoints.length > 0) {
        mapRef.current.fitToCoordinates(allPoints, {
          edgePadding: { top: 120, right: 120, bottom: 120, left: 120 },
          animated: true,
        });
      }
    }
  }, [direccionCoords, puntosCoords]);

  if (!viaje || !direccionCoords) {
    return null; // O algún loader / mensaje
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mapStyle}
      style={{ width: '100%', height: 400 }}
      initialRegion={{
        latitude: UNIVERSIDAD_COORDS.latitude,
        longitude: UNIVERSIDAD_COORDS.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={false}
      loadingEnabled={true}
    >
      {/* Ruta desde dirección principal hasta la universidad */}
      <MapViewDirections
        origin={direccionCoords}
        destination={UNIVERSIDAD_COORDS}
        apikey={GOOGLE_API_KEY}
        strokeWidth={3}
        strokeColor="black"
        mode="DRIVING"
        waypoints={Object.values(puntosCoords)} // Pasa los puntos aceptados como waypoints
        onReady={(result) => {
            console.log('Ruta calculada correctamente');
            console.log(`Distancia: ${result.distance} km`);
            console.log(`Duración estimada: ${result.duration} min`);
        }}
        onError={(errorMessage) => {
            console.error('Error en Directions API:', errorMessage);
        }}
        />
      {/* Marcadores principales en negro */}
      <Marker
        coordinate={UNIVERSIDAD_COORDS}
        title="Universidad de La Sabana"
        description="Destino"
        pinColor="black"
      />
      <Marker
        coordinate={direccionCoords}
        title="Dirección de origen"
        description={viaje.direccion}
        pinColor="black"
      />

      {/* Marcadores de puntos aceptados (azules) */}
      {puntosAceptados.map((punto) => {
        const coord = puntosCoords[punto.idCliente];
        if (!coord) return null;
        return (
          <Marker
            key={punto.idCliente}
            coordinate={coord}
            title={`Pasajero: ${punto.idCliente}`}
            description={punto.direccion}
            pinColor="blue"
          />
        );
      })}
    </MapView>
  );
}
