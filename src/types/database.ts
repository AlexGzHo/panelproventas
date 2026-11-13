export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          actualizado_en: string
          creado_en: string
          creado_por: string | null
          email: string | null
          id: number
          nombre: string
          notas: string | null
          telefono: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          creado_por?: string | null
          email?: string | null
          id?: never
          nombre: string
          notas?: string | null
          telefono?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          creado_por?: string | null
          email?: string | null
          id?: never
          nombre?: string
          notas?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          creado_en: string
          id: string
          nombre: string
          rol: string
        }
        Insert: {
          creado_en?: string
          id: string
          nombre?: string
          rol?: string
        }
        Update: {
          creado_en?: string
          id?: string
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
      plataformas: {
        Row: {
          activo: boolean
          color: string | null
          creado_en: string
          id: number
          nombre: string
        }
        Insert: {
          activo?: boolean
          color?: string | null
          creado_en?: string
          id?: never
          nombre: string
        }
        Update: {
          activo?: boolean
          color?: string | null
          creado_en?: string
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean
          actualizado_en: string
          costo: number
          creado_en: string
          duracion_meses: number
          id: number
          nombre: string
          plataforma_id: number
          precio_venta: number
          tipo_cuenta: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          costo?: number
          creado_en?: string
          duracion_meses?: number
          id?: never
          nombre: string
          plataforma_id: number
          precio_venta: number
          tipo_cuenta?: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          costo?: number
          creado_en?: string
          duracion_meses?: number
          id?: never
          nombre?: string
          plataforma_id?: number
          precio_venta?: number
          tipo_cuenta?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_plataforma_id_fkey"
            columns: ["plataforma_id"]
            isOneToOne: false
            referencedRelation: "plataformas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_plataforma_id_fkey"
            columns: ["plataforma_id"]
            isOneToOne: false
            referencedRelation: "v_ingresos_plataforma_mes"
            referencedColumns: ["plataforma_id"]
          },
          {
            foreignKeyName: "productos_plataforma_id_fkey"
            columns: ["plataforma_id"]
            isOneToOne: false
            referencedRelation: "v_suscripciones"
            referencedColumns: ["plataforma_id"]
          },
        ]
      }
      suscripciones: {
        Row: {
          actualizado_en: string
          anulada: boolean
          anulada_en: string | null
          anulada_motivo: string | null
          cliente_id: number
          costo: number
          creado_en: string
          creado_por: string | null
          fecha_fin: string
          fecha_inicio: string
          fecha_venta: string
          id: number
          metodo_pago: string | null
          notas: string | null
          precio_venta: number
          producto_id: number
          renovacion_de: number | null
        }
        Insert: {
          actualizado_en?: string
          anulada?: boolean
          anulada_en?: string | null
          anulada_motivo?: string | null
          cliente_id: number
          costo: number
          creado_en?: string
          creado_por?: string | null
          fecha_fin: string
          fecha_inicio?: string
          fecha_venta?: string
          id?: never
          metodo_pago?: string | null
          notas?: string | null
          precio_venta: number
          producto_id: number
          renovacion_de?: number | null
        }
        Update: {
          actualizado_en?: string
          anulada?: boolean
          anulada_en?: string | null
          anulada_motivo?: string | null
          cliente_id?: number
          costo?: number
          creado_en?: string
          creado_por?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          fecha_venta?: string
          id?: never
          metodo_pago?: string | null
          notas?: string | null
          precio_venta?: number
          producto_id?: number
          renovacion_de?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_suscripciones"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "suscripciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_suscripciones"
            referencedColumns: ["producto_id"]
          },
          {
            foreignKeyName: "suscripciones_renovacion_de_fkey"
            columns: ["renovacion_de"]
            isOneToOne: false
            referencedRelation: "suscripciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_renovacion_de_fkey"
            columns: ["renovacion_de"]
            isOneToOne: false
            referencedRelation: "v_suscripciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_ingresos_mensuales: {
        Row: {
          costos: number | null
          diferencia: number | null
          ganancia: number | null
          ingresos: number | null
          ingresos_mes_anterior: number | null
          mes: string | null
          variacion_pct: number | null
          ventas: number | null
          ventas_mes_anterior: number | null
        }
        Relationships: []
      }
      v_ingresos_plataforma_mes: {
        Row: {
          ganancia: number | null
          ingresos: number | null
          mes: string | null
          plataforma_color: string | null
          plataforma_id: number | null
          plataforma_nombre: string | null
          ventas: number | null
        }
        Relationships: []
      }
      v_suscripciones: {
        Row: {
          anulada: boolean | null
          anulada_motivo: string | null
          cliente_id: number | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          costo: number | null
          creado_en: string | null
          dias_restantes: number | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          fecha_venta: string | null
          ganancia: number | null
          id: number | null
          metodo_pago: string | null
          notas: string | null
          plataforma_color: string | null
          plataforma_id: number | null
          plataforma_nombre: string | null
          precio_venta: number | null
          producto_id: number | null
          producto_nombre: string | null
          renovacion_de: number | null
          renovada: boolean | null
          tipo_cuenta: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_renovacion_de_fkey"
            columns: ["renovacion_de"]
            isOneToOne: false
            referencedRelation: "suscripciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_renovacion_de_fkey"
            columns: ["renovacion_de"]
            isOneToOne: false
            referencedRelation: "v_suscripciones"
            referencedColumns: ["id"]
          },
        ]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
