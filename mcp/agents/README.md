<!--
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.
-->

# TiltCheck Trustless Solana Agents

AI agents for decentralized tilt detection on trustless Solana infrastructure.

## Agents

### tiltcheck_solana_agent.py

Main agent that processes behavioral data through trustless Solana blockchain infrastructure.

**Features:**
- Real-time behavioral analysis
- Trustless Solana blockchain integration
- Cryptographic result verification
- Decentralized execution without intermediaries

**Usage:**

```bash
# Run the agent
python tiltcheck_solana_agent.py

# With custom Solana RPC
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
python tiltcheck_solana_agent.py
```

## Architecture

```
User Session Data
       ↓
TiltCheck Agent
       ↓
Trustless Solana Network
       ↓
AI Model Execution
       ↓
Results + Signature
       ↓
Solana Blockchain
```

## Configuration

Edit `../config/solana_config.json` to customize:
- Network settings (devnet/mainnet)
- Analysis thresholds
- RPC endpoint preferences
- Risk level definitions

## Development

```bash
# Install dependencies
pip install -r ../resources/requirements.txt

# Run tests
python -m pytest tests/

# Deploy to Solana
npm run deploy
```

## Integration with Agentverse

The trustless Solana agent integrates with the existing TiltCheck Agentverse registration:

```python
from mcp.agents.tiltcheck_solana_agent import TiltCheckSolanaAgent

# Initialize
agent = TiltCheckSolanaAgent()

# Analyze session
result = agent.analyze_behavioral_data(session_data)
```

## Learn More

- [Solana Documentation](https://docs.solana.com/)
- [TiltCheck Agent Guide](../../AGENT_REGISTRATION_GUIDE.md)
