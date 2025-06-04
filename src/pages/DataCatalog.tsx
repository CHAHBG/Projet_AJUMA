import { useState, useEffect } from 'react';
import { 
  Download, 
  Filter, 
  Search, 
  Database, 
  Map as MapIcon, 
  Truck,
  Trash2,
  Plus,
  Calendar,
  FileType2,
  User,
  ChevronDown,
  Upload,
  X
} from 'lucide-react';
import { DatasetMetadata } from '../types';

// Mock datasets
const mockDatasets: DatasetMetadata[] = [
  {
    id: '1',
    name: 'Points de collecte Dakar',
    description: 'Localisation de tous les points de collecte des déchets dans la région de Dakar',
    category: 'Points d\'intérêt',
    source: 'Sonaged',
    lastUpdated: '2025-03-10',
    format: 'GeoJSON',
    owner: 'Direction technique',
    tags: ['collecte', 'conteneurs', 'bacs'],
  },
  {
    id: '2',
    name: 'Circuits de collecte 2025',
    description: 'Tracés des circuits de collecte des déchets pour l\'année 2025',
    category: 'Itinéraires',
    source: 'Département Logistique',
    lastUpdated: '2025-02-15',
    format: 'SHP',
    owner: 'Service Logistique',
    tags: ['circuits', 'itinéraires', 'collecte'],
  },
  {
    id: '3',
    name: 'Zones de couverture',
    description: 'Zones géographiques de couverture des services de collecte',
    category: 'Zonage',
    source: 'Direction Aménagement',
    lastUpdated: '2025-01-25',
    format: 'SHP',
    owner: 'Service SIG',
    tags: ['zones', 'couverture', 'aménagement'],
  },
  {
    id: '4',
    name: 'Données population 2024',
    description: 'Densité de population par quartier pour l\'année 2024',
    category: 'Statistiques',
    source: 'Agence Nationale de la Statistique',
    lastUpdated: '2024-12-05',
    format: 'CSV',
    owner: 'Service Planification',
    tags: ['population', 'densité', 'quartiers'],
  },
  {
    id: '5',
    name: 'Cadastre Dakar 2025',
    description: 'Données cadastrales de la ville de Dakar',
    category: 'Foncier',
    source: 'Direction du Cadastre',
    lastUpdated: '2025-01-10',
    format: 'SHP',
    owner: 'Service Cartographie',
    tags: ['cadastre', 'parcelles', 'foncier'],
  },
  {
    id: '6',
    name: 'Points de dépôt déchets dangereux',
    description: 'Localisation des points de dépôt pour les déchets dangereux',
    category: 'Points d\'intérêt',
    source: 'Direction Environnement',
    lastUpdated: '2025-02-20',
    format: 'GeoJSON',
    owner: 'Service Environnement',
    tags: ['déchets dangereux', 'points de dépôt', 'environnement'],
  },
];

