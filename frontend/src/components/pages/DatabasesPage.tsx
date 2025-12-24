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
    <div className="w-full px-4 sm:px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Databases
        </h1>
        <p className="text-sm text-gray-600">
          View and manage connected databases
        </p>
      </motion.div>

      {connectedDatabase ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
        >
          {/* Database Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6" style={{ color: accentColor }} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {connectedDatabase.name}
                </h2>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full mt-1 inline-block">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Table Container - This will scroll horizontally on small screens */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {connectedDatabase.columns.map((col) => (
                      <th 
                        key={col} 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectedDatabase.rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-mono">{row.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px]">
                        <div className="truncate" title={row.address}>
                          {row.address}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          row.status === 'Resolved'
                            ? 'bg-green-100 text-green-800'
                            : row.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : row.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {row.assigned}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-500">
              Showing {connectedDatabase.rows.length} records
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowConnectModal(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Connect Another Database
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors" 
                style={{ backgroundColor: accentColor }}>
                Export Data
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Database Connected
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect a database to allow AI to access and manage records
          </p>
          <motion.button
            onClick={() => setShowConnectModal(true)}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg flex items-center gap-2 mx-auto"
            style={{ backgroundColor: accentColor }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-4 h-4" />
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