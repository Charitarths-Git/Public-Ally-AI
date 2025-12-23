import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Upload } from 'lucide-react';

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

  // PostgreSQL fields
  const [host, setHost] = useState('');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // External link fields
  const [externalLink, setExternalLink] = useState('');
  const [externalUsername, setExternalUsername] = useState('');
  const [externalPassword, setExternalPassword] = useState('');

  const handleConnect = () => {
    // Mock connection logic
    onClose();
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
  };

  const handleClose = () => {
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl flex items-center gap-2" style={{ color: accentColor }}>
                  <Database className="w-6 h-6" />
                  Connect Database
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Source Type Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-3">Select Data Source Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'postgresql', label: 'PostgreSQL Database' },
                    { value: 'excel', label: 'Excel File' },
                    { value: 'csv', label: 'CSV File' },
                    { value: 'external', label: 'External Link' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSourceType(option.value as DataSourceType)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        sourceType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PostgreSQL Fields */}
              {sourceType === 'postgresql' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mb-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Host</label>
                      <input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="localhost"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Port</label>
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="5432"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Database Name</label>
                    <input
                      type="text"
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                      placeholder="my_database"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Admin Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Excel/CSV Upload */}
              {(sourceType === 'excel' || sourceType === 'csv') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-2">Click to upload {sourceType.toUpperCase()} file</p>
                      <p className="text-sm text-gray-400">File will be parsed automatically</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={sourceType === 'excel' ? '.xlsx,.xls' : '.csv'}
                    />
                  </label>
                </motion.div>
              )}

              {/* External Link */}
              {sourceType === 'external' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mb-6"
                >
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">External Link/API URL</label>
                    <input
                      type="text"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      placeholder="https://api.example.com/data"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Username/API Key</label>
                    <input
                      type="text"
                      value={externalUsername}
                      onChange={(e) => setExternalUsername(e.target.value)}
                      placeholder="Username or API key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Password/Secret</label>
                    <input
                      type="password"
                      value={externalPassword}
                      onChange={(e) => setExternalPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Permissions */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm mb-3">AI Permissions</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canRead}
                      onChange={(e) => setCanRead(e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm">Allow AI to read data from this source</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canWrite}
                      onChange={(e) => setCanWrite(e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm">Allow AI to add or edit records</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleConnect}
                  className="flex-1 px-4 py-3 text-white rounded-lg"
                  style={{ backgroundColor: accentColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
