'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test, Attempt } from '../../lib/types';
import { getTests, getRecentAttempts } from '../../lib/db';
import TestCard from '../../components/TestCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import ThemeToggle from '../../components/ThemeToggle';

export default function JeeMainPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tests
    const all = getTests();
    const mainPapers = all.filter(t => t.category === 'jee_main');
    setTests(mainPapers);

    // Default to the highest year available
    const years = Array.from(new Set(mainPapers.map(t => t.year).filter(Boolean) as number[])).sort((a, b) => b - a);
    if (years.length > 0) {
      setSelectedYear(years[0]);
    }

    // Load attempts
    const recent = getRecentAttempts();
    const attemptsMap: Record<string, Attempt> = {};
    recent.forEach((att) => {
      if (!attemptsMap[att.testId]) {
        attemptsMap[att.testId] = att;
      } else {
        const existing = attemptsMap[att.testId];
        if (existing.completed && !att.completed) {
          attemptsMap[att.testId] = att;
        }
      }
    });
    setAttempts(attemptsMap);
    setLoading(false);
  }, []);

  // Find unique years available
  const availableYears = Array.from(new Set(tests.map(t => t.year).filter(Boolean) as number[])).sort((a, b) => b - a);

  // Group papers for selected year by session
  const yearTests = tests.filter(t => t.year === selectedYear);
  const sessionsInYear = Array.from(new Set(yearTests.map(t => t.session).filter(Boolean) as string[])).sort((a, b) => {
    // Put January session first typically
    if (a.toLowerCase().includes('january')) return -1;
    if (b.toLowerCase().includes('january')) return 1;
    return a.localeCompare(b);
  });

  const getTestStatus = (testId: string) => {
    const att = attempts[testId];
    if (!att) return { status: 'not_started' as const };
    return {
      status: (att.completed ? 'completed' : 'paused') as 'not_started' | 'paused' | 'completed',
      attemptId: att.id
    };
  };

  return (
    <div className="min-h-screen bg-background-custom text-text-primary-custom">
      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-surface-custom/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-text-secondary-custom hover:text-text-primary-custom p-1.5 bg-background-custom/40 rounded-lg border border-[#334155]/60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="font-extrabold text-lg text-text-primary-custom">JEE Main PYPs</h1>
              <p className="text-[10px] text-text-secondary-custom/60 font-bold uppercase tracking-wider">134 Previous Year Papers (2019-2026)</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Year-wise tabs */}
        {availableYears.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none border-b border-[#334155]/20">
            {availableYears.map((year) => {
              const isActive = selectedYear === year;
              const count = tests.filter(t => t.year === year).length;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer outline-none shrink-0 border ${
                    isActive 
                      ? 'bg-primary-custom text-white border-primary-custom shadow-md'
                      : 'bg-surface-custom border-[#334155]/60 text-text-secondary-custom hover:text-text-primary-custom hover:border-text-secondary-custom/60'
                  }`}
                >
                  <span>{year}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-background-custom/80 text-text-secondary-custom'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Sessions Lists */}
        {loading ? (
          <SkeletonLoader count={4} />
        ) : sessionsInYear.length > 0 ? (
          <div className="space-y-8 animate-fadeIn">
            {sessionsInYear.map((sessionName) => {
              const sessionTests = yearTests.filter(t => t.session === sessionName);
              return (
                <section key={sessionName} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-extrabold text-primary-custom tracking-wider uppercase bg-primary-custom/10 border border-primary-custom/20 px-3 py-1 rounded-lg">
                      {sessionName}
                    </h2>
                    <div className="h-[1px] bg-[#334155]/20 flex-grow" />
                    <span className="text-xs text-text-secondary-custom font-semibold">{sessionTests.length} Papers</span>
                  </div>
                  
                  <div className="space-y-4">
                    {sessionTests.map((test) => {
                      const { status, attemptId } = getTestStatus(test.id);
                      return (
                        <div key={test.id}>
                          <TestCard
                            test={test}
                            status={status}
                            attemptId={attemptId}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No Papers Found" message="Could not find previous year papers for this year." />
        )}

      </main>
    </div>
  );
}
