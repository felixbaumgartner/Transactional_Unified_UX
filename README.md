# Transactional Unified UX Demo

An interactive demo application showcasing a **unified messaging platform** for managing marketing, non-marketing, and transactional message campaigns across Email, Push Notification, and SMS channels.

## Overview

This demo illustrates a proposed UX for a unified campaign management tool that brings together:

- **Campaign Management** — Create and manage messaging campaigns with built-in classification
- **Message Classification** — A guided questionnaire that classifies messages as Marketing, Non-marketing, or Transactional based on content and intent
- **Transactional Campaign Builder** — A dedicated setup flow for transactional messages (booking confirmations, OTPs, payment receipts) that bypasses marketing pipelines

## Key Features

### Message Classification Questionnaire
A two-phase decision tree that determines message type:
- **Phase 1 (Promotional Intent Check):** Determines if the message is marketing or non-marketing
- **Phase 2 (Transactional Validation):** For non-marketing messages, validates whether they qualify as transactional (bypasses subscription preferences, gets priority delivery)

### Unified Campaign List
A filterable, sortable list of all campaigns with badges for:
- Message type (Marketing / Non-marketing / Transactional)
- Channel (Email / Push / SMS)
- Status (Draft / Published / Live / Stopped)
- Pipeline and ownership metadata

### Transactional Campaign Setup
A streamlined form for transactional campaigns that combines trigger configuration and campaign settings in one place, including:
- Channel selection and input topic configuration
- Content tracking and message category
- A/B experiment setup with multiple variants
- Reporting settings (affiliate IDs)

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **React Router v6** | Client-side routing |
| **Vite** | Dev server and build tool |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs on [http://localhost:5181](http://localhost:5181).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── index.html                          # Entry HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                        # React entry point
    ├── App.tsx                         # Root layout with sidebar navigation
    ├── constants.ts                    # Types, classification questions, topic configs
    ├── styles.css                      # Global styles
    ├── components/
    │   └── ClassificationQuestionnaire.tsx  # Reusable classification questionnaire
    └── pages/
        ├── CampaignListDemo.tsx        # Campaign list with filters
        ├── CampaignCreateDemo.tsx      # New campaign form (marketing/non-marketing)
        ├── TransactionalCreateDemo.tsx  # Transactional campaign setup
        ├── MessageListDemo.tsx         # Unified message list view
        └── MessageCreateDemo.tsx       # Unified message creation flow
```

## Routes

| Path | Page |
|---|---|
| `/campaigns` | Campaign list (default) |
| `/campaign/new` | Create new campaign (with classification) |
| `/campaign/new/transactional` | Transactional campaign setup |

## License

This project is for demonstration purposes.
