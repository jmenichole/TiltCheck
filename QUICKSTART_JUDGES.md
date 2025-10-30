# TiltCheck Agent - Quick Start for Judges 🏆

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

## ⚡ 60-Second Setup

Want to see the TiltCheck Agent in action immediately? Follow these steps:

### 1. Clone and Install (15 seconds)
```bash
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck
pip install -r requirements.txt
```

### 2. Run the Demo (10 seconds)
```bash
python demo_agent.py
```

**You'll see**:
- ✅ Session data loading (60 spins, 5 minutes)
- ⚠️ Alert #1: Rapid spinning detected (60 spins in 5 minutes)
- ⚠️ Alert #2: Balance drop detected (59% drop in 10 minutes)
- 📊 Detailed metrics and recommendations

### 3. Run the Full Agent (20 seconds)
```bash
python agent.py
```

**You'll see**:
- 🤖 Agent initialization with unique address
- 🌐 Agentverse inspector link
- 🔄 Real-time monitoring every 30 seconds
- 🚨 Live tilt alerts with ASI Chat Protocol format
- ⏱️ Let it run for 1 minute to see multiple checks

Press `Ctrl+C` to stop.

## 📄 Complete Documentation

- **[README_AGENT.md](README_AGENT.md)** - Complete agent documentation
- **[SUBMISSION.md](SUBMISSION.md)** - Detailed hackathon submission with judging criteria responses
- **[DEMO_VIDEO.md](DEMO_VIDEO.md)** - Demo video guide and script

## 🎯 Key Features to Notice

### 1. Real-Time Tilt Detection
Watch the agent detect two types of risky behavior:
- **Rapid Spinning**: More than 50 spins in 5 minutes
- **Balance Drop**: More than 30% loss in 10 minutes

### 2. ASI Chat Protocol
Messages use the `ChatMessage` model:
```python
class ChatMessage(Model):
    message: str        # Plain English alert
    timestamp: str      # ISO format
    alert_type: str     # Risk level (HIGH, MEDIUM, LOW)
```

### 3. Fetch.ai uAgents Framework
Built entirely on uAgents:
- Agent initialization with unique address
- Periodic interval handlers (every 30 seconds)
- Message handlers for Chat Protocol
- Agentverse registration ready

### 4. Plain Language Alerts
Alerts are human-readable and actionable:
- ⚠️ "You've been spinning too fast. Take a break."
- ⚠️ "Your balance is dropping quickly. Vault some winnings."

### 5. Detailed Metrics
Each alert includes comprehensive details:
- Spin counts and rates
- Balance changes and percentages
- Time windows analyzed
- Thresholds exceeded

## 🔍 What Makes This Special

### Innovation (20%)
✅ First autonomous agent for gambling tilt detection  
✅ Uses AI agents for social good (responsible gaming)  
✅ Novel application of ASI Alliance technologies  

### Technical Implementation (25%)
✅ Clean, well-documented Python code  
✅ Proper use of uAgents framework and Chat Protocol  
✅ Real-time reasoning with configurable thresholds  
✅ Production-ready architecture  

### Real-World Impact (20%)
✅ Addresses gambling addiction (affects millions)  
✅ Prevents financial losses through early intervention  
✅ Promotes mental health and responsible gaming  
✅ Immediately useful to players and casinos  

### ASI Alliance Tech Usage (20%)
✅ Built with Fetch.ai uAgents (v0.12.0+)  
✅ ASI Chat Protocol for agent communication  
✅ Agentverse registration ready  
✅ Designed for MeTTa Knowledge Graphs integration  

### User Experience (15%)
✅ Comprehensive documentation  
✅ Simple installation and setup  
✅ Clear, actionable alerts  
✅ Professional presentation  

## 📊 Expected Output

When you run `python agent.py`, you should see:

