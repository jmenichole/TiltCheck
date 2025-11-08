<!--
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.
-->

# TiltCheck AI Agents

AI agents for behavioral tilt detection.

## Agents

### tiltcheck_agent.py

Main agent that processes behavioral data for tilt detection analysis.

**Features:**
- Real-time behavioral analysis
- Pattern recognition
- Predictive analytics
- Alert generation

**Usage:**

```bash
# Run the agent
python tiltcheck_agent.py

# With custom configuration
export TILTCHECK_CONFIG="config/custom_config.json"
python tiltcheck_agent.py
```

## Architecture

```
User Session Data
       ↓
TiltCheck Agent
       ↓
AI Model Execution
       ↓
Analysis Results
       ↓
Alerts & Recommendations
```

## Configuration

Edit `../config/agent_config.json` to customize:
- Analysis thresholds
- Risk level definitions
- Alert preferences
- Model parameters

## Development

```bash
# Install dependencies
pip install -r ../resources/requirements.txt

# Run tests
python -m pytest tests/

# Deploy agent
npm run deploy
```

## Integration with Agentverse

The TiltCheck agent integrates with the existing TiltCheck Agentverse registration:

```python
from mcp.agents.tiltcheck_agent import TiltCheckAgent

# Initialize
agent = TiltCheckAgent()

# Analyze session
result = agent.analyze_behavioral_data(session_data)
```

## Learn More

- [TiltCheck Agent Guide](../../AGENT_REGISTRATION_GUIDE.md)
