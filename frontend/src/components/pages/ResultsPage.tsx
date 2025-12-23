import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Download, Clock, User, CheckCircle, Database, Search, FileText, UserPlus } from 'lucide-react';

interface ResultsPageProps {
  accentColor: string;
}

interface CallRecord {
  id: string;
  type: 'inbound' | 'outbound';
  phone: string;
  name?: string;
  duration: string;
  timestamp: string;
  summary: string;
  actions: string[];
  resolvedByAI: boolean;
}

export default function ResultsPage({ accentColor }: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('outbound');

  const callRecords: CallRecord[] = [
    {
      id: '1',
      type: 'outbound',
      phone: '+91 98765 43210',
      name: 'Rajesh Kumar',
      duration: '4m 32s',
      timestamp: '2024-12-23 10:30 AM',
      summary: 'Called regarding water supply issue in Connaught Place. AI provided information about ongoing maintenance work and created a ticket for follow-up.',
      actions: ['Database Access', 'Ticket Created', 'Document Reference'],
      resolvedByAI: true
    },
    {
      id: '2',
      type: 'outbound',
      phone: '+91 98765 43211',
      name: 'Priya Sharma',
      duration: '6m 15s',
      timestamp: '2024-12-23 10:45 AM',
      summary: 'Inquiry about road maintenance complaint status. AI searched database, found existing ticket, and provided update. Escalated to human agent for special request.',
      actions: ['Database Access', 'Ticket Updated', 'Human Escalation'],
      resolvedByAI: false
    },
    {
      id: '3',
      type: 'inbound',
      phone: '+91 98765 43213',
      name: 'Sneha Gupta',
      duration: '3m 45s',
      timestamp: '2024-12-23 11:00 AM',
      summary: 'Tax payment query. AI accessed database to verify payment status and provided receipt number. Issue fully resolved.',
      actions: ['Database Access', 'Document Reference'],
      resolvedByAI: true
    },
    {
      id: '4',
      type: 'outbound',
      phone: '+91 98765 43212',
      name: 'Amit Patel',
      duration: '5m 20s',
      timestamp: '2024-12-23 11:15 AM',
      summary: 'License application status check. AI searched internet for latest regulations, accessed internal database, and provided comprehensive update.',
      actions: ['Internet Search', 'Database Access', 'Document Reference'],
      resolvedByAI: true
    },
    {
      id: '5',
      type: 'inbound',
      phone: '+91 98765 43214',
      name: 'Vikram Singh',
      duration: '7m 10s',
      timestamp: '2024-12-23 11:30 AM',
      summary: 'Complex complaint requiring policy interpretation. AI referenced multiple documents and escalated to human agent for final decision.',
      actions: ['Document Reference', 'Internet Search', 'Human Escalation'],
      resolvedByAI: false
    },
  ];

  const filteredRecords = callRecords.filter(record => record.type === activeTab);

  const getActionIcon = (action: string) => {
    if (action.includes('Database')) return <Database className="w-4 h-4" />;
    if (action.includes('Internet') || action.includes('Search')) return <Search className="w-4 h-4" />;
    if (action.includes('Document') || action.includes('Ticket')) return <FileText className="w-4 h-4" />;
    if (action.includes('Human')) return <UserPlus className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl mb-2" style={{ color: accentColor }}>Results of Queries</h1>
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
          onClick={() => setActiveTab('outbound')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'outbound' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: activeTab === 'outbound' ? accentColor : 'transparent'
          }}
        >
          Outbound Calls
          {activeTab === 'outbound' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: accentColor }}
              layoutId="tabIndicator"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('inbound')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'inbound' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: activeTab === 'inbound' ? accentColor : 'transparent'
          }}
        >
          Inbound Calls
          {activeTab === 'inbound' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: accentColor }}
              layoutId="tabIndicator"
            />
          )}
        </button>
      </motion.div>

      {/* Call Records */}
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
                    <h3 className="text-lg">{record.name || 'Unknown Caller'}</h3>
                    {record.resolvedByAI && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        AI Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{record.phone}</p>
                </div>
              </div>
              <motion.button
                className="px-4 py-2 flex items-center gap-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download transcript"
              >
                <Download className="w-4 h-4" />
                Transcript
              </motion.button>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {record.duration}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {record.timestamp}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Call Summary</h4>
              <p className="text-gray-700">{record.summary}</p>
            </div>

            {/* Actions Taken */}
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Actions Taken by Agent</h4>
              <div className="flex flex-wrap gap-2">
                {record.actions.map((action, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2 text-sm"
                  >
                    {getActionIcon(action)}
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl mb-2 text-gray-700">No {activeTab} calls yet</h2>
          <p className="text-gray-500">Call records will appear here once the AI starts making or receiving calls</p>
        </motion.div>
      )}
    </div>
  );
}
