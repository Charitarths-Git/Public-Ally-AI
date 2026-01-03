import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Download, Clock, User, CheckCircle, Database, Search, FileText, UserPlus, DollarSign, MessageSquare, ChevronDown } from 'lucide-react';
import CallNotification from '../ui/CallNotification';
import API_ENDPOINTS from '../../lib/api-config';

interface ResultsPageProps {
  accentColor: string;
}

interface CallRecord {
  id: number;
  call_id: string;
  phone_number: string;
  customer_name?: string;
  status: string;
  duration: number;
  started_at: string;
  ended_at: string;
  summary: string;
  transcript: string;
  recording_url?: string;
  created_at: string;
}

interface Notification {
  id: string;
  callId: string;
  phoneNumber: string;
  customerName?: string;
}

export default function ResultsPage({ accentColor }: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCallId, setLastCallId] = useState<string | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Set<string>>(new Set());

  const toggleTranscript = (callId: string) => {
    setExpandedTranscripts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callId)) {
        newSet.delete(callId);
      } else {
        newSet.add(callId);
      }
      return newSet;
    });
  };

  // Fetch call history from API
  const fetchCallHistory = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CALL_HISTORY);
      if (response.ok) {
        const data = await response.json();
        console.log('📞 Fetched call history:', data.length, 'calls');
        setCallRecords(data);
        
        // Check for new calls and show notification
        if (data.length > 0) {
          const latestCall = data[0];
          console.log('Latest call ID:', latestCall.call_id);
          console.log('Last known call ID:', lastCallId);
          
          if (latestCall.call_id !== lastCallId) {
            if (lastCallId !== null) {
              // Show notification for new call
              console.log('🔔 New call detected! Showing notification...');
              const newNotification: Notification = {
                id: latestCall.call_id,
                callId: latestCall.call_id,
                phoneNumber: latestCall.phone_number,
                customerName: latestCall.customer_name
              };
              setNotifications(prev => [...prev, newNotification]);
            }
            setLastCallId(latestCall.call_id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 ResultsPage mounted, starting to fetch call history...');
    fetchCallHistory();
    
    // Poll for new calls every 5 seconds
    const interval = setInterval(() => {
      console.log('🔄 Polling for new calls...');
      fetchCallHistory();
    }, 5000);
    
    return () => {
      console.log('🛑 Clearing interval');
      clearInterval(interval);
    };
  }, [lastCallId]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadTranscript = (record: CallRecord) => {
    const content = `
Call ID: ${record.call_id}
Phone Number: ${record.phone_number}
Customer Name: ${record.customer_name || 'Unknown'}
Duration: ${formatDuration(record.duration)}
Started At: ${formatTimestamp(record.started_at)}
Ended At: ${formatTimestamp(record.ended_at)}

SUMMARY:
${record.summary}

TRANSCRIPT:
${record.transcript}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${record.call_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredRecords = activeTab === 'recent' 
    ? callRecords.slice(0, 10) 
    : callRecords;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Notifications */}
      {notifications.map(notification => (
        <CallNotification
          key={notification.id}
          callId={notification.callId}
          phoneNumber={notification.phoneNumber}
          customerName={notification.customerName}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl mb-2" style={{ color: accentColor }}>Call History</h1>
        <p className="text-gray-600">View detailed records of all AI interactions and call outcomes</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-2 mb-6 inline-flex gap-2"
      >
        <button
          onClick={() => setActiveTab('all')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'all' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: activeTab === 'all' ? accentColor : 'transparent'
          }}
        >
          All Calls ({callRecords.length})
          {activeTab === 'all' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: accentColor }}
              layoutId="tabIndicator"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'recent' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: activeTab === 'recent' ? accentColor : 'transparent'
          }}
        >
          Recent (10)
          {activeTab === 'recent' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: accentColor }}
              layoutId="tabIndicator"
            />
          )}
        </button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading call history...</p>
        </div>
      )}

      {/* Call Records */}
      {!loading && (
        <div className="space-y-4">
          {filteredRecords.map((record, index) => (
            <motion.div
              key={record.id}
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Phone className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg">{record.customer_name || 'Unknown Caller'}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-600">{record.phone_number}</p>
                  </div>
                </div>
                <motion.button
                  className="px-4 py-2 flex items-center gap-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadTranscript(record)}
                  title="Download transcript"
                >
                  <Download className="w-4 h-4" />
                  Transcript
                </motion.button>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 mb-4 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDuration(record.duration)}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {formatTimestamp(record.started_at)}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Call ID: {record.call_id.slice(0, 8)}...
                </div>
              </div>

              {/* Summary */}
              {record.summary && (
                <div className="mb-4">
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Call Summary
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{record.summary}</p>
                </div>
              )}

              {/* Transcript - Expandable */}
              {record.transcript && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Transcript
                    </h4>
                    <motion.button
                      onClick={() => toggleTranscript(record.call_id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: accentColor }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {expandedTranscripts.has(record.call_id) ? 'Collapse' : 'Expand'}
                      <motion.div
                        animate={{ rotate: expandedTranscripts.has(record.call_id) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  </div>
                  <motion.div
                    className="bg-gray-50 p-3 rounded-lg overflow-hidden"
                    initial={false}
                    animate={{
                      maxHeight: expandedTranscripts.has(record.call_id) ? '1000px' : '128px'
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className={expandedTranscripts.has(record.call_id) ? '' : 'max-h-32 overflow-hidden'}>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {expandedTranscripts.has(record.call_id) 
                          ? record.transcript 
                          : `${record.transcript.slice(0, 300)}${record.transcript.length > 300 ? '...' : ''}`
                        }
                      </pre>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Recording Link */}
              {record.recording_url && (
                <div>
                  <a
                    href={record.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Recording
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredRecords.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl mb-2 text-gray-700">No calls yet</h2>
          <p className="text-gray-500">Call records will appear here once the AI starts making calls</p>
        </motion.div>
      )}
    </div>
  );
}
