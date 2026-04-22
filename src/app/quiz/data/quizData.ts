export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  reward: string;
  timeLimit: number;
  questions: QuizQuestion[];
  completed?: boolean;
  bestScore?: number;
}

export const quizzes: Quiz[] = [
  {
    id: 'quiz-001',
    title: 'Aussie Fish Basics',
    description: 'Test your knowledge of common Australian freshwater fish!',
    difficulty: 'Easy',
    questionCount: 5,
    reward: 'Widespread Card Pack',
    timeLimit: 60,
    completed: true,
    bestScore: 4,
    questions: [
      { id: 'q1', question: 'What is the largest freshwater fish native to Australia?', options: ['Rainbow Trout', 'Murray Cod', 'Golden Perch', 'Silver Perch'], correctIndex: 1, explanation: 'Murray Cod can grow over 1.8m and 113kg — the largest native freshwater fish!', category: 'Species', difficulty: 'Easy', points: 10 },
      { id: 'q2', question: 'What colour are the fins of a Redfin Perch?', options: ['Blue', 'Yellow', 'Red/Orange', 'Green'], correctIndex: 2, explanation: 'Redfin Perch have distinctive bright red/orange lower fins.', category: 'Identification', difficulty: 'Easy', points: 10 },
      { id: 'q3', question: 'Which fish is known as the "bread and butter" of Australian estuaries?', options: ['Flathead', 'Bream', 'Whiting', 'Tailor'], correctIndex: 1, explanation: 'Bream are the most commonly caught fish in Australian estuaries.', category: 'Species', difficulty: 'Easy', points: 10 },
      { id: 'q4', question: 'What does "catch and release" mean?', options: ['Keeping the fish', 'Releasing the fish back into the water', 'Throwing the fish to a friend', 'Cooking the fish'], correctIndex: 1, explanation: 'Catch and release means carefully returning the fish to the water so it can live on.', category: 'Conservation', difficulty: 'Easy', points: 10 },
      { id: 'q5', question: 'Which habitat does Barramundi prefer?', options: ['Cold mountain streams', 'Tropical coastal waters', 'Deep ocean', 'Underground caves'], correctIndex: 1, explanation: 'Barramundi thrive in warm tropical and subtropical coastal waters.', category: 'Habitat', difficulty: 'Easy', points: 10 },
    ],
  },
  {
    id: 'quiz-002',
    title: 'Fishing Techniques',
    description: 'How well do you know your fishing methods and gear?',
    difficulty: 'Medium',
    questionCount: 5,
    reward: 'Specimen Card Pack',
    timeLimit: 90,
    completed: false,
    questions: [
      { id: 'q6', question: 'What is a "lure" used for in fishing?', options: ['To attract fish using artificial bait', 'To measure fish size', 'To store fish', 'To clean the hook'], correctIndex: 0, explanation: 'A lure is an artificial bait designed to attract fish through movement and colour.', category: 'Techniques', difficulty: 'Medium', points: 20 },
      { id: 'q7', question: 'What is the best time of day to fish for most species?', options: ['Midday', 'Early morning and late afternoon', 'Midnight only', 'Noon to 2pm'], correctIndex: 1, explanation: 'Dawn and dusk are peak feeding times for most fish species.', category: 'Techniques', difficulty: 'Medium', points: 20 },
      { id: 'q8', question: 'What does "jigging" mean in fishing?', options: ['Dancing while fishing', 'Moving a lure up and down in the water', 'Tying a special knot', 'Casting very far'], correctIndex: 1, explanation: 'Jigging involves moving a lure vertically in the water to mimic injured prey.', category: 'Techniques', difficulty: 'Medium', points: 20 },
      { id: 'q9', question: 'Which knot is most commonly used to attach a hook to a fishing line?', options: ['Reef knot', 'Improved clinch knot', 'Bowline', 'Figure-eight'], correctIndex: 1, explanation: 'The improved clinch knot is the most popular knot for attaching hooks.', category: 'Gear', difficulty: 'Medium', points: 20 },
      { id: 'q10', question: 'What is a "sinker" used for?', options: ['To float the bait', 'To weigh down the line and bait', 'To attract fish with light', 'To store extra line'], correctIndex: 1, explanation: 'A sinker (or weight) pulls the bait down to the desired depth.', category: 'Gear', difficulty: 'Medium', points: 20 },
    ],
  },
  {
    id: 'quiz-003',
    title: 'Conservation Champion',
    description: 'Show you care about our waterways and fish populations!',
    difficulty: 'Hard',
    questionCount: 5,
    reward: 'Legendary Card Pack',
    timeLimit: 120,
    completed: false,
    questions: [
      { id: 'q11', question: 'What is the minimum legal size for Murray Cod in NSW?', options: ['40cm', '55cm', '75cm', '90cm'], correctIndex: 2, explanation: 'Murray Cod must be at least 75cm to keep in NSW to protect breeding fish.', category: 'Regulations', difficulty: 'Hard', points: 30 },
      { id: 'q12', question: 'Why is it important to wet your hands before handling a fish for release?', options: ['To make it slippery', "To protect the fish's slime coat", 'To cool the fish down', "It's not important"], correctIndex: 1, explanation: 'Fish have a protective slime coat that dry hands can damage, making them vulnerable to disease.', category: 'Conservation', difficulty: 'Hard', points: 30 },
      { id: 'q13', question: 'What is a "bag limit" in fishing?', options: ['The weight of your tackle bag', 'The maximum number of fish you can keep', 'The size of your fishing bag', 'The cost of a fishing licence'], correctIndex: 1, explanation: 'Bag limits restrict how many fish you can keep to prevent overfishing.', category: 'Regulations', difficulty: 'Hard', points: 30 },
      { id: 'q14', question: 'Which of these is an introduced (non-native) species in Australian waterways?', options: ['Murray Cod', 'Golden Perch', 'Common Carp', 'Silver Perch'], correctIndex: 2, explanation: 'Common Carp were introduced from Europe and are now a major pest species.', category: 'Conservation', difficulty: 'Hard', points: 30 },
      { id: 'q15', question: 'What should you do if you catch a fish that is below the legal size limit?', options: ['Keep it anyway', 'Release it carefully back into the water', 'Give it to a friend', 'Take it home to measure'], correctIndex: 1, explanation: 'Undersized fish must always be released carefully to allow them to grow and breed.', category: 'Regulations', difficulty: 'Hard', points: 30 },
    ],
  },
];
