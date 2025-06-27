import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MapView from '../components/map/MapView';
import MapExport from '../components/map/MapExport';
import { MapLayer } from '../types';
import { db } from '../lib/supabase';
import {
  Search, Share2, ChevronLeft, ChevronRight, Map as MapIcon,
  Trash2, AlertTriangle
} from 'lucide-react';

const MapExplorer = () => {
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showMobilierSubmenu, setShowMobilierSubmenu] = useState(false);

  // Pour la visualisation directe d'un dataset
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [focusedDataset, setFocusedDataset] = useState<any>(null);
  const [datasetGeoJSON, setDatasetGeoJSON] = useState<any>(null);

  // Récupérer les données passées depuis DataCatalog ou autres pages
  useEffect(() => {
    if (location.state) {
      const { dataset, datasetGeoJSON: geoJSON, focusedDataset: focused } = location.state;
      
      if (focused) {
        setFocusedDataset(focused);
      } else if (dataset) {
        setFocusedDataset(dataset);
      }
      
      if (geoJSON) {
        setDatasetGeoJSON(geoJSON);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (id) {
      if (location.state?.dataset) {
        const dataset = location.state.dataset;
        setFocusedDataset(dataset);
        
        // Si c'est un dataset depuis Supabase (format GeoJSON), récupérer les données
        if (dataset.source === "Supabase" && dataset.format === "GeoJSON") {
          fetchDatasetGeoJSON(dataset.id);
        }
        // Si c'est un dataset mock, créer un faux GeoJSON pour la démo
        else if (dataset.source !== "Supabase") {
          createMockGeoJSON(dataset);
        }
      } else {
        // Fallback : essayer de récupérer depuis collection_points
        db.collectionPoints.getById(id).then((res) => {
          if (res.data) {
            setFocusedDataset(res.data);
            // Convertir le point en GeoJSON
            const geojson = {
              type: "FeatureCollection",
              features: [{
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [res.data.longitude, res.data.latitude]
                },
                properties: res.data
              }]
            };
            setDatasetGeoJSON(geojson);
          }
        }).catch(error => {
          console.error("Erreur lors de la récupération du dataset:", error);
        });
      }
    }
  }, [id, location.state]);

  // Fonction pour récupérer les données GeoJSON d'un dataset depuis Supabase
  const fetchDatasetGeoJSON = async (datasetId: string) => {
    try {
      // Récupérer tous les points de collecte pour ce dataset
      const { data, error } = await db.collectionPoints.getAll();
      if (!error && data) {
        // Filtrer les données pour ce dataset spécifique si nécessaire
        // ou récupérer toutes les données et les convertir en GeoJSON
        const features = data.map((point: any) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [point.longitude, point.latitude]
          },
          properties: point
        }));

        const geojson = {
          type: "FeatureCollection",
          features: features
        };
        
        setDatasetGeoJSON(geojson);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données GeoJSON:", error);
    }
  };

  // Fonction pour créer un GeoJSON de démonstration pour les datasets mock
  const createMockGeoJSON = (dataset: any) => {
    let mockFeatures = [];
    
    // Créer des données de démonstration basées sur le type de dataset
    switch (dataset.category) {
      case "Points d'intérêt":
        // Créer quelques points de collecte fictifs dans Dakar
        mockFeatures = [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-17.4441, 14.6928] },
            properties: { name: "Point de collecte Plateau", type: "conteneur" }
          },
          {
            type: "Feature", 
            geometry: { type: "Point", coordinates: [-17.4681, 14.7167] },
            properties: { name: "Point de collecte Médina", type: "bac" }
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-17.4381, 14.6728] },
            properties: { name: "Point de collecte Gueule Tapée", type: "conteneur" }
          }
        ];
        break;
        
      case "Itinéraires":
        // Créer un circuit de collecte fictif
        mockFeatures = [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [-17.4441, 14.6928],
                [-17.4481, 14.6968],
                [-17.4521, 14.7008],
                [-17.4561, 14.7048]
              ]
            },
            properties: { name: "Circuit Plateau-Médina", type: "collecte" }
          }
        ];
        break;
        
      case "Zonage":
        // Créer une zone de couverture fictive
        mockFeatures = [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [-17.4541, 14.6828],
                [-17.4341, 14.6828], 
                [-17.4341, 14.7028],
                [-17.4541, 14.7028],
                [-17.4541, 14.6828]
              ]]
            },
            properties: { name: "Zone Centre-Ville", couverture: "100%" }
          }
        ];
        break;
        
      default:
        // Points par défaut
        mockFeatures = [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-17.4441, 14.6928] },
            properties: { name: dataset.name, description: dataset.description }
          }
        ];
    }

    const geojson = {
      type: "FeatureCollection",
      features: mockFeatures
    };
    
    setDatasetGeoJSON(geojson);
  };

  useEffect(() => {
    const storedRoute = sessionStorage.getItem('selectedRoute');
    if (storedRoute) {
      const route = JSON.parse(storedRoute);
      setSelectedRoute(route);
      sessionStorage.removeItem('selectedRoute');
    }
  }, []);

  const handleLayerChange = (updatedLayers: MapLayer[]) => {
    setLayers(updatedLayers);
  };

  const handleClearDataset = () => {
    setFocusedDataset(null);
    setDatasetGeoJSON(null);
    // Optionnel: naviguer vers la carte sans paramètre
    navigate('/map', { replace: true });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-600">Carte interactive</h1>
          {focusedDataset && (
            <p className="text-sm text-gray-600 mt-1">
              Visualisation : {focusedDataset.name}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {focusedDataset && (
            <button 
              className="btn-outline flex items-center text-green-600 hover:bg-green-50"
              onClick={() => navigate('/catalog')}
            >
              <ChevronLeft size={16} className="mr-1.5" />
              Retour au catalogue
            </button>
          )}
          <button className="btn-outline flex items-center text-green-600 hover:bg-green-50">
            <Share2 size={16} className="mr-1.5" />
            Partager
          </button>
          <button 
            className="btn-outline flex items-center text-green-600 hover:bg-green-50"
            onClick={() => setShowExportDialog(true)}
          >
            <MapIcon size={16} className="mr-1.5" />
            Export carte
          </button>
        </div>
      </div>

      <div className="flex-1 flex rounded-lg overflow-hidden border border-gray-200 bg-white">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 ease-in-out h-full bg-white border-r border-gray-200 flex flex-col`}
        >
          {sidebarOpen && (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Rechercher un lieu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Informations sur le dataset visualisé */}
                  {focusedDataset && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-800 mb-1">
                            Dataset actuel
                          </h4>
                          <p className="text-xs text-green-700 font-medium">{focusedDataset.name}</p>
                          <p className="text-xs text-green-600 mt-1">{focusedDataset.description}</p>
                          {datasetGeoJSON && (
                            <p className="text-xs text-green-600 mt-1">
                              {datasetGeoJSON.features.length} élément(s) affiché(s)
                            </p>
                          )}
                          <div className="text-xs text-green-500 mt-1">
                            Format: {focusedDataset.format} | Catégorie: {focusedDataset.category}
                          </div>
                        </div>
                        <button
                          onClick={handleClearDataset}
                          className="text-green-600 hover:text-green-700 ml-2"
                          title="Masquer ce dataset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-green-600 mb-2">LÉGENDE</h3>
                    <div className="space-y-2">
                      <button 
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-green-600 flex items-center"
                        onClick={() => navigate('/collection')}
                      >
                        <div className="w-4 h-0.5 bg-red-500 mr-2 rounded"></div>
                        Circuits de collecte
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-green-600 flex items-center"
                        onClick={() => navigate('/sweeping')}
                      >
                        <div className="w-4 h-0.5 bg-blue-500 mr-2 rounded"></div>
                        Circuits de balayage
                      </button>
                      <div>
                        <button 
                          className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-green-600 flex items-center justify-between"
                          onClick={() => setShowMobilierSubmenu(!showMobilierSubmenu)}
                        >
                          <div className="flex items-center">
                            <Trash2 size={16} className="mr-2" />
                            Mobilier urbain
                          </div>
                          <ChevronRight 
                            size={16} 
                            className={`transform transition-transform ${showMobilierSubmenu ? 'rotate-90' : ''}`} 
                          />
                        </button>
                        {showMobilierSubmenu && (
                          <div className="ml-7 mt-1 space-y-1">
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-green-600 flex items-center">
                              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                              PRN
                            </button>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-green-600 flex items-center">
                              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                              Bacs de rue
                            </button>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-green-600 flex items-center">
                              <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                              Points propres
                            </button>
                          </div>
                        )}
                      </div>
                      <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-green-600 flex items-center">
                        <AlertTriangle size={16} className="mr-2" />
                        Zones alertées
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView 
            selectedRoute={selectedRoute} 
            focusedDataset={focusedDataset}
            datasetGeoJSON={datasetGeoJSON}
            layers={layers}
            onLayerChange={handleLayerChange}
          />
          {/* Sidebar toggle */}
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-r-md border border-gray-200 border-l-0 p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* Map Export Dialog */}
      <MapExport
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
};

export default MapExplorer;