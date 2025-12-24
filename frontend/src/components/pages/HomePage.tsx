import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Check, X, Plus, Phone, Upload, Database as DatabaseIcon, Settings, Info } from 'lucide-react';
import type { UserSession } from '../../App';
import AddNumberModal from '../modals/AddNumberModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import ConnectDatabaseModal from '../modals/ConnectDatabaseModal';

interface HomePageProps {
  userSession: UserSession;
  accentColor: string;
  secondaryColor: string;
}

interface QueueEntry {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  status: 'pending' | 'calling' | 'completed';
}

interface AICapability {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function HomePage({ userSession, accentColor, secondaryColor }: HomePageProps) {
  const [aiName, setAiName] = useState('LokMitra');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(aiName);
  const [escalationNumber, setEscalationNumber] = useState('8668944955');
  const [isEditingEscalation, setIsEditingEscalation] = useState(false);
  const [tempEscalation, setTempEscalation] = useState(escalationNumber);
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  const [callingQueue, setCallingQueue] = useState<QueueEntry[]>([
    { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', notes: 'Regarding water supply issue', status: 'pending' },
    { id: '2', name: 'Priya Sharma', phone: '+91 98765 43211', notes: 'Complaint about road maintenance', status: 'pending' },
    { id: '3', name: 'Amit Patel', phone: '+91 98765 43212', status: 'pending' },
  ]);

  const [capabilities, setCapabilities] = useState<AICapability[]>([
    { id: 'tickets', label: 'Create/Update Tickets', description: 'Allow AI to create or update tickets in the database', enabled: true },
    { id: 'internet', label: 'Search Internet', description: 'Enable AI to search the internet to answer questions', enabled: true },
    { id: 'database', label: 'Modify Database Records', description: 'Allow AI to modify records in connected databases', enabled: true },
    { id: 'human', label: 'Add Human Agent to Call', description: 'Enable AI to escalate and add a human agent during calls', enabled: true },
  ]);

  const outboundNumber = '+91 11000 00001';

  const handleSaveName = () => {
    if (tempName.trim()) {
      setAiName(tempName);
      setIsEditingName(false);
    }
  };

  const handleCancelName = () => {
    setTempName(aiName);
    setIsEditingName(false);
  };

  const handleSaveEscalation = () => {
    if (tempEscalation.trim()) {
      setEscalationNumber(tempEscalation);
      setIsEditingEscalation(false);
    }
  };

  const handleCancelEscalation = () => {
    setTempEscalation(escalationNumber);
    setIsEditingEscalation(false);
  };

  const handleAddNumber = (entry: Omit<QueueEntry, 'id' | 'status'>) => {
    const newEntry: QueueEntry = {
      ...entry,
      id: Date.now().toString(),
      status: 'pending'
    };
    setCallingQueue([...callingQueue, newEntry]);
  };

  const toggleCapability = (id: string) => {
    setCapabilities(capabilities.map(cap =>
      cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  const nextCallIndex = callingQueue.findIndex(entry => entry.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-2" style={{ color: accentColor }}>
            LokMitra-AI
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            AI Voice Partner for Public Outreach in Delhi
          </p>
        </div>

        <motion.button
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white shadow-lg text-sm sm:text-base"
          style={{ backgroundColor: accentColor }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Start calling queued numbers"
          onClick={() => {
            console.log('Start Calling clicked');
          }}
        >
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />  
          Start Calling
        </motion.button>
      </motion.div>

      {/* User Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-xl sm:text-2xl mb-4" style={{ color: accentColor }}>User Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Category</p>
            <p className="text-base sm:text-lg capitalize">{userSession.category}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Department/Body</p>
            <p className="text-base sm:text-lg">{userSession.subcategory}</p>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <p className="text-xs sm:text-sm text-gray-500">Account Type</p>
            <p className="text-base sm:text-lg">Demo Account</p>
          </div>
        </div>
      </motion.div>

      {/* AI Customization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-xl sm:text-2xl mb-4 flex items-center gap-2" style={{ color: accentColor }}>
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          AI Customization
        </h2>

        {/* AI Name */}
        <div className="mb-6">
          <label className="block text-xs sm:text-sm text-gray-600 mb-2">AI Agent Name</label>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  autoFocus
                />
                <motion.button
                  onClick={handleSaveName}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <motion.button
                  onClick={handleCancelName}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <span className="text-lg sm:text-xl flex-1 break-words">{aiName}</span>
                <motion.button
                  onClick={() => {
                    setTempName(aiName);
                    setIsEditingName(true);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  title="Edit AI name"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-xs sm:text-sm text-gray-600 mb-2">Description</label>
          <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg">
            {aiName} is an AI voice agent serving <strong>{userSession.subcategory}</strong> to help people through voice interactions and knowledge access.
          </p>
        </div>

        {/* Escalation Number */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-2 flex items-center gap-2">
            <span className="break-words">Human-in-the-Loop Escalation Number</span>
            <div className="group relative flex-shrink-0">
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Phone number for escalating calls to human agents
              </div>
            </div>
          </label>
          <div className="flex items-center gap-2">
            {isEditingEscalation ? (
              <>
                <input
                  type="text"
                  value={tempEscalation}
                  onChange={(e) => setTempEscalation(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  autoFocus
                />
                <motion.button
                  onClick={handleSaveEscalation}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <motion.button
                  onClick={handleCancelEscalation}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                <span className="text-base sm:text-lg flex-1 break-all">{escalationNumber}</span>
                <motion.button
                  onClick={() => {
                    setTempEscalation(escalationNumber);
                    setIsEditingEscalation(true);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  title="Edit escalation number"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Outbound Number */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h3 className="text-lg sm:text-xl mb-3" style={{ color: accentColor }}>Official Outbound Calling Number</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{ color: accentColor }} />
          <span className="text-lg sm:text-xl break-all">{outboundNumber}</span>
          <span className="ml-auto text-xs sm:text-sm text-gray-500">(Fixed)</span>
        </div>
      </motion.div>

      {/* Calling Queue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <h3 className="text-lg sm:text-xl" style={{ color: accentColor }}>Calling Queue</h3>
          <motion.button
            onClick={() => setShowAddNumberModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white shadow-lg text-sm sm:text-base"
            style={{ backgroundColor: accentColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add new number to queue"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Number
          </motion.button>
        </div>

        <div className="space-y-3">
          {callingQueue.map((entry, index) => (
            <motion.div
              key={entry.id}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${index === nextCallIndex
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-gray-50 border-gray-200'
                }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base sm:text-lg break-words">{entry.name}</h4>
                    {index === nextCallIndex && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full whitespace-nowrap">
                        Next Call
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 break-all">{entry.phone}</p>
                  {entry.notes && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 italic break-words">{entry.notes}</p>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">#{index + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upload Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:flex-1">
            <h3 className="text-lg sm:text-xl mb-2" style={{ color: accentColor }}>Upload Documents</h3>
            <p className="text-xs sm:text-sm text-gray-600">Upload PDFs, Word docs, and other files for AI knowledge base</p>
          </div>
          <motion.button
            onClick={() => setShowUploadModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm sm:text-base"
            style={{ backgroundColor: accentColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Upload documents"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            Upload
          </motion.button>
        </div>
      </motion.div>

      {/* Connect Database */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:flex-1">
            <h3 className="text-lg sm:text-xl mb-2" style={{ color: accentColor }}>Connect Database</h3>
            <p className="text-xs sm:text-sm text-gray-600">Connect PostgreSQL, Excel, CSV, or external data sources</p>
          </div>
          <motion.button
            onClick={() => setShowDatabaseModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm sm:text-base"
            style={{ backgroundColor: accentColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Connect database"
          >
            <DatabaseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Connect
          </motion.button>
        </div>
      </motion.div>

      {/* AI Capabilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h3 className="text-lg sm:text-xl mb-4" style={{ color: accentColor }}>AI Capabilities & Controls</h3>
        <div className="space-y-4">
          {capabilities.map((capability) => (
            <div key={capability.id} className="flex sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 w-full sm:w-auto">
                <h4 className="text-base sm:text-lg mb-1 break-words">{capability.label}</h4>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{capability.description}</p>
              </div>
              <motion.button
                onClick={() => toggleCapability(capability.id)}
                className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${capability.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                whileTap={{ scale: 0.95 }}
                title={`Toggle ${capability.label}`}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ left: capability.enabled ? '30px' : '4px' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      <AddNumberModal
        isOpen={showAddNumberModal}
        onClose={() => setShowAddNumberModal(false)}
        onAdd={handleAddNumber}
        accentColor={accentColor}
      />
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        accentColor={accentColor}
      />
      <ConnectDatabaseModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        accentColor={accentColor}
      />
    </div>
  );
}