'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test, Attempt } from '../../lib/types';
import { getTests, getRecentAttempts } from '../../lib/db';
import TestCard from '../../components/TestCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import ThemeToggle from '../../components/ThemeToggle';

export default function JeeAdvancedPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tests
    const all = getTests();
    const advancedPapers = all.filter(t => t.category === 'jee_advanced');
    setTests(advancedPapers);

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

  // Get unique years in descending order
  const uniqueYears = Array.from(new Set(tests.map(t => t.year).filter(Boolean) as number[])).sort((a, b) => b - a);

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
              <h1 className="font-extrabold text-lg text-text-primary-custom">JEE Advanced PYPs</h1>
              <p className="text-[10px] text-text-secondary-custom/60 font-bold uppercase tracking-wider">Official Papers (2021-2025)</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {loading ? (
          <SkeletonLoader count={3} />
        ) : uniqueYears.length > 0 ? (
          <div className="space-y-10 animate-fadeIn">
            {uniqueYears.map((year) => {
              const yearTests = tests.filter(t => t.year === year).sort((a, b) => {
                // Ensure Paper 1 is first
                return a.id.localeCompare(b.id);
              });
              
              return (
                <section key={year} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-extrabold text-success-custom tracking-wider uppercase bg-success-custom/10 border border-success-custom/20 px-3 py-1 rounded-lg">
                      JEE Advanced {year}
                    </h2>
                    <div className="h-[1px] bg-[#334155]/20 flex-grow" />
                  </div>
                  
                  <div className="space-y-4">
                    {yearTests.map((test) => {
                      const { status, attemptId } = getTestStatus(test.id);
                      return (
                        <div key={test.id} className="w-full">
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
          <EmptyState title="No Papers Found" message="Could not find JEE Advanced papers. Please check again later." />
        )}

      </main>
    </div>
  );
}
