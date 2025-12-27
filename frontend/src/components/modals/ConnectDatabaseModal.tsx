import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Upload, Loader2, CheckCircle2, FileType } from 'lucide-react';
import axios from 'axios';

interface ConnectDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

type DataSourceType = 'postgresql' | 'excel' | 'csv' | 'external';

export default function ConnectDatabaseModal({ isOpen, onClose, accentColor }: ConnectDatabaseModalProps) {
  const [sourceType, setSourceType] = useState<DataSourceType>('postgresql');
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states
  const [host, setHost] = useState('');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [externalUsername, setExternalUsername] = useState('');
  const [externalPassword, setExternalPassword] = useState('');

  const handleConnect = async () => {
    if ((sourceType === 'csv' || sourceType === 'excel') && !selectedFile) {
      alert("Please upload a file first");
      return;
    }

    const formData = new FormData();
    formData.append('source_type', sourceType);
    formData.append('can_read', String(canRead));
    formData.append('can_write', String(canWrite));

    // Use the state variable instead of querySelector
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    setIsProcessing(true);
    setStatusMessage('Analyzing data with Gemini AI...');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/connect-database/', formData);
      
      if (response.data.success) {
        setStatusMessage('Success! Database connected.');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Connection failed", err);
      const errorMsg = err.response?.status === 429 
        ? "AI is currently busy. Please wait a moment." 
        : "Failed to connect. Please check your data.";
      alert(errorMsg);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const resetForm = () => {
    setHost('');
    setPort('5432');
    setDatabase('');
    setUsername('');
    setPassword('');
    setExternalLink('');
    setExternalUsername('');
    setExternalPassword('');
    setSelectedFile(null); // Reset file selection
    setIsProcessing(false);
    setStatusMessage('');
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetForm();
    onClose();
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
            onClick={handleClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* LOADING OVERLAY */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: accentColor }} />
                    <p className="text-lg font-bold text-gray-800">{statusMessage}</p>
                    <p className="text-sm text-gray-500 mt-2">Syncing with Sahayaki Knowledge Base...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl flex items-center gap-2 font-bold" style={{ color: accentColor }}>
                  <Database className="w-6 h-6" />
                  Connect Database
                </h2>
                <button onClick={handleClose} disabled={isProcessing} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Source Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Data Source Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['postgresql', 'excel', 'csv', 'external'].map((type) => (
                    <button
                      key={type}
                      disabled={isProcessing}
                      onClick={() => { setSourceType(type as DataSourceType); setSelectedFile(null); }}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        sourceType === type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Upload Area for CSV/Excel */}
              {(sourceType === 'excel' || sourceType === 'csv') && (
                <motion.div className="mb-6">
                  <label className="block cursor-pointer">
                    <motion.div 
                      animate={selectedFile ? { 
                        borderColor: accentColor,
                        backgroundColor: `${accentColor}10`,
                        scale: [1, 1.01, 1] 
                      } : {}}
                      transition={selectedFile ? { repeat: Infinity, duration: 2 } : {}}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                        selectedFile ? 'border-solid' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-blue-700 font-bold text-lg mb-1">File Uploaded</p>
                          <p className="text-sm text-blue-600 font-medium px-4 py-1 bg-blue-100 rounded-full">
                            {selectedFile.name}
                          </p>
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                            className="mt-4 text-xs text-red-500 font-bold uppercase tracking-wider hover:underline"
                          >
                            Remove File
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-700 font-bold">Choose a {sourceType.toUpperCase()} file</p>
                          <p className="text-sm text-gray-400 mt-1">Maximum size 10MB</p>
                        </>
                      )}
                    </motion.div>
                    <input
                      type="file"
                      disabled={isProcessing}
                      onChange={(e) => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
                      className="hidden"
                      accept={sourceType === 'excel' ? '.xlsx,.xls' : '.csv'}
                    />
                  </label>
                </motion.div>
              )}

              {/* PostgreSQL Fields */}
              {sourceType === 'postgresql' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Host</label>
                      <input type="text" value={host} onChange={(e) => setHost(e.target.value)} disabled={isProcessing} className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Port</label>
                      <input type="text" value={port} onChange={(e) => setPort(e.target.value)} disabled={isProcessing} className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  {/* ... Rest of SQL fields ... */}
                </motion.div>
              )}

              {/* Permissions */}
              <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI Permissions</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${canRead ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {canRead && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <input type="checkbox" checked={canRead} onChange={(e) => setCanRead(e.target.checked)} disabled={isProcessing} className="hidden" />
                    <span className="text-sm font-medium text-gray-700">Allow AI to read and retrieve data</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${canWrite ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {canWrite && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <input type="checkbox" checked={canWrite} onChange={(e) => setCanWrite(e.target.checked)} disabled={isProcessing} className="hidden" />
                    <span className="text-sm font-medium text-gray-700">Allow AI to edit and add records</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  CANCEL
                </button>
                <motion.button
                  onClick={handleConnect}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-4 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ESTABLISH CONNECTION'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}