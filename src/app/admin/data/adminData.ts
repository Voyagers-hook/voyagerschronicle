export interface CatchSubmission {
  id: string;
  memberName: string;
  memberInitials: string;
  memberLevel: string;
  species: string;
  weight: string;
  length: string;
  location: string;
  date: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AdminMember {
  id: string;
  name: string;
  level: string;
  email: string;
  joinDate: string;
  cardsOwned: number;
  catchCount: number;
  quizScore: number;
}

export interface AdminQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  active: boolean;
}

export interface AdminCard {
  id: string;
  name: string;
  species: string;
  rarity: 'Widespread' | 'Elusive' | 'Specimen' | 'Legendary';
  image: string;
  power: number;
  stealth: number;
  stamina: number;
  beauty: number;
  habitat: string;
  description: string;
  gradient: string;
  borderColor: string;
  probabilityWeight: number; // 1-100, higher = more common
}

export interface AdminReward {
  id: string;
  label: string;
  description: string;
  pointsCost: number;
  type: string;
  icon: string;
  color: string;
  bg: string;
  active: boolean;
}

export interface AdminFunFact {
  id: string;
  title: string;
  content: string;
  category: string;
  icon_name: string;
  active: boolean;
}

export interface AdminFishingTip {
  id: string;
  title: string;
  content: string;
  section: 'Reading the Water' | 'Technique';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: string;
  active: boolean;
}

export const catchSubmissions: CatchSubmission[] = [
  { id: 'sub-001', memberName: 'Jake Rivers',   memberInitials: 'JR', memberLevel: 'Silver Angler', species: 'Murray Cod',    weight: '4.2kg', length: '68cm', location: 'Murray River, Albury',    date: '20 Apr 2026', notes: 'Caught on a surface lure at dawn. Released after photo.', status: 'pending'  },
  { id: 'sub-002', memberName: 'Mia Chen',       memberInitials: 'MC', memberLevel: 'Gold Explorer', species: 'Rainbow Trout', weight: '1.8kg', length: '52cm', location: 'Thredbo River, NSW',      date: '19 Apr 2026', notes: 'Beautiful fish, perfect condition.',                       status: 'pending'  },
  { id: 'sub-003', memberName: 'Tom Mackenzie',  memberInitials: 'TM', memberLevel: 'Legend Member', species: 'Barramundi',    weight: '6.1kg', length: '82cm', location: 'Daly River, NT',          date: '18 Apr 2026', notes: 'Monster barra! Best catch of the trip.',                  status: 'approved' },
  { id: 'sub-004', memberName: 'Lily Nguyen',    memberInitials: 'LN', memberLevel: 'Bronze Caster', species: 'Flathead',      weight: '0.9kg', length: '38cm', location: 'Port Hacking, NSW',       date: '17 Apr 2026', notes: 'First flathead ever! So excited.',                         status: 'approved' },
  { id: 'sub-005', memberName: 'Sam Torres',     memberInitials: 'ST', memberLevel: 'Gold Explorer', species: 'Snapper',       weight: '3.4kg', length: '58cm', location: 'Sydney Heads',            date: '16 Apr 2026', notes: 'Offshore trip, great conditions.',                         status: 'rejected' },
  { id: 'sub-006', memberName: 'Zoe Park',       memberInitials: 'ZP', memberLevel: 'Silver Angler', species: 'Golden Perch',  weight: '2.1kg', length: '44cm', location: 'Lake Mulwala, VIC',       date: '15 Apr 2026', notes: 'Trolling deep with a minnow lure.',                        status: 'pending'  },
];

