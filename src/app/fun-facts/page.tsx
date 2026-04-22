'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface FunFact {
  id: string;
  title: string;
  content: string;
  category: string;
  icon_name: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  Biology:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  iconBg: 'bg-green-100'  },
  Species:      { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   iconBg: 'bg-blue-100'   },
  Conservation: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  iconBg: 'bg-amber-100'  },
  Habitat:      { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   iconBg: 'bg-teal-100'   },
  General:      { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100' },
};

// Fallback static facts if DB is empty
const staticFacts: FunFact[] = [
  { id: '1', title: 'Fish Can See Colour', content: 'Most fish can see colour, and some can even see ultraviolet light that humans cannot detect. Rainbow trout use colour vision to find food!', category: 'Biology', icon_name: 'EyeIcon' },
  { id: '2', title: 'Barramundi Change Sex', content: 'Barramundi are protandrous hermaphrodites — they start life as males and change to females as they grow older and larger. Amazing!', category: 'Species', icon_name: 'SparklesIcon' },
  { id: '3', title: 'Murray Cod Age', content: 'Murray Cod can live for over 48 years! The oldest recorded Murray Cod was estimated to be around 48 years old when caught.', category: 'Species', icon_name: 'ClockIcon' },
  { id: '4', title: 'Fish Sleep Too', content: 'Fish do sleep, but not like us. They enter a restful state where they slow down and hover in place. Some even change colour while resting!', category: 'Biology', icon_name: 'MoonIcon' },
  { id: '5', title: 'Catch and Release', content: 'When you catch and release a fish properly, it has a very high survival rate. Wet your hands before handling and return it quickly!', category: 'Conservation', icon_name: 'HeartIcon' },
  { id: '6', title: 'Trout Need Cold Water', content: 'Rainbow Trout need cold, well-oxygenated water to survive. They are often found in mountain streams and rivers where the water stays cool.', category: 'Habitat', icon_name: 'BeakerIcon' },
  { id: '7', title: 'Flathead Camouflage', content: 'Flathead are masters of disguise! They bury themselves in sand or mud with only their eyes showing, waiting to ambush prey.', category: 'Species', icon_name: 'EyeSlashIcon' },
  { id: '8', title: 'Fish Scales Tell Age', content: 'Just like tree rings, you can count the rings on a fish scale to determine its age. Each ring represents one year of growth!', category: 'Biology', icon_name: 'MagnifyingGlassIcon' },
  { id: '9', title: 'Bream Are Smart', content: 'Yellowfin Bream have been shown to learn from experience. They can remember locations where they found food and avoid places where they were caught before!', category: 'Species', icon_name: 'AcademicCapIcon' },
];

export default function FunFactsPage() {
  const [facts, setFacts] = useState<FunFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('fun_facts')
      .select('id, title, content, category, icon_name')
      .eq('active', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setFacts(data && data.length > 0 ? data : staticFacts);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(facts.map(f => f.category)))];
  const filtered = activeCategory === 'All' ? facts : facts.filter(f => f.category === activeCategory);

  return (
    <AppLayout currentPath="/fun-facts">
      <div className="fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #E9A23B, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="LightBulbIcon" size={22} className="text-amber-400" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Fun Facts</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm max-w-lg">
              Discover amazing things about fish and fishing. Become a true expert angler!
            </p>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border transition-all ${activeCategory === cat ? 'text-white border-transparent' : 'bg-white border-adventure-border text-earth-500 hover:text-primary-700'}`}
              style={activeCategory === cat ? { backgroundColor: '#ff751f' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Facts grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-adventure-border" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((fact) => {
              const colors = categoryColors[fact.category] || categoryColors.General;
              return (
                <div key={fact.id} className={`rounded-3xl p-5 border card-lift ${colors.bg} ${colors.border}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.iconBg}`}>
                      <Icon name={fact.icon_name as Parameters<typeof Icon>[0]['name']} size={22} className={colors.text} />
                    </div>
                    <div>
                      <span className={`text-xs font-sans font-bold uppercase tracking-wide ${colors.text}`}>{fact.category}</span>
                      <h3 className="font-display text-lg text-primary-800 leading-tight">{fact.title}</h3>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-earth-600 leading-relaxed">{fact.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
