import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Plus } from 'lucide-react';
import ConnectDatabaseModal from '../modals/ConnectDatabaseModal';

interface DatabasesPageProps {
  accentColor: string;
}

interface DatabaseTable {
  name: string;
  rows: any[];
  columns: string[];
}

export default function DatabasesPage({ accentColor }: DatabasesPageProps) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedDatabase, setConnectedDatabase] = useState<DatabaseTable | null>({
    name: 'Citizens Database',
    columns: ['ID', 'Name', 'Phone', 'Address', 'Issue Status', 'Assigned To'],
    rows: [
      { id: 1, name: 'Rajesh Kumar', phone: '+91 98765 43210', address: 'Connaught Place, Delhi', status: 'Open', assigned: 'Agent 1' },
      { id: 2, name: 'Priya Sharma', phone: '+91 98765 43211', address: 'Karol Bagh, Delhi', status: 'In Progress', assigned: 'Agent 2' },
      { id: 3, name: 'Amit Patel', phone: '+91 98765 43212', address: 'Dwarka, Delhi', status: 'Resolved', assigned: 'Agent 1' },
      { id: 4, name: 'Sneha Gupta', phone: '+91 98765 43213', address: 'Rohini, Delhi', status: 'Open', assigned: 'Agent 3' },
      { id: 5, name: 'Vikram Singh', phone: '+91 98765 43214', address: 'Pitampura, Delhi', status: 'Pending', assigned: 'Agent 2' },
    ]
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl mb-2" style={{ color: accentColor }}>Databases</h1>
        <p className="text-gray-600">View and manage connected databases</p>
      </motion.div>

      {connectedDatabase ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6" style={{ color: accentColor }} />
              <h2 className="text-2xl" style={{ color: accentColor }}>{connectedDatabase.name}</h2>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Connected
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: accentColor }}>
                  {connectedDatabase.columns.map((col) => (
                    <th key={col} className="text-left p-3 text-sm uppercase tracking-wider" style={{ color: accentColor }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {connectedDatabase.rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-3">{row.id}</td>
                    <td className="p-3">{row.name}</td>
                    <td className="p-3">{row.phone}</td>
                    <td className="p-3">{row.address}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        row.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">{row.assigned}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Connect Another Database
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl mb-2 text-gray-700">No Database Connected</h2>
          <p className="text-gray-500 mb-6">Connect a database to allow AI to access and manage records</p>
          <motion.button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-3 text-white rounded-lg shadow-lg flex items-center gap-2 mx-auto"
            style={{ backgroundColor: accentColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Connect Database
          </motion.button>
        </motion.div>
      )}

      <ConnectDatabaseModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        accentColor={accentColor}
      />
    </div>
  );
}
