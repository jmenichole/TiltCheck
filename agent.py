"""
TiltCheck Agent - Gambling Tilt Detection using Fetch.ai uAgents Framework

This agent monitors gambling session data to detect tilt behavior and sends
alerts using the ASI Chat Protocol when risk is detected.

ASI Alliance Hackathon Submission - Innovation Lab Category

Technologies Used:
- Fetch.ai uAgents Framework (v0.12.0+)
- ASI Chat Protocol for agent communication
- Agentverse registration ready
- Extensible for MeTTa Knowledge Graphs

For complete documentation, see README_AGENT.md
For submission details, see SUBMISSION.md
Repository: https://github.com/jmenichole/TiltCheck
"""

import os
import logging
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Define message models for ASI Chat Protocol
class ChatMessage(Model):
    """Chat message model for ASI Chat Protocol"""
    message: str
    timestamp: str
    alert_type: str


class TiltAlert(Model):
    """Model for tilt alert information"""
    alert_message: str
    risk_level: str
    timestamp: str
    details: Dict[str, Any]


# Initialize the TiltCheck Agent
# Note: Use the seed phrase from AGENT_SEED_PHRASE environment variable for production
agent_seed = os.environ.get("AGENT_SEED_PHRASE", "tiltcheck_secure_seed_phrase_2024")

