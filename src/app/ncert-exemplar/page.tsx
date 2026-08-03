'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test, Attempt } from '../../lib/types';
import { getTests, getRecentAttempts } from '../../lib/db';
import TestCard from '../../components/TestCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import ThemeToggle from '../../components/ThemeToggle';

export default function NcertExemplarPage() {
  const [selectedClass, setSelectedClass] = useState<'class11' | 'class12'>('class11');
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'chemistry' | 'math'>('physics');
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tests
    const all = getTests();
    const exemplar = all.filter(t => t.category === 'exemplar');
    setTests(exemplar);

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

  const filteredTests = tests.filter(
    t => t.subCategory === selectedClass && t.subject === selectedSubject
  );

  const getTestStatus = (testId: string) => {
    const att = attempts[testId];
    if (!att) return { status: 'not_started' as const };
    return {
      status: (att.completed ? 'completed' : 'paused') as 'not_started' | 'paused' | 'completed',
      attemptId: att.id
    };
  };

  // Get counts for labels
  const getClassCount = (classVal: 'class11' | 'class12') => {
    return tests.filter(t => t.subCategory === classVal).length;
  };

  const getSubjectCount = (classVal: 'class11' | 'class12', subjectVal: 'physics' | 'chemistry' | 'math') => {
    return tests.filter(t => t.subCategory === classVal && t.subject === subjectVal).length;
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
              <h1 className="font-extrabold text-lg text-text-primary-custom">NCERT Exemplar</h1>
              <p className="text-[10px] text-text-secondary-custom/60 font-bold uppercase tracking-wider">Chapter-Wise Practice Tests</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Class Selection Cards */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedClass('class11')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
              selectedClass === 'class11'
                ? 'bg-surface-custom border-primary-custom/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-surface-custom/40 border-[#334155]/40 hover:border-[#334155]/80'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <h3 className="font-extrabold text-lg text-text-primary-custom">Class 11</h3>
              <p className="text-xs text-text-secondary-custom">{getClassCount('class11')} Chapter Tests Available</p>
            </div>
            {selectedClass === 'class11' && (
              <div className="absolute right-3 bottom-3 w-1.5 h-1.5 rounded-full bg-primary-custom" />
            )}
          </button>

          <button
            onClick={() => setSelectedClass('class12')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
              selectedClass === 'class12'
                ? 'bg-surface-custom border-primary-custom/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-surface-custom/40 border-[#334155]/40 hover:border-[#334155]/80'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <h3 className="font-extrabold text-lg text-text-primary-custom">Class 12</h3>
              <p className="text-xs text-text-secondary-custom">{getClassCount('class12')} Chapter Tests Available</p>
            </div>
            {selectedClass === 'class12' && (
              <div className="absolute right-3 bottom-3 w-1.5 h-1.5 rounded-full bg-primary-custom" />
            )}
          </button>
        </div>

        {/* Subject Filters List */}
        <div className="flex flex-wrap gap-2 select-none border-b border-[#334155]/20 pb-4">
          {(['physics', 'chemistry', 'math'] as const).map((sub) => {
            const isActive = selectedSubject === sub;
            const count = getSubjectCount(selectedClass, sub);
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer outline-none border ${
                  isActive 
                    ? 'bg-primary-custom text-white border-primary-custom shadow-md'
                    : 'bg-surface-custom border-[#334155]/60 text-text-secondary-custom hover:text-text-primary-custom hover:border-text-secondary-custom/60'
                }`}
              >
                <span className="capitalize">{sub === 'math' ? 'Mathematics' : sub}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-background-custom/80 text-text-secondary-custom'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tests List */}
        {loading ? (
          <SkeletonLoader count={4} />
        ) : filteredTests.length > 0 ? (
          <div className="space-y-4 animate-fadeIn">
            {filteredTests.map((test) => {
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
        ) : (
          <EmptyState title="No Tests Found" message="No NCERT Exemplar tests found for the selected filter." />
        )}

      </main>
    </div>
  );
}
