<!--
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.
-->

# TiltCheck Frontend

Next.js frontend for TiltCheck AI Agent integration.

## Features

- Real-time tilt analysis interface
- Interactive behavioral tracking
- AI agent interaction
- Professional gaming aesthetic
- Session analytics and insights

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build

```bash
npm run build
npm start
```

## Architecture

The frontend communicates with the TiltCheck AI agent to process behavioral data:

1. User inputs session data
2. Data sent to AI analysis service
3. AI models analyze for tilt patterns
4. Results returned and displayed
5. Session history tracked

## Customization

Edit `app/page.tsx` to modify the UI or `app/globals.css` for styling changes.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TiltCheck Documentation](../../README.md)
