<!--
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.
-->

# TiltCheck Agent Registration - Quick Start

Register your TiltCheck agent with Agentverse in 3 simple steps!

## Prerequisites

- Python 3.8+
- Agentverse API key ([Get one here](https://agentverse.ai))
- Agent seed phrase (create a secure random phrase)

## Quick Start

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `uagents>=0.12.0` - Fetch.ai uAgents framework
- `uagents_core>=0.1.0` - Registration utilities
- `pandas>=2.0.0` - Data processing

### Step 2: Set Environment Variables

**Option A: Command Line**
```bash
export AGENTVERSE_KEY="your_agentverse_api_key_here"
export AGENT_SEED_PHRASE="your_secure_seed_phrase_here"
```

**Option B: .env File**
```bash
cp .env.example .env
# Edit .env and add:
# AGENTVERSE_KEY=your_agentverse_api_key_here
# AGENT_SEED_PHRASE=your_secure_seed_phrase_here
```

### Step 3: Register the Agent

```bash
python register_agent.py
```

✅ **Done!** Your agent is now:
- Registered at `https://tiltcheck.it.com/agent`
- Discoverable on Agentverse
- Enabled for ASI Chat Protocol

## What's Registered?

```python
# This is what the registration script does:
register_chat_agent(
    "TiltCheck",                              # Agent name
    "https://tiltcheck.it.com/agent",         # Public endpoint
    active=True,                              # Enable immediately
    credentials=RegistrationRequestCredentials(
        agentverse_api_key=os.environ["AGENTVERSE_KEY"],
        agent_seed_phrase=os.environ["AGENT_SEED_PHRASE"],
    ),
)
```

## Verify Registration

1. Log in to [Agentverse](https://agentverse.ai)
2. Go to "My Agents"
3. You should see "TiltCheck" listed
4. Status should be "Active"

## Next Steps

After registration:

1. **Run the agent**:
   ```bash
   python agent.py
   ```

2. **Test with sample data**:
   - Ensure `session_data.csv` exists
   - The agent will check for tilt every 30 seconds
   - Watch for alert messages in the logs

3. **Integrate with your application**:
   - Send ChatMessages to the agent
   - Receive tilt alerts via ASI Chat Protocol
   - Use in ASI:One for interactive chat

## Troubleshooting

### Error: "AGENTVERSE_KEY environment variable is not set"

```bash
# Make sure you set the environment variable
export AGENTVERSE_KEY="your_key_here"

# Or check your .env file
cat .env | grep AGENTVERSE_KEY
```

### Error: "No module named 'uagents_core'"

```bash
# Install dependencies
pip install -r requirements.txt

# Or install directly
pip install uagents_core
```

### Error: "Registration failed"

Check:
- ✅ API key is valid (check Agentverse dashboard)
- ✅ Seed phrase is set correctly
- ✅ Internet connection is working
- ✅ Agentverse service is online

## Documentation

For more details, see:
- [AGENT_REGISTRATION_GUIDE.md](AGENT_REGISTRATION_GUIDE.md) - Full registration guide
- [README_AGENT.md](README_AGENT.md) - Complete agent documentation
- [Agentverse Docs](https://docs.agentverse.ai) - Official documentation

## Support

Need help?
- Check the [full registration guide](AGENT_REGISTRATION_GUIDE.md)
- Open an issue on [GitHub](https://github.com/jmenichole/TiltCheck/issues)
- Visit [Agentverse Documentation](https://docs.agentverse.ai)

---

**Built with ❤️ using Fetch.ai uAgents Framework**
