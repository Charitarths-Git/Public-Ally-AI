/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

// Get the API base URL from environment variable or use default
const getApiBaseUrl = (): string => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // In production, use the same origin or environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  // Server-side rendering
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Agent Configuration
  AGENT_CONFIGURATION: `${API_BASE_URL}/api/agent-configuration/`,
  AGENT_CONFIGURATION_UPDATE: `${API_BASE_URL}/api/agent-configuration/update/`,
  
  // Human Experts
  HUMAN_EXPERTS: `${API_BASE_URL}/api/human-experts/`,
  CREATE_HUMAN_EXPERT: `${API_BASE_URL}/api/create-human-expert/`,
  DELETE_HUMAN_EXPERT: (id: string | number) => `${API_BASE_URL}/api/human-experts/${id}/`,
  
  // Tools
  AVAILABLE_TOOLS: `${API_BASE_URL}/api/available-tools/`,
  TOOL_STATUS_UPDATE: `${API_BASE_URL}/api/tool-status/update/`,
  
  // Calling
  START_OUTBOUND_CALLING: `${API_BASE_URL}/api/start-outbound-calling/`,
  START_INBOUND_AGENT: `${API_BASE_URL}/api/start-inbound-agent/`,
  STOP_CALLING: `${API_BASE_URL}/api/stop-calling/`,
  CALL_HISTORY: `${API_BASE_URL}/api/call-history/`,
  
  // Documents
  DOCUMENTS: `${API_BASE_URL}/api/documents/`,
  UPLOAD_DOCUMENT: `${API_BASE_URL}/api/upload-document/`,
  DELETE_DOCUMENT: (id: string | number) => `${API_BASE_URL}/api/documents/${id}/`,
  
  // Databases
  GET_DATABASES: `${API_BASE_URL}/api/get-databases/`,
  DELETE_DATABASE: `${API_BASE_URL}/api/delete-database/`,
  CONNECT_DATABASE: `${API_BASE_URL}/api/connect-database/`,
  CONNECT_SUPABASE: `${API_BASE_URL}/api/connect-supabase/`,
  CONNECT_GOOGLE_SHEETS: `${API_BASE_URL}/api/connect-google-sheets/`,
  UPLOAD_CSV: `${API_BASE_URL}/api/upload-csv/`,
} as const;

export default API_ENDPOINTS;
