import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import API_ENDPOINTS from '../../lib/api-config';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

interface UploadedFile {
  id: string; // Vapi File ID
  name: string;
  type: string;
  size: string;
}

export default function UploadDocumentModal({ isOpen, onClose, accentColor }: UploadDocumentModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // 1. Fetch from Database whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingDocs();
    }
  }, [isOpen]);

  const fetchExistingDocs = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.DOCUMENTS);
    
    // Since the backend already formatted 'id', 'name', and 'type',
    // we just set the state directly.
    setUploadedFiles(response.data); 
    
  } catch (error) {
    console.error("Failed to fetch documents:", error);
  }
};

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    
    for (const file of filesArray) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(API_ENDPOINTS.UPLOAD_DOCUMENT, formData);

        if (response.data.success) {
          const newFile = {
            id: response.data.file_id, 
            name: file.name,
            type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
          };
          setUploadedFiles(prev => [newFile, ...prev]);
        }
      } catch (error) {
        console.error("Upload failed for:", file.name, error);
        alert(`Failed to upload ${file.name}`);
      }
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this document from Sahayaki's memory?")) return;

    try {
      // Call backend to delete from DB and update Vapi Tool
      const response = await axios.delete(API_ENDPOINTS.DELETE_DOCUMENT(id));

      if (response.data.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to remove document from AI memory.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: accentColor }}>Knowledge Base</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <label className="block">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all 
                    ${isUploading ? 'bg-blue-50 border-blue-400' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'}`}>
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <Upload className="w-12 h-12 mb-3 text-blue-500" />
                        </motion.div>
                        <p className="text-blue-700 font-medium">Updating Sahayaki's brain...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400">Knowledge is synced across all voice calls</p>
                      </>
                    )}
                  </div>
                  <input type="file" multiple disabled={isUploading} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                </label>
              </div>

              {/* Files List */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Active Documents</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'} Live
                  </span>
                </div>

                <div className="space-y-3">
                  {uploadedFiles.length === 0 && !isUploading ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                      No documents in memory yet.
                    </div>
                  ) : (
                    uploadedFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                          <FileText className="w-6 h-6" style={{ color: accentColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{file.type}</span>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-100 rounded text-[9px] text-green-600 font-mono">
                              <Check className="w-2.5 h-2.5" /> VAPI SYNCED
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6">
                <motion.button
                  onClick={onClose}
                  className="w-full px-4 py-3 text-white rounded-lg font-medium"
                  style={{ backgroundColor: accentColor }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Close Memory Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}