export const adminMembers: AdminMember[] = [
  { id: 'm1', name: 'Jake Rivers',   level: 'Silver Angler', email: 'jake@example.com',  joinDate: '15 Jan 2026', cardsOwned: 8,  catchCount: 23, quizScore: 85 },
  { id: 'm2', name: 'Mia Chen',      level: 'Gold Explorer', email: 'mia@example.com',   joinDate: '3 Feb 2026',  cardsOwned: 14, catchCount: 31, quizScore: 92 },
  { id: 'm3', name: 'Tom Mackenzie', level: 'Legend Member', email: 'tom@example.com',   joinDate: '10 Dec 2025', cardsOwned: 21, catchCount: 67, quizScore: 98 },
  { id: 'm4', name: 'Lily Nguyen',   level: 'Bronze Caster', email: 'lily@example.com',  joinDate: '1 Mar 2026',  cardsOwned: 4,  catchCount: 7,  quizScore: 60 },
  { id: 'm5', name: 'Sam Torres',    level: 'Gold Explorer', email: 'sam@example.com',   joinDate: '20 Jan 2026', cardsOwned: 16, catchCount: 42, quizScore: 88 },
  { id: 'm6', name: 'Zoe Park',      level: 'Silver Angler', email: 'zoe@example.com',   joinDate: '8 Feb 2026',  cardsOwned: 9,  catchCount: 18, quizScore: 75 },
  { id: 'm7', name: 'Ben Walsh',     level: 'Bronze Caster', email: 'ben@example.com',   joinDate: '12 Mar 2026', cardsOwned: 3,  catchCount: 5,  quizScore: 55 },
];

export const adminQuizQuestions: AdminQuizQuestion[] = [
  { id: 'aq1', question: 'What is the largest freshwater fish native to Australia?', options: ['Rainbow Trout', 'Murray Cod', 'Golden Perch', 'Silver Perch'], correctIndex: 1, category: 'Species',      difficulty: 'Easy',   active: true },
  { id: 'aq2', question: 'What does "catch and release" mean?',                      options: ['Keeping the fish', 'Releasing back into water', 'Throwing to a friend', 'Cooking it'], correctIndex: 1, category: 'Conservation', difficulty: 'Easy',   active: true },
  { id: 'aq3', question: 'What is the minimum legal size for Murray Cod in NSW?',    options: ['40cm', '55cm', '75cm', '90cm'], correctIndex: 2, category: 'Regulations',  difficulty: 'Hard',   active: true },
  { id: 'aq4', question: 'What is a "lure" used for in fishing?',                    options: ['Attract fish with artificial bait', 'Measure fish', 'Store fish', 'Clean hook'], correctIndex: 0, category: 'Techniques',   difficulty: 'Medium', active: false },
  { id: 'aq5', question: 'Which fish is known as the "bread and butter" of estuaries?', options: ['Flathead', 'Bream', 'Whiting', 'Tailor'], correctIndex: 1, category: 'Species',      difficulty: 'Easy',   active: true },
];

export const adminCards: AdminCard[] = [
  { id: 'card-001', name: 'Murray Cod',      species: 'Maccullochella peelii',   rarity: 'Legendary',  image: '', power: 95, stealth: 70, stamina: 90, beauty: 85, habitat: 'River',   description: 'The king of Australian freshwater fish.', gradient: 'from-amber-400 via-yellow-300 to-amber-500',   borderColor: '#F59E0B', probabilityWeight: 5  },
  { id: 'card-002', name: 'Rainbow Trout',   species: 'Oncorhynchus mykiss',     rarity: 'Specimen',   image: '', power: 72, stealth: 60, stamina: 65, beauty: 90, habitat: 'Stream',  description: 'Prized for its stunning colours.',         gradient: 'from-blue-400 via-cyan-300 to-teal-400',       borderColor: '#3B82F6', probabilityWeight: 20 },
  { id: 'card-003', name: 'Golden Perch',    species: 'Macquaria ambigua',       rarity: 'Specimen',   image: '', power: 81, stealth: 55, stamina: 75, beauty: 88, habitat: 'Lake',    description: 'Gleaming golden scales.',                  gradient: 'from-yellow-400 via-amber-300 to-orange-400',  borderColor: '#F59E0B', probabilityWeight: 20 },
  { id: 'card-004', name: 'Barramundi',      species: 'Lates calcarifer',        rarity: 'Specimen',   image: '', power: 88, stealth: 65, stamina: 80, beauty: 78, habitat: 'Coast',   description: 'The iconic Aussie sport fish.',            gradient: 'from-teal-400 via-emerald-300 to-green-400',   borderColor: '#10B981', probabilityWeight: 20 },
  { id: 'card-005', name: 'Flathead',        species: 'Platycephalus fuscus',    rarity: 'Elusive',    image: '', power: 58, stealth: 85, stamina: 60, beauty: 45, habitat: 'Coast',   description: 'A sneaky ambush predator.',                gradient: 'from-gray-400 via-slate-300 to-gray-500',      borderColor: '#6B7280', probabilityWeight: 35 },
  { id: 'card-006', name: 'Yellowfin Bream', species: 'Acanthopagrus australis', rarity: 'Widespread', image: '', power: 42, stealth: 50, stamina: 45, beauty: 65, habitat: 'Estuary', description: 'A reliable catch for young anglers.',      gradient: 'from-yellow-300 via-amber-200 to-yellow-400',  borderColor: '#FCD34D', probabilityWeight: 70 },
  { id: 'card-007', name: 'Kingfish',        species: 'Seriola lalandi',         rarity: 'Legendary',  image: '', power: 97, stealth: 80, stamina: 95, beauty: 88, habitat: 'Ocean',   description: 'The ultimate offshore trophy.',            gradient: 'from-amber-400 via-yellow-300 to-amber-500',   borderColor: '#F59E0B', probabilityWeight: 5  },
  { id: 'card-008', name: 'Marlin',          species: 'Makaira nigricans',       rarity: 'Legendary',  image: '', power: 99, stealth: 75, stamina: 98, beauty: 92, habitat: 'Ocean',   description: 'The ultimate game fish.',                  gradient: 'from-blue-600 via-indigo-500 to-blue-700',     borderColor: '#2563EB', probabilityWeight: 3  },
  { id: 'card-009', name: 'Bream',           species: 'Acanthopagrus butcheri',  rarity: 'Widespread', image: '', power: 40, stealth: 52, stamina: 44, beauty: 48, habitat: 'Estuary', description: 'The bread-and-butter fish.',               gradient: 'from-zinc-300 via-gray-200 to-zinc-400',       borderColor: '#A1A1AA', probabilityWeight: 75 },
  { id: 'card-010', name: 'The Voyager',     species: 'Mythicus voyagerus',      rarity: 'Legendary',  image: '', power: 100,stealth: 100,stamina: 100,beauty: 100,habitat: 'Legend',  description: 'The rarest card of all.',                  gradient: 'from-amber-400 via-yellow-300 to-amber-500',   borderColor: '#F59E0B', probabilityWeight: 1  },
];

