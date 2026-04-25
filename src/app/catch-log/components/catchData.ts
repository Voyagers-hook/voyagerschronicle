export interface CatchEntry {
  id: string;
  species: string;
  weight: number;        // lbs
  length: number;        // cm
  location: string;
  waterType: string;
  date: string;
  notes: string;
  status?: 'pending' | 'approved' | 'rejected';
  photoUrl?: string;
}

export const initialCatches: CatchEntry[] = [];

// UK freshwater & sea species for the typeahead
export const UK_SPECIES = [
  // Freshwater
  'Barbel', 'Bream', 'Carp (Common)', 'Carp (Mirror)', 'Carp (Grass)',
  'Chub', 'Crucian Carp', 'Dace', 'Eel', 'Grayling', 'Gudgeon', 'Ide',
  'Perch', 'Pike', 'Roach', 'Rudd', 'Ruffe', 'Salmon (Atlantic)',
  'Tench', 'Trout (Brown)', 'Trout (Rainbow)', 'Zander',
  // Sea
  'Bass (Sea)', 'Bream (Black)', 'Bream (Red)', 'Coalfish', 'Cod',
  'Conger Eel', 'Dab', 'Dover Sole', 'Flounder', 'Garfish', 'Haddock',
  'Mackerel', 'Mullet (Grey)', 'Plaice', 'Pollock', 'Smoothhound',
  'Turbot', 'Whiting', 'Wrasse',
  // Other
  'Other (specify in notes)',
];
