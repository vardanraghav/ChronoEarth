export interface CityOffsets {
  temp: number;
  tempRise: number;
  seaLevel: number;
  population: number;
  popGrowth: number;
}

export interface DBCity {
  id: string | number;
  created_at: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  year: number;
  offsets: CityOffsets;
  details: Record<string, string>;
  image_url?: string | null;
}

export interface DBNews {
  id: string | number;
  created_at: string;
  title: string;
  category: string;
  time: string;
  description: string;
  image: string;
  slug: string;
  year: number;
  image_url?: string | null;
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  votes: number;
  replies?: Comment[];
}

export interface DBPrediction {
  id: string | number;
  created_at: string;
  title: string;
  slug: string;
  description: string;
  category: 'AI' | 'Climate' | 'Energy' | 'Space' | 'Cities' | 'Transport' | 'Healthcare' | 'Society';
  year: 2030 | 2040 | 2050;
  author: string;
  city: string;
  confidence_score: number;
  initial_votes: number;
  votes: number;
  tags: string[];
  comments: Comment[];
  share_url: string;
  image_url?: string | null;
}

export interface DBSignal {
  id: string | number;
  created_at: string;
  title: string;
  name: string;
  value: string;
  type: string;
  category: string;
  year: number;
  status: string;
  image_url?: string | null;
}

export interface DBKnowledgeBase {
  id: string | number;
  created_at: string;
  title: string;
  category: string;
  stats: Record<string, string | number> | null;
  explanation: string;
  forecast: string;
  risks: string[] | null;
  opportunities: string[] | null;
  sources: string[] | null;
  // Additional fields for KB Articles
  short_desc?: string;
  content?: string;
  readiness_index?: number;
  impact_level?: string;
  slug?: string;
  image_url?: string | null;
}

export interface DBFuturologist {
  id: string | number;
  created_at: string;
  name: string;
  slug: string;
  role: string;
  specialization: string;
  avatar: string;
  bio: string;
  contributions: number;
  influenceScore: number;
  image_url?: string | null;
}

export interface DBMarketSnapshot {
  id: string | number;
  created_at: string;
  ticker: string;
  price: number;
  change: number;
  change_percent: string;
  volume: number;
  timestamp: string;
  image_url?: string | null;
}

export interface DBEarthquake {
  id: string | number;
  created_at: string;
  usgs_id: string;
  magnitude: number;
  place: string;
  time: string;
  lat: number;
  lon: number;
  depth: number | null;
  image_url?: string | null;
}

export interface DBSpaceEvent {
  id: string | number;
  created_at: string;
  event_type: 'APOD' | 'NEO' | 'EPIC';
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  metadata: Record<string, any> | null;
  slug: string | null;
}

export interface DBClimateSnapshot {
  id: string | number;
  created_at: string;
  city_name: string;
  temperature: number;
  humidity: number | null;
  windspeed: number | null;
  rainfall: number | null;
  year: number;
  scenario: string | null;
  timestamp: string;
  image_url?: string | null;
}

export interface DBSemiconductorNews {
  id: string | number;
  created_at: string;
  company: string;
  title: string;
  description: string | null;
  url: string;
  source: string | null;
  image_url: string | null;
  published_at: string;
  slug: string;
}

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: DBCity;
        Insert: Omit<DBCity, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBCity>;
      };
      news: {
        Row: DBNews;
        Insert: Omit<DBNews, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBNews>;
      };
      predictions: {
        Row: DBPrediction;
        Insert: Omit<DBPrediction, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBPrediction>;
      };
      signals: {
        Row: DBSignal;
        Insert: Omit<DBSignal, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBSignal>;
      };
      knowledge_base: {
        Row: DBKnowledgeBase;
        Insert: Omit<DBKnowledgeBase, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBKnowledgeBase>;
      };
      futurologists: {
        Row: DBFuturologist;
        Insert: Omit<DBFuturologist, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBFuturologist>;
      };
      market_snapshots: {
        Row: DBMarketSnapshot;
        Insert: Omit<DBMarketSnapshot, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBMarketSnapshot>;
      };
      earthquakes: {
        Row: DBEarthquake;
        Insert: Omit<DBEarthquake, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBEarthquake>;
      };
      space_events: {
        Row: DBSpaceEvent;
        Insert: Omit<DBSpaceEvent, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBSpaceEvent>;
      };
      climate_snapshots: {
        Row: DBClimateSnapshot;
        Insert: Omit<DBClimateSnapshot, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBClimateSnapshot>;
      };
      semiconductor_news: {
        Row: DBSemiconductorNews;
        Insert: Omit<DBSemiconductorNews, 'id' | 'created_at'> & { id?: string | number; created_at?: string };
        Update: Partial<DBSemiconductorNews>;
      };
    };
  };
}
