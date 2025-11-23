# MMA Rankings - Next.js App

UFC and Lion Championship fighter rankings and events application built with Next.js.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
mma-nextjs/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── Header.tsx       # Tournament switcher header
│   ├── Navigation.tsx   # Main navigation
│   └── EventsPage.tsx   # Events display component
├── public/
│   └── data/           # JSON data files
│       ├── ufc.json
│       ├── lion.json
│       └── events.json
├── types/
│   └── index.ts        # TypeScript type definitions
└── package.json
```

## Features

- Tournament switching (UFC / Lion Championship)
- Dynamic theme changing
- Events page with fight cards
- Rankings page (coming soon)
- Responsive design
- TypeScript support
- Component-based architecture

## Data Management

All fighter rankings and event data are stored in JSON files in the `public/data/` directory:

- `ufc.json` - UFC fighter rankings
- `lion.json` - Lion Championship rankings
- `events.json` - Event details and fight cards

## Build

```bash
npm run build
npm start
```
