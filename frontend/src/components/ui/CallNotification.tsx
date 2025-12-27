import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';

interface CallNotificationProps {
  callId: string;
  phoneNumber: string;
  customerName?: string;
  onClose: () => void;
  autoCloseDelay?: number; // in milliseconds, default 10000 (10 seconds)
}

export default function CallNotification({
  callId,
  phoneNumber,
  customerName,
  onClose,
  autoCloseDelay = 10000
}: CallNotificationProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto-close timer
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (autoCloseDelay / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close notification"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Call Completed
              </h3>
              <p className="text-sm text-gray-600">
                Call with <span className="font-medium">{customerName || phoneNumber}</span> has been completed
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-2">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-medium text-gray-900">{phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Call ID:</span>
                <span className="font-mono text-xs text-gray-700">{callId.slice(0, 20)}...</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Report generated in Call History section
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
