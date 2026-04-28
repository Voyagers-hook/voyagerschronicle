'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { rarityConfig, CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const rarities: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];
const CARDS_PER_PAGE = 8;

// ✅ Your CORRECT working GitHub Pages URLs
const TEX_WOOD = 'https://voyagers-hook.github.io/images/wood%20texture.png';
const TEX_PARCHMENT = 'https://voyagers-hook.github.io/images/parchment.png';
const TEX_RIVET = 'https://voyagers-hook.github.io/images/rivet.png';
const TEX_LEATHER = 'https://voyagers-hook.github.io/images/leather%20texture.png';

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDir, setFlipDir] = useState<'left' | 'right' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const loadCards = async () => {
      setLoading(true);
      setError(null);

      const { data: allCards, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .order('card_number', { ascending: true });

      if (fetchError || !allCards) {
        setError(fetchError?.message ?? 'Failed to load cards.');
        setLoading(false);
        return;
      }

      let collectedMap = new Map<string, string>();
      if (user) {
        const { data: user
