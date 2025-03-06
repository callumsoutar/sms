import { 
  OccurrenceStatus, 
  OccurrenceType, 
  SeverityLevel, 
  InvestigationStage, 
  ActionStatus, 
  UserRole 
} from './schema';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          position: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          position?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          position?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      aircraft: {
        Row: {
          id: string;
          registration: string;
          type: string;
          model: string;
          year: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration: string;
          type: string;
          model: string;
          year?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          registration?: string;
          type?: string;
          model?: string;
          year?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      occurrences: {
        Row: {
          id: string;
          title: string;
          occurrence_date: string;
          location: string;
          occurrence_type: OccurrenceType;
          severity: SeverityLevel;
          status: OccurrenceStatus;
          description: string;
          aircraft_id: string | null;
          reporter_id: string;
          assigned_to: string | null;
          weather_conditions: string | null;
          flight_phase: string | null;
          immediate_actions: string | null;
          is_invalid: boolean | null;
          invalid_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          occurrence_date: string;
          location: string;
          occurrence_type: OccurrenceType;
          severity?: SeverityLevel;
          status?: OccurrenceStatus;
          description: string;
          aircraft_id?: string | null;
          reporter_id: string;
          assigned_to?: string | null;
          weather_conditions?: string | null;
          flight_phase?: string | null;
          immediate_actions?: string | null;
          is_invalid?: boolean | null;
          invalid_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          occurrence_date?: string;
          location?: string;
          occurrence_type?: OccurrenceType;
          severity?: SeverityLevel;
          status?: OccurrenceStatus;
          description?: string;
          aircraft_id?: string | null;
          reporter_id?: string;
          assigned_to?: string | null;
          weather_conditions?: string | null;
          flight_phase?: string | null;
          immediate_actions?: string | null;
          is_invalid?: boolean | null;
          invalid_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "occurrences_aircraft_id_fkey";
            columns: ["aircraft_id"];
            referencedRelation: "aircraft";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrences_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrences_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      investigations: {
        Row: {
          id: string;
          occurrence_id: string;
          lead_investigator_id: string | null;
          stage: InvestigationStage;
          findings: string | null;
          root_causes: string | null;
          contributing_factors: string | null;
          recommendations: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          lead_investigator_id?: string | null;
          stage?: InvestigationStage;
          findings?: string | null;
          root_causes?: string | null;
          contributing_factors?: string | null;
          recommendations?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          occurrence_id?: string;
          lead_investigator_id?: string | null;
          stage?: InvestigationStage;
          findings?: string | null;
          root_causes?: string | null;
          contributing_factors?: string | null;
          recommendations?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investigations_occurrence_id_fkey";
            columns: ["occurrence_id"];
            referencedRelation: "occurrences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investigations_lead_investigator_id_fkey";
            columns: ["lead_investigator_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      investigation_updates: {
        Row: {
          id: string;
          investigation_id: string;
          user_id: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          investigation_id: string;
          user_id: string;
          note: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          investigation_id?: string;
          user_id?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investigation_updates_investigation_id_fkey";
            columns: ["investigation_id"];
            referencedRelation: "investigations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investigation_updates_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      corrective_actions: {
        Row: {
          id: string;
          investigation_id: string;
          title: string;
          description: string;
          assigned_to: string | null;
          status: ActionStatus;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          investigation_id: string;
          title: string;
          description: string;
          assigned_to?: string | null;
          status?: ActionStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          investigation_id?: string;
          title?: string;
          description?: string;
          assigned_to?: string | null;
          status?: ActionStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "corrective_actions_investigation_id_fkey";
            columns: ["investigation_id"];
            referencedRelation: "investigations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "corrective_actions_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      attachments: {
        Row: {
          id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_path: string;
          occurrence_id: string | null;
          investigation_id: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_path: string;
          occurrence_id?: string | null;
          investigation_id?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_path?: string;
          occurrence_id?: string | null;
          investigation_id?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_occurrence_id_fkey";
            columns: ["occurrence_id"];
            referencedRelation: "occurrences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attachments_investigation_id_fkey";
            columns: ["investigation_id"];
            referencedRelation: "investigations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey";
            columns: ["uploaded_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          open_occurrences: number;
          closed_occurrences: number;
          occurrences_last_30_days: number;
          pending_actions: number;
          overdue_actions: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_investigation_for_occurrence: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      update_occurrence_status_on_investigation_update: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      create_notification_for_action_assignment: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      update_overdue_actions: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      occurrence_status: OccurrenceStatus;
      occurrence_type: OccurrenceType;
      severity_level: SeverityLevel;
      investigation_stage: InvestigationStage;
      action_status: ActionStatus;
      user_role: UserRole;
    };
  };
} 