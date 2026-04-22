export type TradeRarity = 'Widespread' | 'Elusive' | 'Specimen' | 'Legendary';

export interface TradeCard {
  id: string;
  name: string;
  rarity: TradeRarity;
  power: number;
  stealth: number;
  stamina: number;
  beauty: number;
  gradient: string;
  borderColor: string;
}

export interface TradeOffer {
  id: string;
  fromMember: string;
  fromInitials: string;
  fromLevel: string;
  offeredCard: TradeCard;
  wantedCard: TradeCard;
  status: 'pending' | 'accepted' | 'declined';
  postedDate: string;
  message?: string;
}

export interface MemberCard {
  memberId: string;
  memberName: string;
  memberInitials: string;
  memberLevel: string;
  cardId: string;
  cardName: string;
  cardRarity: TradeRarity;
  cardPower: number;
  cardStealth: number;
  cardStamina: number;
  cardBeauty: number;
  cardGradient: string;
  cardBorderColor: string;
  isForTrade: boolean;
}

export const tradeOffers: TradeOffer[] = [
  {
    id: 'trade-001',
    fromMember: 'Jake Rivers',
    fromInitials: 'JR',
    fromLevel: 'Silver Angler',
    offeredCard: { id: 'card-005', name: 'Flathead',       rarity: 'Elusive',    power: 58, stealth: 85, stamina: 60, beauty: 45, gradient: 'from-gray-400 via-slate-300 to-gray-500',      borderColor: '#6B7280' },
    wantedCard:  { id: 'card-002', name: 'Rainbow Trout',  rarity: 'Specimen',   power: 72, stealth: 60, stamina: 65, beauty: 90, gradient: 'from-blue-400 via-cyan-300 to-teal-400',       borderColor: '#3B82F6' },
    status: 'pending',
    postedDate: '20 Apr 2026',
    message: 'Would love to trade my Flathead for your Rainbow Trout. Fair deal?',
  },
  {
    id: 'trade-002',
    fromMember: 'Mia Chen',
    fromInitials: 'MC',
    fromLevel: 'Gold Explorer',
    offeredCard: { id: 'card-009', name: 'Whiting',        rarity: 'Widespread', power: 35, stealth: 55, stamina: 38, beauty: 58, gradient: 'from-stone-300 via-zinc-200 to-stone-400',     borderColor: '#A8A29E' },
    wantedCard:  { id: 'card-006', name: 'Yellowfin Bream',rarity: 'Widespread', power: 42, stealth: 50, stamina: 45, beauty: 65, gradient: 'from-yellow-300 via-amber-200 to-yellow-400',  borderColor: '#FCD34D' },
    status: 'pending',
    postedDate: '19 Apr 2026',
    message: 'Swapping commons to complete my set!',
  },
  {
    id: 'trade-003',
    fromMember: 'Tom Mackenzie',
    fromInitials: 'TM',
    fromLevel: 'Legend Member',
    offeredCard: { id: 'card-014', name: 'Tailor',         rarity: 'Widespread', power: 45, stealth: 60, stamina: 48, beauty: 52, gradient: 'from-cyan-400 via-sky-300 to-blue-400',        borderColor: '#06B6D4' },
    wantedCard:  { id: 'card-003', name: 'Golden Perch',   rarity: 'Specimen',   power: 81, stealth: 55, stamina: 75, beauty: 88, gradient: 'from-yellow-400 via-amber-300 to-orange-400',  borderColor: '#F59E0B' },
    status: 'pending',
    postedDate: '18 Apr 2026',
    message: 'Long shot but worth asking — my Tailor for your Golden Perch?',
  },
];

