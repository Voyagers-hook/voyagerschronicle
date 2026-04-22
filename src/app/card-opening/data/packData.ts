import { FishingCard, allCards } from '@/app/card-collection/data/cardData';

export interface CardPack {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  gradient: string;
  cards: FishingCard[];
}

// Simulate a pack of 3 cards being opened
export const samplePack: CardPack = {
  id: 'pack-001',
  name: 'Voyager Pack',
  description: 'Contains 3 random fishing cards. Rare guaranteed!',
  cardCount: 3,
  gradient: 'from-primary-700 via-primary-600 to-primary-500',
  cards: [
    allCards.find(c => c.id === 'card-002')!,
    allCards.find(c => c.id === 'card-003')!,
    allCards.find(c => c.id === 'card-001')!,
  ],
};
