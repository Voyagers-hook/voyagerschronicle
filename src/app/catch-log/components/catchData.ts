export interface CatchEntry {
  id: string;
  species: string;
  weight: number;        // kg — stored as number in Supabase
  length: number;        // cm — stored as number in Supabase
  location: string;
  waterType: string;
  date: string;          // ISO timestamp from Supabase
  notes: string;
  status?: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
  // weather, bait, emoji are not in the DB — removed
}

// Empty — data comes from Supabase, not hardcoded
export const initialCatches: CatchEntry[] = [];
