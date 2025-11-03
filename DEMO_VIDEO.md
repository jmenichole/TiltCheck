# TiltCheck Agent Demo Video 🎬

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

## Overview

This document provides information about the TiltCheck Agent demonstration video for the ASI Alliance Hackathon submission.

## 📹 Demo Video Content (3-5 minutes)

The demo video showcases the complete functionality of the TiltCheck Agent:

### 1. Introduction (30 seconds)
- Overview of the TiltCheck Agent
- Problem statement: Gambling tilt and responsible gaming
- Technologies used: Fetch.ai uAgents, ASI Chat Protocol

### 2. Setup & Installation (45 seconds)
- Cloning the repository
- Installing dependencies: `pip install -r requirements.txt`
- Quick overview of required files (agent.py, session_data.csv)

### 3. Agent Startup (45 seconds)
- Running the agent: `python agent.py`
- Agent initialization logs
- Showing the generated agent address
- Explaining the seed phrase and wallet funding

### 4. Tilt Detection in Action (90 seconds)
- Agent monitoring session data every 30 seconds
- **Live Alert 1**: Rapid spinning detection
  - Showing 55 spins in 5 minutes
  - Alert message: "You've been spinning too fast. Take a break."
  - Detailed metrics displayed
- **Live Alert 2**: Balance drop detection
  - Showing 70% balance drop in 10 minutes
  - Alert message: "Your balance is dropping quickly. Vault some winnings."
  - Risk details and thresholds

### 5. Technical Deep Dive (45 seconds)
- Code walkthrough of key functions
- ASI Chat Protocol message structure
- Showing the ChatMessage model
- Explaining how alerts are generated

### 6. Agentverse Integration (30 seconds)
- How to register the agent on Agentverse
- Enabling Chat Protocol for ASI:One
- Making the agent discoverable
- Setting up public endpoints

### 7. Real-World Impact (15 seconds)
- Responsible gaming benefits
- Preventing financial losses
- Promoting healthy gaming habits

## 🎥 Creating Your Own Demo

If you want to create a demo video yourself, follow these steps:

### Prerequisites
- Screen recording software (OBS Studio, QuickTime, etc.)
- Working installation of TiltCheck Agent
- Microphone for voiceover (optional but recommended)

### Recording Steps

1. **Prepare Your Environment**
   ```bash
   cd /path/to/TiltCheck
   # Ensure you have clean terminal output
   clear
   ```

2. **Start Recording**
   - Open your screen recording software
   - Start recording your terminal and/or IDE

3. **Follow the Script**
   ```bash
   # 1. Show the repository
   ls -la
   cat README_AGENT.md  # Show first few lines
   
   # 2. Install dependencies
   pip install -r requirements.txt
   
   # 3. Show the agent code briefly
   cat agent.py | head -50
   
   # 4. Run the agent
   python agent.py
   
   # Let it run for 1-2 minutes to show the periodic checks
   # The demo data will trigger both alerts
   
   # 5. Press Ctrl+C to stop
   ```

4. **Add Voiceover** (recommended)
   - Explain what's happening at each step
   - Highlight the alert messages
   - Discuss the technical implementation
   - Mention real-world impact

5. **Edit and Export**
   - Trim to 3-5 minutes
   - Add title slides if desired
   - Export in MP4 format (1080p recommended)

### Demo Script Outline

```markdown
[SLIDE: TiltCheck Agent - ASI Alliance Hackathon]

"Hi, I'm demonstrating the TiltCheck Agent, an intelligent agent built 
with Fetch.ai's uAgents framework for the ASI Alliance Hackathon."

[SHOW: Terminal with repository]

"TiltCheck uses AI agents to detect gambling tilt - a state where players 
make poor decisions due to emotional frustration. Let's see it in action."

[SHOW: Installation]

"First, we install the required dependencies - the uAgents framework 
and pandas for data processing."

[SHOW: Starting the agent]

"Now let's start the agent. Notice it generates a unique address and 
registers itself on the testnet."

[SHOW: Agent running]

"The agent monitors gambling session data every 30 seconds. Here we see 
it detecting rapid spinning - 55 spins in just 5 minutes."

[HIGHLIGHT: Alert message]

"The agent sends a plain English alert through the ASI Chat Protocol: 
'You've been spinning too fast. Take a break.'"

[SHOW: Second alert]

"And here's another alert - the player's balance dropped 70% in 10 minutes. 
The agent recommends vaulting some winnings."

[SHOW: Code briefly]

"Under the hood, the agent uses configurable thresholds and time windows 
to detect these patterns. All messages use the ASI Chat Protocol for 
agent-to-agent communication."

[SHOW: Agentverse registration]

"The agent can be registered on Agentverse and discovered through ASI:One, 
making it part of the broader ASI Alliance ecosystem."

[CLOSING SLIDE]

"TiltCheck Agent promotes responsible gaming through intelligent monitoring 
and timely interventions. This is real-world AI for social good. 
Thank you!"
```

## 🎬 Alternative: Live Demo

If you prefer a live demonstration:

1. **Run the demo script**:
   ```bash
   python demo_agent.py
   ```
   This runs the detection algorithms without needing the uAgents framework.

2. **Show the output**:
   - Session statistics
   - Tilt detection results
   - Alert messages and details

3. **Explain the integration**:
   - How the full agent.py adds uAgents framework
   - ASI Chat Protocol messaging
   - Agentverse discoverability

## 📊 What to Highlight

### Technical Excellence
- ✅ Clean, well-documented code
- ✅ Proper use of uAgents framework
- ✅ ASI Chat Protocol integration
- ✅ Robust error handling

### Innovation
- ✅ Novel application to responsible gaming
- ✅ Plain language alerts that users understand
- ✅ Real-time pattern detection
- ✅ Extensible architecture

### Real-World Impact
- ✅ Prevents gambling addiction
- ✅ Reduces financial losses
- ✅ Promotes healthy gaming habits
- ✅ Actionable interventions

## 🔗 Resources

- **GitHub Repository**: [https://github.com/jmenichole/TiltCheck](https://github.com/jmenichole/TiltCheck)
- **Agent Documentation**: [README_AGENT.md](README_AGENT.md)
- **Fetch.ai Docs**: [https://fetch.ai/docs/uagents](https://fetch.ai/docs/uagents)
- **Agentverse**: [https://agentverse.ai](https://agentverse.ai)

## 📝 Notes for Judges

The TiltCheck Agent demonstrates:

1. **Proper ASI Alliance Tech Usage**:
   - Built with uAgents framework (v0.12.0+)
   - Uses ASI Chat Protocol for messaging
   - Ready for Agentverse registration
   - Discoverable through ASI:One

2. **Functional Implementation**:
   - Real-time monitoring every 30 seconds
   - Multiple detection algorithms
   - Comprehensive logging and error handling
   - Production-ready architecture

3. **Innovation**:
   - Applies agent technology to social good
   - Novel approach to responsible gaming
   - Plain language alerts for accessibility
   - Extensible for future enhancements

4. **Real-World Impact**:
   - Addresses gambling addiction problem
   - Prevents financial losses
   - Promotes responsible behavior
   - Scalable to multiple platforms

5. **User Experience**:
   - Clear documentation
   - Easy setup process
   - Comprehensive logging
   - Professional presentation

---

**For questions or assistance, please open an issue in the GitHub repository.**

*Demo video prepared for ASI Alliance Hackathon submission*
