import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, X, ZoomIn, ZoomOut, Search } from 'lucide-react';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import axios from 'axios';
import API_ENDPOINTS from '../../lib/api-config';

interface KnowledgeBasePageProps {
  accentColor: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  content?: string;
}

export default function KnowledgeBasePage({ accentColor }: KnowledgeBasePageProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch documents from Django on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.DOCUMENTS);
      
      const formattedDocs = response.data.map((doc: any) => ({
        id: doc.id, 
        name: doc.name,
        type: doc.type,
        size: 'Synced',
        uploadDate: new Date(doc.created_at || Date.now()).toLocaleDateString(),
        content: `Document ID: ${doc.id}\n\nThis document is live in Sahayaki's memory. Sahayaki uses this information to provide accurate, document-backed responses during voice calls.`
      }));
      
      setDocuments(formattedDocs);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Filter logic for Search Bar
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  // 3. Handle Modal Close (Refresh the grid)
  const handleModalClose = () => {
    setShowUploadModal(false);
    fetchDocuments();
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl mb-2 font-bold" style={{ color: accentColor }}>Knowledge Base</h1>
          <p className="text-gray-600">Manage and preview documents used by Sahayaki for AI reference</p>
        </motion.div>

        <motion.button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 text-white rounded-xl shadow-lg flex items-center gap-2 w-fit"
          style={{ backgroundColor: accentColor }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Sync New Documents
        </motion.button>
      </div>

      {/* Search Bar UI */}
      <motion.div 
        className="relative mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search documents by name or file type..."
          className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-offset-2 transition-all outline-none text-gray-700 shadow-sm"
          style={{ '--tw-ring-color': accentColor } as any}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: accentColor }}></div>
          <p className="text-gray-500 animate-pulse">Accessing knowledge repository...</p>
        </div>
      ) : (
        <>
          {filteredDocuments.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? `No documents match "${searchTerm}"` : 'Your knowledge base is currently empty.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  layout
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border border-gray-100 group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${accentColor}15` }}
                    >
                      <FileText className="w-8 h-8" style={{ color: accentColor }} />
                    </div>
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 text-gray-800">{doc.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{doc.type}</span>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <p className="text-[10px] text-gray-400">{doc.uploadDate}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex-1">
                  <h2 className="text-xl font-bold" style={{ color: accentColor }}>{selectedDoc.name}</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">UUID: {selectedDoc.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomOut className="w-5 h-5" /></button>
                  <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-center">{zoomLevel}%</span>
                  <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomIn className="w-5 h-5" /></button>
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8 bg-gray-100/50">
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }} 
                  className="transition-transform duration-200"
                >
                  <div className="bg-white p-12 shadow-sm border border-gray-200 min-h-[800px] w-full max-w-4xl mx-auto rounded-sm">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                      {selectedDoc.content}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={handleModalClose}
        accentColor={accentColor}
      />
    </div>
  );
}