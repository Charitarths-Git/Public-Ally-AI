"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Home, List, Database, BookOpen, FileText, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { UserSession } from '@/types';
import CallNotification from '@/components/ui/CallNotification';
import API_ENDPOINTS from '@/lib/api-config';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'calling-list', label: 'Calling List', icon: List, path: '/dashboard/calling-list' },
  { id: 'databases', label: 'Databases', icon: Database, path: '/dashboard/databases' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, path: '/dashboard/knowledge-base' },
  { id: 'results', label: 'Call History', icon: FileText, path: '/dashboard/results' },
  { id: 'how-to-use', label: 'How to Use', icon: HelpCircle, path: '/dashboard/how-to-use' },
];

interface Notification {
  id: string;
  callId: string;
  phoneNumber: string;
  customerName?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCallId, setLastCallId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      setUserSession(JSON.parse(session));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CALL_HISTORY);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const latestCall = data[0];
            if (latestCall.call_id !== lastCallId) {
              if (lastCallId !== null) {
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
      }
    };

    fetchCallHistory();
    const interval = setInterval(fetchCallHistory, 5000);
    return () => clearInterval(interval);
  }, [lastCallId]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  if (!userSession) return null;

  const isGovernanceTheme = userSession.theme === 'governance';
  const bgGradient = isGovernanceTheme
    ? 'linear-gradient(135deg, #FFE5CC 0%, #FFDAB3 20%, #FFE8D6 35%, #C8E6C9 55%, #A5D6A7 75%, #E3F2FD 100%)'
    : 'linear-gradient(135deg, #F5F7FA 0%, #E3F2FD 100%)';
  
  const accentColor = isGovernanceTheme ? '#001f3f' : '#1976D2';

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: bgGradient }}>
      
      {notifications.map(notification => (
        <CallNotification
          key={notification.id}
          callId={notification.callId}
          phoneNumber={notification.phoneNumber}
          customerName={notification.customerName}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* Sidebar - Desktop (FIXED) */}
      <motion.aside
        className="hidden lg:flex lg:flex-col w-72 bg-white shadow-2xl h-screen fixed left-0 top-0 z-40"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="p-6 border-b-2 flex-shrink-0" style={{ borderColor: accentColor }}>
          <h2 className="text-2xl" style={{ color: accentColor }}>LokMitra-AI</h2>
          <p className="text-sm text-gray-600 mt-1">AI Voice Partner</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <motion.button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive ? 'bg-opacity-10 shadow-md' : 'hover:bg-gray-100'
                }`}
                style={{ backgroundColor: isActive ? `${accentColor}20` : undefined }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Icon className="w-5 h-5" style={{ color: isActive ? accentColor : '#6B7280' }} />
                <span style={{ color: isActive ? accentColor : '#374151' }}>{item.label}</span>

                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ backgroundColor: accentColor }}
                    layoutId="activeIndicator"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar*/}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
            >
              <div className="p-6 border-b-2 flex items-center justify-between" style={{ borderColor: accentColor }}>
                <div>
                  <h2 className="text-2xl" style={{ color: accentColor }}>LokMitra-AI</h2>
                  <p className="text-sm text-gray-600 mt-1">AI Voice Partner</p>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                        isActive ? 'bg-opacity-10 shadow-md' : 'hover:bg-gray-100'
                      }`}
                      style={{ backgroundColor: isActive ? `${accentColor}20` : undefined }}
                    >
                      <Icon className="w-5 h-5" style={{ color: isActive ? accentColor : '#6B7280' }} />
                      <span style={{ color: isActive ? accentColor : '#374151' }}>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content*/}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden max-w-full lg:ml-72">
        <div className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" style={{ color: accentColor }} />
          </button>
          <h2 className="text-xl" style={{ color: accentColor }}>LokMitra-AI</h2>
          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden max-w-full">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
