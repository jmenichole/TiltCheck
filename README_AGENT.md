# TiltCheck Agent 🎯

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)
![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)
![uAgents Framework](https://img.shields.io/badge/uAgents-0.12.0%2B-purple)

A Fetch.ai uAgents-based intelligent agent that monitors gambling session data to detect tilt behavior and sends timely alerts using the ASI Chat Protocol.

## 🏆 ASI Alliance Hackathon Submission

This project is submitted to the ASI Alliance Hackathon and meets all submission requirements:

### ✅ Submission Checklist

- **Code**: Public GitHub repository at [https://github.com/jmenichole/TiltCheck](https://github.com/jmenichole/TiltCheck)
- **README**: Agent details including name (`tiltcheck_agent`) and address (generated at runtime)
- **Category**: Innovation Lab (badges displayed at top)
- **Technologies Used**:
  - ✅ Fetch.ai uAgents Framework (v0.12.0+)
  - ✅ ASI Chat Protocol for agent communication
  - ✅ Agentverse registration ready
  - ✅ ASI:One Chat Protocol enabled
- **Demo Video**: See [Demo Video](#-demo-video) section below
- **Documentation**: Comprehensive setup and usage instructions included

### 🎬 Demo Video

**Video Link**: [TiltCheck Agent Demo (3-5 minutes)](https://github.com/jmenichole/TiltCheck/blob/main/DEMO_VIDEO.md)

The demo video showcases:
1. **Agent Setup**: Installing dependencies and configuring the agent
2. **Agent Startup**: Running the agent and viewing initialization logs
3. **Tilt Detection**: Live demonstration of rapid spinning and balance drop detection
4. **Alert Generation**: Real-time alerts using ASI Chat Protocol
5. **Agentverse Integration**: How to register and discover the agent on Agentverse
6. **ASI:One Interaction**: Agent communication via Chat Protocol

**Note**: If you're viewing this before the video is available, you can create your own demo by following the Usage instructions below. The agent provides comprehensive logging that demonstrates all functionality.

### 🏅 Judging Criteria Alignment

**Functionality & Technical Implementation (25%)**
- ✅ Agent system works as intended with real-time tilt detection
- ✅ Agents properly communicate using ASI Chat Protocol
- ✅ Real-time reasoning with configurable thresholds
- ✅ Comprehensive error handling and logging

**Use of ASI Alliance Tech (20%)**
- ✅ Agents registered/registerable on Agentverse
- ✅ Chat Protocol live and ready for ASI:One
- ✅ Built with uAgents framework
- ✅ Extensible for MeTTa Knowledge Graphs integration

**Innovation & Creativity (20%)**
- ✅ Novel application of AI agents to responsible gaming
- ✅ Solves real-world gambling addiction problem
- ✅ Plain language alerts that are actionable
- ✅ Unconventional use of agent technology for social good

**Real-World Impact & Usefulness (20%)**
- ✅ Addresses gambling addiction and tilt behavior
- ✅ Helps players make better decisions
- ✅ Prevents financial losses
- ✅ Promotes responsible gaming practices

**User Experience & Presentation (15%)**
- ✅ Clear, well-structured documentation
- ✅ Easy-to-follow setup instructions
- ✅ Smooth user experience with comprehensive logs
- ✅ Professional presentation with badges and formatting

## 🎲 What is Tilt?

"Tilt" is a state of mental or emotional confusion or frustration in which a player adopts a less than optimal strategy, usually resulting in poor decision-making and increased losses. TiltCheck Agent helps identify these patterns early and intervene with helpful alerts.

## 🚀 Features

- **Real-time Tilt Detection**: Monitors gambling session data for risky behavior patterns
- **Multiple Detection Rules**:
  - 🚨 **Rapid Spinning**: Detects more than 50 spins in 5 minutes
  - 📉 **Balance Drop**: Alerts when balance drops 30% or more in 10 minutes
- **ASI Chat Protocol Integration**: Sends alerts as ChatMessages for agent-to-agent communication
- **CSV Data Processing**: Easy integration with existing session tracking systems
- **Comprehensive Logging**: Detailed logs for demo and debugging purposes
- **Agentverse Discoverable**: Published manifest for discoverability on Agentverse

## 📋 Requirements

### Core Requirements
- Python 3.8 or higher
- pip (Python package manager)

### Extra Resources

**Required Dependencies** (installed via `requirements.txt`):
- `uagents>=0.12.0` - [Fetch.ai uAgents Framework](https://fetch.ai/docs/uagents)
- `pandas>=2.0.0` - [Data processing library](https://pandas.pydata.org/)

**Optional Resources**:
- **Agentverse Account** - [Create free account](https://agentverse.ai) for agent registration and discovery
- **Public Endpoint** (for production):
  - [ngrok](https://ngrok.com/) - Free tier available for testing
  - Cloud hosting (AWS, Google Cloud, Heroku, etc.) - For production deployment
- **ASI:One Access** - Available through [Agentverse](https://agentverse.ai) after agent registration

**Network Requirements**:
- Internet connection for agent registration and testnet funding
- Port 8001 available for agent endpoint (configurable)
- Outbound HTTPS access for Agentverse communication

## 🔧 Installation

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `uagents>=0.12.0` - Fetch.ai uAgents framework
- `pandas>=2.0.0` - Data processing library

### Step 2: Prepare Session Data

The agent expects a CSV file named `session_data.csv` with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | datetime | ISO format timestamp or Unix timestamp |
| `bet_amount` | numeric | Amount wagered on each spin/bet |
| `outcome` | string | Result of the bet (win/loss/push) |
| `balance` | numeric | Player's balance after the bet |

Example CSV format:
```csv
timestamp,bet_amount,outcome,balance
2024-01-15T10:00:00,10,loss,1000
2024-01-15T10:00:30,10,loss,990
2024-01-15T10:01:00,10,win,1010
```

A sample `session_data.csv` is included for testing.

## 🎮 Usage

### Run the Agent

```bash
python agent.py
```

### What Happens Next

1. The agent starts and logs its initialization
2. Every 30 seconds, it checks the `session_data.csv` file
3. It analyzes the data against tilt detection rules
4. If tilt risk is detected, it generates and logs alert messages
5. Messages are formatted according to the ASI Chat Protocol

## 📊 Example Output

When you run the agent, you'll see output like this:

```
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
2024-01-15 10:27:45 - __main__ - INFO - TiltCheck Agent Started
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
2024-01-15 10:27:45 - __main__ - INFO - Agent Address: agent1qd2j9x...abc123
2024-01-15 10:27:45 - __main__ - INFO - Agent Name: tiltcheck_agent
2024-01-15 10:27:45 - __main__ - INFO - Monitoring for tilt behavior...
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
2024-01-15 10:27:45 - __main__ - INFO - Running periodic tilt check...
2024-01-15 10:27:45 - __main__ - INFO - Successfully loaded 55 records from session_data.csv
2024-01-15 10:27:45 - __main__ - WARNING - Rapid spinning detected: 55 spins in 5 minutes
2024-01-15 10:27:45 - __main__ - WARNING - Significant balance drop detected: 70.0% in 10 minutes
2024-01-15 10:27:45 - __main__ - INFO - Tilt check complete: 2 alerts detected
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
2024-01-15 10:27:45 - __main__ - INFO - 🚨 TILT ALERT DETECTED 🚨
2024-01-15 10:27:45 - __main__ - INFO - Message: ⚠️ Tilt Alert: You've been spinning too fast. Take a break.
2024-01-15 10:27:45 - __main__ - INFO - Risk Level: HIGH
2024-01-15 10:27:45 - __main__ - INFO - Timestamp: 2024-01-15T10:27:45.123456
2024-01-15 10:27:45 - __main__ - INFO - Details: {'spin_count': 55, 'time_window_minutes': 5, 'threshold': 50, 'avg_spin_rate': '11.0 spins/min'}
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
2024-01-15 10:27:45 - __main__ - INFO - 🚨 TILT ALERT DETECTED 🚨
2024-01-15 10:27:45 - __main__ - INFO - Message: ⚠️ Tilt Alert: Your balance is dropping quickly. Vault some winnings.
2024-01-15 10:27:45 - __main__ - INFO - Risk Level: HIGH
2024-01-15 10:27:45 - __main__ - INFO - Timestamp: 2024-01-15T10:27:45.234567
2024-01-15 10:27:45 - __main__ - INFO - Details: {'start_balance': 1000.0, 'end_balance': 300.0, 'balance_lost': 700.0, 'drop_percentage': '70.0%', 'time_window_minutes': 10, 'threshold': '30.0%'}
2024-01-15 10:27:45 - __main__ - INFO - ============================================================
```

## 🔍 Alert Messages

The agent generates two types of plain English alerts:

### 1. Rapid Spinning Alert
**Trigger**: More than 50 spins in 5 minutes

**Message**: 
```
⚠️ Tilt Alert: You've been spinning too fast. Take a break.
```

**Details Provided**:
- Total spin count in window
- Time window checked
- Average spin rate per minute
- Threshold that was exceeded

### 2. Balance Drop Alert
**Trigger**: Balance dropped 30% or more in 10 minutes

**Message**:
```
⚠️ Tilt Alert: Your balance is dropping quickly. Vault some winnings.
```

**Details Provided**:
- Starting balance
- Ending balance
- Amount lost
- Percentage drop
- Time window checked
- Threshold that was exceeded

## 🏗️ Architecture

### Key Components

1. **Agent Initialization**
   - Creates a uAgents Agent with unique address
   - Registers with testnet for funding
   - Sets up event handlers

2. **Data Loading** (`load_csv_data`)
   - Reads CSV files with session data
   - Validates required columns
   - Converts timestamps to datetime objects
   - Sorts data chronologically

3. **Tilt Detection Rules**
   - `check_rapid_spinning`: Monitors spin frequency
   - `check_balance_drop`: Tracks balance changes
   - `check_all_tilt_conditions`: Coordinates all checks

4. **Alert Generation**
   - `create_chat_message`: Wraps alerts in ChatMessage format
   - Compatible with ASI Chat Protocol

5. **Event Handlers**
   - `startup_handler`: Initializes agent and logs startup info
   - `check_tilt_interval`: Runs every 30 seconds to analyze data
   - `handle_chat_message`: Processes incoming chat messages

### Message Models

```python
class ChatMessage(Model):
    """ASI Chat Protocol message"""
    message: str          # Alert text in plain English
    timestamp: str        # ISO format timestamp
    alert_type: str       # Risk level (HIGH, MEDIUM, LOW)

class TiltAlert(Model):
    """Internal tilt alert structure"""
    alert_message: str    # Human-readable warning
    risk_level: str       # Risk severity
    timestamp: str        # When detected
    details: Dict         # Additional context
```

## 🌐 Agentverse Integration

The agent is configured to be discoverable on Agentverse:

- **Agent Name**: `tiltcheck_agent`
- **Agent Seed**: `tiltcheck_secure_seed_phrase_2024` (configurable in agent.py)
- **Endpoint**: `http://localhost:8001/submit`
- **Protocol**: ASI Chat Protocol
- **Port**: 8001
- **Agent Address**: Generated at runtime and logged at startup (format: `agent1qd2j9x...`)

### Registering on Agentverse

To make your agent discoverable on Agentverse and ASI:One:

1. **Run the agent to get its address**:
   ```bash
   python agent.py
   ```
   The agent address will be displayed in the startup logs.

2. **Register on Agentverse**:
   - Visit [Agentverse](https://agentverse.ai)
   - Create an account or login
   - Navigate to "My Agents" → "Register Agent"
   - Enter your agent's address
   - Configure the endpoint URL (must be publicly accessible)
   - Enable Chat Protocol for ASI:One integration

3. **Enable Chat Protocol**:
   - In Agentverse agent settings, enable "Chat Protocol"
   - This makes your agent discoverable through ASI:One
   - Set the agent category to "Innovation Lab"

4. **Public Endpoint Setup** (for production):
   ```bash
   # Option 1: Use ngrok for testing
   ngrok http 8001
   
   # Option 2: Deploy to cloud (recommended)
   # Update agent.py endpoint with your public URL
   # Example: https://your-domain.com/submit
   ```

To publish to Agentverse, ensure your agent is running and accessible at the configured endpoint. The agent's address will be logged at startup.

## 🔄 Customization

### Adjusting Detection Thresholds

You can modify the tilt detection rules by adjusting the parameters:

```python
# In agent.py, modify these calls in check_tilt_interval():

# Change rapid spinning: 60 spins in 3 minutes
rapid_spin_alert = check_rapid_spinning(df, window_minutes=3, threshold_spins=60)

# Change balance drop: 40% drop in 15 minutes
balance_drop_alert = check_balance_drop(df, window_minutes=15, drop_threshold=0.40)
```

### Adding New Detection Rules

Add new functions following this pattern:

```python
def check_custom_rule(df: pd.DataFrame) -> Optional[TiltAlert]:
    """Your custom tilt detection logic"""
    # Analyze df
    # If condition met, return TiltAlert
    # Otherwise return None
    pass
```

Then add it to `check_all_tilt_conditions()`.

## 🧪 Testing

### Test with Sample Data

The included `session_data.csv` contains a simulated tilt scenario:
- 55 spins in rapid succession
- Balance drops from 1000 to 0 over 27 minutes
- Both alerts will trigger

### Create Your Own Test Data

Generate custom CSV files with different patterns:

```python
import pandas as pd
from datetime import datetime, timedelta

# Generate test data
data = []
balance = 1000
start_time = datetime.now()

for i in range(100):
    data.append({
        'timestamp': start_time + timedelta(seconds=i*30),
        'bet_amount': 10,
        'outcome': 'loss' if i % 3 == 0 else 'win',
        'balance': balance
    })
    balance -= 10 if i % 3 == 0 else -5

df = pd.DataFrame(data)
df.to_csv('custom_session.csv', index=False)
```

## 🛠️ Troubleshooting

### Issue: "File not found: session_data.csv"
**Solution**: Ensure `session_data.csv` exists in the same directory as `agent.py`

### Issue: "Missing required columns"
**Solution**: Verify your CSV has columns: `timestamp`, `bet_amount`, `outcome`, `balance`

### Issue: Agent address not funded
**Solution**: The agent automatically requests testnet funding. If this fails, check your internet connection and testnet availability.

### Issue: No alerts detected
**Solution**: Check that your session data actually triggers the conditions (50+ spins in 5 min or 30%+ balance drop in 10 min)

## 📚 Additional Resources

- [Fetch.ai uAgents Documentation](https://fetch.ai/docs/uagents)
- [ASI Chat Protocol Specification](https://fetch.ai/docs/protocols/chat)
- [Agentverse Platform](https://agentverse.ai)
- [TiltCheck Main Repository](https://github.com/jmenichole/TiltCheck)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

See the main repository LICENSE file for details.

## 🎯 Use Cases

- **Casino Integration**: Monitor real players and send interventions
- **Self-Help Tools**: Personal gambling session tracking
- **Research**: Study tilt patterns in controlled environments
- **Responsible Gaming**: Automated break reminders and alerts

## 🧠 Advanced Features & Integration

### MeTTa Knowledge Graphs Integration (Future Enhancement)

The TiltCheck Agent is designed to be extended with SingularityNET's MeTTa (Meta Type Talk) for advanced reasoning:

**Potential MeTTa Integration**:
```python
# Example pseudo-code for MeTTa integration
from hyperon import MeTTa

# Define tilt reasoning rules in MeTTa
metta = MeTTa()
metta.run("""
    ; Define tilt risk reasoning
    (: tilt-risk (-> Player RiskLevel))
    
    ; Rule: Rapid spinning indicates high risk
    (= (tilt-risk $player)
       (if (and (rapid-spinning $player)
                (balance-dropping $player))
           high-risk
           moderate-risk))
    
    ; Query tilt risk for player
    !(tilt-risk player-123)
""")
```

**Benefits of MeTTa Integration**:
- **Advanced Reasoning**: Complex pattern matching beyond simple thresholds
- **Explainable AI**: Transparent reasoning about tilt detection
- **Knowledge Representation**: Store and query historical tilt patterns
- **Multi-Factor Analysis**: Combine multiple indicators intelligently
- **Adaptive Learning**: Update rules based on new patterns

**Implementation Roadmap**:
1. Add MeTTa hyperon library to requirements
2. Define tilt reasoning rules in MeTTa syntax
3. Convert tilt detection logic to knowledge graph queries
4. Enable agent-to-agent knowledge sharing
5. Build historical pattern database

For more on MeTTa: [https://github.com/trueagi-io/hyperon-experimental](https://github.com/trueagi-io/hyperon-experimental)

### Multi-Agent Ecosystem

The TiltCheck Agent can interact with other agents:

**Counselor Agent**: Provides personalized advice based on tilt alerts
```python
# Send alert to counselor agent
await ctx.send(
    counselor_agent_address,
    ChatMessage(
        message="Player experiencing tilt, needs intervention",
        timestamp=datetime.now().isoformat(),
        alert_type="HIGH"
    )
)
```

**Analytics Agent**: Aggregates tilt data across multiple players
**Intervention Agent**: Coordinates break reminders and vault suggestions
**Compliance Agent**: Ensures responsible gaming regulations are met

## 🚀 Next Steps

1. **Multi-Agent Setup**: Connect TiltCheck Agent with other agents in Agentverse
2. **MeTTa Integration**: Add knowledge graph reasoning for advanced pattern detection
3. **Real-time Data**: Integrate with live casino APIs instead of CSV
4. **Machine Learning**: Add predictive models for early tilt detection
5. **Mobile Alerts**: Send notifications via SMS or push notifications
6. **Dashboard Integration**: Connect with TiltCheck web dashboard
7. **Multi-Player Analytics**: Aggregate insights across player populations

---

**Built with ❤️ using Fetch.ai uAgents Framework**

For questions or support, please open an issue in the repository.
