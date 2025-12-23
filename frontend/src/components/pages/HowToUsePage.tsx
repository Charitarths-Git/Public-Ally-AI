import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  List, 
  Database, 
  BookOpen, 
  FileText, 
  Settings, 
  Phone, 
  Upload, 
  CheckCircle,
  Users,
  Zap
} from 'lucide-react';

interface HowToUsePageProps {
  accentColor: string;
}

const sections = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: Home,
    content: 'LokMitra-AI is an AI-powered voice partner designed for public outreach in Delhi. It serves as the first point of contact between institutions (government bodies, political parties, companies, and organizations) and citizens, capable of handling both inbound and outbound calls autonomously.',
    features: [
      'Autonomous voice calling capabilities',
      'Context-aware conversations with citizens',
      'Multi-source knowledge integration',
      'Human-in-the-loop escalation',
      'Governance-grade reliability and transparency'
    ]
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: 'To begin using LokMitra-AI, select your organization type on the login page. Each type has a tailored theme and configuration options.',
    features: [
      'Select your category: Government Body, Political Party, Company, or Organization',
      'Choose or enter your specific department/body name',
      'Use demo credentials to explore the platform',
      'Once logged in, customize your AI agent on the Home page'
    ]
  },
  {
    id: 'home-page',
    title: 'Home Page Configuration',
    icon: Settings,
    content: 'The Home page is your central hub for configuring the AI agent and managing core settings.',
    features: [
      'Customize AI Agent Name (default: "LokMitra")',
      'Set Human-in-the-Loop escalation phone number',
      'View the official outbound calling number',
      'Manage the calling queue with priority ordering',
      'Upload documents for AI knowledge base',
      'Connect databases for real-time data access',
      'Enable/disable AI capabilities and controls'
    ]
  },
  {
    id: 'calling-queue',
    title: 'Managing the Calling Queue',
    icon: Phone,
    content: 'Add phone numbers to the calling queue for the AI to contact. The queue processes calls in order from top to bottom.',
    features: [
      'Click "Add Number" to add new entries with name, phone, and optional notes',
      'View all queued calls with their position and details',
      'The next call to be made is highlighted in the queue',
      'Special notes help the AI understand context for each call'
    ]
  },
  {
    id: 'calling-list',
    title: 'Calling List Management',
    icon: List,
    content: 'The Calling List page provides advanced management of phone numbers with drag-and-drop prioritization.',
    features: [
      'Add new entries with name, phone number, and description',
      'Drag and drop rows to change call priority',
      'Edit descriptions inline for each entry',
      'Delete entries that are no longer needed',
      'All changes reflect in real-time'
    ]
  },
  {
    id: 'databases',
    title: 'Database Connections',
    icon: Database,
    content: 'Connect external databases to enable the AI to read and modify records based on caller needs.',
    features: [
      'Support for PostgreSQL, Excel, CSV, and external APIs',
      'Secure credential management',
      'Set granular permissions (read-only or read-write)',
      'View connected database tables with live data',
      'AI can create tickets, update records, and retrieve information'
    ]
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Base Documents',
    icon: BookOpen,
    content: 'Upload documents that the AI can reference during calls to provide accurate, organization-specific information.',
    features: [
      'Upload PDFs, Word documents, text files, and more',
      'Documents are automatically indexed for AI reference',
      'Click any document to view its contents',
      'Zoom in/out for easier reading',
      'AI reads and reasons over uploaded content during calls'
    ]
  },
  {
    id: 'results',
    title: 'Results and Call Analytics',
    icon: FileText,
    content: 'Review detailed records of all AI interactions, including inbound and outbound calls.',
    features: [
      'Toggle between Inbound and Outbound call views',
      'See call duration, phone number, and timestamp',
      'Read AI-generated summaries of each conversation',
      'View specific actions taken (database access, ticket creation, etc.)',
      'Download call transcripts for compliance and review',
      'Identify which calls were fully resolved by AI vs. escalated'
    ]
  },
  {
    id: 'ai-capabilities',
    title: 'AI Capabilities & Controls',
    icon: CheckCircle,
    content: 'Control what the AI agent is allowed to do during calls. All capabilities are enabled by default but can be toggled.',
    features: [
      'Create/Update Tickets: Allow AI to manage ticketing system',
      'Search Internet: Enable AI to search online for answers',
      'Modify Database Records: Grant write access to databases',
      'Add Human Agent: Allow AI to escalate calls to live operators',
      'Toggle any capability on/off based on your requirements'
    ]
  },
  {
    id: 'human-escalation',
    title: 'Human-in-the-Loop Escalation',
    icon: Users,
    content: 'When the AI encounters a situation beyond its capabilities, it can automatically escalate to a human agent.',
    features: [
      'Set a dedicated escalation phone number on the Home page',
      'AI intelligently determines when human intervention is needed',
      'Seamless handoff with full context transfer',
      'All escalations are logged in Results page',
      'Ensures critical or sensitive issues receive human attention'
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: CheckCircle,
    content: 'Follow these recommendations to get the most out of LokMitra-AI.',
    features: [
      'Keep knowledge base documents up-to-date with latest policies',
      'Review AI call summaries regularly to identify improvement areas',
      'Set appropriate permissions for database access',
      'Test with demo accounts before production deployment',
      'Monitor escalation patterns to optimize AI training',
      'Maintain accurate calling list with detailed notes for context'
    ]
  }
];

export default function HowToUsePage({ accentColor }: HowToUsePageProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl mb-2" style={{ color: accentColor }}>How to Use LokMitra-AI</h1>
        <p className="text-gray-600">Complete guide to using the platform effectively</p>
      </motion.div>

      <div className="space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: accentColor }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl mb-2" style={{ color: accentColor }}>{section.title}</h2>
                  <p className="text-gray-700">{section.content}</p>
                </div>
              </div>

              <div className="ml-16">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {section.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + idx * 0.02 }}
                    >
                      <CheckCircle 
                        className="w-5 h-5 mt-0.5 flex-shrink-0" 
                        style={{ color: accentColor }} 
                      />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
      >
        <h3 className="text-lg mb-2" style={{ color: accentColor }}>Need Help?</h3>
        <p className="text-gray-700">
          LokMitra-AI is designed to be intuitive and user-friendly. If you have questions 
          or need assistance, hover over any icon or button in the dashboard for contextual 
          tooltips and explanations. The platform is built with governance-grade reliability 
          and transparency in mind, ensuring you maintain full control and visibility over 
          all AI actions.
        </p>
      </motion.div>
    </div>
  );
}