const DataCatalog = () => {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadType, setUploadType] = useState<'SHP' | 'CSV' | 'PDF' | 'GeoJSON' | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setDatasets(mockDatasets);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadType || !uploadFile || !uploadName) return;

    // Here you would normally send the data to your backend
    // For demo purposes, we'll just add it to the local state
    const newDataset: DatasetMetadata = {
      id: String(Date.now()),
      name: uploadName,
      description: uploadDescription,
      category: 'Importé',
      source: 'Upload utilisateur',
      lastUpdated: new Date().toISOString().split('T')[0],
      format: uploadType,
      owner: 'Utilisateur actuel',
      tags: [],
    };

    setDatasets([newDataset, ...datasets]);
    setShowAddModal(false);
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setUploadType(null);
    setUploadFile(null);
    setUploadName('');
    setUploadDescription('');
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch = searchQuery === '' || 
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFormat = selectedFormat === null || dataset.format === selectedFormat;
    const matchesCategory = selectedCategory === null || dataset.category === selectedCategory;
    
    return matchesSearch && matchesFormat && matchesCategory;
  });

  const uniqueFormats = Array.from(new Set(datasets.map(dataset => dataset.format)));
  const uniqueCategories = Array.from(new Set(datasets.map(dataset => dataset.category)));

  const formatIcon = (format: string) => {
    switch (format) {
      case 'SHP':
        return <MapIcon size={16} className="text-green-500" />;
      case 'GeoJSON':
        return <Database size={16} className="text-green-500" />;
      case 'CSV':
        return <FileType2 size={16} className="text-green-500" />;
      case 'PDF':
        return <FileType2 size={16} className="text-red-500" />;
      default:
        return <FileType2 size={16} className="text-gray-500" />;
    }
  };

  const categoryIcon = (category: string) => {
    switch (category) {
      case 'Points d\'intérêt':
        return <MapIcon size={16} className="text-green-600" />;
      case 'Itinéraires':
        return <Truck size={16} className="text-green-600" />;
      case 'Zonage':
        return <MapIcon size={16} className="text-green-600" />;
      case 'Statistiques':
        return <Database size={16} className="text-green-600" />;
      case 'Foncier':
        return <MapIcon size={16} className="text-green-600" />;
      default:
        return <Database size={16} className="text-green-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-green-600">Catalogue de données</h1>
        <button 
          className="btn-primary flex items-center bg-green-600 hover:bg-green-700"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} className="mr-1.5" />
          Ajouter un jeu de données
        </button>
      </div>

      {/* Add Dataset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Ajouter un jeu de données</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetUploadForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!uploadType ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUploadType('SHP')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <MapIcon size={24} className="mx-auto mb-2 text-green-600" />
                    <span className="block text-sm font-medium">Shapefile (.shp)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('GeoJSON')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Database size={24} className="mx-auto mb-2 text-green-600" />
                    <span className="block text-sm font-medium">GeoJSON (.geojson)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('CSV')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <FileType2 size={24} className="mx-auto mb-2 text-green-600" />
                    <span className="block text-sm font-medium">CSV (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('PDF')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <FileType2 size={24} className="mx-auto mb-2 text-red-600" />
                    <span className="block text-sm font-medium">PDF (.pdf)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du jeu de données
                    </label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fichier ({uploadType})
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
                            <span>Téléverser un fichier</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept={`.${uploadType.toLowerCase()}`}
                              onChange={handleFileUpload}
                              required
                            />
                          </label>
                        </div>
                        {uploadFile ? (
                          <p className="text-sm text-gray-500">{uploadFile.name}</p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Glissez-déposez ou cliquez pour sélectionner
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setUploadType(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Importer
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Rechercher un jeu de données..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex space-x-3">
            <div className="relative w-40">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none"
                value={selectedFormat || ''}
                onChange={(e) => setSelectedFormat(e.target.value || null)}
              >
                <option value="">Tous formats</option>
                {uniqueFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>

            <div className="relative w-52">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">Toutes catégories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>

            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 flex items-center">
              <Filter size={16} className="mr-1.5" />
              Plus de filtres
            </button>
          </div>
        </div>
      </div>

      {/* Dataset list */}
      <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement des données...</div>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <Trash2 size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun jeu de données trouvé</h3>
            <p className="text-gray-500 text-center max-w-md">
              Aucun jeu de données ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Format
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Dernière mise à jour
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Propriétaire
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDatasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                          <Database size={20} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-green-600">{dataset.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{dataset.description}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {dataset.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">{categoryIcon(dataset.category)}</div>
                        <div className="text-sm text-green-600">{dataset.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">{formatIcon(dataset.format)}</div>
                        <div className="text-sm text-green-600">{dataset.format}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-green-500 mr-2" />
                        <div className="text-sm text-green-600">{dataset.lastUpdated}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-green-500 mr-2" />
                        <div className="text-sm text-green-600">{dataset.owner}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-700 mr-3">
                        Visualiser
                      </button>
                      <button className="text-green-600 hover:text-green-700 flex items-center inline-flex">
                        <Download size={16} className="mr-1" />
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCatalog;