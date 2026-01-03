import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, Loader2, Trash2, Download } from 'lucide-react';
import axios from 'axios';
import ConnectDatabaseModal from '../modals/ConnectDatabaseModal';
import API_ENDPOINTS from '../../lib/api-config';

interface DatabasesPageProps {
  accentColor: string;
}

interface DatabaseTable {
  id: number;
  name: string;
  rows: any[];
  columns: string[];
}

export default function DatabasesPage({ accentColor }: DatabasesPageProps) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [databases, setDatabases] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.GET_DATABASES);
      const formattedDatabases = response.data.map((db: any) => ({
        id: db.id,
        name: db.name,
        rows: db.data,
        columns: db.data.length > 0 ? Object.keys(db.data[0]) : []
      }));
      setDatabases(formattedDatabases);
    } catch (error) {
      console.error("Failed to fetch databases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  /**
   * Deletes the database from the local Django backend.
   * Because your agent is transient, future calls will naturally 
   * exclude this tool since it no longer exists in your DB.
   */
  /**
   * Deletes the database from the local Django backend.
   */
  const handleDeleteDatabase = async (name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to disconnect "${name.replace(/_/g, ' ')}"? \n\nSahayaki will immediately lose access to this data for all future calls.`
    );

    if (!confirmDelete) return;

    try {
      // FIX: Changed URL to '/api/delete-database/' to match your cleaner view
      await axios.delete(API_ENDPOINTS.DELETE_DATABASE, {
        params: { name: name }
      });

      // Refresh the UI list
      setDatabases(prev => prev.filter(db => db.name !== name));
      
      console.log(`🗑️ Successfully disconnected: ${name}`);
    } catch (error) {
      console.error("Failed to delete database:", error);
      alert("Error: Could not disconnect the database. Check if the delete-database view is registered in urls.py.");
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 py-4 pb-20">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Databases
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage live datasets and scheme information for Sahayaki AI.
          </p>
        </div>
        {databases.length > 0 && (
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4" />
            Connect New Source
          </button>
        )}
      </motion.div>

      {/* Database Lists */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: accentColor }} />
          <p className="text-gray-400 font-medium animate-pulse">Syncing datasets...</p>
        </div>
      ) : databases.length > 0 ? (
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="flex flex-col gap-10 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {databases.map((db, dbIndex) => (
            <motion.div
              key={db.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dbIndex * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-gray-100 flex-shrink-0">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate">
                      {db.name.replace(/_/g, ' ').toUpperCase()}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Store</span>
                    </div>
                  </div>
                </div>
                {/* Updated Delete Button */}
                <button 
                  onClick={() => handleDeleteDatabase(db.name)}
                  className="p-2 sm:p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                  title="Disconnect Database"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>


              {/* Table Container - Scrollable horizontally */}
              <div className="w-full overflow-x-auto max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="bg-white border-b border-gray-100">
                      {db.columns.map((col) => (
                        <th key={col} className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {db.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="group hover:bg-gray-50/50 transition-colors">
                        {db.columns.map((col) => (
                          <td key={col} className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
                            {row[col]?.toString() || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-400">
                  Total Records: <span className="text-gray-900">{db.rows.length}</span>
                </p>
                <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: accentColor }}>
                  <Download className="w-3 h-3" />
                  Export CSV
                </button>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto mt-10"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-50 flex items-center justify-center rotate-3 border border-gray-100">
            <Database className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">No Knowledge Bases Found</h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">
            Link an Excel file to enable Sahayaki to reason through government schemes and public data.
          </p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-8 py-4 text-sm font-black text-white rounded-2xl flex items-center gap-3 mx-auto shadow-xl transition-all hover:translate-y-[-2px]"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-5 h-5" />
            UPLOAD FIRST DATASET
          </button>
        </motion.div>
      )}

      <ConnectDatabaseModal
        isOpen={showConnectModal}
        onClose={() => {
          setShowConnectModal(false);
          fetchDatabases();
        }}
        accentColor={accentColor}
      />
    </div>
  );
}