# TiltCheck Nosana Agents

AI agents for decentralized tilt detection on Nosana compute network.

## Agents

### tiltcheck_nosana_agent.py

Main agent that processes behavioral data through Nosana's decentralized AI infrastructure.

**Features:**
- Real-time behavioral analysis
- Solana blockchain integration
- Cryptographic result verification
- Decentralized compute execution

**Usage:**

```bash
# Run the agent
python tiltcheck_nosana_agent.py

# With custom Solana RPC
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
python tiltcheck_nosana_agent.py
```

## Architecture

```
User Session Data
       ↓
TiltCheck Agent
       ↓
Nosana Compute Network
       ↓
AI Model Execution
       ↓
Results + Signature
       ↓
Solana Blockchain
```

## Configuration

Edit `../config/nosana_config.json` to customize:
- Network settings (devnet/mainnet)
- Analysis thresholds
- Compute node preferences
- Risk level definitions

## Development

```bash
# Install dependencies
pip install -r ../resources/requirements.txt

# Run tests
python -m pytest tests/

# Deploy to Nosana
npm run deploy
```

## Integration with Agentverse

The Nosana agent integrates with the existing TiltCheck Agentverse registration:

```python
from mcp.agents.tiltcheck_nosana_agent import TiltCheckNosanaAgent

# Initialize
agent = TiltCheckNosanaAgent()

# Analyze session
result = agent.analyze_behavioral_data(session_data)
```

## Learn More

- [Nosana Documentation](https://docs.nosana.io/)
- [Solana Documentation](https://docs.solana.com/)
- [TiltCheck Agent Guide](../../AGENT_REGISTRATION_GUIDE.md)
