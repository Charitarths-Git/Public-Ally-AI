import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
}

export default function UploadDocumentModal({ isOpen, onClose, accentColor }: UploadDocumentModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'Department Guidelines.pdf', type: 'PDF', size: '2.4 MB' },
    { id: '2', name: 'FAQs Document.docx', type: 'DOCX', size: '1.1 MB' },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDelete = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
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
                <h2 className="text-2xl" style={{ color: accentColor }}>Upload Documents</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400">PDF, DOCX, TXT, and other documents</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              <div>
                <h3 className="text-lg mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <FileText className="w-8 h-8" style={{ color: accentColor }} />
                      <div className="flex-1">
                        <p className="text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.type} • {file.size}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <motion.button
                  onClick={onClose}
                  className="w-full px-4 py-3 text-white rounded-lg"
                  style={{ backgroundColor: accentColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
