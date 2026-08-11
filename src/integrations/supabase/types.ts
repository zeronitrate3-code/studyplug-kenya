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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value?: number
          description: string
          icon?: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ai_tutor_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarked_notes: {
        Row: {
          created_at: string
          id: string
          note_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_notes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          flagged: boolean | null
          id: string
          image_url: string | null
          room_id: string
          text: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          flagged?: boolean | null
          id?: string
          image_url?: string | null
          room_id: string
          text?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          flagged?: boolean | null
          id?: string
          image_url?: string | null
          room_id?: string
          text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          grade_level: number | null
          icon: string | null
          id: string
          image_url: string | null
          is_custom: boolean
          member_count: number | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          grade_level?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_custom?: boolean
          member_count?: number | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          grade_level?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_custom?: boolean
          member_count?: number | null
          name?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          text: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          text?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          text?: string | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json
          created_at: string
          exam_id: string | null
          grade_id: number | null
          id: string
          question_ids: Json
          started_at: string
          status: string
          subject_id: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          exam_id?: string | null
          grade_id?: number | null
          id?: string
          question_ids?: Json
          started_at?: string
          status?: string
          subject_id: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          exam_id?: string | null
          grade_id?: number | null
          id?: string
          question_ids?: Json
          started_at?: string
          status?: string
          subject_id?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string
          id: string
          position: number
          question_id: string
        }
        Insert: {
          exam_id: string
          id?: string
          position?: number
          question_id: string
        }
        Update: {
          exam_id?: string
          id?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          created_at: string
          grade: number
          id: string
          percentage: number
          points: number
          score: number
          subject_id: string
          subject_name: string
          total_questions: number
          user_id: string
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          percentage: number
          points?: number
          score: number
          subject_id: string
          subject_name: string
          total_questions: number
          user_id: string
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          percentage?: number
          points?: number
          score?: number
          subject_id?: string
          subject_name?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          grade_id: number | null
          id: string
          is_published: boolean
          question_count: number
          subject_id: string
          time_limit_seconds: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          grade_id?: number | null
          id?: string
          is_published?: boolean
          question_count?: number
          subject_id: string
          time_limit_seconds?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          grade_id?: number | null
          id?: string
          is_published?: boolean
          question_count?: number
          subject_id?: string
          time_limit_seconds?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      grade_subjects: {
        Row: {
          grade_id: number
          subject_id: string
        }
        Insert: {
          grade_id: number
          subject_id: string
        }
        Update: {
          grade_id?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_subjects_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      leaderboard_stats: {
        Row: {
          exams_taken: number
          sum_percentage: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          exams_taken?: number
          sum_percentage?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          exams_taken?: number
          sum_percentage?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_progress: {
        Row: {
          bookmarked: boolean
          completed: boolean
          created_at: string
          grade: number | null
          id: string
          last_read_at: string | null
          subject_id: string | null
          topic_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean
          completed?: boolean
          created_at?: string
          grade?: number | null
          id?: string
          last_read_at?: string | null
          subject_id?: string | null
          topic_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean
          completed?: boolean
          created_at?: string
          grade?: number | null
          id?: string
          last_read_at?: string | null
          subject_id?: string | null
          topic_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          common_mistakes: string | null
          content: string | null
          created_at: string
          created_by: string | null
          examples: string | null
          formulas: string | null
          id: string
          introduction: string | null
          key_points: string | null
          order_number: number
          summary: string | null
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          common_mistakes?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          examples?: string | null
          formulas?: string | null
          id?: string
          introduction?: string | null
          key_points?: string | null
          order_number?: number
          summary?: string | null
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          common_mistakes?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          examples?: string | null
          formulas?: string | null
          id?: string
          introduction?: string | null
          key_points?: string | null
          order_number?: number
          summary?: string | null
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          note_id: string
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          order_number: number
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          note_id: string
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          order_number?: number
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          note_id?: string
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          order_number?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_questions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          grade: number | null
          id: string
          is_private: boolean
          last_seen_at: string | null
          pathway: string | null
          selected_subjects: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          grade?: number | null
          id?: string
          is_private?: boolean
          last_seen_at?: string | null
          pathway?: string | null
          selected_subjects?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          grade?: number | null
          id?: string
          is_private?: boolean
          last_seen_at?: string | null
          pathway?: string | null
          selected_subjects?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          created_by: string | null
          difficulty: string
          explanation: string | null
          grade_id: number | null
          id: string
          legacy_key: string | null
          options: Json
          question: string
          subject_id: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          grade_id?: number | null
          id?: string
          legacy_key?: string | null
          options: Json
          question: string
          subject_id: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          grade_id?: number | null
          id?: string
          legacy_key?: string | null
          options?: Json
          question?: string
          subject_id?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          attempt_id: string | null
          created_at: string
          exam_id: string | null
          grade_id: number | null
          id: string
          percentage: number
          points: number
          score: number
          subject_id: string
          subject_name: string
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          created_at?: string
          exam_id?: string | null
          grade_id?: number | null
          id?: string
          percentage: number
          points?: number
          score: number
          subject_id: string
          subject_name: string
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          created_at?: string
          exam_id?: string | null
          grade_id?: number | null
          id?: string
          percentage?: number
          points?: number
          score?: number
          subject_id?: string
          subject_name?: string
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      student_note_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_viewed_at: string
          note_id: string
          progress_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_viewed_at?: string
          note_id: string
          progress_percentage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_viewed_at?: string
          note_id?: string
          progress_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_note_progress_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_leaderboard_stats: {
        Row: {
          exams_taken: number
          subject_id: string
          sum_percentage: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          exams_taken?: number
          subject_id: string
          sum_percentage?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          exams_taken?: number
          subject_id?: string
          sum_percentage?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string | null
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          code?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          grade_id: number | null
          id: string
          name: string
          order_number: number
          subject_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_id?: number | null
          id?: string
          name: string
          order_number?: number
          subject_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_id?: number | null
          id?: string
          name?: string
          order_number?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          avg_percentage: number | null
          display_name: string | null
          exams_taken: number | null
          grade: number | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
    Enums: {
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
