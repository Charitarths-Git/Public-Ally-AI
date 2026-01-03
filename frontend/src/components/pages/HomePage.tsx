import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Check, X, Plus, Phone, Upload, Database as DatabaseIcon, Settings, Info, PhoneOff, AlertCircle, UserPlus, Trash2 } from 'lucide-react';
import type { UserSession } from '../../types';
import AddNumberModal from '../modals/AddNumberModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import ConnectDatabaseModal from '../modals/ConnectDatabaseModal';
import AddHumanExpertModal from '../modals/AddHumanExpertModal';
import axios from 'axios';
import API_ENDPOINTS from '../../lib/api-config';

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

interface AvailableTool {
  id: string;
  name: string;
  description: string;
  type: 'base' | 'database' | 'transfer';
  enabled: boolean;
}

interface HumanExpertData {
  id: number;
  phone_number: string;
  expert_field: string;
  tool_id: string;
  created_at?: string;
}

export default function HomePage({ userSession, accentColor, secondaryColor }: HomePageProps) {
  const [aiName, setAiName] = useState('LokMitra');
  const [aiDescription, setAiDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempName, setTempName] = useState(aiName);
  const [tempDescription, setTempDescription] = useState(aiDescription);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [humanExpert, setHumanExpert] = useState<HumanExpertData | null>(null);
  const [showHumanExpertModal, setShowHumanExpertModal] = useState(false);
  const [isCreatingExpert, setIsCreatingExpert] = useState(false);
  const [isRemovingExpert, setIsRemovingExpert] = useState(false);
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [activeFileIds, setActiveFileIds] = useState<string[]>([]);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [inboundAgentActive, setInboundAgentActive] = useState(false);
  const [isStartingInbound, setIsStartingInbound] = useState(false);
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [isTogglingTool, setIsTogglingTool] = useState<string | null>(null);

  // Fetch agent configuration, human experts, and available tools on component mount
  useEffect(() => {
    const fetchAgentConfiguration = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.AGENT_CONFIGURATION);
        if (response.data && response.data.success) {
          setAiName(response.data.name);
          setTempName(response.data.name);
          setAiDescription(response.data.description);
          setTempDescription(response.data.description);
          console.log('Loaded agent configuration from backend:', response.data);
        }
      } catch (error) {
        console.error('Error fetching agent configuration:', error);
      }
    };

    const fetchHumanExperts = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.HUMAN_EXPERTS);
        if (response.data && response.data.length > 0) {
          // Use the first active human expert
          setHumanExpert(response.data[0]);
          console.log('Loaded human expert from backend:', response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching human experts:', error);
      }
    };

    const fetchAvailableTools = async () => {
      setIsLoadingTools(true);
      try {
        const response = await axios.get(API_ENDPOINTS.AVAILABLE_TOOLS);
        if (response.data && response.data.success) {
          setAvailableTools(response.data.tools);
          console.log('Loaded available tools from backend:', response.data.tools);
        }
      } catch (error) {
        console.error('Error fetching available tools:', error);
      } finally {
        setIsLoadingTools(false);
      }
    };
    
    fetchAgentConfiguration();
    fetchHumanExperts();
    fetchAvailableTools();
  }, []);

  const triggerNextCall = async () => {
    const nextPerson = callingQueue.find(entry => entry.status === 'pending');

    if (!nextPerson) {
      alert("No more pending calls in the queue!");
      return;
    }

    setIsCalling(true);
    setSessionInProgress(true);

    setCallingQueue(prev => prev.map(entry => 
      entry.id === nextPerson.id ? { ...entry, status: 'calling' } : entry
    ));

    try {
      const response = await axios.post(API_ENDPOINTS.START_OUTBOUND_CALLING, {
        phone_number: nextPerson.phone.replace(/\s+/g, ''),
        file_ids: activeFileIds
      });

      if (response.data.success) {
        console.log('Outbound call initiated successfully:', response.data.session_id);
      }
    } catch (error: any) {
      console.error("VAPI/Django Error:", error.response?.data || error.message);
      alert("Failed to start outbound call: " + (error.response?.data?.error || "Server error"));
      
      setCallingQueue(prev => prev.map(entry => 
        entry.id === nextPerson.id ? { ...entry, status: 'pending' } : entry
      ));
      setSessionInProgress(false);
    } finally {
      setIsCalling(false);
    }
  };

  const startInboundAgent = async () => {
    setIsStartingInbound(true);
    
    try {
      const response = await axios.post(API_ENDPOINTS.START_INBOUND_AGENT, {
        file_ids: activeFileIds
      });

      if (response.data.success) {
        console.log('Inbound agent started successfully:', response.data.assistant_id);
        setInboundAgentActive(true);
        alert('Inbound agent activated successfully! The system is now ready to receive calls.');
      }
    } catch (error: any) {
      console.error("VAPI/Django Error:", error.response?.data || error.message);
      alert("Failed to start inbound agent: " + (error.response?.data?.error || "Server error"));
    } finally {
      setIsStartingInbound(false);
    }
  };

  const stopInboundAgent = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.STOP_CALLING, {});
      
      if (response.data.success) {
        setInboundAgentActive(false);
        alert('Inbound agent stopped successfully.');
      }
    } catch (error: any) {
      console.error("Error stopping inbound agent:", error.response?.data || error.message);
      alert("Failed to stop inbound agent: " + (error.response?.data?.error || "Server error"));
    }
  };

  const endSession = () => {
    // Mark all calling entries as completed
    setCallingQueue(prev => prev.map(entry => 
      entry.status === 'calling' ? { ...entry, status: 'completed' } : entry
    ));
    setSessionInProgress(false);
    setIsCalling(false);
  };

  const [callingQueue, setCallingQueue] = useState<QueueEntry[]>([
    { id: '1', name: 'Kartavya', phone: '+918668944955', notes: 'Regarding govt_schemes info', status: 'pending' },
    { id: '2', name: 'Priya Sharma', phone: '+919876543211', notes: 'Complaint about road maintenance', status: 'pending' },
    { id: '3', name: 'Amit Patel', phone: '+919876543212', notes: 'Info about Govt schemes', status: 'pending' },
  ]);

  const [capabilities, setCapabilities] = useState<AICapability[]>([
    { id: 'tickets', label: 'Create/Update Tickets', description: 'Allow AI to create or update tickets in the database', enabled: true },
    { id: 'internet', label: 'Search Internet', description: 'Enable AI to search the internet to answer questions', enabled: true },
    { id: 'database', label: 'Modify Database Records', description: 'Allow AI to modify records in connected databases', enabled: true },
    { id: 'human', label: 'Add Human Agent to Call', description: 'Enable AI to escalate and add a human agent during calls', enabled: true },
  ]);

  const outboundNumber = '+1 225-777-9567';

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    
    setIsSavingConfig(true);
    try {
      const response = await axios.put(API_ENDPOINTS.AGENT_CONFIGURATION_UPDATE, {
        name: tempName.trim()
      });
      
      if (response.data.success) {
        setAiName(response.data.name);
        setIsEditingName(false);
        console.log('Agent name updated successfully:', response.data);
      }
    } catch (error: any) {
      console.error('Error updating agent name:', error.response?.data || error.message);
      alert('Failed to update agent name: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!tempDescription.trim()) return;
    
    setIsSavingConfig(true);
    try {
      const response = await axios.put(API_ENDPOINTS.AGENT_CONFIGURATION_UPDATE, {
        description: tempDescription.trim()
      });
      
      if (response.data.success) {
        setAiDescription(response.data.description);
        setIsEditingDescription(false);
        console.log('Agent description updated successfully:', response.data);
      }
    } catch (error: any) {
      console.error('Error updating agent description:', error.response?.data || error.message);
      alert('Failed to update agent description: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleUploadSuccess = (newFileId: string) => {
    setActiveFileIds(prev => [...prev, newFileId]);
  };

  const handleCancelName = () => {
    setTempName(aiName);
    setIsEditingName(false);
  };

  const handleCancelDescription = () => {
    setTempDescription(aiDescription);
    setIsEditingDescription(false);
  };

  const handleAddHumanExpert = async (data: { phoneNumber: string; expertField: string }) => {
    setIsCreatingExpert(true);
    
    try {
      const response = await axios.post(API_ENDPOINTS.CREATE_HUMAN_EXPERT, {
        phone_number: data.phoneNumber,
        expert_field: data.expertField
      });
      
      if (response.data.success) {
        setHumanExpert({
          id: response.data.id,
          phone_number: data.phoneNumber,
          expert_field: data.expertField,
          tool_id: response.data.tool_id
        });
        setShowHumanExpertModal(false);
        console.log('Human expert created and saved:', response.data);
      }
    } catch (error: any) {
      console.error('Error creating human expert:', error.response?.data || error.message);
      alert('Failed to create human expert tool: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setIsCreatingExpert(false);
    }
  };

  const handleRemoveHumanExpert = async () => {
    if (!humanExpert) return;
    
    setIsRemovingExpert(true);
    
    try {
      const response = await axios.delete(API_ENDPOINTS.DELETE_HUMAN_EXPERT(humanExpert.id));
      
      if (response.data.success) {
        setHumanExpert(null);
        console.log('Human expert removed:', response.data.message);
      }
    } catch (error: any) {
      console.error('Error removing human expert:', error.response?.data || error.message);
      alert('Failed to remove human expert: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setIsRemovingExpert(false);
    }
  };

  const handleAddNumber = (entry: Omit<QueueEntry, 'id' | 'status'>) => {
    const newEntry: QueueEntry = {
      ...entry,
      id: Date.now().toString(),
      status: 'pending'
    };
    setCallingQueue([...callingQueue, newEntry]);
  };

  const toggleTool = async (toolId: string) => {
    if (sessionInProgress) return;
    
    const tool = availableTools.find(t => t.id === toolId);
    if (!tool) return;
    
    const newEnabled = !tool.enabled;
    setIsTogglingTool(toolId);
    
    try {
      const response = await axios.put(API_ENDPOINTS.TOOL_STATUS_UPDATE, {
        tool_id: toolId,
        enabled: newEnabled
      });
      
      if (response.data.success) {
        setAvailableTools(prev => prev.map(t =>
          t.id === toolId ? { ...t, enabled: newEnabled } : t
        ));
        console.log(`Tool ${toolId} status updated to: ${newEnabled}`);
      }
    } catch (error: any) {
      console.error('Error toggling tool:', error.response?.data || error.message);
      alert('Failed to update tool status: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setIsTogglingTool(null);
    }
  };

  // Keep legacy toggleCapability for backwards compatibility but it now uses toggleTool
  const toggleCapability = (id: string) => {
    if (sessionInProgress) return;
    setCapabilities(capabilities.map(cap =>
      cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  const nextCallIndex = callingQueue.findIndex(entry => entry.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Session In Progress Alert */}
      <AnimatePresence>
        {sessionInProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-orange-100 border-2 border-orange-500 rounded-xl p-4 flex items-center gap-3 shadow-lg"
          >
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <p className="text-sm sm:text-base text-orange-800 font-medium">
              <strong>Session in Progress:</strong> No modifications allowed while calling is active
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Outbound Calling Button */}
          <motion.button
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white shadow-lg text-sm sm:text-base transition-colors"
            style={{ 
              backgroundColor: sessionInProgress 
                ? '#dc2626' 
                : (isCalling || nextCallIndex === -1) 
                ? '#9ca3af' 
                : accentColor,
              cursor: (!sessionInProgress && (isCalling || nextCallIndex === -1)) ? 'not-allowed' : 'pointer'
            }}
            whileHover={sessionInProgress || (!isCalling && nextCallIndex !== -1) ? { scale: 1.05 } : {}}
            whileTap={sessionInProgress || (!isCalling && nextCallIndex !== -1) ? { scale: 0.95 } : {}}
            title={sessionInProgress ? "End current session" : nextCallIndex === -1 ? "No pending numbers in queue" : "Start calling queued numbers"}
            disabled={!sessionInProgress && (isCalling || nextCallIndex === -1)}
            onClick={sessionInProgress ? endSession : triggerNextCall}
          >
            {sessionInProgress ? (
              <>
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>End Outbound</span>
              </>
            ) : isCalling ? (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{nextCallIndex === -1 ? 'Queue Empty' : 'Start Outbound Calling'}</span>
              </>
            )}
          </motion.button>

          {/* Inbound Agent Button */}
          <motion.button
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white shadow-lg text-sm sm:text-base transition-colors"
            style={{ 
              backgroundColor: inboundAgentActive 
                ? '#dc2626' 
                : isStartingInbound
                ? '#9ca3af'
                : secondaryColor || '#10b981',
              cursor: isStartingInbound ? 'not-allowed' : 'pointer'
            }}
            whileHover={!isStartingInbound ? { scale: 1.05 } : {}}
            whileTap={!isStartingInbound ? { scale: 0.95 } : {}}
            title={inboundAgentActive ? "Stop inbound agent" : "Start inbound agent to receive calls"}
            disabled={isStartingInbound}
            onClick={inboundAgentActive ? stopInboundAgent : startInboundAgent}
          >
            {inboundAgentActive ? (
              <>
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Stop Inbound Agent</span>
              </>
            ) : isStartingInbound ? (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Start Inbound Agent</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* User Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${sessionInProgress ? 'opacity-60 pointer-events-none' : ''}`}
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
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${sessionInProgress ? 'opacity-60 pointer-events-none' : ''}`}
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
                  disabled={isSavingConfig}
                />
                <motion.button
                  onClick={handleSaveName}
                  disabled={isSavingConfig}
                  className={`p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${isSavingConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isSavingConfig ? { scale: 1.05 } : {}}
                  whileTap={!isSavingConfig ? { scale: 0.95 } : {}}
                >
                  {isSavingConfig ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>
                <motion.button
                  onClick={handleCancelName}
                  disabled={isSavingConfig}
                  className={`p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 ${isSavingConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isSavingConfig ? { scale: 1.05 } : {}}
                  whileTap={!isSavingConfig ? { scale: 0.95 } : {}}
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
          <label className="block text-xs sm:text-sm text-gray-600 mb-2">Agent Description</label>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base min-h-[100px] resize-y"
                autoFocus
                disabled={isSavingConfig}
                placeholder="Describe what this AI agent does..."
              />
              <div className="flex gap-2 justify-end">
                <motion.button
                  onClick={handleSaveDescription}
                  disabled={isSavingConfig}
                  className={`flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm ${isSavingConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isSavingConfig ? { scale: 1.02 } : {}}
                  whileTap={!isSavingConfig ? { scale: 0.98 } : {}}
                >
                  {isSavingConfig ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save
                </motion.button>
                <motion.button
                  onClick={handleCancelDescription}
                  disabled={isSavingConfig}
                  className={`flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm ${isSavingConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isSavingConfig ? { scale: 1.02 } : {}}
                  whileTap={!isSavingConfig ? { scale: 0.98 } : {}}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm sm:text-base text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg break-words">
                {aiDescription || `${aiName} is an AI voice agent serving ${userSession.subcategory} to help people through voice interactions and knowledge access.`}
              </p>
              <motion.button
                onClick={() => {
                  setTempDescription(aiDescription || `${aiName} is an AI voice agent serving ${userSession.subcategory} to help people through voice interactions and knowledge access.`);
                  setIsEditingDescription(true);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 flex-shrink-0 mt-1"
                whileHover={{ scale: 1.05 }}
                title="Edit description"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Human Expert Escalation */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-2 flex items-center gap-2">
            <span className="break-words">Human-in-the-Loop Escalation</span>
            <div className="group relative flex-shrink-0">
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Configure a human expert for call transfers
              </div>
            </div>
          </label>
          
          {humanExpert ? (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: accentColor }} />
                    <span className="text-base sm:text-lg font-medium break-all">{humanExpert.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words">{humanExpert.expert_field}</span>
                  </div>
                  {humanExpert.tool_id && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Tool configured (ID: {humanExpert.tool_id.slice(0, 8)}...)
                    </p>
                  )}
                </div>
                <motion.button
                  onClick={handleRemoveHumanExpert}
                  disabled={isRemovingExpert}
                  className={`p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 flex-shrink-0 ${isRemovingExpert ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isRemovingExpert ? { scale: 1.05 } : {}}
                  whileTap={!isRemovingExpert ? { scale: 0.95 } : {}}
                  title="Remove human expert"
                >
                  {isRemovingExpert ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowHumanExpertModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Human Expert</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Outbound Number */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${sessionInProgress ? 'opacity-60' : ''}`}
      >
        <h3 className="text-lg sm:text-xl mb-3" style={{ color: accentColor }}>Official Outbound and Inbound Calling Number</h3>
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
            disabled={sessionInProgress}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white shadow-lg text-sm sm:text-base ${
              sessionInProgress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: accentColor }}
            whileHover={!sessionInProgress ? { scale: 1.05 } : {}}
            whileTap={!sessionInProgress ? { scale: 0.95 } : {}}
            title={sessionInProgress ? "Cannot add numbers during session" : "Add new number to queue"}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Number
          </motion.button>
        </div>

        <div className="space-y-3">
          {callingQueue.map((entry, index) => (
            <motion.div
              key={entry.id}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                entry.status === 'calling'
                  ? 'bg-orange-50 border-orange-500 shadow-md ring-1 ring-orange-200'
                  : entry.status === 'completed'
                  ? 'bg-gray-50 border-green-200 opacity-75'
                  : index === nextCallIndex
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base sm:text-lg font-medium break-words">{entry.name}</h4>
                    
                    {entry.status === 'calling' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[10px] sm:text-xs rounded-full uppercase tracking-wider animate-pulse font-bold">
                        <Phone className="w-3 h-3" /> Calling...
                      </span>
                    )}
                    
                    {entry.status === 'completed' && (
                      <span className="px-2 py-1 bg-green-500 text-white text-[10px] sm:text-xs rounded-full uppercase tracking-wider font-bold">
                        Completed
                      </span>
                    )}

                    {index === nextCallIndex && entry.status === 'pending' && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-[10px] sm:text-xs rounded-full whitespace-nowrap uppercase tracking-wider font-bold">
                        Next Call
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-600 break-all">{entry.phone}</p>
                  {entry.notes && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 italic break-words">{entry.notes}</p>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-400 font-mono flex-shrink-0">#{index + 1}</span>
              </div>
            </motion.div>
          ))}
          
          {callingQueue.length === 0 && (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              Queue is empty. Add a number to get started.
            </div>
          )}
        </div>
      </motion.div>

      {/* Upload Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${sessionInProgress ? 'opacity-60 pointer-events-none' : ''}`}
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
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${sessionInProgress ? 'opacity-60 pointer-events-none' : ''}`}
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

      {/* AI Tools & Capabilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${sessionInProgress ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <h3 className="text-lg sm:text-xl mb-4" style={{ color: accentColor }}>AI Tools & Capabilities</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">Toggle tools on/off to control what the AI agent can access during calls.</p>
        
        {isLoadingTools ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-500">Loading tools...</span>
          </div>
        ) : availableTools.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No tools available. Add databases or configure human experts to see tools here.
          </div>
        ) : (
          <div className="space-y-4">
            {availableTools.map((tool) => (
              <div key={tool.id} className={`flex sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border-2 ${
                tool.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base sm:text-lg break-words">{tool.name}</h4>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-semibold ${
                      tool.type === 'base' ? 'bg-blue-100 text-blue-700' :
                      tool.type === 'database' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {tool.type}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">{tool.description}</p>
                </div>
                <motion.button
                  onClick={() => toggleTool(tool.id)}
                  disabled={isTogglingTool === tool.id}
                  className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                    isTogglingTool === tool.id ? 'opacity-50 cursor-not-allowed' :
                    tool.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  whileTap={!sessionInProgress && isTogglingTool !== tool.id ? { scale: 0.95 } : {}}
                  title={`Toggle ${tool.name}`}
                >
                  {isTogglingTool === tool.id ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <motion.div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ left: tool.enabled ? '30px' : '4px' }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              </div>
            ))}
          </div>
        )}
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
      <AddHumanExpertModal
        isOpen={showHumanExpertModal}
        onClose={() => setShowHumanExpertModal(false)}
        onAdd={handleAddHumanExpert}
        accentColor={accentColor}
        isLoading={isCreatingExpert}
      />
    </div>
  );
}