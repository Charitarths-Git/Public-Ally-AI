import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Users, Briefcase, Building, Eye, EyeOff, Info } from 'lucide-react';
import type { CategoryType, UserSession } from '@/types';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
}

const categories = [
  { id: 'government' as CategoryType, label: 'Government Body', icon: Building2, color: 'from-orange-500 to-green-600' },
  { id: 'political' as CategoryType, label: 'Political Party', icon: Users, color: 'from-saffron-500 to-blue-900' },
  { id: 'company' as CategoryType, label: 'Company', icon: Briefcase, color: 'from-blue-500 to-blue-700' },
  { id: 'organization' as CategoryType, label: 'Organization', icon: Building, color: 'from-blue-400 to-blue-600' },
];

const governmentDepts = [
  'Department of Education',
  'Municipal Corporation',
  'Health Department',
  'Transport Department',
  'Other'
];

const politicalParties = ['BJP', 'Congress', 'AAP', 'Other'];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [subcategory, setSubcategory] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const currentTheme = selectedCategory === 'government' || selectedCategory === 'political' 
    ? 'governance' 
    : selectedCategory === 'company' || selectedCategory === 'organization'
    ? 'corporate'
    : 'default';

  const getBackgroundGradient = () => {
    switch (currentTheme) {
      case 'governance':
        return 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 25%, #138808 50%, #000080 100%)';
      case 'corporate':
        return `
          linear-gradient(
            135deg,
            #1E3A5F 0%,
            #2B4F81 20%,
            #3A6EA5 40%,
            #1F3C88 65%,
            #162447 100%
          )
        `;
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setSubcategory('');
    setCustomInput('');
    setUsername('');
    setPassword('');
  };

  const useDemoAccount = () => {
    const sub = customInput || subcategory;
    const categoryName = selectedCategory || '';
    const subName = sub.toLowerCase().replace(/\s+/g, '-');
    
    // Create demo session and login immediately
    if (selectedCategory && sub) {
      const theme = currentTheme === 'governance' ? 'governance' : 'corporate';
      onLogin({
        category: selectedCategory,
        subcategory: sub,
        username: `${categoryName}-${subName}-demo-acc`,
        theme
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && (subcategory || customInput) && username && password) {
      const theme = currentTheme === 'governance' ? 'governance' : 'corporate';
      onLogin({
        category: selectedCategory,
        subcategory: customInput || subcategory,
        username,
        theme
      });
    }
  };

  const getSubcategoryOptions = () => {
    if (selectedCategory === 'government') return governmentDepts;
    if (selectedCategory === 'political') return politicalParties;
    return [];
  };

  const showDropdown = selectedCategory === 'government' || selectedCategory === 'political';
  const showTextInput = selectedCategory === 'company' || selectedCategory === 'organization';

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-8 transition-all duration-500"
      style={{
        background: getBackgroundGradient()
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-6xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={`text-5xl mb-3 transition-colors duration-500 ${
            currentTheme === 'governance' ? 'text-orange-700' : 
            currentTheme === 'corporate' ? 'text-blue-900' : 
            'text-white'
          }`}>
            LokMitra-AI
          </h1>
          <p className={`text-xl transition-colors duration-500 ${
            currentTheme === 'governance' ? 'text-gray-800' : 
            currentTheme === 'corporate' ? 'text-gray-700' : 
            'text-white/90'
          }`}>
            AI Voice Partner for Public Outreach in Delhi
          </p>
        </motion.div>

        {/* Category Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            
            return (
              <motion.button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 ${
                  isSelected 
                    ? 'bg-white shadow-2xl scale-105' 
                    : 'bg-white/20 hover:bg-white/30 shadow-lg hover:scale-102'
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{
                    color: isSelected 
                      ? (cat.id === 'government' || cat.id === 'political' ? '#001f3f' : '#1976D2')
                      : '#FFFFFF'
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className="w-12 h-12 mx-auto mb-3" />
                </motion.div>
                <h3 className={`text-lg transition-colors duration-400 ${
                  isSelected ? 'text-gray-900' : 'text-white'
                }`}>
                  {cat.label}
                </h3>
                {isSelected && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r rounded-b-2xl"
                    style={{
                      backgroundImage: cat.id === 'government' || cat.id === 'political'
                        ? 'linear-gradient(to right, #FF9933, #138808)'
                        : 'linear-gradient(to right, #1976D2, #64B5F6)'
                    }}
                    layoutId="categoryIndicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Login Form */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              initial={{ y: 20, opacity: 0, height: 0 }}
              animate={{ y: 0, opacity: 1, height: 'auto' }}
              exit={{ y: -20, opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.form
                onSubmit={handleLogin}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Subcategory Selection */}
                <div className="mb-6">
                  {showDropdown && (
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Select {selectedCategory === 'government' ? 'Department' : 'Party'}
                      </label>
                      <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Choose...</option>
                        {getSubcategoryOptions().map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {showTextInput && (
                    <div>
                      <label className="block text-gray-700 mb-2">
                        {selectedCategory === 'company' ? 'Company Name' : 'Organization Name'}
                      </label>
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder={`Enter ${selectedCategory} name`}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Credentials */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <button
                    type="button"
                    onClick={useDemoAccount}
                    disabled={!subcategory && !customInput}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                    title="Login instantly with demo account credentials"
                  >
                    <Info className="w-5 h-5" />
                    Login with Demo Account
                    <span className="text-xs opacity-80 ml-2 hidden group-hover:inline">
                      (Instant login)
                    </span>
                  </button>
                </div>

                {/* Login Button */}
                <motion.button
                  type="submit"
                  className={`w-full py-4 rounded-xl text-white shadow-lg transition-all duration-300 ${
                    currentTheme === 'governance'
                      ? 'bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login to Dashboard
                </motion.button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
