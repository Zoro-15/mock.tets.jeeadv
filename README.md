# JEE Mock Test Platform

A modern, responsive, and high-performance exam simulation platform designed for JEE Main and JEE Advanced aspirants.

## 🚀 Features

- **Realistic Exam Interface**: Experience a premium exam interface with active countdown timer alerts and right-side question palette drawers.
- **Three Core Mock Categories**:
  - **NCERT Exemplar**: 76 chapter-wise tests for Physics, Chemistry, and Mathematics (Class 11 and Class 12).
  - **JEE Main PYPs**: 134 official year-wise papers spanning 2019 to 2026.
  - **JEE Advanced PYPs**: 10 official papers (Paper 1 & Paper 2) spanning 2021 to 2025.
- **Dynamic Question Builder**: Fully parses LaTeX math formulas, structured tables, and assertion-reason formats.
- **Local Progress Persistence**: Sessions auto-save dynamically in your browser's local storage, allowing you to resume interrupted tests.
- **Performance Evaluation Tab**:
  - Comprehensive scorecard metrics (score, percentile, accuracy, average response times).
  - Detailed solutions panel with correct/incorrect answer filters.
  - Preparation dashboard featuring subject breakdowns, weak/strong chapters, bookmarks, and attempt logs.
- **Keyboard Navigation Shortcuts**:
  - `1` - `4` : Select answer options A to D
  - `&rarr;` (Right Arrow) : Save & Next
  - `&uarr;` (Up Arrow) : Mark for Review
  - `&larr;` (Left Arrow) : Previous Question
  - `C` : Clear Response
  - `P` : Toggle Question Palette drawer

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19 & TypeScript
- **Styling**: Tailwind CSS v4 (Custom dark tokens)
- **Math Rendering**: KaTeX

## ⚙️ Development

Start the development server locally:

```bash
npm install
npm run dev
```

Build the static production bundle:

```bash
npm run build
```
