'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

type AdminTab = 'catch-submissions' | 'send-cards' | 'cards' | 'rewards' | 'quiz-manager' | 'fun-facts' | 'fishing-tips';

const RARITIES = ['Widespread', 'Elusive', 'Specimen', 'Legendary'] as const;
const RARITY_COLORS: Record<string, string> = {
  Widespread: 'bg-earth-100 text-earth-700 border-earth-300',
  Elusive:    'bg-green-100 text-green-700 border-green-300',
  Specimen:   'bg-blue-100 text-blue-700 border-blue-300',
  Legendary:  'bg-amber-100 text-amber-700 border-amber-300',
};
const ICON_OPTIONS = [
  'GiftIcon', 'TagIcon', 'TrophyIcon', 'StarIcon', 'SparklesIcon',
  'EyeIcon', 'ClockIcon', 'MoonIcon', 'HeartIcon', 'BeakerIcon',
  'MagnifyingGlassIcon', 'AcademicCapIcon', 'FireIcon', 'BoltIcon',
  'GlobeAltIcon', 'ShieldCheckIcon', 'LightBulbIcon',
];

const inputCls = 'w-full border border-adventure-border rounded-xl px-4 py-2.5 text-sm font-sans text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white';
const labelCls = 'block text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide mb-1';
const btnPrimary = 'flex items-center gap-2 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95';
const btnGhost = 'flex items-center gap-2 font-sans font-semibold text-sm px-4 py-2.5 rounded-xl border border-adventure-border text-earth-500 hover:bg-adventure-bg transition-all';

// ── Types ──────────────────────────────────────────────────────────────────
interface CatchSubmission {
  id: string;
  user_id: string;
  species: string;
  weight_lbs: number | null;
  length_cm: number | null;
  location: string | null;
  notes: string | null;
  photo_url: string | null;
  catch_status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  username?: string;
}

interface Card {
  id: string;
  card_number: number;
  name: string;
  species: string;
  rarity: typeof RARITIES[number];
  power: number;
  stealth: number;
  energy: number;
  beauty: number;
  habitat: string;
  description: string | null;
  image_url: string | null;
  gradient: string;
  border_color: string;
  foil: boolean;
  drop_rate: number;
}

// Exactly matches rewards_catalogue columns:
// id, title, description, points_cost, reward_type, icon, active,
// stock, created_at, updated_at, link, image_url,
interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  reward_type: string;
  icon: string;
  active: boolean;
  stock: number | null;
  link: string | null;
  image_url: string | null;
}

interface Member {
  id: string;
  username: string;
  email: string;
  level: number;
  membership_tier: string;
  total_points: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  category: string;
  difficulty: string;
  active: boolean;
}

interface FunFact {
  id: string;
  title: string;
  content: string;
  category: string;
  icon_name: string;
  active: boolean;
}

interface FishingTip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  icon_name: string;
  active: boolean;
}

// ── Blank form defaults matching DB columns exactly ────────────────────────
const blankReward: Omit<Reward, 'id'> = {
  title: '',
  description: '',
  points_cost: 100,
  reward_type: 'general',
  icon: 'GiftIcon',
  active: true,
  stock: null,
  link: '',
  image_url: '',
};

