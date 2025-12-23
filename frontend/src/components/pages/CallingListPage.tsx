import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, GripVertical, Edit2, Trash2, Save, X } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface CallingListPageProps {
  accentColor: string;
}

interface CallEntry {
  id: string;
  name: string;
  phone: string;
  description: string;
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

  const handleCancelDesc = () => {
    setTempDesc(entry.description);
    setIsEditingDesc(false);
  };

  return (
    <div ref={(node) => preview(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <motion.div
        className="bg-white rounded-lg shadow-md p-4 mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="flex items-start gap-3">
          <div
            ref={drag}
            className="cursor-move mt-2"
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">#{index + 1}</span>
              <h3 className="text-lg">{entry.name}</h3>
            </div>
            <p className="text-gray-600 mb-2">{entry.phone}</p>
            
            {isEditingDesc ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Add description..."
                  autoFocus
                />
                <button
                  onClick={handleSaveDesc}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelDesc}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
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
                  title="Edit description"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CallingListContent({ accentColor }: CallingListPageProps) {
  const [entries, setEntries] = useState<CallEntry[]>([
    { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', description: 'Inquiry about water supply' },
    { id: '2', name: 'Priya Sharma', phone: '+91 98765 43211', description: 'Road maintenance complaint' },
    { id: '3', name: 'Amit Patel', phone: '+91 98765 43212', description: 'License application status' },
    { id: '4', name: 'Sneha Gupta', phone: '+91 98765 43213', description: 'Tax payment query' },
    { id: '5', name: 'Vikram Singh', phone: '+91 98765 43214', description: '' },
  ]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const moveEntry = (dragIndex: number, hoverIndex: number) => {
    const dragEntry = entries[dragIndex];
    const newEntries = [...entries];
    newEntries.splice(dragIndex, 1);
    newEntries.splice(hoverIndex, 0, dragEntry);
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    if (newName.trim() && newPhone.trim()) {
      const newEntry: CallEntry = {
        id: Date.now().toString(),
        name: newName.trim(),
        phone: newPhone.trim(),
        description: newDesc.trim()
      };
      setEntries([newEntry, ...entries]);
      setNewName('');
      setNewPhone('');
      setNewDesc('');
    }
  };

  const handleEdit = (id: string, field: string, value: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl mb-2" style={{ color: accentColor }}>Calling List</h1>
        <p className="text-gray-600">Manage and prioritize phone numbers for AI calling</p>
      </motion.div>

      {/* Add New Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl mb-4 flex items-center gap-2" style={{ color: accentColor }}>
          <Plus className="w-5 h-5" />
          Add New Entry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <motion.button
          onClick={handleAddEntry}
          disabled={!newName.trim() || !newPhone.trim()}
          className="w-full px-4 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          style={{ backgroundColor: newName.trim() && newPhone.trim() ? accentColor : undefined }}
          whileHover={newName.trim() && newPhone.trim() ? { scale: 1.02 } : {}}
          whileTap={newName.trim() && newPhone.trim() ? { scale: 0.98 } : {}}
        >
          Add to List
        </motion.button>
      </motion.div>

      {/* Entries List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Drag and drop entries to change call priority. The top entry will be called first.
          </p>
        </div>

        {entries.map((entry, index) => (
          <CallEntryRow
            key={entry.id}
            entry={entry}
            index={index}
            moveEntry={moveEntry}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor={accentColor}
          />
        ))}
      </motion.div>
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