export const membersCards: MemberCard[] = [
  { memberId: 'm1', memberName: 'Jake Rivers',   memberInitials: 'JR', memberLevel: 'Silver Angler', cardId: 'card-008', cardName: 'Snapper',      cardRarity: 'Specimen',   cardPower: 76, cardStealth: 62, cardStamina: 70, cardBeauty: 82, cardGradient: 'from-red-400 via-rose-300 to-red-500',         cardBorderColor: '#EF4444', isForTrade: true },
  { memberId: 'm1', memberName: 'Jake Rivers',   memberInitials: 'JR', memberLevel: 'Silver Angler', cardId: 'card-015', cardName: 'Trevally',     cardRarity: 'Specimen',   cardPower: 70, cardStealth: 65, cardStamina: 72, cardBeauty: 68, cardGradient: 'from-teal-500 via-cyan-400 to-teal-600',       cardBorderColor: '#14B8A6', isForTrade: true },
  { memberId: 'm2', memberName: 'Mia Chen',      memberInitials: 'MC', memberLevel: 'Gold Explorer', cardId: 'card-010', cardName: 'Jewfish',      cardRarity: 'Specimen',   cardPower: 84, cardStealth: 78, cardStamina: 82, cardBeauty: 75, cardGradient: 'from-indigo-400 via-violet-300 to-purple-400', cardBorderColor: '#8B5CF6', isForTrade: true },
  { memberId: 'm3', memberName: 'Tom Mackenzie', memberInitials: 'TM', memberLevel: 'Legend Member', cardId: 'card-012', cardName: 'Kingfish',     cardRarity: 'Legendary',  cardPower: 97, cardStealth: 80, cardStamina: 95, cardBeauty: 88, cardGradient: 'from-amber-400 via-yellow-300 to-amber-500',   cardBorderColor: '#F59E0B', isForTrade: false },
  { memberId: 'm4', memberName: 'Lily Nguyen',   memberInitials: 'LN', memberLevel: 'Bronze Caster', cardId: 'card-019', cardName: 'Mackerel',     cardRarity: 'Specimen',   cardPower: 74, cardStealth: 72, cardStamina: 76, cardBeauty: 70, cardGradient: 'from-sky-400 via-blue-300 to-sky-500',         cardBorderColor: '#38BDF8', isForTrade: true },
  { memberId: 'm5', memberName: 'Sam Torres',    memberInitials: 'ST', memberLevel: 'Gold Explorer', cardId: 'card-021', cardName: 'Mulloway',     cardRarity: 'Specimen',   cardPower: 86, cardStealth: 82, cardStamina: 84, cardBeauty: 78, cardGradient: 'from-violet-500 via-purple-400 to-violet-600', cardBorderColor: '#7C3AED', isForTrade: true },
  { memberId: 'm6', memberName: 'Zoe Park',      memberInitials: 'ZP', memberLevel: 'Silver Angler', cardId: 'card-004', cardName: 'Barramundi',   cardRarity: 'Specimen',   cardPower: 88, cardStealth: 65, cardStamina: 80, cardBeauty: 78, cardGradient: 'from-teal-400 via-emerald-300 to-green-400',   cardBorderColor: '#10B981', isForTrade: true },
  { memberId: 'm7', memberName: 'Ben Walsh',     memberInitials: 'BW', memberLevel: 'Bronze Caster', cardId: 'card-023', cardName: 'Salmon Trout', cardRarity: 'Specimen',   cardPower: 68, cardStealth: 58, cardStamina: 65, cardBeauty: 80, cardGradient: 'from-orange-400 via-amber-300 to-orange-500',  cardBorderColor: '#F97316', isForTrade: true },
];

// My cards (current user) available for trade
export const myCards: MemberCard[] = [
  { memberId: 'me', memberName: 'Finn Mackenzie', memberInitials: 'FM', memberLevel: 'Gold Explorer', cardId: 'card-001', cardName: 'Murray Cod',     cardRarity: 'Legendary',  cardPower: 95, cardStealth: 70, cardStamina: 90, cardBeauty: 85, cardGradient: 'from-amber-400 via-yellow-300 to-amber-500',   cardBorderColor: '#F59E0B', isForTrade: true },
  { memberId: 'me', memberName: 'Finn Mackenzie', memberInitials: 'FM', memberLevel: 'Gold Explorer', cardId: 'card-002', cardName: 'Rainbow Trout',  cardRarity: 'Specimen',   cardPower: 72, cardStealth: 60, cardStamina: 65, cardBeauty: 90, cardGradient: 'from-blue-400 via-cyan-300 to-teal-400',       cardBorderColor: '#3B82F6', isForTrade: true },
  { memberId: 'me', memberName: 'Finn Mackenzie', memberInitials: 'FM', memberLevel: 'Gold Explorer', cardId: 'card-005', cardName: 'Flathead',       cardRarity: 'Elusive',    cardPower: 58, cardStealth: 85, cardStamina: 60, cardBeauty: 45, cardGradient: 'from-gray-400 via-slate-300 to-gray-500',      cardBorderColor: '#6B7280', isForTrade: true },
  { memberId: 'me', memberName: 'Finn Mackenzie', memberInitials: 'FM', memberLevel: 'Gold Explorer', cardId: 'card-006', cardName: 'Yellowfin Bream',cardRarity: 'Widespread', cardPower: 42, cardStealth: 50, cardStamina: 45, cardBeauty: 65, cardGradient: 'from-yellow-300 via-amber-200 to-yellow-400',  cardBorderColor: '#FCD34D', isForTrade: true },
  { memberId: 'me', memberName: 'Finn Mackenzie', memberInitials: 'FM', memberLevel: 'Gold Explorer', cardId: 'card-009', cardName: 'Whiting',        cardRarity: 'Widespread', cardPower: 35, cardStealth: 55, cardStamina: 38, cardBeauty: 58, cardGradient: 'from-stone-300 via-zinc-200 to-stone-400',     cardBorderColor: '#A8A29E', isForTrade: true },
  { memberId: 'me', memberName: 'Finn Mackenzie', memberInitials: 'FM', memberLevel: 'Gold Explorer', cardId: 'card-014', cardName: 'Tailor',         cardRarity: 'Widespread', cardPower: 45, cardStealth: 60, cardStamina: 48, cardBeauty: 52, cardGradient: 'from-cyan-400 via-sky-300 to-blue-400',        cardBorderColor: '#06B6D4', isForTrade: true },
];
