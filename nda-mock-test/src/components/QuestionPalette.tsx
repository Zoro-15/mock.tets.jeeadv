import React, { useState } from 'react';
import { Question, QuestionResponse } from '../lib/types';

interface QuestionPaletteProps {
  questions: Question[];
  responses: Record<string, QuestionResponse>;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  onSubmitClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionPalette({
  questions,
  responses,
  currentIndex,
  onSelectIndex,
  onSubmitClick,
  isOpen,
  onClose
}: QuestionPaletteProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Close palette on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helpers to count states accurately for the official 5 CBT categories
  const list = Object.values(responses);
  const answeredOnlyCount = list.filter(r => r.selectedOptionIndex !== null && r.status !== 'marked-attempted').length;
  const markedAttemptedCount = list.filter(r => r.status === 'marked-attempted').length;
  const markedOnlyCount = list.filter(r => r.status === 'marked').length;
  const unattemptedCount = list.filter(r => r.selectedOptionIndex === null && r.status === 'unattempted').length;
  const visitedCount = list.filter(r => r.status !== 'unseen').length;
  const unseenCount = Math.max(0, questions.length - visitedCount);

  const getQuestionButtonStyles = (q: Question, idx: number) => {
    const resp = responses[q.id];
    const isCurrent = idx === currentIndex;
    
    let base = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative transition-all border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-custom ";
    
    if (isCurrent) {
      base += " ring-2 ring-offset-2 ring-offset-background-custom ring-primary-custom ";
    }

    if (!resp || resp.status === 'unseen') {
      // 1. Not Visited
      return base + "bg-surface-custom/40 border-[#334155]/60 text-text-secondary-custom/60 hover:border-primary-custom/40";
    }

    if (resp.status === 'marked-attempted') {
      // 2. Answered & Marked for Review (Evaluated in CBT)
      return base + "bg-purple-600 border-purple-400 text-white shadow-sm";
    } else if (resp.status === 'marked') {
      // 3. Marked for Review without answer
      return base + "bg-purple-500/20 border-purple-500 text-purple-300";
    } else if (resp.selectedOptionIndex !== null) {
      // 4. Answered & Saved
      return base + "bg-success-custom border-success-custom text-white shadow-sm";
    } else {
      // 5. Visited but Not Answered
      return base + "bg-danger-custom/15 border-danger-custom/60 text-danger-custom";
    }
  };

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div 
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity cursor-pointer"
        />
      )}

      {/* Drawer Container */}
      <div 
        role="region"
        aria-label="Question Navigation Palette"
        className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-background-custom md:bg-surface-custom border-l border-[#334155] z-50 transform transition-transform duration-300 flex flex-col md:static md:translate-x-0 md:z-0 md:h-[calc(100vh-140px)] md:rounded-2xl shadow-2xl md:shadow-none ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        {/* Mobile Header (Close button & title) */}
        <div className="flex justify-between items-center md:hidden px-5 py-4 border-b border-[#334155]/60 shrink-0 bg-surface-custom/30">
          <span className="text-sm font-bold text-text-primary-custom">Question Palette</span>
          <button 
            onClick={onClose} 
            aria-label="Close question palette"
            className="p-1.5 text-text-secondary-custom hover:text-text-primary-custom bg-surface-custom/50 rounded-lg border border-[#334155]/60 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-custom outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toggle Grid/List Header */}
        <div className="flex border-b border-[#334155] text-xs font-semibold select-none shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 py-3 text-center transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-custom ${
              viewMode === 'grid' 
                ? 'text-primary-custom border-b-2 border-primary-custom font-bold' 
                : 'text-text-secondary-custom hover:text-text-primary-custom'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-3 text-center transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-custom ${
              viewMode === 'list' 
                ? 'text-primary-custom border-b-2 border-primary-custom font-bold' 
                : 'text-text-secondary-custom hover:text-text-primary-custom'
            }`}
          >
            List View
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* 5-State Official CBT Legend */}
          <div className="bg-background-custom/60 border border-[#334155]/40 rounded-xl p-3 space-y-2">
            <h4 className="text-[11px] font-bold text-text-secondary-custom/90 uppercase tracking-wider mb-2">
              Question States
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-success-custom flex-shrink-0" />
                  <span className="text-text-secondary-custom">Answered</span>
                </div>
                <span className="font-mono font-bold text-text-primary-custom">{answeredOnlyCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-danger-custom/20 border border-danger-custom flex-shrink-0" />
                  <span className="text-text-secondary-custom">Not Answered</span>
                </div>
                <span className="font-mono font-bold text-text-primary-custom">{unattemptedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500/20 border border-purple-500 flex-shrink-0" />
                  <span className="text-text-secondary-custom">Marked for Review</span>
                </div>
                <span className="font-mono font-bold text-text-primary-custom">{markedOnlyCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 flex-shrink-0 relative">
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success-custom rounded-full ring-1 ring-background-custom" />
                  </span>
                  <span className="text-text-secondary-custom">Answered & Marked*</span>
                </div>
                <span className="font-mono font-bold text-text-primary-custom">{markedAttemptedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-surface-custom/40 border border-[#334155]/60 flex-shrink-0" />
                  <span className="text-text-secondary-custom">Not Visited</span>
                </div>
                <span className="font-mono font-bold text-text-primary-custom">{unseenCount}</span>
              </div>
            </div>
            <p className="text-[9px] text-text-secondary-custom/50 italic pt-1 border-t border-[#334155]/30">
              *Answered & Marked will be considered for final scoring.
            </p>
          </div>

          {/* Question List/Grid Content */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary-custom/80 uppercase tracking-wider mb-3">Questions</h4>
            
            {viewMode === 'grid' ? (
              <div className="space-y-6">
                {Object.entries(questions.reduce((acc, q, idx) => {
                  const sec = q.section || 'Questions';
                  if (!acc[sec]) acc[sec] = [];
                  acc[sec].push({ q, idx });
                  return acc;
                }, {} as Record<string, { q: Question; idx: number }[]>)).map(([sectionName, sectionQuestions]) => (
                  <div key={sectionName}>
                    {sectionName !== 'Questions' && (
                      <h5 className="text-[11px] font-bold text-primary-custom mb-3 border-b border-primary-custom/30 pb-1">{sectionName}</h5>
                    )}
                    <div className="grid grid-cols-5 gap-2.5">
                      {sectionQuestions.map(({ q, idx }) => {
                        const resp = responses[q.id];
                        const isMarkedAttempted = resp?.status === 'marked-attempted';
                        const isMarkedOnly = resp?.status === 'marked';

                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              onSelectIndex(idx);
                              if (window.innerWidth < 768) onClose();
                            }}
                            className={getQuestionButtonStyles(q, idx)}
                          >
                            <span>{idx + 1}</span>
                            {/* Dot badge for marked states */}
                            {isMarkedAttempted && (
                              <span 
                                title="Answered & Marked for Evaluation"
                                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success-custom rounded-full ring-2 ring-background-custom" 
                              />
                            )}
                            {isMarkedOnly && (
                              <span 
                                title="Marked for Review"
                                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-warning-custom rounded-full ring-2 ring-background-custom" 
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(questions.reduce((acc, q, idx) => {
                  const sec = q.section || 'Questions';
                  if (!acc[sec]) acc[sec] = [];
                  acc[sec].push({ q, idx });
                  return acc;
                }, {} as Record<string, { q: Question; idx: number }[]>)).map(([sectionName, sectionQuestions]) => (
                  <div key={sectionName} className="space-y-2">
                    {sectionName !== 'Questions' && (
                      <h5 className="text-[11px] font-bold text-primary-custom mb-2 border-b border-primary-custom/30 pb-1">{sectionName}</h5>
                    )}
                    {sectionQuestions.map(({ q, idx }) => {
                      const resp = responses[q.id];
                      const isCurrent = idx === currentIndex;
                      const isAnswered = resp?.selectedOptionIndex !== null && resp?.status !== 'marked-attempted';
                      const isMarkedAttempted = resp?.status === 'marked-attempted';
                      const isMarkedOnly = resp?.status === 'marked';
                      
                      let badgeText = "Not Visited";
                      let badgeClass = "bg-surface-custom/40 text-text-secondary-custom/50 border border-[#334155]/40";
                      
                      if (isMarkedAttempted) {
                        badgeText = "Answered & Marked";
                        badgeClass = "bg-purple-600/20 text-purple-300 border border-purple-500/40";
                      } else if (isMarkedOnly) {
                        badgeText = "Marked for Review";
                        badgeClass = "bg-purple-500/15 text-purple-300 border border-purple-500/30";
                      } else if (isAnswered) {
                        badgeText = "Answered";
                        badgeClass = "bg-success-custom/15 text-success-custom border border-success-custom/30";
                      } else if (resp?.status === 'unattempted') {
                        badgeText = "Not Answered";
                        badgeClass = "bg-danger-custom/15 text-danger-custom border border-danger-custom/30";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            onSelectIndex(idx);
                            if (window.innerWidth < 768) onClose();
                          }}
                          className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-semibold cursor-pointer outline-none transition-colors ${
                            isCurrent 
                              ? 'border-primary-custom bg-primary-custom/10' 
                              : 'border-[#334155]/40 hover:bg-surface-custom/50'
                          }`}
                        >
                          <span className="text-text-primary-custom">Question {idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                            {badgeText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="p-4 border-t border-[#334155] bg-surface-custom/90 flex-shrink-0">
          <button
            onClick={onSubmitClick}
            className="w-full py-3 bg-danger-custom hover:bg-danger-custom/90 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-colors cursor-pointer outline-none"
          >
            SUBMIT TEST
          </button>
        </div>
      </div>
    </>
  );
}
