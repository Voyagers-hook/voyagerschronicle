export type CardRarity = 'Widespread' | 'Elusive' | 'Specimen' | 'Legendary';

export interface FishingCard {
  id: string;
  name: string;
  species: string;
  rarity: CardRarity;
  image?: string;
  power: number;
  stealth: number;
  stamina: number;
  beauty: number;
  habitat: string;
  description: string;
  collected: boolean;
  collectedDate?: string;
  cardNumber: number;
  totalCards: number;
  foil?: boolean;
  gradient: string;
  borderColor: string;
}

export const rarityConfig: Record<CardRarity, { color: string; bg: string; glow: string; label: string; badge: string }> = {
  Widespread: { color: 'text-earth-600',   bg: 'bg-earth-100',   glow: 'shadow-earth-200',    label: 'Widespread',  badge: 'bg-earth-200 text-earth-700' },
  Elusive:    { color: 'text-green-700',   bg: 'bg-green-50',    glow: 'shadow-green-200',    label: 'Elusive',     badge: 'bg-green-100 text-green-800' },
  Specimen:   { color: 'text-blue-700',    bg: 'bg-blue-50',     glow: 'shadow-blue-300',     label: 'Specimen',    badge: 'bg-blue-100 text-blue-800' },
  Legendary:  { color: 'text-amber-700',   bg: 'bg-amber-50',    glow: 'shadow-amber-400',    label: 'Legendary',   badge: 'bg-amber-100 text-amber-800' },
};