tiltcheck_agent = Agent(
    name="tiltcheck_agent",
    seed=agent_seed,
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

# Fund agent if needed (for testnet)
# Note: This requires network connectivity to the Fetch.ai testnet
# Comment out for local/offline testing
try:
    fund_agent_if_low(tiltcheck_agent.wallet.address())
except Exception as e:
    logger.warning(f"Could not fund agent from testnet: {e}")
    logger.warning("Agent will run in demo mode without testnet connection")

logger.info(f"TiltCheck Agent initialized with address: {tiltcheck_agent.address}")


def load_csv_data(filepath: str) -> Optional[pd.DataFrame]:
    """
    Load gambling session data from CSV file.
    
    Expected CSV format:
    - timestamp: ISO format datetime or Unix timestamp
    - bet_amount: numeric bet amount
    - outcome: win/loss/push
    - balance: current balance after bet
    
    Args:
        filepath: Path to CSV file
        
    Returns:
        DataFrame with session data or None if error
    """
    try:
        df = pd.read_csv(filepath)
        
        # Validate required columns
        required_columns = ['timestamp', 'bet_amount', 'outcome', 'balance']
        if not all(col in df.columns for col in required_columns):
            logger.error(f"Missing required columns. Need: {required_columns}")
            return None
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Sort by timestamp
        df = df.sort_values('timestamp').reset_index(drop=True)
        
        logger.info(f"Successfully loaded {len(df)} records from {filepath}")
        return df
        
    except FileNotFoundError:
        logger.error(f"File not found: {filepath}")
        return None
    except Exception as e:
        logger.error(f"Error loading CSV: {str(e)}")
        return None


def check_rapid_spinning(df: pd.DataFrame, window_minutes: int = 5, 
                        threshold_spins: int = 50) -> Optional[TiltAlert]:
    """
    Check if player has made too many spins in a short time window.
    
    Tilt Rule: More than 50 spins in 5 minutes = tilt risk
    
    Args:
        df: DataFrame with session data
        window_minutes: Time window to check (default 5 minutes)
        threshold_spins: Spin threshold (default 50)
        
    Returns:
        TiltAlert if risk detected, None otherwise
    """
    if len(df) < 2:
        return None
    
    # Check most recent time window
    latest_time = df['timestamp'].max()
    window_start = latest_time - timedelta(minutes=window_minutes)
    recent_spins = df[df['timestamp'] >= window_start]
    
    spin_count = len(recent_spins)
    
    if spin_count > threshold_spins:
        logger.warning(f"Rapid spinning detected: {spin_count} spins in {window_minutes} minutes")
        
        return TiltAlert(
            alert_message=f"⚠️ Tilt Alert: You've been spinning too fast. Take a break.",
            risk_level="HIGH",
            timestamp=datetime.now().isoformat(),
            details={
                "spin_count": spin_count,
                "time_window_minutes": window_minutes,
                "threshold": threshold_spins,
                "avg_spin_rate": f"{spin_count / window_minutes:.1f} spins/min"
            }
        )
    
    return None


def check_balance_drop(df: pd.DataFrame, window_minutes: int = 10, 
                       drop_threshold: float = 0.30) -> Optional[TiltAlert]:
    """
    Check if player's balance has dropped significantly in a time window.
    
    Tilt Rule: Balance dropped 30% in 10 minutes = tilt risk
    
    Args:
        df: DataFrame with session data
        window_minutes: Time window to check (default 10 minutes)
        drop_threshold: Percentage drop threshold (default 0.30 = 30%)
        
    Returns:
        TiltAlert if risk detected, None otherwise
    """
    if len(df) < 2:
        return None
    
    # Check most recent time window
    latest_time = df['timestamp'].max()
    window_start = latest_time - timedelta(minutes=window_minutes)
    recent_data = df[df['timestamp'] >= window_start]
    
    if len(recent_data) < 2:
        return None
    
    # Get starting and ending balance for the window
    start_balance = recent_data.iloc[0]['balance']
    end_balance = recent_data.iloc[-1]['balance']
    
    if start_balance <= 0:
        return None
    
    # Calculate percentage drop
    balance_change = start_balance - end_balance
    drop_percentage = balance_change / start_balance
    
    if drop_percentage >= drop_threshold:
        logger.warning(f"Significant balance drop detected: {drop_percentage*100:.1f}% in {window_minutes} minutes")
        
        return TiltAlert(
            alert_message=f"⚠️ Tilt Alert: Your balance is dropping quickly. Vault some winnings.",
            risk_level="HIGH",
            timestamp=datetime.now().isoformat(),
            details={
                "start_balance": float(start_balance),
                "end_balance": float(end_balance),
                "balance_lost": float(balance_change),
                "drop_percentage": f"{drop_percentage*100:.1f}%",
                "time_window_minutes": window_minutes,
                "threshold": f"{drop_threshold*100}%"
            }
        )
    
    return None


def check_all_tilt_conditions(df: pd.DataFrame) -> List[TiltAlert]:
    """
    Check all tilt detection rules against the session data.
    
    Args:
        df: DataFrame with session data
        
    Returns:
        List of TiltAlert objects for detected risks
    """
    alerts = []
    
    # Check rapid spinning
    rapid_spin_alert = check_rapid_spinning(df)
    if rapid_spin_alert:
        alerts.append(rapid_spin_alert)
    
    # Check balance drop
    balance_drop_alert = check_balance_drop(df)
    if balance_drop_alert:
        alerts.append(balance_drop_alert)
    
    logger.info(f"Tilt check complete: {len(alerts)} alerts detected")
    return alerts


def create_chat_message(alert: TiltAlert) -> ChatMessage:
    """
    Wrap a TiltAlert into a ChatMessage for the ASI Chat Protocol.
    
    Args:
        alert: TiltAlert object
        
    Returns:
        ChatMessage ready to be sent
    """
    return ChatMessage(
        message=alert.alert_message,
        timestamp=alert.timestamp,
        alert_type=alert.risk_level
    )


@tiltcheck_agent.on_event("startup")
async def startup_handler(ctx: Context):
    """
    Handler called when agent starts up.
    """
    logger.info("=" * 60)
    logger.info("TiltCheck Agent Started")
    logger.info("=" * 60)
    logger.info(f"Agent Address: {ctx.agent.address}")
    logger.info(f"Agent Name: {ctx.agent.name}")
    logger.info("Monitoring for tilt behavior...")
    logger.info("=" * 60)


@tiltcheck_agent.on_interval(period=30.0)
async def check_tilt_interval(ctx: Context):
    """
    Periodic interval handler to check for tilt conditions.
    Runs every 30 seconds to analyze session data.
    """
    logger.info("Running periodic tilt check...")
    
    # Load session data
    csv_file = "session_data.csv"
    df = load_csv_data(csv_file)
    
    if df is None:
        logger.warning(f"Could not load session data from {csv_file}")
        return
    
    # Check for tilt conditions
    alerts = check_all_tilt_conditions(df)
    
    # Send chat messages for each alert
    for alert in alerts:
        chat_msg = create_chat_message(alert)
        
        logger.info("=" * 60)
        logger.info("🚨 TILT ALERT DETECTED 🚨")
        logger.info(f"Message: {chat_msg.message}")
        logger.info(f"Risk Level: {alert.risk_level}")
        logger.info(f"Timestamp: {chat_msg.timestamp}")
        logger.info(f"Details: {alert.details}")
        logger.info("=" * 60)
        
        # In a real implementation, you would send this to other agents
        # using ctx.send() with the target agent's address
        # For demo purposes, we're logging it


@tiltcheck_agent.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    Handler for incoming chat messages.
    """
    logger.info(f"Received message from {sender}: {msg.message}")
    logger.info(f"Alert Type: {msg.alert_type} | Timestamp: {msg.timestamp}")


def main():
    """
    Main entry point for the TiltCheck Agent.
    """
    logger.info("Starting TiltCheck Agent...")
    logger.info("Press Ctrl+C to stop the agent")
    
    # Run the agent
    tiltcheck_agent.run()


if __name__ == "__main__":
    main()
