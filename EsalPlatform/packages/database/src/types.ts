/**
 * TypeScript types for the Supabase database
 * Generated from the Supabase API types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          created_at: string;
          id: string;
          match_reason: string | null;
          organization_id: string | null;
          score: number;
          status: string;
          updated_at: string | null;
          user_id_1: string;
          user_id_2: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          match_reason?: string | null;
          organization_id?: string | null;
          score?: number;
          status?: string;
          updated_at?: string | null;
          user_id_1: string;
          user_id_2: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          match_reason?: string | null;
          organization_id?: string | null;
          score?: number;
          status?: string;
          updated_at?: string | null;
          user_id_1?: string;
          user_id_2?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_id_1_fkey";
            columns: ["user_id_1"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_id_2_fkey";
            columns: ["user_id_2"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          logo_url: string | null;
          meta: Json | null;
          name: string;
          slug: string;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          meta?: Json | null;
          name: string;
          slug: string;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          meta?: Json | null;
          name?: string;
          slug?: string;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          availability: Json | null;
          bio: string | null;
          created_at: string;
          email: string;
          id: string;
          interests: string[] | null;
          location: Json | null;
          name: string;
          skills: string[] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          availability?: Json | null;
          bio?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          interests?: string[] | null;
          location?: Json | null;
          name: string;
          skills?: string[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          availability?: Json | null;
          bio?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          interests?: string[] | null;
          location?: Json | null;
          name?: string;
          skills?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
