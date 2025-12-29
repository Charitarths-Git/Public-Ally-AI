import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, UserPlus } from 'lucide-react';

interface AddHumanExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { phoneNumber: string; expertField: string }) => void;
  accentColor: string;
  isLoading?: boolean;
}

export default function AddHumanExpertModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  accentColor,
  isLoading = false 
}: AddHumanExpertModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [expertField, setExpertField] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim() && expertField.trim()) {
      // Prepend +91 to the phone number
      const fullPhoneNumber = `+91${phoneNumber.trim()}`;
      onAdd({ phoneNumber: fullPhoneNumber, expertField: expertField.trim() });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPhoneNumber('');
      setExpertField('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <UserPlus className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <h2 className="text-2xl" style={{ color: accentColor }}>Add Human Expert</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Configure a human expert for call transfers when the AI needs to escalate sensitive or complex queries.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg"
                    >
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">+91</span>
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10 digit number"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      maxLength={10}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter the 10-digit mobile number without country code</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Field of Expertise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expertField}
                    onChange={(e) => setExpertField(e.target.value)}
                    placeholder="e.g., Legal matters, Technical support, Medical queries"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe the expertise area. AI will transfer calls when users ask about this topic.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !phoneNumber.trim() || !expertField.trim()}
                    className="flex-1 px-4 py-3 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Add Expert</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
