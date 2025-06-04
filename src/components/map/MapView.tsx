import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { CollectionPoint } from '../../types';
import MapLegend from './MapLegend';
import NorthArrow from './NorthArrow';
import MapScale from './MapScale';
import { MapLayer } from '../../types';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock data for collection points
const mockCollectionPoints: CollectionPoint[] = [
  {
    id: '1',
    name: 'Point de collecte Centre-ville',
    type: 'container',
    coordinates: [14.7167, -17.4677], // Dakar coordinates
    capacity: 1000,
    fillLevel: 75,
    lastCollection: '2025-03-15T10:30:00',
    wasteType: 'general',
  },
  // ... other mock points
];

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
  showNorthArrow?: boolean;
  showScale?: boolean;
  showLogo?: boolean;
  selectedRoute?: any;
}

const MapView = ({ 
  center = [14.7167, -17.4677], 
  zoom = 13,
  showLegend = true,
  showNorthArrow = true,
  showScale = true,
  showLogo = true,
  selectedRoute,
}: MapViewProps) => {
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>([]);

  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      setCollectionPoints(mockCollectionPoints);
    }, 1000);
  }, []);

  const getRouteCoordinates = () => {
    if (!selectedRoute?.geometry) return [];

    try {
      if (selectedRoute.geometry.type === 'LineString') {
        return selectedRoute.geometry.coordinates.map((coord: number[]) => [
          coord[1],
          coord[0]
        ]);
      } else if (selectedRoute.geometry.type === 'MultiLineString') {
        return selectedRoute.geometry.coordinates.map((line: number[][]) =>
          line.map((coord: number[]) => [
            coord[1],
            coord[0]
          ])
        );
      }
    } catch (error) {
      console.error('Error processing route coordinates:', error);
    }
    return [];
  };

  const getFillLevelColor = (level?: number) => {
    if (!level) return '#E5E7EB';
    if (level < 30) return '#10B981';
    if (level < 70) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* SONAGED Logo Watermark */}
      <div className="absolute inset-0 pointer-events-none z-[1] flex items-center justify-center">
        <img 
          src="/SONAGED.png" 
          alt="SONAGED Watermark"
          className="w-[500px] h-[500px] object-contain opacity-5"
        />
      </div>

      <MapContainer
        center={center as LatLngExpression}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render collection points */}
        {collectionPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.coordinates[0], point.coordinates[1]]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium text-base">{point.name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {point.type} - {point.wasteType}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Niveau de remplissage</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${point.fillLevel || 0}%`,
                        backgroundColor: getFillLevelColor(point.fillLevel)
                      }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1">{point.fillLevel || 0}%</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Dernière collecte</p>
                  <p className="text-sm">{formatDate(point.lastCollection)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Capacité</p>
                  <p className="text-sm">{point.capacity} kg</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render selected route */}
        {selectedRoute && selectedRoute.geometry && (
          selectedRoute.geometry.type === 'MultiLineString' ? (
            getRouteCoordinates().map((line: any[], index: number) => (
              <Polyline
                key={index}
                positions={line}
                pathOptions={{
                  color: '#10B981',
                  weight: 4,
                  opacity: 0.8,
                }}
              />
            ))
          ) : (
            <Polyline
              positions={getRouteCoordinates()}
              pathOptions={{
                color: '#10B981',
                weight: 4,
                opacity: 0.8,
              }}
            />
          )
        )}

        {showScale && <MapScale />}
      </MapContainer>

      {showLegend && <MapLegend layers={layers} />}
      {showNorthArrow && <NorthArrow />}
      
      {showLogo && (
        <div className="absolute bottom-8 right-8 bg-white p-2 rounded-lg shadow-md z-[1000]">
          <img src="/logo_siteWeb-3.png\" alt="SONAGED\" className="h-12 w-auto" />
        </div>
      )}
    </div>
  );
};

export default MapView;