export const allCards: FishingCard[] = [
  { id: 'card-001', cardNumber: 1,  totalCards: 24, name: 'Murray Cod',       species: 'Maccullochella peelii',   rarity: 'Legendary',  power: 95, stealth: 70, stamina: 90, beauty: 85, habitat: 'River',   description: 'The king of Australian freshwater fish. Massive and powerful.',           collected: true,  collectedDate: '14 Apr 2026', foil: true,  gradient: 'from-amber-400 via-yellow-300 to-amber-500',   borderColor: '#F59E0B' },
  { id: 'card-002', cardNumber: 2,  totalCards: 24, name: 'Rainbow Trout',    species: 'Oncorhynchus mykiss',     rarity: 'Specimen',   power: 72, stealth: 60, stamina: 65, beauty: 90, habitat: 'Stream',  description: 'Prized for its stunning colours and fighting spirit.',                   collected: true,  collectedDate: '10 Apr 2026', foil: false, gradient: 'from-blue-400 via-cyan-300 to-teal-400',       borderColor: '#3B82F6' },
  { id: 'card-003', cardNumber: 3,  totalCards: 24, name: 'Golden Perch',     species: 'Macquaria ambigua',       rarity: 'Specimen',   power: 81, stealth: 55, stamina: 75, beauty: 88, habitat: 'Lake',    description: 'Gleaming golden scales that shimmer in the sunlight.',                   collected: true,  collectedDate: '8 Apr 2026',  foil: true,  gradient: 'from-yellow-400 via-amber-300 to-orange-400',  borderColor: '#F59E0B' },
  { id: 'card-004', cardNumber: 4,  totalCards: 24, name: 'Barramundi',       species: 'Lates calcarifer',        rarity: 'Specimen',   power: 88, stealth: 65, stamina: 80, beauty: 78, habitat: 'Coast',   description: 'The iconic Aussie sport fish. Fast, strong, and delicious.',             collected: false, foil: false, gradient: 'from-teal-400 via-emerald-300 to-green-400',   borderColor: '#10B981' },
  { id: 'card-005', cardNumber: 5,  totalCards: 24, name: 'Flathead',         species: 'Platycephalus fuscus',    rarity: 'Elusive',    power: 58, stealth: 85, stamina: 60, beauty: 45, habitat: 'Coast',   description: 'A sneaky ambush predator hiding in the sand.',                           collected: true,  collectedDate: '2 Apr 2026',  foil: false, gradient: 'from-gray-400 via-slate-300 to-gray-500',      borderColor: '#6B7280' },
  { id: 'card-006', cardNumber: 6,  totalCards: 24, name: 'Yellowfin Bream',  species: 'Acanthopagrus australis', rarity: 'Widespread', power: 42, stealth: 50, stamina: 45, beauty: 65, habitat: 'Estuary', description: 'A reliable catch for young anglers learning the ropes.',                 collected: true,  collectedDate: '28 Mar 2026', foil: false, gradient: 'from-yellow-300 via-amber-200 to-yellow-400',  borderColor: '#FCD34D' },
  { id: 'card-007', cardNumber: 7,  totalCards: 24, name: 'Silver Perch',     species: 'Bidyanus bidyanus',       rarity: 'Elusive',    power: 55, stealth: 70, stamina: 58, beauty: 60, habitat: 'River',   description: 'A native gem making a comeback in our waterways.',                       collected: false, foil: false, gradient: 'from-slate-300 via-gray-200 to-slate-400',     borderColor: '#94A3B8' },
  { id: 'card-008', cardNumber: 8,  totalCards: 24, name: 'Snapper',          species: 'Chrysophrys auratus',     rarity: 'Specimen',   power: 76, stealth: 62, stamina: 70, beauty: 82, habitat: 'Ocean',   description: 'The red beauty of the deep. A trophy catch for any angler.',             collected: false, foil: false, gradient: 'from-red-400 via-rose-300 to-red-500',         borderColor: '#EF4444' },
  { id: 'card-009', cardNumber: 9,  totalCards: 24, name: 'Whiting',          species: 'Sillago ciliata',         rarity: 'Widespread', power: 35, stealth: 55, stamina: 38, beauty: 58, habitat: 'Beach',   description: 'Perfect for beginners. Tasty and fun to catch from the beach.',          collected: true,  collectedDate: '20 Mar 2026', foil: false, gradient: 'from-stone-300 via-zinc-200 to-stone-400',     borderColor: '#A8A29E' },
  { id: 'card-010', cardNumber: 10, totalCards: 24, name: 'Jewfish',          species: 'Argyrosomus japonicus',   rarity: 'Specimen',   power: 84, stealth: 78, stamina: 82, beauty: 75, habitat: 'Estuary', description: 'A powerful fighter that tests every angler\'s skill.',                  collected: false, foil: true,  gradient: 'from-indigo-400 via-violet-300 to-purple-400', borderColor: '#8B5CF6' },
  { id: 'card-011', cardNumber: 11, totalCards: 24, name: 'Carp',             species: 'Cyprinus carpio',         rarity: 'Widespread', power: 28, stealth: 40, stamina: 50, beauty: 30, habitat: 'Lake',    description: 'Introduced but widespread. Great for practice casting.',                 collected: true,  collectedDate: '15 Mar 2026', foil: false, gradient: 'from-amber-700 via-yellow-600 to-amber-800',   borderColor: '#92400E' },
  { id: 'card-012', cardNumber: 12, totalCards: 24, name: 'Kingfish',         species: 'Seriola lalandi',         rarity: 'Legendary',  power: 97, stealth: 80, stamina: 95, beauty: 88, habitat: 'Ocean',   description: 'The ultimate offshore trophy. Speed and power combined.',                collected: false, foil: true,  gradient: 'from-amber-400 via-yellow-300 to-amber-500',   borderColor: '#F59E0B' },
  { id: 'card-013', cardNumber: 13, totalCards: 24, name: 'Luderick',         species: 'Girella tricuspidata',    rarity: 'Elusive',    power: 48, stealth: 80, stamina: 52, beauty: 55, habitat: 'Rock',    description: 'The blackfish. A challenging catch requiring patience.',                 collected: false, foil: false, gradient: 'from-gray-700 via-slate-600 to-gray-800',      borderColor: '#374151' },
  { id: 'card-014', cardNumber: 14, totalCards: 24, name: 'Tailor',           species: 'Pomatomus saltatrix',     rarity: 'Widespread', power: 45, stealth: 60, stamina: 48, beauty: 52, habitat: 'Beach',   description: 'Fast and ferocious. Watch those teeth!',                                 collected: true,  collectedDate: '5 Mar 2026',  foil: false, gradient: 'from-cyan-400 via-sky-300 to-blue-400',        borderColor: '#06B6D4' },
  { id: 'card-015', cardNumber: 15, totalCards: 24, name: 'Trevally',         species: 'Caranx ignobilis',        rarity: 'Specimen',   power: 70, stealth: 65, stamina: 72, beauty: 68, habitat: 'Reef',    description: 'A hard-fighting schooling fish loved by sport anglers.',                 collected: false, foil: false, gradient: 'from-teal-500 via-cyan-400 to-teal-600',       borderColor: '#14B8A6' },
  { id: 'card-016', cardNumber: 16, totalCards: 24, name: 'Catfish',          species: 'Tandanus tandanus',       rarity: 'Widespread', power: 32, stealth: 65, stamina: 42, beauty: 35, habitat: 'River',   description: 'The whiskered bottom-dweller of our rivers.',                            collected: true,  collectedDate: '1 Mar 2026',  foil: false, gradient: 'from-stone-400 via-amber-300 to-stone-500',    borderColor: '#78716C' },
  { id: 'card-017', cardNumber: 17, totalCards: 24, name: 'Marlin',           species: 'Makaira nigricans',       rarity: 'Legendary',  power: 99, stealth: 75, stamina: 98, beauty: 92, habitat: 'Ocean',   description: 'The ultimate game fish. A once-in-a-lifetime catch.',                   collected: false, foil: true,  gradient: 'from-blue-600 via-indigo-500 to-blue-700',     borderColor: '#2563EB' },
  { id: 'card-018', cardNumber: 18, totalCards: 24, name: 'Redfin Perch',     species: 'Perca fluviatilis',       rarity: 'Elusive',    power: 52, stealth: 68, stamina: 55, beauty: 70, habitat: 'Lake',    description: 'Striking red fins make this an eye-catching catch.',                    collected: false, foil: false, gradient: 'from-red-300 via-rose-200 to-red-400',         borderColor: '#F87171' },
  { id: 'card-019', cardNumber: 19, totalCards: 24, name: 'Mackerel',         species: 'Scomberomorus commerson', rarity: 'Specimen',   power: 74, stealth: 72, stamina: 76, beauty: 70, habitat: 'Ocean',   description: 'Lightning fast. A blur of silver in the blue water.',                   collected: false, foil: false, gradient: 'from-sky-400 via-blue-300 to-sky-500',         borderColor: '#38BDF8' },
  { id: 'card-020', cardNumber: 20, totalCards: 24, name: 'Estuary Perch',    species: 'Macquaria colonorum',     rarity: 'Elusive',    power: 60, stealth: 75, stamina: 62, beauty: 68, habitat: 'Estuary', description: 'A stealthy predator lurking in mangrove roots.',                         collected: true,  collectedDate: '22 Feb 2026', foil: false, gradient: 'from-green-400 via-emerald-300 to-green-500',  borderColor: '#22C55E' },
  { id: 'card-021', cardNumber: 21, totalCards: 24, name: 'Mulloway',         species: 'Argyrosomus japonicus',   rarity: 'Specimen',   power: 86, stealth: 82, stamina: 84, beauty: 78, habitat: 'Estuary', description: 'The ghost of the estuary. Best caught at night.',                        collected: false, foil: true,  gradient: 'from-violet-500 via-purple-400 to-violet-600', borderColor: '#7C3AED' },
  { id: 'card-022', cardNumber: 22, totalCards: 24, name: 'Bream',            species: 'Acanthopagrus butcheri',  rarity: 'Widespread', power: 40, stealth: 52, stamina: 44, beauty: 48, habitat: 'Estuary', description: 'The bread-and-butter fish of Australian estuaries.',                    collected: true,  collectedDate: '18 Feb 2026', foil: false, gradient: 'from-zinc-300 via-gray-200 to-zinc-400',       borderColor: '#A1A1AA' },
  { id: 'card-023', cardNumber: 23, totalCards: 24, name: 'Salmon Trout',     species: 'Salmo trutta',            rarity: 'Specimen',   power: 68, stealth: 58, stamina: 65, beauty: 80, habitat: 'Stream',  description: 'Introduced from Europe, now a prized catch in cold streams.',            collected: false, foil: false, gradient: 'from-orange-400 via-amber-300 to-orange-500',  borderColor: '#F97316' },
  { id: 'card-024', cardNumber: 24, totalCards: 24, name: 'The Voyager',      species: 'Mythicus voyagerus',      rarity: 'Legendary',  power: 100,stealth: 100,stamina: 100,beauty: 100,habitat: 'Legend',  description: 'The rarest card of all. Only true Voyagers can unlock this.',            collected: false, foil: true,  gradient: 'from-amber-400 via-yellow-300 to-amber-500',   borderColor: '#F59E0B' },
];

export function getUserStats(cards: FishingCard[]) {
  const collected = cards.filter(c => c.collected);
  return {
    power:   collected.reduce((s, c) => s + c.power,   0),
    stealth: collected.reduce((s, c) => s + c.stealth, 0),
    stamina: collected.reduce((s, c) => s + c.stamina, 0),
    beauty:  collected.reduce((s, c) => s + c.beauty,  0),
    total:   collected.reduce((s, c) => s + c.power + c.stealth + c.stamina + c.beauty, 0),
  };
}