```
WARNING:__main__:Agent will run in demo mode without testnet connection
INFO:__main__:TiltCheck Agent initialized with address: agent1q0m8395gt07...
INFO:__main__:Starting TiltCheck Agent...
INFO:__main__:============================================================
INFO:__main__:TiltCheck Agent Started
INFO:__main__:============================================================
INFO:__main__:Agent Address: agent1q0m8395gt07a6hekk6u4x832p5qs54yhvasq55...
INFO:__main__:Agent Name: tiltcheck_agent
INFO:__main__:Monitoring for tilt behavior...
INFO:__main__:============================================================
INFO:     [tiltcheck_agent]: Agent inspector available at https://agentverse.ai/inspect/?uri=...
INFO:     [tiltcheck_agent]: Starting server on http://0.0.0.0:8001
INFO:__main__:Running periodic tilt check...
INFO:__main__:Successfully loaded 55 records from session_data.csv
WARNING:__main__:Significant balance drop detected: 100.0% in 10 minutes
INFO:__main__:Tilt check complete: 1 alerts detected
INFO:__main__:============================================================
INFO:__main__:🚨 TILT ALERT DETECTED 🚨
INFO:__main__:Message: ⚠️ Tilt Alert: Your balance is dropping quickly. Vault some winnings.
INFO:__main__:Risk Level: HIGH
INFO:__main__:Timestamp: 2025-10-30T18:58:56.105817
INFO:__main__:Details: {'start_balance': 510.0, 'end_balance': 0.0, 'balance_lost': 510.0, 'drop_percentage': '100.0%', 'time_window_minutes': 10, 'threshold': '30.0%'}
INFO:__main__:============================================================
```

## 🧪 Testing Different Scenarios

The repository includes three sample CSV files:

1. **session_data.csv** - Standard session that triggers balance drop alert
2. **session_data_both_alerts.csv** - Triggers both rapid spinning AND balance drop
3. **session_data_tilt_example.csv** - Another tilt scenario

To test different data:
```bash
# Edit agent.py line 262 to change the CSV file:
csv_file = "session_data_both_alerts.csv"  # or any other file
```

## 📈 Architecture Overview

```
CSV Data → Agent → Tilt Detection → Alert Generation → Chat Protocol
             ↓                                             ↓
        Periodic Check                            Agent-to-Agent
        (30 seconds)                              Communication
```

## 🎓 Code Quality Highlights

### Type Safety
```python
from typing import List, Dict, Optional, Any

def check_rapid_spinning(df: pd.DataFrame, 
                        window_minutes: int = 5, 
                        threshold_spins: int = 50) -> Optional[TiltAlert]:
```

### Error Handling
```python
try:
    df = pd.read_csv(filepath)
except FileNotFoundError:
    logger.error(f"File not found: {filepath}")
    return None
```

### Comprehensive Logging
```python
logger.info(f"Successfully loaded {len(df)} records from {filepath}")
logger.warning(f"Rapid spinning detected: {spin_count} spins in {window_minutes} minutes")
```

### Clean Architecture
- Separation of concerns (data loading, detection, alert generation)
- Configurable thresholds
- Extensible detection rules
- Message protocol abstraction

## 🚀 Next Steps After Testing

1. **Review Code**: Check out `agent.py` for implementation details
2. **Read Documentation**: See `README_AGENT.md` for complete guide
3. **Submission Details**: Review `SUBMISSION.md` for judging criteria responses
4. **Video Guide**: Check `DEMO_VIDEO.md` for demo creation instructions

## 💡 Questions?

- **GitHub Issues**: [github.com/jmenichole/TiltCheck/issues](https://github.com/jmenichole/TiltCheck/issues)
- **Email**: j.chapman7@yahoo.com
- **Repository**: [github.com/jmenichole/TiltCheck](https://github.com/jmenichole/TiltCheck)

## 🏆 Summary for Judges

**What**: Autonomous agent that detects gambling tilt behavior  
**How**: Fetch.ai uAgents + ASI Chat Protocol  
**Why**: Promotes responsible gaming, prevents addiction  
**Impact**: Real-world solution to a significant problem  
**Quality**: Production-ready, well-documented, extensible  

**Time to evaluate**: ~5 minutes for full demonstration  
**Lines of code**: ~310 in agent.py (well-documented)  
**Dependencies**: 2 (uagents, pandas)  
**Setup complexity**: Minimal (3 commands)  

---

**Thank you for reviewing TiltCheck Agent!**

*Built with ❤️ using Fetch.ai uAgents Framework for the ASI Alliance Hackathon*