const blankCard: Partial<Card> = {
  name: '', species: '', rarity: 'Widespread',
  power: 50, stealth: 50, energy: 50, beauty: 50,
  habitat: '', description: '', foil: false,
  gradient: 'from-blue-400 via-cyan-300 to-teal-400',
  border_color: '#3B82F6', image_url: '', drop_rate: 10,
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<AdminTab>('catch-submissions');
  const [toast, setToast] = useState('');

  // Data
  const [submissions, setSubmissions] = useState<CatchSubmission[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [facts, setFacts] = useState<FunFact[]>([]);
  const [tips, setTips] = useState<FishingTip[]>([]);
  const [loading, setLoading] = useState(true);

  // Send-cards state
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [sendMode, setSendMode] = useState<'all' | 'select'>('all');
  const [rarityFilter, setRarityFilter] = useState<typeof RARITIES[number] | 'All'>('All');
  const [batchSize, setBatchSize] = useState(1);
  const [sending, setSending] = useState(false);

  // Card form
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardForm, setCardForm] = useState<Partial<Card>>(blankCard);

  // Reward form
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState<Omit<Reward, 'id'>>(blankReward);

  // Quiz form
  const [showQForm, setShowQForm] = useState(false);
  const [editingQ, setEditingQ] = useState<QuizQuestion | null>(null);
  const [qForm, setQForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', category: 'Species', difficulty: 'Easy',
  });

  // Fact form
  const [showFactForm, setShowFactForm] = useState(false);
  const [editingFact, setEditingFact] = useState<FunFact | null>(null);
  const [factForm, setFactForm] = useState<Partial<FunFact>>({
    title: '', content: '', category: 'Biology', icon_name: 'SparklesIcon',
  });

  // Tip form
  const [showTipForm, setShowTipForm] = useState(false);
  const [editingTip, setEditingTip] = useState<FishingTip | null>(null);
  const [tipForm, setTipForm] = useState<Partial<FishingTip>>({
    title: '', content: '', category: 'General', difficulty: 'Beginner', icon_name: 'LightBulbIcon',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Fetch all data ─────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [subsRes, cardsRes, rewardsRes, membersRes, qRes, factsRes, tipsRes] = await Promise.all([
      supabase.from('catch_submissions').select('*, user_profiles(username)').order('submitted_at', { ascending: false }),
      supabase.from('cards').select('*').order('card_number'),
      supabase.from('rewards_catalogue').select('*').order('points_cost', { ascending: true }),
      supabase.from('user_profiles').select('id, username, email, level, membership_tier, total_points').eq('role', 'member'),
      supabase.from('quiz_questions').select('*').order('created_at'),
      supabase.from('fun_facts').select('*').order('created_at'),
      supabase.from('fishing_tips').select('*').order('created_at'),
    ]);

    if (subsRes.error)    console.error('Submissions:', subsRes.error);
    if (cardsRes.error)   console.error('Cards:', cardsRes.error);
    if (rewardsRes.error) console.error('Rewards:', rewardsRes.error);
    if (membersRes.error) console.error('Members:', membersRes.error);
    if (qRes.error)       console.error('Quiz:', qRes.error);
    if (factsRes.error)   console.error('Facts:', factsRes.error);
    if (tipsRes.error)    console.error('Tips:', tipsRes.error);

    if (subsRes.data)    setSubmissions(subsRes.data.map((s: any) => ({ ...s, username: s.user_profiles?.username })));
    if (cardsRes.data)   setCards(cardsRes.data);
    if (rewardsRes.data) setRewards(rewardsRes.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (qRes.data)       setQuestions(qRes.data);
    if (factsRes.data)   setFacts(factsRes.data);
    if (tipsRes.data)    setTips(tipsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Catch submission handlers ──────────────────────────────────────────
  const handleCatchStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('catch_submissions')
      .update({ catch_status: status, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { showToast('Error updating submission'); return; }
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, catch_status: status } : s));
    showToast(status === 'approved' ? 'Catch approved! ✓' : 'Catch rejected.');
  };

  // ── Image upload ───────────────────────────────────────────────────────
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'cards' | 'rewards',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split('.').pop();
      const path = `${target}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('voyagers-images')
        .upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('voyagers-images').getPublicUrl(path);
      if (target === 'cards')   setCardForm(p => ({ ...p, image_url: data.publicUrl }));
      if (target === 'rewards') setRewardForm(p => ({ ...p, image_url: data.publicUrl }));
      showToast('Image uploaded! ✓');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message);
    }
  };

  // ── Send cards ─────────────────────────────────────────────────────────
  const handleSendCards = async () => {
    if (!cards.length) { showToast('No cards in the database yet.'); return; }
    const pool = rarityFilter === 'All' ? cards : cards.filter(c => c.rarity === rarityFilter);
    if (!pool.length) { showToast(`No ${rarityFilter} cards found.`); return; }
    const targets = sendMode === 'all' ? members : members.filter(m => selectedMembers.includes(m.id));
    if (!targets.length) { showToast('Select at least one member.'); return; }

    setSending(true);
    const totalWeight = pool.reduce((sum, c) => sum + (c.drop_rate ?? 10), 0);
    const rows: { user_id: string; card_id: string }[] = [];

    for (const member of targets) {
      for (let i = 0; i < batchSize; i++) {
        let rVal = Math.random() * totalWeight;
        let chosen = pool[0];
        for (const card of pool) {
          if (rVal < (card.drop_rate ?? 10)) { chosen = card; break; }
          rVal -= (card.drop_rate ?? 10);
        }
        rows.push({ user_id: member.id, card_id: chosen.id });
      }
    }

    const { error } = await supabase.from('user_cards').insert(rows);
    setSending(false);
    if (error) { showToast('Error sending cards: ' + error.message); return; }
    showToast(`Sent ${batchSize} card(s) to ${targets.length} member(s)! ✓`);
    setSelectedMembers([]);
  };

  // ── Card CRUD ──────────────────────────────────────────────────────────
  const saveCard = async () => {
    if (!cardForm.name?.trim()) return;
    // Strip the id field — let Supabase handle it
    const { id: _id, ...payload } = cardForm as any;

    if (editingCard?.id) {
      const { error } = await supabase.from('cards').update(payload).eq('id', editingCard.id);
      if (error) { showToast('Error: ' + error.message); return; }
      setCards(prev => prev.map(c => c.id === editingCard.id ? { ...c, ...payload } as Card : c));
      showToast('Card updated! ✓');
    } else {
      const nextNum = cards.reduce((max, c) => Math.max(max, c.card_number), 0) + 1;
      const { data, error } = await supabase
        .from('cards')
        .insert({ ...payload, card_number: nextNum, total_cards: 24 })
        .select()
        .single();
      if (error) { showToast('Error: ' + error.message); return; }
      setCards(prev => [...prev, data]);
      showToast('Card added! ✓');
    }
    setShowCardForm(false);
    setEditingCard(null);
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) { showToast('Error: ' + error.message); return; }
    setCards(prev => prev.filter(c => c.id !== id));
    showToast('Card deleted.');
  };

  // ── Reward CRUD ────────────────────────────────────────────────────────
  const saveReward = async () => {
    if (!rewardForm.title?.trim()) { showToast('Title is required.'); return; }

    // Build payload — only include columns that exist on rewards_catalogue
    const payload = {
      title:               rewardForm.title.trim(),
      description:         rewardForm.description || null,
      points_cost:             Number(rewardForm.points_cost),
      reward_type:         rewardForm.reward_type,
      icon:                rewardForm.icon,
      active:              rewardForm.active,
      stock:               rewardForm.stock ?? null,
      link:                rewardForm.link || null,
      image_url:           rewardForm.image_url || null,
    };

    if (editingReward?.id) {
      const { error } = await supabase
        .from('rewards_catalogue')
        .update(payload)
        .eq('id', editingReward.id);
      if (error) { showToast('Error: ' + error.message); return; }
      setRewards(prev => prev.map(r => r.id === editingReward.id ? { ...r, ...payload } as Reward : r));
      showToast('Reward updated! ✓');
    } else {
      const { data, error } = await supabase
        .from('rewards_catalogue')
        .insert(payload)
        .select()
        .single();
      if (error) { showToast('Error: ' + error.message); return; }
      setRewards(prev => [...prev, data]);
      showToast('Reward added! ✓');
    }
    setShowRewardForm(false);
    setEditingReward(null);
  };

  const deleteReward = async (id: string) => {
    const { error } = await supabase.from('rewards_catalogue').delete().eq('id', id);
    if (error) { showToast('Error: ' + error.message); return; }
    setRewards(prev => prev.filter(r => r.id !== id));
    showToast('Reward deleted.');
  };

  // ── Quiz CRUD ──────────────────────────────────────────────────────────
  const saveQuestion = async () => {
    if (!qForm.question.trim()) return;
    if (editingQ) {
      const { error } = await supabase.from('quiz_questions').update(qForm).eq('id', editingQ.id);
      if (error) { showToast('Error: ' + error.message); return; }
      setQuestions(prev => prev.map(q => q.id === editingQ.id ? { ...q, ...qForm } : q));
      showToast('Question updated! ✓');
    } else {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({ ...qForm, active: true })
        .select().single();
      if (error) { showToast('Error: ' + error.message); return; }
      setQuestions(prev => [...prev, data]);
      showToast('Question added! ✓');
    }
    setShowQForm(false);
    setEditingQ(null);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) { showToast('Error: ' + error.message); return; }
    setQuestions(prev => prev.filter(q => q.id !== id));
    showToast('Question deleted.');
  };

  const toggleQuestion = async (id: string, active: boolean) => {
    await supabase.from('quiz_questions').update({ active: !active }).eq('id', id);
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, active: !active } : q));
  };

  // ── Fun Fact CRUD ──────────────────────────────────────────────────────
  const saveFact = async () => {
    if (!factForm.title?.trim()) return;
    if (editingFact) {
      const { error } = await supabase.from('fun_facts').update(factForm).eq('id', editingFact.id);
      if (error) { showToast('Error: ' + error.message); return; }
      setFacts(prev => prev.map(f => f.id === editingFact.id ? { ...f, ...factForm } as FunFact : f));
      showToast('Fact updated! ✓');
    } else {
      const { data, error } = await supabase
        .from('fun_facts')
        .insert({ ...factForm, active: true })
        .select().single();
      if (error) { showToast('Error: ' + error.message); return; }
      setFacts(prev => [...prev, data]);
      showToast('Fact added! ✓');
    }
    setShowFactForm(false);
    setEditingFact(null);
  };

  const deleteFact = async (id: string) => {
    await supabase.from('fun_facts').delete().eq('id', id);
    setFacts(prev => prev.filter(f => f.id !== id));
    showToast('Fact deleted.');
  };

  const toggleFact = async (id: string, active: boolean) => {
    await supabase.from('fun_facts').update({ active: !active }).eq('id', id);
    setFacts(prev => prev.map(f => f.id === id ? { ...f, active: !active } : f));
  };

  // ── Fishing Tip CRUD ───────────────────────────────────────────────────
  const saveTip = async () => {
    if (!tipForm.title?.trim()) return;
    if (editingTip) {
      const { error } = await supabase.from('fishing_tips').update(tipForm).eq('id', editingTip.id);
      if (error) { showToast('Error: ' + error.message); return; }
      setTips(prev => prev.map(t => t.id === editingTip.id ? { ...t, ...tipForm } as FishingTip : t));
      showToast('Tip updated! ✓');
    } else {
      const { data, error } = await supabase
        .from('fishing_tips')
        .insert({ ...tipForm, active: true })
        .select().single();
      if (error) { showToast('Error: ' + error.message); return; }
      setTips(prev => [...prev, data]);
      showToast('Tip added! ✓');
    }
    setShowTipForm(false);
    setEditingTip(null);
  };

  const deleteTip = async (id: string) => {
    await supabase.from('fishing_tips').delete().eq('id', id);
    setTips(prev => prev.filter(t => t.id !== id));
    showToast('Tip deleted.');
  };

  const toggleTip = async (id: string, active: boolean) => {
    await supabase.from('fishing_tips').update({ active: !active }).eq('id', id);
    setTips(prev => prev.map(t => t.id === id ? { ...t, active: !active } : t));
  };

  const pendingCount = submissions.filter(s => s.catch_status === 'pending').length;

  const tabs: { key: AdminTab; label: string; iconName: Parameters<typeof Icon>[0]['name']; badge?: number }[] = [
    { key: 'catch-submissions', label: 'Submissions',  iconName: 'ClipboardDocumentListIcon', badge: pendingCount },
    { key: 'send-cards',        label: 'Send Cards',   iconName: 'GiftIcon' },
    { key: 'cards',             label: 'Cards',        iconName: 'BookOpenIcon' },
    { key: 'rewards',           label: 'Rewards',      iconName: 'StarIcon' },
    { key: 'quiz-manager',      label: 'Quiz',         iconName: 'AcademicCapIcon' },
    { key: 'fun-facts',         label: 'Fun Facts',    iconName: 'LightBulbIcon' },
    { key: 'fishing-tips',      label: 'Fishing Tips', iconName: 'BookmarkIcon' },
  ];

  if (loading) return (
    <AppLayout currentPath="/admin">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={32} className="animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-earth-400 font-sans text-sm">Loading admin data...</p>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout currentPath="/admin">
      <div className="fade-in space-y-5">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Cog6ToothIcon" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Admin Panel</h1>
              <p className="text-primary-200 font-sans text-sm mt-0.5">
                {members.length} members · {cards.length} cards · {pendingCount} pending catches
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap items-center gap-1 bg-white rounded-2xl border border-adventure-border p-1.5 shadow-card">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${tab === t.key ? 'text-white shadow-sm' : 'text-earth-500 hover:text-primary-700 hover:bg-primary-50'}`}
              style={tab === t.key ? { backgroundColor: '#ff751f' } : {}}>
              <Icon name={t.iconName} size={14} />
              {t.label}
              {t.badge && t.badge > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CATCH SUBMISSIONS
        ══════════════════════════════════════════════════════════════ */}
              {tab === 'catch-submissions' && (
          <div className="space-y-4">
            <p className="text-sm font-sans text-earth-400">{pendingCount} pending review · {submissions.length} total</p>
            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-adventure-border p-12 text-center">
                <Icon name="ClipboardDocumentListIcon" size={40} className="text-earth-300 mx-auto mb-3" />
                <p className="text-earth-400 font-sans">No catch submissions yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {submissions.map(sub => (
                  <div key={sub.id} className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
                    {/* Photo */}
                    {sub.photo_url && (
                      <div className="relative w-full aspect-[4/3] bg-earth-100">
                        <img
                          src={sub.photo_url}
                          alt={`${sub.species} catch`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-primary-700 to-primary-500 p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white font-sans flex-shrink-0">
                        {(sub.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-white text-sm">{sub.username || 'Unknown'}</p>
                        <p className="text-primary-200 text-xs font-sans">{new Date(sub.submitted_at).toLocaleDateString('en-GB')}</p>
                      </div>
                      <span className={`ml-auto text-xs font-sans font-bold px-2.5 py-1 rounded-full ${sub.catch_status === 'pending' ? 'bg-amber-400/30 text-amber-200' : sub.catch_status === 'approved' ? 'bg-green-400/30 text-green-200' : 'bg-red-400/30 text-red-200'}`}>
                        {sub.catch_status.charAt(0).toUpperCase() + sub.catch_status.slice(1)}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-display text-lg text-primary-800">{sub.species}</p>
                        {sub.location && <p className="text-xs font-sans text-earth-400">{sub.location}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                        <div className="bg-adventure-bg rounded-xl p-2">
                          <p className="text-earth-400 uppercase tracking-wide font-semibold mb-0.5">Weight</p>
                          <p className="font-semibold text-primary-700">{sub.weight_lbs ? `${sub.weight_lbs} lbs` : '—'}</p>
                        </div>
                        <div className="bg-adventure-bg rounded-xl p-2">
                          <p className="text-earth-400 uppercase tracking-wide font-semibold mb-0.5">Length</p>
                          <p className="font-semibold text-primary-700">{sub.length_cm ? `${sub.length_cm} cm` : '—'}</p>
                        </div>
                      </div>
                      {sub.notes && <p className="text-xs font-sans text-earth-500 italic">&ldquo;{sub.notes}&rdquo;</p>}
                      {sub.catch_status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleCatchStatus(sub.id, 'approved')}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-sans font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                            <Icon name="CheckIcon" size={12} /> Approve
                          </button>
                          <button onClick={() => handleCatchStatus(sub.id, 'rejected')}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                            <Icon name="XMarkIcon" size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ══════════════════════════════════════════════════════════════
            SEND CARDS
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'send-cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
              <h2 className="font-display text-xl text-primary-800 mb-1">Recipients</h2>
              <p className="text-xs font-sans text-earth-400 mb-4">{members.length} members registered</p>
              <div className="flex gap-2 mb-4">
                {(['all', 'select'] as const).map(mode => (
                  <button key={mode} onClick={() => setSendMode(mode)}
                    className={`flex-1 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${sendMode === mode ? 'text-white' : 'bg-adventure-bg text-earth-500'}`}
                    style={sendMode === mode ? { backgroundColor: '#ff751f' } : {}}>
                    {mode === 'all' ? 'All Members' : 'Select Members'}
                  </button>
                ))}
              </div>
              {sendMode === 'select' && (
                <div className="divide-y divide-adventure-border border border-adventure-border rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                  {members.map(member => (
                    <button key={member.id}
                      onClick={() => setSelectedMembers(prev =>
                        prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]
                      )}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-primary-50 ${selectedMembers.includes(member.id) ? 'bg-primary-50' : ''}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedMembers.includes(member.id) ? 'border-orange-500 bg-orange-500' : 'border-earth-300'}`}>
                        {selectedMembers.includes(member.id) && <Icon name="CheckIcon" size={11} className="text-white" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 font-sans flex-shrink-0">
                        {(member.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-primary-800 text-sm">{member.username}</p>
                        <p className="text-xs font-sans text-earth-400">Level {member.level} · {member.membership_tier}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {sendMode === 'all' && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-sm font-sans text-primary-700">
                  Cards will be sent to all <strong>{members.length} members</strong>.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                <h2 className="font-display text-xl text-primary-800 mb-4">Distribution Settings</h2>
                <div className="mb-4">
                  <label className={labelCls}>Source Category</label>
                  <select className={inputCls} value={rarityFilter} onChange={e => setRarityFilter(e.target.value as any)}>
                    <option value="All">All Cards (Fully Random)</option>
                    {RARITIES.map(r => <option key={r} value={r}>{r} Only</option>)}
                  </select>
                </div>
                <label className={labelCls}>Cards Per Member</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setBatchSize(Math.max(1, batchSize - 1))} className="w-10 h-10 rounded-xl bg-adventure-bg border border-adventure-border flex items-center justify-center text-primary-700 hover:bg-primary-50 font-bold text-lg">−</button>
                  <span className="font-display text-4xl text-primary-800 tabular-nums w-12 text-center">{batchSize}</span>
                  <button onClick={() => setBatchSize(Math.min(10, batchSize + 1))} className="w-10 h-10 rounded-xl bg-adventure-bg border border-adventure-border flex items-center justify-center text-primary-700 hover:bg-primary-50 font-bold text-lg">+</button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="font-sans font-semibold text-amber-700 text-sm mb-1">Ready to send!</p>
                <p className="text-amber-600 font-sans text-xs mb-3">
                  Sending {batchSize} {rarityFilter !== 'All' ? rarityFilter.toLowerCase() : 'random'} card(s) to{' '}
                  {sendMode === 'all' ? `all ${members.length} members` : `${selectedMembers.length} selected member(s)`}.
                  Distribution respects each card's drop rate weight.
                </p>
                <button onClick={handleSendCards} disabled={sending}
                  className={`w-full ${btnPrimary} justify-center`} style={{ backgroundColor: '#ff751f' }}>
                  {sending ? <Icon name="ArrowPathIcon" size={16} className="animate-spin" /> : <Icon name="GiftIcon" size={16} />}
                  {sending ? 'Sending...' : 'Send Random Cards'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CARDS
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-sans text-earth-400">{cards.length} cards in collection</p>
              <button
                onClick={() => { setEditingCard(null); setCardForm(blankCard); setShowCardForm(true); }}
                className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add New Card
              </button>
            </div>

            {showCardForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-6 fade-in">
                <h3 className="font-display text-xl text-primary-800 mb-5">{editingCard ? 'Edit Card' : 'Add New Card'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Card Name</label><input className={inputCls} value={cardForm.name || ''} onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Species</label><input className={inputCls} value={cardForm.species || ''} onChange={e => setCardForm(p => ({ ...p, species: e.target.value }))} /></div>
                  <div>
                    <label className={labelCls}>Rarity</label>
                    <select className={inputCls} value={cardForm.rarity || 'Widespread'} onChange={e => setCardForm(p => ({ ...p, rarity: e.target.value as Card['rarity'] }))}>
                      {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Habitat</label><input className={inputCls} value={cardForm.habitat || ''} onChange={e => setCardForm(p => ({ ...p, habitat: e.target.value }))} /></div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Image</label>
                    <div className="flex gap-2">
                      <input className={inputCls} placeholder="https://..." value={cardForm.image_url || ''} onChange={e => setCardForm(p => ({ ...p, image_url: e.target.value }))} />
                      <label className="cursor-pointer bg-adventure-bg border border-adventure-border rounded-xl px-4 py-2.5 hover:bg-primary-50 transition-colors flex items-center justify-center shrink-0">
                        <Icon name="ArrowUpTrayIcon" size={16} className="text-primary-700" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'cards')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Drop Rate % (1–100)</label>
                    <input type="number" min={1} max={100} className={inputCls} value={cardForm.drop_rate ?? 10} onChange={e => setCardForm(p => ({ ...p, drop_rate: Number(e.target.value) }))} />
                    <p className="text-[10px] text-earth-400 mt-1 italic">How often this card appears when opening packs.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea className={inputCls} rows={2} value={cardForm.description || ''} onChange={e => setCardForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  {(['power', 'stealth', 'energy', 'beauty'] as const).map(stat => (
                    <div key={stat}>
                      <label className={labelCls}>{stat.charAt(0).toUpperCase() + stat.slice(1)} <span className="text-primary-500 font-bold">{cardForm[stat]}</span></label>
                      <input type="range" min={1} max={100} value={cardForm[stat] || 50} onChange={e => setCardForm(p => ({ ...p, [stat]: Number(e.target.value) }))} className="w-full accent-orange-500" />
                    </div>
                  ))}
                  <div>
                    <label className={labelCls}>Border Colour</label>
                    <input type="color" value={cardForm.border_color || '#3B82F6'} onChange={e => setCardForm(p => ({ ...p, border_color: e.target.value }))} className="h-10 w-full rounded-xl border border-adventure-border cursor-pointer" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={saveCard} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                    <Icon name="CheckIcon" size={15} />{editingCard ? 'Save Changes' : 'Add Card'}
                  </button>
                  <button onClick={() => setShowCardForm(false)} className={btnGhost}>Cancel</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-adventure-border bg-adventure-bg">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Card</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Rarity</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">PWR</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">STL</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">ENG</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">BTY</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Drop%</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-adventure-border">
                    {cards.map(card => (
                      <tr key={card.id} className="hover:bg-primary-50/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-earth-400 font-sans">#{card.card_number}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {card.image_url && <img src={card.image_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-adventure-border" />}
                            <div>
                              <p className="font-semibold text-primary-800">{card.name}</p>
                              <p className="text-xs text-earth-400 italic">{card.species}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</span></td>
                        <td className="px-3 py-3 text-center font-display text-primary-700">{card.power}</td>
                        <td className="px-3 py-3 text-center font-display text-primary-700">{card.stealth}</td>
                        <td className="px-3 py-3 text-center font-display text-primary-700">{card.energy}</td>
                        <td className="px-3 py-3 text-center font-display text-primary-700">{card.beauty}</td>
                        <td className="px-3 py-3 text-center text-xs font-sans font-semibold text-amber-600">{card.drop_rate}%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingCard(card); setCardForm({ ...card }); setShowCardForm(true); }} className="p-1.5 rounded-lg text-earth-400 hover:text-primary-600 hover:bg-primary-50"><Icon name="PencilSquareIcon" size={15} /></button>
                            <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded-lg text-earth-400 hover:text-red-500 hover:bg-red-50"><Icon name="TrashIcon" size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            REWARDS
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'rewards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{rewards.length} rewards available</p>
              <button
                onClick={() => { setEditingReward(null); setRewardForm(blankReward); setShowRewardForm(true); }}
                className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add Reward Item
              </button>
            </div>

            {showRewardForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-6 fade-in">
                <h3 className="font-display text-xl text-primary-800 mb-5">{editingReward ? 'Edit Reward' : 'New Reward Item'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Reward Title *</label><input className={inputCls} value={rewardForm.title} onChange={e => setRewardForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><label className={labelCls}>XP Cost *</label><input type="number" min={1} className={inputCls} value={rewardForm.points_cost} onChange={e => setRewardForm(p => ({ ...p, points_cost: Number(e.target.value) }))} /></div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select className={inputCls} value={rewardForm.reward_type} onChange={e => setRewardForm(p => ({ ...p, reward_type: e.target.value }))}>
                      {['general', 'discount', 'freebie', 'merch', 'experience', 'card-pack', 'external'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Icon</label>
                    <select className={inputCls} value={rewardForm.icon} onChange={e => setRewardForm(p => ({ ...p, icon: e.target.value }))}>
                      {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('Icon', '')}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Image</label>
                    <div className="flex gap-2">
                      <input className={inputCls} placeholder="https://..." value={rewardForm.image_url || ''} onChange={e => setRewardForm(p => ({ ...p, image_url: e.target.value }))} />
                      <label className="cursor-pointer bg-adventure-bg border border-adventure-border rounded-xl px-4 py-2.5 hover:bg-primary-50 transition-colors flex items-center justify-center shrink-0">
                        <Icon name="ArrowUpTrayIcon" size={16} className="text-primary-700" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'rewards')} />
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea className={inputCls} rows={2} value={rewardForm.description || ''} onChange={e => setRewardForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Stock Limit (blank = unlimited)</label>
                    <input type="number" min={1} className={inputCls} value={rewardForm.stock ?? ''} onChange={e => setRewardForm(p => ({ ...p, stock: e.target.value ? Number(e.target.value) : null }))} />
                  </div>
                  <div>
                    <label className={labelCls}>External Link (optional)</label>
                    <input className={inputCls} placeholder="https://..." value={rewardForm.link || ''} onChange={e => setRewardForm(p => ({ ...p, link: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3 bg-adventure-bg rounded-xl px-4 py-3 border border-adventure-border">
                    <button onClick={() => setRewardForm(p => ({ ...p, active: !p.active }))}
                      className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${rewardForm.active ? 'bg-primary-500' : 'bg-earth-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${rewardForm.active ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    <div>
                      <p className="text-sm font-sans font-semibold text-primary-700">Visible to members</p>
                      <p className="text-xs font-sans text-earth-400">Hidden rewards cannot be redeemed</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={saveReward} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                    <Icon name="CheckIcon" size={15} />Save Reward
                  </button>
                  <button onClick={() => setShowRewardForm(false)} className={btnGhost}>Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <div key={reward.id} className="bg-white rounded-2xl border border-adventure-border p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {reward.image_url ? (
                        <img src={reward.image_url} alt="" className="w-12 h-12 rounded-lg object-cover border border-adventure-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Icon name={reward.icon as any} size={24} className="text-orange-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-primary-800 text-sm">{reward.title}</p>
                        <p className="text-xs text-earth-400">
                          {reward.points_cost} XP
                          {reward.stock !== null && ` · Stock: ${reward.stock}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${reward.active ? 'bg-green-500' : 'bg-red-500'}`} title={reward.active ? 'Active' : 'Inactive'} />
                      <button onClick={() => { setEditingReward(reward); setRewardForm({ title: reward.title, description: reward.description, points_cost: reward.points_cost, reward_type: reward.reward_type, icon: reward.icon, active: reward.active, stock: reward.stock, link: reward.link, image_url: reward.image_url, }); setShowRewardForm(true); }} className="p-1.5 text-earth-400 hover:text-primary-600"><Icon name="PencilSquareIcon" size={15} /></button>
                      <button onClick={() => deleteReward(reward.id)} className="p-1.5 text-earth-400 hover:text-red-500"><Icon name="TrashIcon" size={15} /></button>
                    </div>
                  </div>
                  {reward.description && <p className="text-xs text-earth-500 line-clamp-2">{reward.description}</p>}
                </div>
              ))}
              {rewards.length === 0 && (
                <div className="md:col-span-3 bg-white rounded-2xl border border-adventure-border p-12 text-center">
                  <Icon name="GiftIcon" size={40} className="text-earth-300 mx-auto mb-3" />
                  <p className="text-earth-400 font-sans">No rewards yet. Add one above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            QUIZ MANAGER
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'quiz-manager' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{questions.length} questions · {questions.filter(q => q.active).length} active</p>
              <button
                onClick={() => { setEditingQ(null); setQForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', category: 'Species', difficulty: 'Easy' }); setShowQForm(true); }}
                className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add Question
              </button>
            </div>
            {showQForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 fade-in">
                <h3 className="font-display text-lg text-primary-800 mb-4">{editingQ ? 'Edit Question' : 'New Question'}</h3>
                <div className="space-y-3">
                  <div><label className={labelCls}>Question</label><input className={inputCls} value={qForm.question} onChange={e => setQForm(p => ({ ...p, question: e.target.value }))} /></div>
                  {(['A', 'B', 'C', 'D'] as const).map(letter => (
                    <div key={letter} className="flex items-center gap-2">
                      <input type="radio" name="correct" checked={qForm.correct_answer === letter} onChange={() => setQForm(p => ({ ...p, correct_answer: letter }))} className="accent-orange-500 w-4 h-4 flex-shrink-0" />
                      <input className={inputCls} placeholder={`Option ${letter}`} value={qForm[`option_${letter.toLowerCase()}` as keyof typeof qForm] as string} onChange={e => setQForm(p => ({ ...p, [`option_${letter.toLowerCase()}`]: e.target.value }))} />
                    </div>
                  ))}
                  <p className="text-xs text-earth-400">Select the radio button next to the correct answer</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} value={qForm.category} onChange={e => setQForm(p => ({ ...p, category: e.target.value }))}>
                        {['Species', 'Techniques', 'Conservation', 'Regulations', 'Habitat', 'Gear', 'General'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Difficulty</label>
                      <select className={inputCls} value={qForm.difficulty} onChange={e => setQForm(p => ({ ...p, difficulty: e.target.value }))}>
                        {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveQuestion} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}><Icon name="CheckIcon" size={15} />{editingQ ? 'Save' : 'Add Question'}</button>
                    <button onClick={() => setShowQForm(false)} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="divide-y divide-adventure-border">
                {questions.map(q => (
                  <div key={q.id} className="flex items-start gap-4 p-4 hover:bg-primary-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-medium text-sm text-primary-800 leading-snug">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs font-sans text-earth-400">{q.category}</span>
                        <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{q.difficulty}</span>
                        <span className="text-xs font-sans text-earth-300">✓ Option {q.correct_answer}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleQuestion(q.id, q.active)} className={`text-xs font-sans font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${q.active ? 'bg-green-100 text-green-700' : 'bg-earth-100 text-earth-500'}`}>{q.active ? 'Active' : 'Off'}</button>
                      <button onClick={() => { setEditingQ(q); setQForm({ question: q.question, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_answer: q.correct_answer, category: q.category, difficulty: q.difficulty }); setShowQForm(true); }} className="p-1.5 rounded-xl text-earth-400 hover:text-primary-600 hover:bg-primary-50"><Icon name="PencilSquareIcon" size={14} /></button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50"><Icon name="TrashIcon" size={14} /></button>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && <div className="p-8 text-center text-earth-400 font-sans text-sm">No questions yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            FUN FACTS
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'fun-facts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{facts.length} facts · {facts.filter(f => f.active).length} active</p>
              <button onClick={() => { setEditingFact(null); setFactForm({ title: '', content: '', category: 'Biology', icon_name: 'SparklesIcon' }); setShowFactForm(true); }} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}><Icon name="PlusCircleIcon" size={16} /> Add Fact</button>
            </div>
            {showFactForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 fade-in">
                <h3 className="font-display text-lg text-primary-800 mb-4">{editingFact ? 'Edit Fact' : 'New Fun Fact'}</h3>
                <div className="space-y-3">
                  <div><label className={labelCls}>Title</label><input className={inputCls} value={factForm.title || ''} onChange={e => setFactForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><label className={labelCls}>Content</label><textarea className={inputCls} rows={3} value={factForm.content || ''} onChange={e => setFactForm(p => ({ ...p, content: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Category</label><select className={inputCls} value={factForm.category || 'Biology'} onChange={e => setFactForm(p => ({ ...p, category: e.target.value }))}>{['Biology', 'Species', 'Conservation', 'Habitat', 'General'].map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className={labelCls}>Icon</label><select className={inputCls} value={factForm.icon_name || 'SparklesIcon'} onChange={e => setFactForm(p => ({ ...p, icon_name: e.target.value }))}>{ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic.replace('Icon', '')}</option>)}</select></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveFact} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}><Icon name="CheckIcon" size={15} />{editingFact ? 'Save' : 'Add Fact'}</button>
                    <button onClick={() => setShowFactForm(false)} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="divide-y divide-adventure-border">
                {facts.map(fact => (
                  <div key={fact.id} className="flex items-start gap-4 p-4 hover:bg-primary-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0"><Icon name={fact.icon_name as any} size={18} className="text-primary-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm text-primary-800">{fact.title}</p>
                      <p className="text-xs font-sans text-earth-400 mt-0.5 line-clamp-2">{fact.content}</p>
                      <span className="text-xs font-sans font-semibold text-earth-400 mt-1 inline-block">{fact.category}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleFact(fact.id, fact.active)} className={`text-xs font-sans font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${fact.active ? 'bg-green-100 text-green-700' : 'bg-earth-100 text-earth-500'}`}>{fact.active ? 'Active' : 'Off'}</button>
                      <button onClick={() => { setEditingFact(fact); setFactForm({ ...fact }); setShowFactForm(true); }} className="p-1.5 rounded-xl text-earth-400 hover:text-primary-600 hover:bg-primary-50"><Icon name="PencilSquareIcon" size={14} /></button>
                      <button onClick={() => deleteFact(fact.id)} className="p-1.5 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50"><Icon name="TrashIcon" size={14} /></button>
                    </div>
                  </div>
                ))}
                {facts.length === 0 && <div className="p-8 text-center text-earth-400 font-sans text-sm">No fun facts yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            FISHING TIPS
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'fishing-tips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{tips.length} tips · {tips.filter(t => t.active).length} active</p>
              <button onClick={() => { setEditingTip(null); setTipForm({ title: '', content: '', category: 'General', difficulty: 'Beginner', icon_name: 'LightBulbIcon' }); setShowTipForm(true); }} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}><Icon name="PlusCircleIcon" size={16} /> Add Tip</button>
            </div>
            {showTipForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 fade-in">
                <h3 className="font-display text-lg text-primary-800 mb-4">{editingTip ? 'Edit Tip' : 'New Fishing Tip'}</h3>
                <div className="space-y-3">
                  <div><label className={labelCls}>Title</label><input className={inputCls} value={tipForm.title || ''} onChange={e => setTipForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><label className={labelCls}>Content</label><textarea className={inputCls} rows={4} value={tipForm.content || ''} onChange={e => setTipForm(p => ({ ...p, content: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Category</label><select className={inputCls} value={tipForm.category || 'General'} onChange={e => setTipForm(p => ({ ...p, category: e.target.value }))}>{['General', 'Location', 'Technique', 'Tackle & Gear', 'Conservation', 'Timing'].map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className={labelCls}>Difficulty</label><select className={inputCls} value={tipForm.difficulty || 'Beginner'} onChange={e => setTipForm(p => ({ ...p, difficulty: e.target.value }))}>{['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d}>{d}</option>)}</select></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveTip} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}><Icon name="CheckIcon" size={15} />{editingTip ? 'Save' : 'Add Tip'}</button>
                    <button onClick={() => setShowTipForm(false)} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="divide-y divide-adventure-border">
                {tips.map(tip => (
                  <div key={tip.id} className="flex items-start gap-4 p-4 hover:bg-primary-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0"><Icon name="LightBulbIcon" size={18} className="text-amber-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm text-primary-800">{tip.title}</p>
                      <p className="text-xs font-sans text-earth-400 mt-0.5 line-clamp-2">{tip.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${tip.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : tip.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{tip.difficulty}</span>
                        <span className="text-xs font-sans text-earth-400">{tip.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleTip(tip.id, tip.active)} className={`text-xs font-sans font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${tip.active ? 'bg-green-100 text-green-700' : 'bg-earth-100 text-earth-500'}`}>{tip.active ? 'Active' : 'Off'}</button>
                      <button onClick={() => { setEditingTip(tip); setTipForm({ ...tip }); setShowTipForm(true); }} className="p-1.5 rounded-xl text-earth-400 hover:text-primary-600 hover:bg-primary-50"><Icon name="PencilSquareIcon" size={14} /></button>
                      <button onClick={() => deleteTip(tip.id)} className="p-1.5 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50"><Icon name="TrashIcon" size={14} /></button>
                    </div>
                  </div>
                ))}
                {tips.length === 0 && <div className="p-8 text-center text-earth-400 font-sans text-sm">No tips yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 text-white text-sm font-sans font-semibold px-5 py-3 rounded-2xl shadow-panel fade-in" style={{ backgroundColor: '#ff751f' }}>
            {toast}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
