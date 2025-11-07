<!--
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.
-->

# TiltCheck Trustless Solana AI Agent

TiltCheck integrated with trustless Solana for decentralized behavioral data analysis.

## Overview

This directory contains the trustless Solana AI agent integration for TiltCheck, combining Solana blockchain capabilities with behavioral tilt detection for decentralized AI-powered gambling analytics.

## Structure

- `agents/` - Trustless Solana AI agent implementations
- `resources/` - Agent resources (models, data, configs)
- `config/` - Configuration files for Solana integration
- `frontend/` - Next.js frontend for agent interface

## Trustless Solana Integration

TiltCheck uses trustless Solana integration to run AI models for tilt detection. The behavioral data is processed directly on Solana, ensuring transparency and verifiability without relying on centralized compute networks.

### Key Features

- **Decentralized Tilt Detection**: AI models run on trustless Solana infrastructure
- **Solana Data Pipeline**: Behavioral data stored and analyzed on-chain
- **Real-time Processing**: Low-latency tilt alerts via direct Solana integration
- **Verifiable Results**: All AI predictions are cryptographically signed

## Setup

See individual component READMEs for setup instructions:
- [Agent Setup](./agents/README.md)
- [Frontend Setup](./frontend/README.md)
- [Resource Management](./resources/README.md)

## Architecture

```
TiltCheck User → Frontend → Trustless Solana AI Agent → Solana Blockchain
                                ↓
                        Behavioral Analysis
                                ↓
                        Tilt Detection Models
                                ↓
                        Results + Alerts
```

## Development

```bash
# Install dependencies
npm install

# Run agent locally
npm run agent:dev

# Deploy to Solana
npm run agent:deploy
```

## Learn More

- [Solana Documentation](https://docs.solana.com/)
- [TiltCheck Agent Docs](../README_AGENT.md)
