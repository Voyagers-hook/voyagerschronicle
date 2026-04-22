'use client';

import React, { useState } from 'react';
import { catchSubmissions, adminMembers, adminQuizQuestions, adminCards, adminRewards, adminFunFacts, adminFishingTips, CatchSubmission, AdminQuizQuestion, AdminCard, AdminReward, AdminFunFact, AdminFishingTip,  } from '@/app/admin/data/adminData';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

type AdminTab = 'cards' | 'send-cards' | 'rewards' | 'catch-submissions' | 'quiz-manager' | 'fun-facts' | 'fishing-tips';

const RARITIES = ['Widespread', 'Elusive', 'Specimen', 'Legendary'] as const;
const RARITY_COLORS: Record<string, string> = {
  Widespread: 'bg-earth-100 text-earth-700 border-earth-300',
  Elusive:    'bg-green-100 text-green-700 border-green-300',
  Specimen:   'bg-blue-100 text-blue-700 border-blue-300',
  Legendary:  'bg-amber-100 text-amber-700 border-amber-300',
};
const RARITY_PROB_DEFAULTS: Record<string, number> = {
  Widespread: 70, Elusive: 35, Specimen: 20, Legendary: 5,
};

const ICON_OPTIONS = ['EyeIcon','SparklesIcon','ClockIcon','MoonIcon','HeartIcon','BeakerIcon','EyeSlashIcon','MagnifyingGlassIcon','AcademicCapIcon','StarIcon','FireIcon','BoltIcon','GlobeAltIcon','ShieldCheckIcon'];

