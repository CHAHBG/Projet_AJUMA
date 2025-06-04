import { useState, useEffect } from 'react';
import MapView from '../components/map/MapView';
import MapExport from '../components/map/MapExport';
import { MapLayer } from '../types';
import { Search, Share2, ChevronLeft, ChevronRight, Map as MapIcon, Trash2, AlertTriangle } from 'lucide-react';
import type { MapExportConfig } from '../components/map/MapExport';
import { useNavigate } from 'react-router-dom';

const MapExplorer = () => {
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showMobilierSubmenu, setShowMobilierSubmenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a selected route in sessionStorage
    const storedRoute = sessionStorage.getItem('selectedRoute');
    if (storedRoute) {
      const route = JSON.parse(storedRoute);
      setSelectedRoute(route);
      // Clear the stored route to avoid showing it again on subsequent visits
      sessionStorage.removeItem('selectedRoute');
    }
  }, []);

  const handleLayerChange = (updatedLayers: MapLayer[]) => {
    setLayers(updatedLayers);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-green-600">Carte interactive</h1>
        <div className="flex space-x-2">
          <button className="btn-outline flex items-center text-green-600">
            <Share2 size={16} className="mr-1.5" />
            Partager
          </button>
          <button 
            className="btn-outline flex items-center text-green-600"
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
                  <div>
                    <h3 className="text-sm font-medium text-green-600 mb-2">LEGENDE</h3>
                    <div className="space-y-2">
                      <button 
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-green-600 flex items-center"
                        onClick={() => navigate('/collection')}
                      >
                        <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
                        Circuits de collecte
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-green-600 flex items-center"
                        onClick={() => navigate('/sweeping')}
                      >
                        <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
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
                              <img src="/prnn.jpg" alt="PRN" className="w-4 h-4 mr-2" />
                              PRN
                            </button>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-green-600 flex items-center">
                              <img src="/Bac à ordures.png" alt="Bacs de rue" className="w-4 h-4 mr-2" />
                              Bacs de rue
                            </button>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-green-600 flex items-center">
                              <img src="/prnn.jpg" alt="Points propres" className="w-4 h-4 mr-2 filter hue-rotate-[240deg]" />
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
          <MapView selectedRoute={selectedRoute} />
          
          {/* Sidebar toggle */}
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-r-md border border-gray-200 border-l-0 p-1.5 shadow-sm"
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