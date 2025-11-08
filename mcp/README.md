<!--
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.
-->

# TiltCheck AI Agent Integration

TiltCheck integrated with AI capabilities for behavioral data analysis.

## Overview

This directory contains AI agent integration for TiltCheck, combining machine learning capabilities with behavioral tilt detection for AI-powered gambling analytics.

## Structure

- `agents/` - AI agent implementations
- `resources/` - Agent resources (models, data, configs)
- `config/` - Configuration files
- `frontend/` - Next.js frontend for agent interface

## AI Integration

TiltCheck uses AI models to enhance tilt detection. The behavioral data is processed to provide insights and early warning signs of tilt behavior.

### Key Features

- **AI-Powered Tilt Detection**: Machine learning models for pattern recognition
- **Behavioral Data Pipeline**: Data collection and analysis
- **Real-time Processing**: Low-latency tilt alerts
- **Actionable Insights**: Analysis results with recommendations

## Setup

See individual component READMEs for setup instructions:
- [Agent Setup](./agents/README.md)
- [Frontend Setup](./frontend/README.md)
- [Resource Management](./resources/README.md)

## Architecture

```
TiltCheck User → Frontend → AI Agent → Behavioral Analysis
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

# Deploy agent
npm run agent:deploy
```

## Learn More

- [TiltCheck Agent Docs](../README_AGENT.md)