const inputCls = 'w-full border border-adventure-border rounded-xl px-4 py-2.5 text-sm font-sans text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white';
const labelCls = 'block text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide mb-1';
const btnPrimary = 'flex items-center gap-2 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95';
const btnGhost = 'flex items-center gap-2 font-sans font-semibold text-sm px-4 py-2.5 rounded-xl border border-adventure-border text-earth-500 hover:bg-adventure-bg transition-all';

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('cards');
  const [submissions, setSubmissions] = useState<CatchSubmission[]>(catchSubmissions);
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>(adminQuizQuestions);
  const [cards, setCards] = useState<AdminCard[]>(adminCards);
  const [rewards, setRewards] = useState<AdminReward[]>(adminRewards);
  const [facts, setFacts] = useState<AdminFunFact[]>(adminFunFacts);
  const [tips, setTips] = useState<AdminFishingTip[]>(adminFishingTips);
  const [toastMsg, setToastMsg] = useState('');

  // Send cards state
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [sendMode, setSendMode] = useState<'all' | 'select'>('all');
  const [batchSize, setBatchSize] = useState(1);
  const [rarityWeights, setRarityWeights] = useState<Record<string, number>>(RARITY_PROB_DEFAULTS);

  // Card management state
  const [editingCard, setEditingCard] = useState<AdminCard | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState<Partial<AdminCard>>({
    name: '', species: '', rarity: 'Widespread', image: '', power: 50, stealth: 50, stamina: 50, beauty: 50,
    habitat: '', description: '', gradient: 'from-blue-400 via-cyan-300 to-teal-400', borderColor: '#3B82F6', probabilityWeight: 50,
  });

  // Reward management state
  const [editingReward, setEditingReward] = useState<AdminReward | null>(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [rewardForm, setRewardForm] = useState<Partial<AdminReward>>({
    label: '', description: '', pointsCost: 500, type: 'card-pack', icon: 'GiftIcon', color: '#ff751f', bg: 'bg-orange-50', active: true,
  });

  // Quiz state
  const [showNewQForm, setShowNewQForm] = useState(false);
  const [editingQ, setEditingQ] = useState<AdminQuizQuestion | null>(null);
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], correctIndex: 0, category: 'Species', difficulty: 'Easy\' as \'Easy\' | \'Medium\' | \'Hard' });

  // Fun facts state
  const [showFactForm, setShowFactForm] = useState(false);
  const [editingFact, setEditingFact] = useState<AdminFunFact | null>(null);
  const [factForm, setFactForm] = useState<Partial<AdminFunFact>>({ title: '', content: '', category: 'Biology', icon_name: 'SparklesIcon', active: true });

  // Tips state
  const [showTipForm, setShowTipForm] = useState(false);
  const [editingTip, setEditingTip] = useState<AdminFishingTip | null>(null);
  const [tipForm, setTipForm] = useState<Partial<AdminFishingTip>>({ title: '', content: '', section: 'Reading the Water', level: 'Beginner', readTime: '2 min', active: true });
  const [tipSection, setTipSection] = useState<'Reading the Water' | 'Technique'>('Reading the Water');

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const tabs: { key: AdminTab; label: string; iconName: Parameters<typeof Icon>[0]['name']; badge?: number }[] = [
    { key: 'cards',             label: 'Cards',           iconName: 'BookOpenIcon'              },
    { key: 'send-cards',        label: 'Send Cards',      iconName: 'GiftIcon'                  },
    { key: 'rewards',           label: 'Rewards',         iconName: 'TrophyIcon'                },
    { key: 'catch-submissions', label: 'Submissions',     iconName: 'ClipboardDocumentListIcon', badge: pendingCount },
    { key: 'quiz-manager',      label: 'Quiz',            iconName: 'AcademicCapIcon'           },
    { key: 'fun-facts',         label: 'Fun Facts',       iconName: 'LightBulbIcon'             },
    { key: 'fishing-tips',      label: 'Fishing Tips',    iconName: 'BookmarkIcon'              },
  ];

  // ── CARD HELPERS ──────────────────────────────────────────────
  const openNewCard = () => {
    setEditingCard(null);
    setCardForm({ name: '', species: '', rarity: 'Widespread', image: '', power: 50, stealth: 50, stamina: 50, beauty: 50, habitat: '', description: '', gradient: 'from-blue-400 via-cyan-300 to-teal-400', borderColor: '#3B82F6', probabilityWeight: 50 });
    setShowCardForm(true);
  };
  const openEditCard = (card: AdminCard) => {
    setEditingCard(card);
    setCardForm({ ...card });
    setShowCardForm(true);
  };
  const saveCard = () => {
    if (!cardForm.name?.trim()) return;
    if (editingCard) {
      setCards(prev => prev.map(c => c.id === editingCard.id ? { ...c, ...cardForm } as AdminCard : c));
      showToast('Card updated!');
    } else {
      const newCard: AdminCard = { ...cardForm as AdminCard, id: `card-${Date.now()}` };
      setCards(prev => [...prev, newCard]);
      showToast('Card added!');
    }
    setShowCardForm(false);
    setEditingCard(null);
  };
  const deleteCard = (id: string) => { setCards(prev => prev.filter(c => c.id !== id)); showToast('Card deleted.'); };

  // ── SEND CARDS HELPERS ────────────────────────────────────────
  const toggleMember = (id: string) => setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  const handleSendCards = () => {
    const targets = sendMode === 'all' ? adminMembers.map(m => m.name) : adminMembers.filter(m => selectedMembers.includes(m.id)).map(m => m.name);
    if (targets.length === 0) { showToast('Select at least one member.'); return; }
    showToast(`Sending ${batchSize} random card${batchSize > 1 ? 's' : ''} to ${targets.length} member${targets.length > 1 ? 's' : ''}!`);
    setSelectedMembers([]);
  };

  // ── REWARD HELPERS ────────────────────────────────────────────
  const openNewReward = () => {
    setEditingReward(null);
    setRewardForm({ label: '', description: '', pointsCost: 500, type: 'card-pack', icon: 'GiftIcon', color: '#ff751f', bg: 'bg-orange-50', active: true });
    setShowRewardForm(true);
  };
  const openEditReward = (r: AdminReward) => { setEditingReward(r); setRewardForm({ ...r }); setShowRewardForm(true); };
  const saveReward = () => {
    if (!rewardForm.label?.trim()) return;
    if (editingReward) {
      setRewards(prev => prev.map(r => r.id === editingReward.id ? { ...r, ...rewardForm } as AdminReward : r));
      showToast('Reward updated!');
    } else {
      setRewards(prev => [...prev, { ...rewardForm as AdminReward, id: `reward-${Date.now()}` }]);
      showToast('Reward added!');
    }
    setShowRewardForm(false);
  };
  const deleteReward = (id: string) => { setRewards(prev => prev.filter(r => r.id !== id)); showToast('Reward deleted.'); };
  const toggleReward = (id: string) => { setRewards(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r)); };

  // ── QUIZ HELPERS ──────────────────────────────────────────────
  const openNewQ = () => { setEditingQ(null); setQForm({ question: '', options: ['', '', '', ''], correctIndex: 0, category: 'Species', difficulty: 'Easy' }); setShowNewQForm(true); };
  const openEditQ = (q: AdminQuizQuestion) => { setEditingQ(q); setQForm({ question: q.question, options: [...q.options], correctIndex: q.correctIndex, category: q.category, difficulty: q.difficulty }); setShowNewQForm(true); };
  const saveQ = () => {
    if (!qForm.question.trim()) return;
    if (editingQ) {
      setQuestions(prev => prev.map(q => q.id === editingQ.id ? { ...q, ...qForm } : q));
      showToast('Question updated!');
    } else {
      setQuestions(prev => [...prev, { id: `aq${Date.now()}`, ...qForm, active: true }]);
      showToast('Question added!');
    }
    setShowNewQForm(false);
  };
  const deleteQuestion = (id: string) => { setQuestions(prev => prev.filter(q => q.id !== id)); showToast('Question deleted.'); };
  const toggleQuestion = (id: string) => { setQuestions(prev => prev.map(q => q.id === id ? { ...q, active: !q.active } : q)); };

  // ── FACT HELPERS ──────────────────────────────────────────────
  const openNewFact = () => { setEditingFact(null); setFactForm({ title: '', content: '', category: 'Biology', icon_name: 'SparklesIcon', active: true }); setShowFactForm(true); };
  const openEditFact = (f: AdminFunFact) => { setEditingFact(f); setFactForm({ ...f }); setShowFactForm(true); };
  const saveFact = () => {
    if (!factForm.title?.trim()) return;
    if (editingFact) {
      setFacts(prev => prev.map(f => f.id === editingFact.id ? { ...f, ...factForm } as AdminFunFact : f));
      showToast('Fact updated!');
    } else {
      setFacts(prev => [...prev, { ...factForm as AdminFunFact, id: `ff${Date.now()}` }]);
      showToast('Fact added!');
    }
    setShowFactForm(false);
  };
  const deleteFact = (id: string) => { setFacts(prev => prev.filter(f => f.id !== id)); showToast('Fact deleted.'); };
  const toggleFact = (id: string) => { setFacts(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f)); };

  // ── TIP HELPERS ───────────────────────────────────────────────
  const openNewTip = () => { setEditingTip(null); setTipForm({ title: '', content: '', section: tipSection, level: 'Beginner', readTime: '2 min', active: true }); setShowTipForm(true); };
  const openEditTip = (t: AdminFishingTip) => { setEditingTip(t); setTipForm({ ...t }); setShowTipForm(true); };
  const saveTip = () => {
    if (!tipForm.title?.trim()) return;
    if (editingTip) {
      setTips(prev => prev.map(t => t.id === editingTip.id ? { ...t, ...tipForm } as AdminFishingTip : t));
      showToast('Tip updated!');
    } else {
      setTips(prev => [...prev, { ...tipForm as AdminFishingTip, id: `tip-${Date.now()}` }]);
      showToast('Tip added!');
    }
    setShowTipForm(false);
  };
  const deleteTip = (id: string) => { setTips(prev => prev.filter(t => t.id !== id)); showToast('Tip deleted.'); };
  const toggleTip = (id: string) => { setTips(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t)); };

  const handleApprove = (id: string) => { setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' as const } : s)); showToast('Catch approved!'); };
  const handleReject  = (id: string) => { setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s)); showToast('Catch rejected.'); };

  return (
    <AppLayout currentPath="/admin">
      <div className="fade-in space-y-5">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Cog6ToothIcon" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Admin Panel</h1>
              <p className="text-primary-200 font-sans text-sm mt-0.5">Full control over your Voyagers Chronicle club.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-white rounded-2xl border border-adventure-border p-1.5 shadow-card">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${tab === t.key ? 'text-white shadow-sm' : 'text-earth-500 hover:text-primary-700 hover:bg-primary-50'}`}
              style={tab === t.key ? { backgroundColor: '#ff751f' } : {}}
            >
              <Icon name={t.iconName} size={14} />
              {t.label}
              {t.badge && t.badge > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CARDS TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{cards.length} cards in collection</p>
              <button onClick={openNewCard} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add New Card
              </button>
            </div>

            {/* Card form */}
            {showCardForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-6 fade-in">
                <h3 className="font-display text-xl text-primary-800 mb-5">{editingCard ? 'Edit Card' : 'Add New Card'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Card Name</label>
                    <input className={inputCls} placeholder="e.g. Murray Cod" value={cardForm.name || ''} onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Species (Latin)</label>
                    <input className={inputCls} placeholder="e.g. Maccullochella peelii" value={cardForm.species || ''} onChange={e => setCardForm(p => ({ ...p, species: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Rarity</label>
                    <select className={inputCls} value={cardForm.rarity || 'Widespread'} onChange={e => setCardForm(p => ({ ...p, rarity: e.target.value as AdminCard['rarity'], probabilityWeight: RARITY_PROB_DEFAULTS[e.target.value] }))}>
                      {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Habitat</label>
                    <input className={inputCls} placeholder="e.g. River, Lake, Ocean" value={cardForm.habitat || ''} onChange={e => setCardForm(p => ({ ...p, habitat: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea className={inputCls} rows={2} placeholder="Short flavour text for the card..." value={cardForm.description || ''} onChange={e => setCardForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Card Image URL (optional)</label>
                    <input className={inputCls} placeholder="https://..." value={cardForm.image || ''} onChange={e => setCardForm(p => ({ ...p, image: e.target.value }))} />
                  </div>
                  {/* Stats */}
                  {(['power', 'stealth', 'stamina', 'beauty'] as const).map(stat => (
                    <div key={stat}>
                      <label className={labelCls}>{stat.charAt(0).toUpperCase() + stat.slice(1)} <span className="text-primary-500 font-bold">{cardForm[stat]}</span></label>
                      <input type="range" min={1} max={100} value={cardForm[stat] || 50} onChange={e => setCardForm(p => ({ ...p, [stat]: Number(e.target.value) }))} className="w-full accent-orange-500" />
                    </div>
                  ))}
                  <div>
                    <label className={labelCls}>Drop Probability Weight <span className="text-primary-500 font-bold">{cardForm.probabilityWeight}</span></label>
                    <input type="range" min={1} max={100} value={cardForm.probabilityWeight || 50} onChange={e => setCardForm(p => ({ ...p, probabilityWeight: Number(e.target.value) }))} className="w-full accent-orange-500" />
                    <p className="text-xs text-earth-400 mt-1">Higher = appears more often when cards are sent</p>
                  </div>
                  <div>
                    <label className={labelCls}>Border Colour</label>
                    <input type="color" value={cardForm.borderColor || '#3B82F6'} onChange={e => setCardForm(p => ({ ...p, borderColor: e.target.value }))} className="h-10 w-full rounded-xl border border-adventure-border cursor-pointer" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={saveCard} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                    <Icon name="CheckIcon" size={15} /> {editingCard ? 'Save Changes' : 'Add Card'}
                  </button>
                  <button onClick={() => setShowCardForm(false)} className={btnGhost}>Cancel</button>
                </div>
              </div>
            )}

            {/* Cards table */}
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-adventure-border bg-adventure-bg">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Card</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Rarity</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">PWR</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">STL</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">STA</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">BTY</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Drop%</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-earth-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-adventure-border">
                    {cards.map(card => (
                      <tr key={card.id} className="hover:bg-primary-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-primary-800">{card.name}</p>
                            <p className="text-xs text-earth-400 italic">{card.species}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-display text-primary-700">{card.power}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-display text-primary-700">{card.stealth}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-display text-primary-700">{card.stamina}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-display text-primary-700">{card.beauty}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-sans text-xs font-semibold text-earth-500">{card.probabilityWeight}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditCard(card)} className="p-1.5 rounded-lg text-earth-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                              <Icon name="PencilSquareIcon" size={15} />
                            </button>
                            <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded-lg text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Icon name="TrashIcon" size={15} />
                            </button>
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

        {/* ═══════════════════════════════════════════════════════════
            SEND CARDS TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'send-cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Members */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                <h2 className="font-display text-xl text-primary-800 mb-1">Recipients</h2>
                <p className="text-xs font-sans text-earth-400 mb-4">Choose who receives the random cards</p>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setSendMode('all')} className={`flex-1 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${sendMode === 'all' ? 'text-white' : 'bg-adventure-bg text-earth-500'}`} style={sendMode === 'all' ? { backgroundColor: '#ff751f' } : {}}>
                    All Members
                  </button>
                  <button onClick={() => setSendMode('select')} className={`flex-1 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${sendMode === 'select' ? 'text-white' : 'bg-adventure-bg text-earth-500'}`} style={sendMode === 'select' ? { backgroundColor: '#ff751f' } : {}}>
                    Select Members
                  </button>
                </div>
                {sendMode === 'select' && (
                  <div className="divide-y divide-adventure-border border border-adventure-border rounded-xl overflow-hidden">
                    {adminMembers.map(member => (
                      <button key={member.id} onClick={() => toggleMember(member.id)} className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-primary-50 ${selectedMembers.includes(member.id) ? 'bg-primary-50' : ''}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedMembers.includes(member.id) ? 'border-orange-500 bg-orange-500' : 'border-earth-300'}`}>
                          {selectedMembers.includes(member.id) && <Icon name="CheckIcon" size={11} className="text-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 font-sans flex-shrink-0">
                          {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-semibold text-primary-800 text-sm">{member.name}</p>
                          <p className="text-xs font-sans text-earth-400">{member.level} · {member.cardsOwned} cards</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {sendMode === 'all' && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-sm font-sans text-primary-700">
                    Cards will be sent to all <strong>{adminMembers.length} members</strong>.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-4">
              {/* Batch size */}
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                <h2 className="font-display text-xl text-primary-800 mb-1">Cards Per Member</h2>
                <p className="text-xs font-sans text-earth-400 mb-4">How many random cards each member receives</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => setBatchSize(Math.max(1, batchSize - 1))} className="w-10 h-10 rounded-xl bg-adventure-bg border border-adventure-border flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors font-bold text-lg">−</button>
                  <span className="font-display text-4xl text-primary-800 tabular-nums w-12 text-center">{batchSize}</span>
                  <button onClick={() => setBatchSize(Math.min(10, batchSize + 1))} className="w-10 h-10 rounded-xl bg-adventure-bg border border-adventure-border flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors font-bold text-lg">+</button>
                  <span className="text-sm font-sans text-earth-400">card{batchSize > 1 ? 's' : ''} each</span>
                </div>
              </div>

              {/* Rarity probability weights */}
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                <h2 className="font-display text-xl text-primary-800 mb-1">Rarity Probability</h2>
                <p className="text-xs font-sans text-earth-400 mb-4">Set how likely each rarity is to appear. Higher = more common.</p>
                <div className="space-y-4">
                  {RARITIES.map(rarity => (
                    <div key={rarity}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${RARITY_COLORS[rarity]}`}>{rarity}</span>
                        <span className="font-display text-lg text-primary-700 tabular-nums">{rarityWeights[rarity]}</span>
                      </div>
                      <input type="range" min={1} max={100} value={rarityWeights[rarity]} onChange={e => setRarityWeights(p => ({ ...p, [rarity]: Number(e.target.value) }))} className="w-full accent-orange-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Send button */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="font-sans font-semibold text-amber-700 text-sm mb-1">Ready to send!</p>
                <p className="text-amber-600 font-sans text-xs mb-3">
                  {batchSize} random card{batchSize > 1 ? 's' : ''} will be sent to {sendMode === 'all' ? `all ${adminMembers.length} members` : `${selectedMembers.length} selected member${selectedMembers.length !== 1 ? 's' : ''}`}. Cards are chosen randomly based on the probability weights above.
                </p>
                <button onClick={handleSendCards} className={`w-full ${btnPrimary} justify-center`} style={{ backgroundColor: '#ff751f' }}>
                  <Icon name="GiftIcon" size={16} />
                  Send Random Cards
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            REWARDS TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'rewards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{rewards.length} rewards configured</p>
              <button onClick={openNewReward} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add Reward
              </button>
            </div>

            {showRewardForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-6 fade-in">
                <h3 className="font-display text-xl text-primary-800 mb-5">{editingReward ? 'Edit Reward' : 'Add New Reward'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Reward Name</label>
                    <input className={inputCls} placeholder="e.g. Card Pack" value={rewardForm.label || ''} onChange={e => setRewardForm(p => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Points Cost</label>
                    <input type="number" min={1} className={inputCls} value={rewardForm.pointsCost || 500} onChange={e => setRewardForm(p => ({ ...p, pointsCost: Number(e.target.value) }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea className={inputCls} rows={2} placeholder="What does this reward give the member?" value={rewardForm.description || ''} onChange={e => setRewardForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select className={inputCls} value={rewardForm.type || 'card-pack'} onChange={e => setRewardForm(p => ({ ...p, type: e.target.value }))}>
                      {['card-pack', 'rare-pack', 'legend-pack', 'discount', 'external', 'physical'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Active</label>
                    <select className={inputCls} value={rewardForm.active ? 'true' : 'false'} onChange={e => setRewardForm(p => ({ ...p, active: e.target.value === 'true' }))}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={saveReward} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                    <Icon name="CheckIcon" size={15} /> {editingReward ? 'Save Changes' : 'Add Reward'}
                  </button>
                  <button onClick={() => setShowRewardForm(false)} className={btnGhost}>Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <div key={reward.id} className={`bg-white rounded-2xl border border-adventure-border shadow-card p-5 ${!reward.active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reward.bg}`}>
                      <Icon name={reward.icon as Parameters<typeof Icon>[0]['name']} size={22} style={{ color: reward.color }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleReward(reward.id)} className={`text-xs font-sans font-semibold px-2.5 py-1 rounded-lg transition-colors ${reward.active ? 'bg-green-100 text-green-700' : 'bg-earth-100 text-earth-500'}`}>
                        {reward.active ? 'Active' : 'Off'}
                      </button>
                      <button onClick={() => openEditReward(reward)} className="p-1.5 rounded-lg text-earth-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                        <Icon name="PencilSquareIcon" size={14} />
                      </button>
                      <button onClick={() => deleteReward(reward.id)} className="p-1.5 rounded-lg text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display text-lg text-primary-800 mb-1">{reward.label}</h3>
                  <p className="text-xs font-sans text-earth-500 mb-3 leading-relaxed">{reward.description}</p>
                  <div className="flex items-center gap-1.5">
                    <Icon name="StarIcon" size={13} className="text-amber-500" />
                    <span className="font-display text-lg text-primary-800">{reward.pointsCost.toLocaleString()}</span>
                    <span className="text-xs font-sans text-earth-400">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CATCH SUBMISSIONS TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'catch-submissions' && (
          <div className="space-y-4">
            <p className="text-sm font-sans text-earth-400">{pendingCount} pending review</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-700 to-primary-500 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white font-sans flex-shrink-0">{sub.memberInitials}</div>
                    <div>
                      <p className="font-sans font-semibold text-white text-sm">{sub.memberName}</p>
                      <p className="text-primary-200 text-xs font-sans">{sub.memberLevel}</p>
                    </div>
                    <span className={`ml-auto text-xs font-sans font-bold px-2.5 py-1 rounded-full ${sub.status === 'pending' ? 'bg-amber-400/30 text-amber-200' : sub.status === 'approved' ? 'bg-green-400/30 text-green-200' : 'bg-red-400/30 text-red-200'}`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="font-display text-lg text-primary-800">{sub.species}</p>
                      <p className="text-xs font-sans text-earth-400">{sub.date} · {sub.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      <div className="bg-adventure-bg rounded-xl p-2"><p className="text-earth-400 uppercase tracking-wide font-semibold mb-0.5">Weight</p><p className="font-semibold text-primary-700">{sub.weight}</p></div>
                      <div className="bg-adventure-bg rounded-xl p-2"><p className="text-earth-400 uppercase tracking-wide font-semibold mb-0.5">Length</p><p className="font-semibold text-primary-700">{sub.length}</p></div>
                    </div>
                    {sub.notes && <p className="text-xs font-sans text-earth-500 italic">"{sub.notes}"</p>}
                    {sub.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleApprove(sub.id)} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-sans font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                          <Icon name="CheckIcon" size={12} /> Approve
                        </button>
                        <button onClick={() => handleReject(sub.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                          <Icon name="XMarkIcon" size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            QUIZ MANAGER TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'quiz-manager' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{questions.length} questions in bank</p>
              <button onClick={openNewQ} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add Question
              </button>
            </div>

            {showNewQForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 fade-in">
                <h3 className="font-display text-lg text-primary-800 mb-4">{editingQ ? 'Edit Question' : 'New Question'}</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Question</label>
                    <input className={inputCls} placeholder="Enter your question..." value={qForm.question} onChange={e => setQForm(p => ({ ...p, question: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Answer Options (mark correct with radio)</label>
                    <div className="space-y-2">
                      {qForm.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" name="correct" checked={qForm.correctIndex === i} onChange={() => setQForm(p => ({ ...p, correctIndex: i }))} className="accent-orange-500 w-4 h-4 flex-shrink-0" />
                          <input className={inputCls} placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm(p => ({ ...p, options: opts })); }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-earth-400 mt-1">Select the radio button next to the correct answer</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} value={qForm.category} onChange={e => setQForm(p => ({ ...p, category: e.target.value }))}>
                        {['Species', 'Techniques', 'Conservation', 'Regulations', 'Habitat', 'Gear', 'Identification'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Difficulty</label>
                      <select className={inputCls} value={qForm.difficulty} onChange={e => setQForm(p => ({ ...p, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}>
                        {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveQ} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                      <Icon name="CheckIcon" size={15} /> {editingQ ? 'Save Changes' : 'Add Question'}
                    </button>
                    <button onClick={() => setShowNewQForm(false)} className={btnGhost}>Cancel</button>
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
                        <span className="text-xs font-sans text-earth-300">✓ {q.options[q.correctIndex]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleQuestion(q.id)} className={`text-xs font-sans font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${q.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-earth-100 text-earth-500 hover:bg-earth-200'}`}>
                        {q.active ? 'Active' : 'Off'}
                      </button>
                      <button onClick={() => openEditQ(q)} className="p-1.5 rounded-xl text-earth-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                        <Icon name="PencilSquareIcon" size={14} />
                      </button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            FUN FACTS TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'fun-facts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-earth-400">{facts.length} facts · {facts.filter(f => f.active).length} active</p>
              <button onClick={openNewFact} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add Fact
              </button>
            </div>

            {showFactForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 fade-in">
                <h3 className="font-display text-lg text-primary-800 mb-4">{editingFact ? 'Edit Fact' : 'New Fun Fact'}</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input className={inputCls} placeholder="e.g. Fish Can See Colour" value={factForm.title || ''} onChange={e => setFactForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Content</label>
                    <textarea className={inputCls} rows={3} placeholder="The interesting fact content..." value={factForm.content || ''} onChange={e => setFactForm(p => ({ ...p, content: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} value={factForm.category || 'Biology'} onChange={e => setFactForm(p => ({ ...p, category: e.target.value }))}>
                        {['Biology', 'Species', 'Conservation', 'Habitat', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Icon</label>
                      <select className={inputCls} value={factForm.icon_name || 'SparklesIcon'} onChange={e => setFactForm(p => ({ ...p, icon_name: e.target.value }))}>
                        {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic.replace('Icon', '')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveFact} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                      <Icon name="CheckIcon" size={15} /> {editingFact ? 'Save Changes' : 'Add Fact'}
                    </button>
                    <button onClick={() => setShowFactForm(false)} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="divide-y divide-adventure-border">
                {facts.map(fact => (
                  <div key={fact.id} className="flex items-start gap-4 p-4 hover:bg-primary-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon name={fact.icon_name as Parameters<typeof Icon>[0]['name']} size={18} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm text-primary-800">{fact.title}</p>
                      <p className="text-xs font-sans text-earth-400 mt-0.5 line-clamp-2">{fact.content}</p>
                      <span className="text-xs font-sans font-semibold text-earth-400 mt-1 inline-block">{fact.category}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleFact(fact.id)} className={`text-xs font-sans font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${fact.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-earth-100 text-earth-500 hover:bg-earth-200'}`}>
                        {fact.active ? 'Active' : 'Off'}
                      </button>
                      <button onClick={() => openEditFact(fact)} className="p-1.5 rounded-xl text-earth-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                        <Icon name="PencilSquareIcon" size={14} />
                      </button>
                      <button onClick={() => deleteFact(fact.id)} className="p-1.5 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            FISHING TIPS TAB
        ═══════════════════════════════════════════════════════════ */}
        {tab === 'fishing-tips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-1 bg-white rounded-xl border border-adventure-border p-1">
                {(['Reading the Water', 'Technique'] as const).map(s => (
                  <button key={s} onClick={() => setTipSection(s)} className={`px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-all ${tipSection === s ? 'text-white' : 'bg-adventure-bg text-earth-500'}`} style={tipSection === s ? { backgroundColor: '#ff751f' } : {}}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={openNewTip} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                <Icon name="PlusCircleIcon" size={16} /> Add Tip
              </button>
            </div>

            {showTipForm && (
              <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 fade-in">
                <h3 className="font-display text-lg text-primary-800 mb-4">{editingTip ? 'Edit Tip' : 'New Fishing Tip'}</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input className={inputCls} placeholder="e.g. Reading Current Seams" value={tipForm.title || ''} onChange={e => setTipForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Content</label>
                    <textarea className={inputCls} rows={4} placeholder="The tip content..." value={tipForm.content || ''} onChange={e => setTipForm(p => ({ ...p, content: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Section</label>
                      <select className={inputCls} value={tipForm.section || 'Reading the Water'} onChange={e => setTipForm(p => ({ ...p, section: e.target.value as AdminFishingTip['section'] }))}>
                        <option value="Reading the Water">Reading the Water</option>
                        <option value="Technique">Technique</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Level</label>
                      <select className={inputCls} value={tipForm.level || 'Beginner'} onChange={e => setTipForm(p => ({ ...p, level: e.target.value as AdminFishingTip['level'] }))}>
                        {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Read Time</label>
                      <input className={inputCls} placeholder="e.g. 3 min" value={tipForm.readTime || ''} onChange={e => setTipForm(p => ({ ...p, readTime: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveTip} className={btnPrimary} style={{ backgroundColor: '#ff751f' }}>
                      <Icon name="CheckIcon" size={15} /> {editingTip ? 'Save Changes' : 'Add Tip'}
                    </button>
                    <button onClick={() => setShowTipForm(false)} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="divide-y divide-adventure-border">
                {tips.filter(t => t.section === tipSection).map(tip => (
                  <div key={tip.id} className="flex items-start gap-4 p-4 hover:bg-primary-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon name="LightBulbIcon" size={18} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm text-primary-800">{tip.title}</p>
                      <p className="text-xs font-sans text-earth-400 mt-0.5 line-clamp-2">{tip.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${tip.level === 'Beginner' ? 'bg-green-100 text-green-700' : tip.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{tip.level}</span>
                        <span className="text-xs font-sans text-earth-400">{tip.readTime} read</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleTip(tip.id)} className={`text-xs font-sans font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${tip.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-earth-100 text-earth-500 hover:bg-earth-200'}`}>
                        {tip.active ? 'Active' : 'Off'}
                      </button>
                      <button onClick={() => openEditTip(tip)} className="p-1.5 rounded-xl text-earth-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                        <Icon name="PencilSquareIcon" size={14} />
                      </button>
                      <button onClick={() => deleteTip(tip.id)} className="p-1.5 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {tips.filter(t => t.section === tipSection).length === 0 && (
                  <div className="p-8 text-center text-earth-400 font-sans text-sm">No tips in this section yet. Add one above!</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 text-white text-sm font-sans font-semibold px-5 py-3 rounded-2xl shadow-panel fade-in" style={{ backgroundColor: '#ff751f' }}>
            {toastMsg}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
