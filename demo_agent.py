#!/usr/bin/env python3
"""
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.

---

TiltCheck Agent Demo - Demonstrates tilt detection without running the full agent

This script shows how the TiltCheck Agent detects tilt conditions in gambling
session data. It loads sample CSV data and runs the tilt detection algorithms
without starting the uAgents framework (which would require network connectivity).
"""

import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TiltAlert:
    """Model for tilt alert information"""
    def __init__(self, alert_message: str, risk_level: str, timestamp: str, details: Dict):
        self.alert_message = alert_message
        self.risk_level = risk_level
        self.timestamp = timestamp
        self.details = details


def load_csv_data(filepath: str) -> Optional[pd.DataFrame]:
    """Load gambling session data from CSV file."""
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
    """Check if player has made too many spins in a short time window."""
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
    """Check if player's balance has dropped significantly in a time window."""
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


def display_alert(alert: TiltAlert):
    """Display a formatted alert"""
    print("=" * 70)
    print("🚨 TILT ALERT DETECTED 🚨")
    print("=" * 70)
    print(f"Message: {alert.alert_message}")
    print(f"Risk Level: {alert.risk_level}")
    print(f"Timestamp: {alert.timestamp}")
    print(f"\nDetails:")
    for key, value in alert.details.items():
        print(f"  - {key.replace('_', ' ').title()}: {value}")
    print("=" * 70)
    print()


def demo_tilt_detection(csv_file: str):
    """Run a demonstration of tilt detection"""
    print("\n" + "=" * 70)
    print("TiltCheck Agent - Tilt Detection Demo")
    print("=" * 70)
    print(f"Analyzing session data from: {csv_file}\n")
    
    # Load data
    df = load_csv_data(csv_file)
    if df is None:
        print("❌ Failed to load session data")
        return
    
    # Show session summary
    print("\n📊 Session Summary:")
    print(f"  - Total spins: {len(df)}")
    print(f"  - Time range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    duration = (df['timestamp'].max() - df['timestamp'].min()).total_seconds() / 60
    print(f"  - Session duration: {duration:.1f} minutes")
    print(f"  - Starting balance: ${df.iloc[0]['balance']:.2f}")
    print(f"  - Ending balance: ${df.iloc[-1]['balance']:.2f}")
    print(f"  - Total bet amount: ${df['bet_amount'].sum():.2f}")
    
    # Calculate overall stats
    wins = len(df[df['outcome'] == 'win'])
    losses = len(df[df['outcome'] == 'loss'])
    win_rate = (wins / len(df)) * 100 if len(df) > 0 else 0
    print(f"  - Win rate: {win_rate:.1f}% ({wins} wins, {losses} losses)")
    
    # Check for tilt conditions
    print("\n🔍 Checking for Tilt Conditions...\n")
    
    alerts = []
    
    # Check rapid spinning
    rapid_spin_alert = check_rapid_spinning(df)
    if rapid_spin_alert:
        alerts.append(rapid_spin_alert)
        display_alert(rapid_spin_alert)
    else:
        print("✅ Rapid spinning check: PASSED (spinning rate is healthy)")
    
    # Check balance drop
    balance_drop_alert = check_balance_drop(df)
    if balance_drop_alert:
        alerts.append(balance_drop_alert)
        display_alert(balance_drop_alert)
    else:
        print("✅ Balance drop check: PASSED (balance changes are within safe limits)")
    
    # Summary
    print("\n" + "=" * 70)
    if alerts:
        print(f"⚠️  {len(alerts)} TILT ALERT(S) DETECTED")
        print("Recommendation: Take a break and review your gameplay")
    else:
        print("✅ NO TILT DETECTED")
        print("Your gaming behavior appears healthy. Keep it up!")
    print("=" * 70)
    print()


def main():
    """Main entry point for the demo"""
    import os
    
    print("\n" + "=" * 70)
    print(" TiltCheck Agent - Responsible Gaming Tilt Detection ")
    print(" Using Fetch.ai uAgents Framework ")
    print("=" * 70)
    
    # Demo with the tilt example data that triggers both alerts
    csv_file = "session_data_both_alerts.csv"
    
    if not os.path.exists(csv_file):
        print(f"\n❌ File not found: {csv_file}")
        print("Please ensure the sample data file exists in the current directory.")
        return
    
    demo_tilt_detection(csv_file)
    
    print("\n💡 About This Demo:")
    print("   This demonstration shows the tilt detection algorithms in action.")
    print("   The full agent.py includes:")
    print("   - uAgents framework integration")
    print("   - ASI Chat Protocol messaging")
    print("   - Periodic monitoring (every 30 seconds)")
    print("   - Agentverse discoverability")
    print("\n   To run the full agent: python agent.py")
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()
