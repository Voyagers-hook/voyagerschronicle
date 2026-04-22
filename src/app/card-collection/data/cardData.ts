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

export const allCards: FishingCard[] = [];

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
