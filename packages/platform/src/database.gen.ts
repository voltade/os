export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app: {
        Row: {
          created_at: string
          description: string | null
          display_name: string | null
          id: string
          org_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          org_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          org_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_org_id_org_id_fk"
            columns: ["org_id"]
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
      app_installation: {
        Row: {
          app_id: string
          created_at: string
          environment_id: string
          org_id: string | null
          updated_at: string
        }
        Insert: {
          app_id: string
          created_at?: string
          environment_id: string
          org_id?: string | null
          updated_at?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          environment_id?: string
          org_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_installation_app_id_app_id_fk"
            columns: ["app_id"]
            referencedRelation: "app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_installation_environment_id_environment_id_fk"
            columns: ["environment_id"]
            referencedRelation: "environment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_installation_org_id_org_id_fk"
            columns: ["org_id"]
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
      environment: {
        Row: {
          anon_key: string
          created_at: string
          database_instance_count: number
          description: string | null
          display_name: string | null
          id: string
          is_production: boolean
          org_id: string
          runner_count: number
          service_key: string
          updated_at: string
        }
        Insert: {
          anon_key: string
          created_at?: string
          database_instance_count?: number
          description?: string | null
          display_name?: string | null
          id?: string
          is_production?: boolean
          org_id: string
          runner_count?: number
          service_key: string
          updated_at?: string
        }
        Update: {
          anon_key?: string
          created_at?: string
          database_instance_count?: number
          description?: string | null
          display_name?: string | null
          id?: string
          is_production?: boolean
          org_id?: string
          runner_count?: number
          service_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environment_org_id_org_id_fk"
            columns: ["org_id"]
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_variable: {
        Row: {
          created_at: string
          description: string | null
          environment_id: string
          id: string
          name: string
          org_id: string
          secret_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          environment_id: string
          id?: string
          name: string
          org_id: string
          secret_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          environment_id?: string
          id?: string
          name?: string
          org_id?: string
          secret_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environment_variable_environment_id_environment_id_fk"
            columns: ["environment_id"]
            referencedRelation: "environment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_variable_org_id_org_id_fk"
            columns: ["org_id"]
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
      org: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_domain: {
        Row: {
          created_at: string
          domain: string
          id: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_domain_org_id_org_id_fk"
            columns: ["org_id"]
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
      org_join_identity: {
        Row: {
          created_at: string
          identity_id: string
          org_id: string
        }
        Insert: {
          created_at?: string
          identity_id: string
          org_id: string
        }
        Update: {
          created_at?: string
          identity_id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_join_identity_org_id_org_id_fk"
            columns: ["org_id"]
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
