export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "guide" | "company";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type RequestStatus = "pending" | "approved" | "rejected" | "matched" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          status: ApprovalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role: UserRole;
          status?: ApprovalStatus;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      guide_applications: {
        Row: {
          id: string;
          user_id: string;
          city: string;
          languages: string[];
          specialties: string[];
          experience_years: number;
          bio: string;
          hourly_rate: number | null;
          license_file_path: string | null;
          status: ApprovalStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["guide_applications"]["Row"], "id" | "reviewed_by" | "reviewed_at" | "created_at" | "updated_at"> & {
          id?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["guide_applications"]["Insert"]>;
      };
      company_applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          registration_number: string;
          industry: string;
          website: string | null;
          address: string;
          document_file_path: string | null;
          status: ApprovalStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["company_applications"]["Row"], "id" | "reviewed_by" | "reviewed_at" | "created_at" | "updated_at"> & {
          id?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["company_applications"]["Insert"]>;
      };
      company_guide_requests: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          location: string;
          requested_language: string;
          specialties: string[];
          starts_on: string | null;
          budget: number | null;
          attachment_file_path: string | null;
          status: RequestStatus;
          assigned_guide_id: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["company_guide_requests"]["Row"], "id" | "assigned_guide_id" | "reviewed_by" | "reviewed_at" | "created_at" | "updated_at"> & {
          id?: string;
          assigned_guide_id?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["company_guide_requests"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      approval_status: ApprovalStatus;
      request_status: RequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
