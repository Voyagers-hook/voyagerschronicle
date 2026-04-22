'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
}

const difficultyConfig: Record<string, { bg: string; text: string; label: string }> = {
  Easy:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Easy'   },
  Medium: { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Medium' },
  Hard:   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Hard'   },
};

const optionLabels = ['A', 'B', 'C', 'D'];
const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'] as const;

export default function QuizPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('quiz_questions')
      .select('id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, category, difficulty')
      .eq('active', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setQuestions(data || []);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category)))];
  const filteredQuestions = activeCategory === 'All' ? questions : questions.filter(q => q.category === activeCategory);
  const currentQuestion = filteredQuestions[currentIdx];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === currentQuestion.correct_answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
      saveScore();
    }
  };

  const saveScore = async () => {
    if (!user) return;
    const supabase = createClient();
    const finalScore = score + (selectedAnswer === currentQuestion?.correct_answer ? 1 : 0);
    await supabase.from('quiz_scores').insert({
      user_id: user.id,
      quiz_category: activeCategory,
      score: Math.round((finalScore / filteredQuestions.length) * 100),
      total_questions: filteredQuestions.length,
    });
    toast.success(`Quiz complete! You scored ${finalScore}/${filteredQuestions.length}`);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setQuizStarted(false);
  };

  const getOptionColor = (optionKey: string, optionLabel: string) => {
    if (!showResult) return 'bg-white border-adventure-border hover:border-primary-300 text-primary-800';
    const isCorrect = optionLabel === currentQuestion.correct_answer;
    const isSelected = optionLabel === selectedAnswer;
    if (isCorrect) return 'bg-green-50 border-green-400 text-green-800';
    if (isSelected && !isCorrect) return 'bg-red-50 border-red-400 text-red-800';
    return 'bg-white border-adventure-border text-earth-400';
  };

  if (loading) {
    return (
      <AppLayout currentPath="/quiz">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-adventure-border" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPath="/quiz">
      <div className="fade-in space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="AcademicCapIcon" size={22} className="text-white" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Quiz Zone</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm">Test your fishing knowledge and earn points!</p>
          </div>
        </div>

        {!quizStarted ? (
          /* Category selection */
          <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6 space-y-5">
            <h2 className="font-display text-2xl text-primary-800">Choose a Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => {
                const count = cat === 'All' ? questions.length : questions.filter(q => q.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${activeCategory === cat ? 'border-orange-400 bg-orange-50' : 'border-adventure-border bg-adventure-bg hover:border-primary-300'}`}
                  >
                    <p className="font-sans font-semibold text-primary-800 text-sm">{cat}</p>
                    <p className="text-xs font-sans text-earth-400 mt-0.5">{count} questions</p>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setCurrentIdx(0); setScore(0); setFinished(false); setSelectedAnswer(null); setShowResult(false); setQuizStarted(true); }}
              disabled={filteredQuestions.length === 0}
              className="w-full py-3.5 rounded-xl font-sans font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: '#ff751f' }}
            >
              <Icon name="PlayIcon" size={18} />
              Start Quiz ({filteredQuestions.length} questions)
            </button>
          </div>
        ) : finished ? (
          /* Results */
          <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #ff751f, #E9A23B)' }}>
              <Icon name="TrophyIcon" size={36} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-3xl text-primary-800 mb-1">Quiz Complete!</h2>
              <p className="text-earth-500 font-sans text-sm">You scored</p>
              <p className="font-display text-5xl mt-2" style={{ color: '#ff751f' }}>{score}/{filteredQuestions.length}</p>
              <p className="text-earth-400 font-sans text-sm mt-1">{Math.round((score / filteredQuestions.length) * 100)}% correct</p>
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-xl font-sans font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ff751f' }}
            >
              <Icon name="ArrowPathIcon" size={18} />
              Try Again
            </button>
          </div>
        ) : currentQuestion ? (
          /* Active quiz */
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans font-semibold text-earth-400 uppercase tracking-wide">Question {currentIdx + 1} of {filteredQuestions.length}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${difficultyConfig[currentQuestion.difficulty]?.bg || 'bg-gray-100'} ${difficultyConfig[currentQuestion.difficulty]?.text || 'text-gray-700'}`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-xs font-sans text-earth-400">{currentQuestion.category}</span>
                </div>
              </div>
              <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%`, backgroundColor: '#ff751f' }} />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6">
              <p className="font-display text-xl text-primary-800 mb-5 leading-snug">{currentQuestion.question}</p>
              <div className="space-y-3">
                {optionKeys.map((key, i) => {
                  const label = optionLabels[i];
                  const text = currentQuestion[key];
                  const isCorrect = showResult && label === currentQuestion.correct_answer;
                  const isWrong = showResult && label === selectedAnswer && label !== currentQuestion.correct_answer;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswer(label)}
                      disabled={showResult}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${getOptionColor(key, label)}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isCorrect ? 'bg-green-500 text-white' : isWrong ? 'bg-red-500 text-white' : 'bg-earth-100 text-earth-600'}`}>
                        {isCorrect ? <Icon name="CheckIcon" size={16} /> : isWrong ? <Icon name="XMarkIcon" size={16} /> : label}
                      </div>
                      <span className="font-sans text-sm">{text}</span>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`mt-4 p-4 rounded-2xl ${selectedAnswer === currentQuestion.correct_answer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-sans font-semibold text-sm mb-1 ${selectedAnswer === currentQuestion.correct_answer ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Not quite!'}
                  </p>
                  <p className="font-sans text-xs text-earth-600">{currentQuestion.explanation}</p>
                </div>
              )}

              {showResult && (
                <button
                  onClick={handleNext}
                  className="w-full mt-4 py-3 rounded-xl font-sans font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#ff751f' }}
                >
                  {currentIdx < filteredQuestions.length - 1 ? (
                    <><Icon name="ArrowRightIcon" size={18} />Next Question</>
                  ) : (
                    <><Icon name="TrophyIcon" size={18} />See Results</>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-display text-xl text-primary-700">No questions available yet.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
