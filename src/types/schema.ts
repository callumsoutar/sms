// Aviation Safety Management System TypeScript Types

// Enum Types
export type OccurrenceStatus = 'reported' | 'in_review' | 'under_investigation' | 'closed';
export type OccurrenceType = 'incident' | 'accident' | 'hazard' | 'observation';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type InvestigationStage = 'not_started' | 'data_collection' | 'analysis' | 'recommendations' | 'review' | 'completed';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type UserRole = 'admin' | 'safety_officer' | 'investigator' | 'reporter' | 'readonly';

// Profile Interface
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  position?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Aircraft Interface
export interface Aircraft {
  id: string;
  registration: string;
  type: string;
  model: string;
  year?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Occurrence Interface
export interface Occurrence {
  id: string;
  title: string;
  occurrence_date: string;
  location: string;
  occurrence_type: OccurrenceType;
  severity: SeverityLevel;
  status: OccurrenceStatus;
  description: string;
  aircraft_id?: string;
  reporter_id: string;
  assigned_to?: string;
  weather_conditions?: string;
  flight_phase?: string;
  immediate_actions?: string;
  is_invalid?: boolean;
  invalid_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (optional)
  aircraft?: Aircraft;
  reporter?: Profile;
  assignee?: Profile;
  investigation?: Investigation;
  attachments?: Attachment[];
}

// Investigation Interface
export interface Investigation {
  id: string;
  occurrence_id: string;
  lead_investigator_id?: string;
  stage: InvestigationStage;
  findings?: string;
  root_causes?: string;
  contributing_factors?: string;
  recommendations?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (optional)
  occurrence?: Occurrence;
  lead_investigator?: Profile;
  updates?: InvestigationUpdate[];
  corrective_actions?: CorrectiveAction[];
  attachments?: Attachment[];
}

// Investigation Update Interface
export interface InvestigationUpdate {
  id: string;
  investigation_id: string;
  user_id: string;
  note: string;
  created_at: string;
  
  // Relations (optional)
  investigation?: Investigation;
  user?: Profile;
}

// Corrective Action Interface
export interface CorrectiveAction {
  id: string;
  investigation_id: string;
  title: string;
  description: string;
  assigned_to?: string;
  status: ActionStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (optional)
  investigation?: Investigation;
  assignee?: Profile;
}

// Attachment Interface
export interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  occurrence_id?: string | null;
  investigation_id?: string | null;
  uploaded_by: string;
  created_at: string;
  
  // Relations (optional)
  occurrence?: Occurrence;
  investigation?: Investigation;
  uploader?: Profile;
}

// Notification Interface
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
  
  // Relations (optional)
  user?: Profile;
}

// Dashboard Stats Interface
export interface DashboardStats {
  open_occurrences: number;
  closed_occurrences: number;
  occurrences_last_30_days: number;
  pending_actions: number;
  overdue_actions: number;
} 