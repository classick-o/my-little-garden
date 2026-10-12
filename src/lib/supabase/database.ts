/**
 * Forma bazei de date, scrisa de mana.
 *
 * Tine pasul cu `supabase/migrations`. Orice migratie care schimba o coloana
 * trebuie sa schimbe si fisierul asta - altfel tipurile mint, si mint tacut.
 *
 * Scrisa de mana si nu generata pentru ca generarea cere conexiune directa la
 * Postgres, pe care mediul nostru nu o are la indemana; aici avem nevoie doar
 * de tabelele pe care le atingem.
 */

export type SunlightLevel = "low" | "medium" | "bright_indirect" | "direct";

export type PlantEventType =
  | "created"
  | "watered"
  | "photo_added"
  | "note_added"
  | "fertilized"
  | "repotted"
  | "pruned"
  | "moved"
  | "ai_analysis";

export type AIAnalysisType = "identification" | "health" | "care";

/** Sfaturile de ingrijire, asa cum stau in coloana `plants.care`. */
export type CareJson = {
  light?: string;
  watering?: string;
  humidity?: string;
  temperature?: string;
};

export type PlantRow = {
  id: string;
  user_id: string;
  name: string;
  species: string | null;
  description: string | null;
  location: string | null;
  sunlight: SunlightLevel | null;
  watering_interval_days: number;
  /** Ultima udare. `next_watering_at` se calculeaza, nu se stocheaza. */
  last_watered_at: string | null;
  care: CareJson;
  cover_photo_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PlantPhotoRow = {
  id: string;
  plant_id: string;
  user_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type PlantEventRow = {
  id: string;
  /** Nul pentru evenimente care privesc gradina, nu o planta anume. */
  plant_id: string | null;
  user_id: string;
  type: PlantEventType;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type PlantAIAnalysisRow = {
  id: string;
  plant_id: string | null;
  photo_id: string | null;
  user_id: string;
  analysis_type: AIAnalysisType;
  result: Record<string, unknown>;
  confidence: number | null;
  model: string;
  prompt_version: string;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  garden_name: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Legaturile dintre tabele.
 *
 * Clientul le cere ca sa stie ce imbinari sunt valide: fara ele,
 * `select("..., plants ( name )")` nu compileaza. Se scriu doar cele pe care
 * le folosim.
 */
type ToPlant = [
  {
    foreignKeyName: string;
    columns: ["plant_id"];
    isOneToOne: false;
    referencedRelation: "plants";
    referencedColumns: ["id"];
  },
];

/* Forma pe care o asteapta clientul Supabase. Doar tabelele pe care le
   folosim: ce nu e aici nu se poate interoga gresit, fiindca nu compileaza. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      plants: {
        Row: PlantRow;
        Insert: Omit<PlantRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<PlantRow, "id" | "user_id">>;
        Relationships: [];
      };
      plant_photos: {
        Row: PlantPhotoRow;
        Insert: Omit<PlantPhotoRow, "id" | "created_at"> & { id?: string };
        Update: Partial<PlantPhotoRow>;
        Relationships: ToPlant;
      };
      plant_events: {
        Row: PlantEventRow;
        Insert: Omit<PlantEventRow, "id" | "created_at"> & { id?: string };
        Update: Partial<PlantEventRow>;
        Relationships: ToPlant;
      };
      plant_ai_analysis: {
        Row: PlantAIAnalysisRow;
        Insert: Omit<PlantAIAnalysisRow, "id" | "created_at"> & { id?: string };
        Update: Partial<PlantAIAnalysisRow>;
        Relationships: ToPlant;
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      sunlight_level: SunlightLevel;
      plant_event_type: PlantEventType;
      ai_analysis_type: AIAnalysisType;
    };
    CompositeTypes: Record<never, never>;
  };
};
