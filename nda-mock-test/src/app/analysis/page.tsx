'use client';

import React, { useState, Suspense, useTransition, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Attempt, Test, Question, LeaderboardEntry } from '../../lib/types';
import { getAttempt, getTestById, getQuestionsForTest, getLeaderboardForTest } from '../../lib/db';
import { generateSubjectAnalytics, generatePacingAnalytics, calculateNdaQualification } from '../../lib/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import StatsCard from '../../components/StatsCard';
import SolutionCard from '../../components/SolutionCard';
import ThemeToggle from '../../components/ThemeToggle';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId') || '';

  const [activeTab, setActiveTab] = useState<'analysis' | 'solutions' | 'leaderboard'>('analysis');
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [isPending, startTransition] = useTransition();
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleFilterChange = (filter: 'all' | 'correct' | 'incorrect' | 'unattempted') => {
    startTransition(() => {
      setSolutionFilter(filter);
      setVisibleCount(10);
    });
  };

  useEffect(() => {
    if (activeTab !== 'solutions' || isPending) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [activeTab, isPending]);

  const fetcher = async (id: string) => {
    const attemptIdStr = id.replace('analysis-', '');
    const att = await getAttempt(attemptIdStr);
    if (!att) throw new Error("Attempt not found");
    const t = getTestById(att.testId);
    if (!t) throw new Error("Test not found");
    const q = await getQuestionsForTest(att.testId);
    const board = await getLeaderboardForTest(att.testId);
    return { attempt: att, test: t, questions: q, leaderboard: board };
  };

  const { data, error, isLoading } = useSWR(
    attemptId ? `analysis-${attemptId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleTabChange = (tab: 'analysis' | 'solutions' | 'leaderboard') => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-custom p-8 max-w-5xl mx-auto space-y-6">
        <SkeletonLoader count={4} />
      </div>
    );
  }

  if (error || !data || !data.attempt || !data.test || data.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background-custom flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <EmptyState title="Report Error" message="We could not load this analysis report. It may have been cleared or removed." />
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 bg-primary-custom text-white rounded-xl text-sm font-semibold">
            Go back Home
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, test, questions, leaderboard } = data;

  // Format time taken
  const formatTimeTaken = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  // Derived states
  const attemptedCount = attempt.correctCount + attempt.incorrectCount;
  const avgTime = attemptedCount > 0 ? Math.round(attempt.timeTaken / attemptedCount) : 0;

  const topicInsights = questions.length && attempt 
    ? generateSubjectAnalytics(questions, attempt.responses)
    : [];

  const ndaStatus = test && attempt ? calculateNdaQualification(attempt.score, test.marks) : null;
  const pacingInsights = questions.length && attempt ? generatePacingAnalytics(questions, attempt.responses) : null;

  // Solution items based on filters
  const filteredQuestions = questions.map((q, idx) => ({ q, idx: idx + 1 })).filter(({ q }) => {
    const resp = attempt.responses[q.id];
    const isAnswered = resp && resp.selectedOptionIndex !== null;
    const isCorrect = isAnswered && resp.selectedOptionIndex === q.correctOptionIndex;
    const isWrong = isAnswered && resp.selectedOptionIndex !== q.correctOptionIndex;

    if (solutionFilter === 'correct') return isCorrect;
    if (solutionFilter === 'incorrect') return isWrong;
    if (solutionFilter === 'unattempted') return !isAnswered;
    return true; // 'all'
  });

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-background-custom text-text-primary-custom">
      
      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-surface-custom/85 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to dashboard" className="text-text-secondary-custom hover:text-text-primary-custom p-1.5 bg-background-custom/40 rounded-lg border border-[#334155]/60 focus-visible:ring-2 focus-visible:ring-primary-custom outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-text-primary-custom">Performance Report</h1>
              <p className="text-[10px] text-text-secondary-custom/60 font-bold uppercase tracking-wider">{test.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/"
              className="px-4 py-2 border border-[#334155]/60 text-xs sm:text-sm font-semibold rounded-xl text-text-secondary-custom hover:text-text-primary-custom hover:bg-surface-custom/40 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-custom outline-none"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div role="tablist" className="flex border-b border-[#334155]">
          {(['analysis', 'solutions', leaderboard && leaderboard.length > 0 ? 'leaderboard' : null].filter(Boolean) as ('analysis' | 'solutions' | 'leaderboard')[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab)}
                className={`py-3 px-6 text-sm font-semibold capitalize transition-all relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-custom ${
                  isActive ? 'text-primary-custom' : 'text-text-secondary-custom hover:text-text-primary-custom'
                }`}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-custom rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}

        {isPending ? (
          <div className="space-y-6 mt-6">
            <SkeletonLoader count={3} />
          </div>
        ) : (
          <>
            {/* 1. ANALYSIS TAB */}
            {activeTab === 'analysis' && (
              <div className="space-y-6 animate-fadeIn">
            {/* Official NDA Qualifying Benchmark */}
            {ndaStatus && (
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                ndaStatus.verdict === 'Qualified'
                  ? 'bg-success-custom/10 border-success-custom/40 text-success-custom'
                  : ndaStatus.verdict === 'Borderline'
                  ? 'bg-warning-custom/10 border-warning-custom/40 text-warning-custom'
                  : 'bg-danger-custom/10 border-danger-custom/40 text-danger-custom'
              }`}>
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                    ndaStatus.verdict === 'Qualified' 
                      ? 'bg-success-custom text-slate-950 shadow-md shadow-success-custom/20' 
                      : ndaStatus.verdict === 'Borderline'
                      ? 'bg-warning-custom text-slate-950 shadow-md shadow-warning-custom/20'
                      : 'bg-danger-custom text-white shadow-md shadow-danger-custom/20'
                  }`} aria-hidden="true">
                    {ndaStatus.verdict === 'Qualified' ? '✓' : ndaStatus.verdict === 'Borderline' ? '▲' : '!'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-text-primary-custom">
                        UPSC NDA Qualifying Benchmark: {ndaStatus.verdict}
                      </h4>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-surface-custom border border-[#334155]/60 text-text-secondary-custom">
                        {ndaStatus.percentageScore}% Score
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-custom leading-relaxed max-w-2xl">
                      {ndaStatus.verdictMessage}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-secondary-custom/80 font-mono pt-1">
                      <span>Sectional Cutoff (25%): <strong>{ndaStatus.sectionalRequiredMarks}</strong> marks</span>
                      <span>•</span>
                      <span>Estimated Merit Benchmark: <strong>~{ndaStatus.estimatedCutoffMarks}</strong> marks</span>
                      <span>•</span>
                      <span>Your Score: <strong className="text-text-primary-custom">{attempt.score}</strong> / {test.marks}</span>
                    </div>
                  </div>
                </div>
                <div className="self-start md:self-center shrink-0">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border ${
                    ndaStatus.verdict === 'Qualified'
                      ? 'border-success-custom/40 bg-success-custom/20 text-success-custom'
                      : ndaStatus.verdict === 'Borderline'
                      ? 'border-warning-custom/40 bg-warning-custom/20 text-warning-custom'
                      : 'border-danger-custom/40 bg-danger-custom/20 text-danger-custom'
                  }`}>
                    {ndaStatus.verdict}
                  </span>
                </div>
              </div>
            )}

            {/* Summary cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Score"
                value={`${attempt.score} / ${test.marks}`}
                subtitle={`Target: ${Math.round(test.marks * 0.4)} (Cutoff approx)`}
                accentColor={attempt.score >= test.marks * 0.4 ? 'success' : 'warning'}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.75a1.125 1.125 0 0 1-1.125-1.125V11.25M9 18.75V15.375c0-.621.504-1.125 1.125-1.125h.75A1.125 1.125 0 0 1 12 15.375V18.75m9-13.5h-18M21 5.25v3.375C21 9.246 20.496 9.75 19.875 9.75H4.125C3.504 9.75 3 9.246 3 8.625V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                  </svg>
                }
              />
              <StatsCard
                title="Accuracy"
                value={`${attempt.accuracy}%`}
                subtitle="Percentage of correct answers"
                accentColor={attempt.accuracy >= 80 ? 'success' : attempt.accuracy >= 50 ? 'warning' : 'danger'}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                }
              />
              <StatsCard
                title="Percentile"
                value={`${attempt.percentile}%`}
                subtitle="Relative standing among peers"
                accentColor="primary"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  </svg>
                }
              />
            </div>

            {/* Answer Distribution Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Card 1: Answers Breakdown */}
              <div className="bg-surface-custom border border-[#334155]/60 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-primary-custom uppercase tracking-wider pb-2 border-b border-[#334155]/40">
                  Question Breakdown
                </h3>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center text-text-secondary-custom">
                    <span>Total Questions</span>
                    <span className="font-bold text-text-primary-custom">{questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary-custom">
                    <span>Attempted</span>
                    <span className="font-bold text-primary-custom">{attemptedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-success-custom">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-success-custom" />
                      Correct
                    </span>
                    <span className="font-bold">{attempt.correctCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-danger-custom">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-danger-custom" />
                      Incorrect
                    </span>
                    <span className="font-bold">{attempt.incorrectCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary-custom/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#334155]" />
                      Unattempted
                    </span>
                    <span className="font-bold">{attempt.unattemptedCount}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Time Analytics */}
              <div className="bg-surface-custom border border-[#334155]/60 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-primary-custom uppercase tracking-wider pb-2 border-b border-[#334155]/40">
                  Time Analysis
                </h3>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center text-text-secondary-custom">
                    <span>Total Duration</span>
                    <span className="font-bold text-text-primary-custom">{test.duration} mins</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary-custom">
                    <span>Time Taken</span>
                    <span className="font-bold text-text-primary-custom">{formatTimeTaken(attempt.timeTaken)}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary-custom">
                    <span>Average Time / Question</span>
                    <span className="font-bold text-primary-custom">{avgTime} seconds</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary-custom/60">
                    <span>Remaining Time (leftover)</span>
                    <span className="font-bold">{formatTimeTaken(attempt.timeLeft)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Speed vs. Accuracy Pacing Quadrant */}
            {pacingInsights && (
              <div className="bg-surface-custom border border-[#334155]/60 rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155]/40 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary-custom uppercase tracking-wider">
                      Speed vs. Accuracy Pacing Quadrant
                    </h3>
                    <p className="text-xs text-text-secondary-custom/70">
                      Identify careless errors, mastered topics, and dangerous time traps
                    </p>
                  </div>
                  {pacingInsights.wastedTimeSeconds > 0 && (
                    <div className="text-xs font-mono bg-danger-custom/10 border border-danger-custom/30 text-danger-custom px-3 py-1 rounded-lg">
                      Time Lost on Wrong Qs: <strong>{formatTimeTaken(pacingInsights.wastedTimeSeconds)}</strong>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Quadrant 1: Ideal Pace */}
                  <div className="bg-background-custom/60 border border-success-custom/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-success-custom">⚡ Ideal Pace</span>
                      <span className="font-mono text-xs text-text-secondary-custom/60">avg {pacingInsights.idealPace.avgTime}s</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-text-primary-custom">
                      {pacingInsights.idealPace.count} <span className="text-xs font-normal text-text-secondary-custom">Questions</span>
                    </div>
                    <p className="text-[11px] text-text-secondary-custom leading-tight">
                      Correct & answered swiftly (&le;90s). High conceptual mastery.
                    </p>
                  </div>

                  {/* Quadrant 2: Slow & Steady */}
                  <div className="bg-background-custom/60 border border-primary-custom/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-custom">⏱️ Slow & Steady</span>
                      <span className="font-mono text-xs text-text-secondary-custom/60">avg {pacingInsights.slowAndSteady.avgTime}s</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-text-primary-custom">
                      {pacingInsights.slowAndSteady.count} <span className="text-xs font-normal text-text-secondary-custom">Questions</span>
                    </div>
                    <p className="text-[11px] text-text-secondary-custom leading-tight">
                      Correct but took &gt;90s. Concept known, but speed drills needed.
                    </p>
                  </div>

                  {/* Quadrant 3: Rushed Guess */}
                  <div className="bg-background-custom/60 border border-warning-custom/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-warning-custom">⚠️ Rushed Guess</span>
                      <span className="font-mono text-xs text-text-secondary-custom/60">avg {pacingInsights.rushedGuess.avgTime}s</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-text-primary-custom">
                      {pacingInsights.rushedGuess.count} <span className="text-xs font-normal text-text-secondary-custom">Questions</span>
                    </div>
                    <p className="text-[11px] text-text-secondary-custom leading-tight">
                      Incorrect in &lt;20s. Impulsive attempts or blind guesses costing negative marks.
                    </p>
                  </div>

                  {/* Quadrant 4: Time Trap */}
                  <div className="bg-background-custom/60 border border-danger-custom/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-danger-custom">🛑 Time Trap</span>
                      <span className="font-mono text-xs text-text-secondary-custom/60">avg {pacingInsights.timeTrap.avgTime}s</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-text-primary-custom">
                      {pacingInsights.timeTrap.count} <span className="text-xs font-normal text-text-secondary-custom">Questions</span>
                    </div>
                    <p className="text-[11px] text-text-secondary-custom leading-tight">
                      Incorrect & spent &gt;120s. Dangerous traps — cultivate skipping discipline.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TOPIC INSIGHTS */}
            <div className="bg-surface-custom border border-[#334155]/60 rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-text-primary-custom uppercase tracking-wider pb-2 border-b border-[#334155]/40">
                Deep Topic Analytics
              </h3>
              
              <div className="space-y-6">
                {topicInsights.map(insight => (
                  <div key={insight.topic} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-primary-custom">{insight.topic} <span className="text-xs text-text-secondary-custom/60 font-mono ml-1">({insight.total} Qs)</span></span>
                      <span className={insight.accuracy >= 70 ? 'text-success-custom' : insight.accuracy >= 40 ? 'text-warning-custom' : 'text-danger-custom'}>
                        {insight.accuracy}% Accuracy
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-background-custom rounded-full h-2.5 overflow-hidden flex ring-1 ring-[#334155]/50">
                      <div className="bg-success-custom transition-all" style={{ width: `${(insight.correct / insight.total) * 100}%` }} title={`Correct: ${insight.correct}`} />
                      <div className="bg-danger-custom transition-all" style={{ width: `${(insight.incorrect / insight.total) * 100}%` }} title={`Incorrect: ${insight.incorrect}`} />
                    </div>
                    {/* Tiny Stats */}
                    <div className="flex justify-between text-[10px] font-mono text-text-secondary-custom/70">
                      <span className="text-success-custom">{insight.correct} Correct</span>
                      <span className="text-danger-custom">{insight.incorrect} Wrong</span>
                      <span>{insight.unattempted} Skipped</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. SOLUTIONS TAB */}
        {activeTab === 'solutions' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all', label: 'All Questions' },
                { id: 'correct', label: 'Correct' },
                { id: 'incorrect', label: 'Incorrect' },
                { id: 'unattempted', label: 'Unattempted' }
              ] as const).map((filter) => {
                const isActive = solutionFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer outline-none ${
                      isActive 
                        ? 'bg-primary-custom border-primary-custom text-white' 
                        : 'bg-surface-custom border-[#334155]/60 text-text-secondary-custom hover:text-text-primary-custom'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable solutions list */}
            {filteredQuestions.length > 0 ? (
              <div className="space-y-6">
                {visibleQuestions.map(({ q, idx }) => (
                  <div 
                    key={q.id} 
                    className="[content-visibility:auto] contain-intrinsic-size-[400px]"
                  >
                    <SolutionCard
                      question={q}
                      response={attempt.responses[q.id]}
                      questionNumber={idx}
                    />
                  </div>
                ))}
                {visibleCount < filteredQuestions.length && (
                  <div ref={observerTarget} className="py-6 flex justify-center">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title="No Solutions Match Filter" message="Select a different filter chip above to view explanations." />
            )}
          </div>
        )}

        {/* 3. LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="bg-surface-custom border border-[#334155]/60 rounded-2xl p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155]/40 pb-4">
              <h3 className="text-base font-bold text-text-primary-custom">Leaderboard (Simulation)</h3>
              <p className="text-xs text-text-secondary-custom/60 leading-relaxed mt-0.5">
                See where you stand relative to the top scoring candidates who attempted this test.
              </p>
            </div>

            {/* Leaderboard list */}
            <div className="border border-[#334155]/60 rounded-xl overflow-hidden font-mono text-sm">
              <div className="grid grid-cols-12 bg-background-custom border-b border-[#334155]/60 p-3.5 text-xs font-bold text-text-secondary-custom/80 uppercase">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-4 pl-4">Name</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Accuracy</div>
                <div className="col-span-2 text-center">Time</div>
              </div>

              {/* Candidates */}
              {leaderboard.map((cand) => (
                <div 
                  key={cand.rank}
                  className="grid grid-cols-12 p-3.5 border-b border-[#334155]/30 hover:bg-surface-custom/50 transition-colors text-text-secondary-custom"
                >
                  <div className="col-span-2 text-center font-bold text-primary-custom">
                    #{cand.rank}
                  </div>
                  <div className="col-span-4 pl-4 text-text-primary-custom font-semibold truncate">
                    {cand.name}
                  </div>
                  <div className="col-span-2 text-center text-success-custom font-semibold">
                    {cand.score}
                  </div>
                  <div className="col-span-2 text-center">
                    {cand.accuracy}%
                  </div>
                  <div className="col-span-2 text-center text-xs">
                    {cand.timeTaken}
                  </div>
                </div>
              ))}

              {/* Current user placement row */}
              <div className="grid grid-cols-12 p-4 bg-primary-custom/10 border-t-2 border-primary-custom text-text-primary-custom">
                <div className="col-span-2 text-center font-black">
                  #142
                </div>
                <div className="col-span-4 pl-4 font-bold truncate">
                  Aspirant (You)
                </div>
                <div className="col-span-2 text-center font-bold text-success-custom">
                  {attempt.score}
                </div>
                <div className="col-span-2 text-center font-semibold">
                  {attempt.accuracy}%
                </div>
                <div className="col-span-2 text-center text-xs font-semibold">
                  {formatTimeTaken(attempt.timeTaken)}
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-text-secondary-custom/40 text-center italic mt-2">
              Note: This is a static user interface template demonstrating the leaderboard structure. No real-time backend communication has been implemented.
            </p>
          </div>
        )}
          </>
        )}

      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-custom flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
