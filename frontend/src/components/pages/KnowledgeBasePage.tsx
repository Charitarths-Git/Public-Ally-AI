import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, X, ZoomIn, ZoomOut } from 'lucide-react';
import UploadDocumentModal from '../modals/UploadDocumentModal';

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

  const [documents, setDocuments] = useState<Document[]>([
    { 
      id: '1', 
      name: 'Department Guidelines.pdf', 
      type: 'PDF', 
      size: '2.4 MB', 
      uploadDate: '2024-12-20',
      content: 'Sample guidelines content for the department...'
    },
    { 
      id: '2', 
      name: 'FAQs Document.docx', 
      type: 'DOCX', 
      size: '1.1 MB', 
      uploadDate: '2024-12-19',
      content: 'Frequently asked questions about our services...'
    },
    { 
      id: '3', 
      name: 'Policy Manual.pdf', 
      type: 'PDF', 
      size: '3.2 MB', 
      uploadDate: '2024-12-18',
      content: 'Complete policy manual for governance...'
    },
    { 
      id: '4', 
      name: 'Service Procedures.docx', 
      type: 'DOCX', 
      size: '890 KB', 
      uploadDate: '2024-12-17',
      content: 'Standard operating procedures for all services...'
    },
  ]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl mb-2" style={{ color: accentColor }}>Knowledge Base</h1>
        <p className="text-gray-600">Manage documents for AI reference and learning</p>
      </motion.div>

      {/* Add Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <motion.button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 text-white rounded-lg shadow-lg flex items-center gap-2"
          style={{ backgroundColor: accentColor }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add More Documents
        </motion.button>
      </motion.div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <FileText className="w-8 h-8" style={{ color: accentColor }} />
              </div>
              <h3 className="text-sm mb-2 line-clamp-2">{doc.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{doc.type} • {doc.size}</p>
              <p className="text-xs text-gray-400">Uploaded: {doc.uploadDate}</p>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex-1">
                  <h2 className="text-xl" style={{ color: accentColor }}>{selectedDoc.name}</h2>
                  <p className="text-sm text-gray-500">{selectedDoc.type} • {selectedDoc.size}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[4rem] text-center">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <motion.div
                  className="bg-gray-50 rounded-lg p-8"
                  animate={{ scale: zoomLevel / 100 }}
                  style={{ transformOrigin: 'top left' }}
                >
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDoc.content}</p>
                  <div className="mt-8 space-y-4">
                    <p className="text-gray-700">
                      This is a preview of the document content. In a production environment, 
                      this would show the actual document rendered with appropriate viewers 
                      for PDFs, Word documents, and other file types.
                    </p>
                    <p className="text-gray-700">
                      The AI agent can read and reason over the content of this document 
                      to answer questions and provide accurate information to callers.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        accentColor={accentColor}
      />
    </div>
  );
}