export const adminRewards: AdminReward[] = [
  { id: 'pack-1',    label: 'Card Pack',        description: 'Receive a random pack of 3 new fishing cards!',                    pointsCost: 500,  type: 'card-pack',   icon: 'GiftIcon',     color: '#ff751f', bg: 'bg-orange-50',  active: true  },
  { id: 'pack-2',    label: 'Rare Pack',         description: 'A special pack with at least one Elusive or rarer card!',          pointsCost: 1000, type: 'rare-pack',   icon: 'SparklesIcon', color: '#3B82F6', bg: 'bg-blue-50',    active: true  },
  { id: 'discount',  label: '10% Shop Discount', description: 'Get a 10% discount code for your next purchase!',                  pointsCost: 750,  type: 'discount',    icon: 'TagIcon',      color: '#2D6A4F', bg: 'bg-green-50',   active: true  },
  { id: 'discount2', label: '20% Shop Discount', description: 'Get a 20% discount code for your next purchase!',                  pointsCost: 1500, type: 'discount',    icon: 'TagIcon',      color: '#7C3AED', bg: 'bg-purple-50',  active: true  },
  { id: 'external',  label: 'Rewards Page',      description: 'Visit the Voyagers Hook rewards page for exclusive prizes!',       pointsCost: 2000, type: 'external',    icon: 'TrophyIcon',   color: '#F59E0B', bg: 'bg-amber-50',   active: true  },
  { id: 'legend',    label: 'Legendary Pack',    description: 'An ultra-rare pack with a chance of a Legendary card!',            pointsCost: 2500, type: 'legend-pack', icon: 'StarIcon',     color: '#F59E0B', bg: 'bg-yellow-50',  active: true  },
];

