import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Upload, Loader2, CheckCircle2, Link, Globe, Table, Key, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import API_ENDPOINTS from '../../lib/api-config';

interface ConnectDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

type DataSourceType = 'supabase' | 'excel' | 'csv' | 'googlesheets';

export default function ConnectDatabaseModal({ isOpen, onClose, accentColor }: ConnectDatabaseModalProps) {
  const [sourceType, setSourceType] = useState<DataSourceType>('supabase');
  
  // Permissions Logic
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states for Supabase
  const [dbDisplayName, setDbDisplayName] = useState(''); 
  const [host, setHost] = useState('');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('postgres');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');
  const [tableName, setTableName] = useState('');
  const [supabaseAccessToken, setSupabaseAccessToken] = useState('');

  // Form states for Google Sheets
  const [sheetUrl, setSheetUrl] = useState('');

  const handleConnect = async () => {
    // 1. Validation Logic
    if (sourceType === 'supabase' && (!host || !database || !username || !password || !tableName || !supabaseAccessToken)) {
      alert("Please fill in all Supabase connection details and your Access Token.");
      return;
    }
    if (sourceType === 'googlesheets' && !sheetUrl) {
      alert("Please provide the Google Sheet URL.");
      return;
    }
    if ((sourceType === 'csv' || sourceType === 'excel') && !selectedFile) {
      alert("Please upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append('source_type', sourceType);
    formData.append('can_read', String(canRead));
    formData.append('can_write', String(canWrite));
    formData.append('name', dbDisplayName || (selectedFile ? selectedFile.name : `Dataset_${Date.now()}`));

    // 2. Routing to correct Endpoint
    let endpoint: string = API_ENDPOINTS.CONNECT_DATABASE; // Default for Files

    if (sourceType === 'supabase') {
      endpoint = API_ENDPOINTS.CONNECT_SUPABASE;
      formData.append('host', host);
      formData.append('database', database);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('port', port);
      formData.append('table_name', tableName);
      formData.append('access_token', supabaseAccessToken);
    } 
    else if (sourceType === 'googlesheets') {
      endpoint = API_ENDPOINTS.CONNECT_GOOGLE_SHEETS;
      formData.append('sheet_url', sheetUrl);
    } 
    else if (selectedFile) {
      formData.append('file', selectedFile);
    }

    setIsProcessing(true);
    setStatusMessage(`Provisioning ${sourceType.toUpperCase()} Infrastructure...`);

    try {
      const response = await axios.post(endpoint, formData);
      
      if (response.data.success) {
        setStatusMessage('Success! Sahayaki is now Synced.');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      alert(err.response?.data?.error || "Failed to establish connection. Check console for details.");
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const resetForm = () => {
    setDbDisplayName(''); setHost(''); setPort('5432'); setDatabase('postgres');
    setUsername('postgres'); setPassword(''); setTableName('');
    setSupabaseAccessToken(''); setSheetUrl(''); setSelectedFile(null);
    setCanWrite(false); // Reset to read-only for safety
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto relative border border-gray-100"
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Syncing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center rounded-3xl text-center p-10">
                <Loader2 className="w-14 h-14 animate-spin mb-6" style={{ color: accentColor }} />
                <p className="text-xl font-black text-gray-900">{statusMessage}</p>
                <p className="text-sm text-gray-400 mt-2 font-medium italic px-10">
                  Initializing Cloud Functions and Vapi dynamic tool definitions...
                </p>
              </div>
            )}

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: accentColor }}>
                  <Database className="w-7 h-7" /> Link Data Source
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Empower Sahayaki with live external data</p>
              </div>
              <X className="w-6 h-6 cursor-pointer text-gray-300 hover:text-gray-900 transition-colors" onClick={onClose} />
            </div>

            {/* Infrastructure Selector */}
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 block">Select Environment</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'supabase', label: 'Supabase', icon: Globe },
                  { id: 'excel', label: 'Excel', icon: Table },
                  { id: 'csv', label: 'CSV', icon: FileSpreadsheet },
                  { id: 'googlesheets', label: 'Google Sheets', icon: Link }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setSourceType(type.id as DataSourceType); setSelectedFile(null); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      sourceType === type.id 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-200' 
                        : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Identifier */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Dataset Display Name</label>
              <input 
                type="text" placeholder="e.g. MCD_Garbage_Schedule" 
                value={dbDisplayName} onChange={(e) => setDbDisplayName(e.target.value)} 
                className="w-full mt-1 px-5 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-bold text-gray-700" 
              />
            </div>

            {/* --- SOURCE SPECIFIC FIELDS --- */}

            {/* Supabase Flow */}
            {sourceType === 'supabase' && (
              <div className="space-y-4 mb-8">
                <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <label className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4" /> Management Access Token
                  </label>
                  <input 
                    type="password" placeholder="sbp_xxxxxxxxxxxx" 
                    value={supabaseAccessToken} onChange={(e) => setSupabaseAccessToken(e.target.value)} 
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none font-bold text-sm shadow-sm" 
                  />
                  <p className="text-[9px] text-blue-400 font-bold uppercase mt-2">Used to deploy Edge Functions to your project.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Host (db.xxx.supabase.co)" value={host} onChange={(e) => setHost(e.target.value)} className="px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" />
                  <input type="text" placeholder="Database (usually postgres)" value={database} onChange={(e) => setDatabase(e.target.value)} className="px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="User (usually postgres)" value={username} onChange={(e) => setUsername(e.target.value)} className="px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" />
                  <input type="password" placeholder="DB Password" value={password} onChange={(e) => setPassword(e.target.value)} className="px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Port (5432)" value={port} onChange={(e) => setPort(e.target.value)} className="px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" />
                  <input type="text" placeholder="Target Table (public.schemes)" value={tableName} onChange={(e) => setTableName(e.target.value)} className="px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-sm" />
                </div>
              </div>
            )}

            {/* Google Sheets Flow */}
            {sourceType === 'googlesheets' && (
              <div className="mb-8 space-y-4">
                <div className="p-5 bg-green-50/50 rounded-3xl border border-green-100">
                  <label className="text-[10px] font-black uppercase text-green-600 flex items-center gap-2 mb-2">
                    <Link className="w-4 h-4" /> Google Spreadsheet URL
                  </label>
                  <input 
                    type="url" placeholder="https://docs.google.com/spreadsheets/d/..." 
                    value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} 
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none font-bold text-sm shadow-sm" 
                  />
                  <p className="text-[9px] text-green-400 font-bold uppercase mt-2">Ensure the sheet is shared with 'Anyone with the link can view'.</p>
                </div>
              </div>
            )}

            {/* File Upload Flow */}
            {(sourceType === 'excel' || sourceType === 'csv') && (
              <div className="mb-8">
                <label className="block cursor-pointer">
                  <div className="border-4 border-dashed border-gray-50 bg-gray-50 rounded-3xl p-12 text-center transition-all hover:border-gray-200">
                    <Upload className="w-10 h-10 mx-auto text-gray-300 mb-4" />
                    <p className="text-xs font-black uppercase text-gray-900">{selectedFile ? selectedFile.name : `Drop ${sourceType.toUpperCase()} Dataset here`}</p>
                    {selectedFile && <button onClick={(e) => {e.preventDefault(); setSelectedFile(null);}} className="text-[9px] font-black text-red-500 uppercase mt-2 underline">Change File</button>}
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept={sourceType === 'excel' ? '.xlsx,.xls' : '.csv'} />
                </label>
              </div>
            )}

            {/* Agentic Permissions (Now handles Sheets Write Access) */}
            <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Intelligence Permissions
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">Read Access</span>
                    <span className="text-[10px] text-gray-400 font-medium">Allow Sahayaki to query this for knowledge.</span>
                  </div>
                  <input type="checkbox" checked={canRead} onChange={(e) => setCanRead(e.target.checked)} className="w-5 h-5 accent-gray-900" />
                </div>
                <div className={`flex items-center justify-between transition-opacity ${sourceType === 'googlesheets' ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">Write Access (Append)</span>
                    <span className="text-[10px] text-gray-400 font-medium italic">Vapi native tool for ticketing/logs.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    disabled={sourceType !== 'googlesheets'} 
                    checked={canWrite} 
                    onChange={(e) => setCanWrite(e.target.checked)} 
                    className="w-5 h-5 accent-gray-900" 
                  />
                </div>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={onClose} 
                className="flex-1 py-5 text-[11px] font-black uppercase text-gray-400 hover:bg-gray-50 rounded-2xl tracking-[0.2em] transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleConnect} 
                disabled={isProcessing}
                className="flex-[2] py-5 text-[11px] font-black uppercase text-white rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                style={{ backgroundColor: accentColor }}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync with Sahayaki'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}