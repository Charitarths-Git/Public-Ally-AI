import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, DatabaseIcon, GripVertical, Edit2, Trash2, Save, X, Phone, CheckCircle, Clock } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Papa from 'papaparse';
import axios from 'axios';
import API_ENDPOINTS from '../../lib/api-config';

interface CallingListPageProps {
  accentColor: string;
}

// 1. Updated Interface to include status
interface CallEntry {
  id: string;
  name: string;
  phone: string;
  description: string;
  status: 'pending' | 'calling' | 'completed';
}

const ItemType = 'CALL_ENTRY';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

function CallEntryRow({ 
  entry, 
  index, 
  moveEntry, 
  onEdit, 
  onDelete, 
  accentColor 
}: { 
  entry: CallEntry; 
  index: number; 
  moveEntry: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (id: string, field: string, value: string) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(entry.description);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: { type: ItemType, id: entry.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveEntry(item.index, index);
        item.index = index;
      }
    },
  });

  const handleSaveDesc = () => {
    onEdit(entry.id, 'description', tempDesc);
    setIsEditingDesc(false);
  };

  // 2. Helper to get status tag styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'calling':
        return 'bg-orange-500 text-white animate-pulse';
      case 'completed':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calling': return <Phone className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div ref={(node) => preview(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <motion.div
        className={`bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 ${
          entry.status === 'calling' ? 'border-orange-500' : 
          entry.status === 'completed' ? 'border-green-500' : 'border-blue-400'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="flex items-start gap-3">
          <div ref={drag} className="cursor-move mt-2" title="Drag to reorder">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">#{index + 1}</span>
              <h3 className="text-lg font-medium">{entry.name}</h3>
              
              {/* 3. Status Tag UI */}
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(entry.status)}`}>
                {getStatusIcon(entry.status)}
                {entry.status}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{entry.phone}</p>
            
            {isEditingDesc ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button onClick={handleSaveDesc} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditingDesc(false)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-sm text-gray-600 italic">
                  {entry.description || 'No description'}
                </p>
                <button
                  onClick={() => {
                    setTempDesc(entry.description);
                    setIsEditingDesc(true);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CallingListContent({ accentColor }: CallingListPageProps) {
  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAll, setShowAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Fetch real data from Supabase
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CALLING_QUEUE);
        setEntries(response.data);
      } catch (error) {
        console.error("Failed to fetch calling queue:", error);
      }
    };
    fetchEntries();
  }, []);

  const moveEntry = (dragIndex: number, hoverIndex: number) => {
    const dragEntry = entries[dragIndex];
    const newEntries = [...entries];
    newEntries.splice(dragIndex, 1);
    newEntries.splice(hoverIndex, 0, dragEntry);
    setEntries(newEntries);
  };

  const handleAddEntry = async () => {
    if (newName.trim() && newPhone.trim()) {
      try {
        const response = await axios.post(API_ENDPOINTS.CALLING_QUEUE, {
          name: newName.trim(),
          phone: newPhone.trim(),
          description: newDesc.trim()
        });
        if (response.data.success) {
          setEntries([response.data.data, ...entries]);
          setNewName(''); setNewPhone(''); setNewDesc('');
        }
      } catch (error) {
        alert("Error saving to database.");
      }
    }
  };

  // 5. Updated Edit handler with Database Sync
  const handleEdit = async (id: string, field: string, value: string) => {
    try {
      await axios.patch(API_ENDPOINTS.UPDATE_QUEUE_STATUS(id), {
        [field]: value
      });
      setEntries(entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    } catch (error) {
      alert("Could not update database.");
    }
  };

  // 6. Updated Delete handler with Database Sync
  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this entry from the database?")) return;
    try {
      await axios.delete(`${API_ENDPOINTS.CALLING_QUEUE}${id}/`);
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const successfulEntries: CallEntry[] = [];
        for (const row of results.data as any[]) {
          const name = row.name || row.Name || '';
          const phone = row.phone || row.Phone || '';
          const description = row.description || row.notes || '';

          if (name && phone) {
            try {
              const res = await axios.post(API_ENDPOINTS.CALLING_QUEUE, { name, phone, description });
              if (res.data.success) successfulEntries.push(res.data.data);
            } catch (e) { console.error("CSV row skip:", e); }
          }
        }
        setEntries([...successfulEntries, ...entries]);
      }
    });
  };

  const displayedEntries = showAll ? entries : entries.slice(0, 5);
  const hasMoreEntries = entries.length > 5;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: accentColor }}>Calling List</h1>
          <p className="text-sm text-gray-600">Syncing live with Supabase database</p>
        </div>
        <motion.button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-lg text-white shadow-lg" style={{ backgroundColor: accentColor }}>
          <DatabaseIcon className="w-4 h-4" /> Add CSV
        </motion.button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
      </motion.div>

      {/* Add New Entry Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500" />
          <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91..." className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500" />
          <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Notes" className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500" />
        </div>
        <button onClick={handleAddEntry} className="w-full py-3 text-white rounded-lg font-bold shadow-md" style={{ backgroundColor: accentColor }}>Add to Database</button>
      </div>

      {/* Real-time List */}
      <div className="space-y-1">
        {displayedEntries.map((entry, index) => (
          <CallEntryRow key={entry.id} entry={entry} index={index} moveEntry={moveEntry} onEdit={handleEdit} onDelete={handleDelete} accentColor={accentColor} />
        ))}
        {hasMoreEntries && (
          <button onClick={() => setShowAll(!showAll)} className="w-full mt-4 py-3 border-2 rounded-lg font-medium" style={{ borderColor: accentColor, color: accentColor }}>
            {showAll ? 'Show Less' : `Show More (${entries.length - 5} more)`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CallingListPage({ accentColor }: CallingListPageProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CallingListContent accentColor={accentColor} />
    </DndProvider>
  );
}