export const adminFunFacts: AdminFunFact[] = [
  { id: 'ff1', title: 'Fish Can See Colour',   content: 'Most fish can see colour, and some can even see ultraviolet light. Rainbow trout use colour vision to find food!',                                                    category: 'Biology',      icon_name: 'EyeIcon',              active: true  },
  { id: 'ff2', title: 'Barramundi Change Sex', content: 'Barramundi are protandrous hermaphrodites — they start life as males and change to females as they grow older.',                                                      category: 'Species',      icon_name: 'SparklesIcon',         active: true  },
  { id: 'ff3', title: 'Murray Cod Age',        content: 'Murray Cod can live for over 48 years! The oldest recorded Murray Cod was estimated to be around 48 years old.',                                                     category: 'Species',      icon_name: 'ClockIcon',            active: true  },
  { id: 'ff4', title: 'Fish Sleep Too',        content: 'Fish do sleep, but not like us. They enter a restful state where they slow down and hover in place.',                                                                 category: 'Biology',      icon_name: 'MoonIcon',             active: true  },
  { id: 'ff5', title: 'Catch and Release',     content: 'When you catch and release a fish properly, it has a very high survival rate. Wet your hands before handling!',                                                      category: 'Conservation', icon_name: 'HeartIcon',            active: true  },
  { id: 'ff6', title: 'Trout Need Cold Water', content: 'Rainbow Trout need cold, well-oxygenated water to survive. They are often found in mountain streams.',                                                               category: 'Habitat',      icon_name: 'BeakerIcon',           active: true  },
  { id: 'ff7', title: 'Flathead Camouflage',   content: 'Flathead are masters of disguise! They bury themselves in sand or mud with only their eyes showing.',                                                                category: 'Species',      icon_name: 'EyeSlashIcon',         active: true  },
  { id: 'ff8', title: 'Fish Scales Tell Age',  content: 'Just like tree rings, you can count the rings on a fish scale to determine its age. Each ring represents one year!',                                                 category: 'Biology',      icon_name: 'MagnifyingGlassIcon',  active: true  },
  { id: 'ff9', title: 'Bream Are Smart',       content: 'Yellowfin Bream can remember locations where they found food and avoid places where they were caught before!',                                                       category: 'Species',      icon_name: 'AcademicCapIcon',      active: false },
];

export const adminFishingTips: AdminFishingTip[] = [
  { id: 'tip-001', title: 'Reading Current Seams',      content: 'Fish love to hold where fast water meets slow water. Look for the edge between currents — that\'s where the big ones wait. The seam creates a natural conveyor belt of food.',                                    section: 'Reading the Water', level: 'Intermediate', readTime: '3 min', active: true  },
  { id: 'tip-002', title: 'Spotting Structure',          content: 'Submerged logs, rocks, and weed beds are fish magnets. Any structure that breaks the current gives fish a place to rest and ambush prey. Always cast to the edges of structure first.',                          section: 'Reading the Water', level: 'Beginner',     readTime: '2 min', active: true  },
  { id: 'tip-003', title: 'Understanding Depth Changes', content: 'Where shallow water drops into deeper water is called a drop-off. Fish patrol these edges, especially at dawn and dusk. Use a depth finder or look for colour changes in the water.',                           section: 'Reading the Water', level: 'Intermediate', readTime: '3 min', active: true  },
  { id: 'tip-004', title: 'Tidal Influence',             content: 'In estuaries, fish movement is driven by the tide. The last two hours of the run-out tide concentrates baitfish and predators in channels. Learn the tide times for your local water.',                         section: 'Reading the Water', level: 'Advanced',     readTime: '4 min', active: true  },
  { id: 'tip-005', title: 'The Slow Retrieve',           content: 'When fish are lethargic in cold water, slow everything down. A lure retrieved at half your normal speed often triggers strikes that a fast retrieve would miss. Patience is the key.',                          section: 'Technique',         level: 'Beginner',     readTime: '2 min', active: true  },
  { id: 'tip-006', title: 'Jigging for Depth',           content: 'Vertical jigging is deadly for fish holding deep. Drop your jig to the bottom, then lift the rod sharply and let it flutter back down. The falling action triggers the strike — keep your line tight!',        section: 'Technique',         level: 'Intermediate', readTime: '3 min', active: true  },
  { id: 'tip-007', title: 'Soft Plastics Basics',        content: 'Rig your soft plastic on a jig head that matches the depth. Cast past your target, let it sink, then hop it along the bottom with short rod lifts. Pause between hops — most strikes happen on the pause.',   section: 'Technique',         level: 'Beginner',     readTime: '3 min', active: true  },
  { id: 'tip-008', title: 'Surface Lure Timing',         content: 'Surface lures work best in low-light conditions — dawn, dusk, and overcast days. Walk the dog across the surface with rhythmic rod twitches. The explosive surface strike is one of fishing\'s greatest thrills.', section: 'Technique',      level: 'Advanced',     readTime: '4 min', active: true  },
];
