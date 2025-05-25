/**
 * Database models and helpers
 */
import { supabase } from "./client";
import type { Database } from "./types";

export type Tables = Database["public"]["Tables"];

// User profile types
export type UserProfile = Tables["user_profiles"]["Row"];
export type InsertUserProfile = Tables["user_profiles"]["Insert"];
export type UpdateUserProfile = Tables["user_profiles"]["Update"];

// Organization types
export type Organization = Tables["organizations"]["Row"];
export type InsertOrganization = Tables["organizations"]["Insert"];
export type UpdateOrganization = Tables["organizations"]["Update"];

// Matching types
export type Match = Tables["matches"]["Row"];
export type InsertMatch = Tables["matches"]["Insert"];
export type UpdateMatch = Tables["matches"]["Update"];

/**
 * User profile model with helper functions
 */
export const UserProfiles = {
  /**
   * Get a user profile by ID
   */
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  },

  /**
   * Create a new user profile
   */
  async create(profile: InsertUserProfile): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return null;
    }

    return data;
  },

  /**
   * Update a user profile
   */
  async update(
    id: string,
    profile: UpdateUserProfile
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(profile)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  },
};

/**
 * Organizations model with helper functions
 */
export const Organizations = {
  /**
   * Get an organization by ID
   */
  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching organization:", error);
      return null;
    }

    return data;
  },

  /**
   * Create a new organization
   */
  async create(organization: InsertOrganization): Promise<Organization | null> {
    const { data, error } = await supabase
      .from("organizations")
      .insert(organization)
      .select()
      .single();

    if (error) {
      console.error("Error creating organization:", error);
      return null;
    }

    return data;
  },
};
