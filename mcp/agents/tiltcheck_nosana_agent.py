#!/usr/bin/env python3
"""
TiltCheck Nosana AI Agent

Integrates TiltCheck tilt detection with Nosana's decentralized compute network
and Solana blockchain for transparent, verifiable behavioral analysis.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from solana.rpc.api import Client
from solana.keypair import Keypair

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TiltCheckNosanaAgent:
    """
    TiltCheck agent running on Nosana compute network with Solana integration.
    
    This agent processes behavioral data through decentralized AI models,
    stores results on Solana, and provides verifiable tilt detection.
    """
    
    def __init__(self, solana_rpc_url: Optional[str] = None):
        """
        Initialize the Nosana agent.
        
        Args:
            solana_rpc_url: Solana RPC endpoint (defaults to devnet)
        """
        self.solana_rpc_url = solana_rpc_url or "https://api.devnet.solana.com"
        self.solana_client = Client(self.solana_rpc_url)
        
        # Load or generate keypair for signing
        wallet_path = os.environ.get("SOLANA_WALLET_PATH", "~/.config/solana/id.json")
        self.keypair = self._load_keypair(wallet_path)
        
        logger.info(f"TiltCheck Nosana Agent initialized")
        logger.info(f"Solana RPC: {self.solana_rpc_url}")
        logger.info(f"Public Key: {self.keypair.public_key if self.keypair else 'None'}")
    
    def _load_keypair(self, wallet_path: str) -> Optional[Keypair]:
        """Load Solana keypair from file or environment."""
        try:
            expanded_path = os.path.expanduser(wallet_path)
            if os.path.exists(expanded_path):
                with open(expanded_path, 'r') as f:
                    secret_key = json.load(f)
                return Keypair.from_secret_key(bytes(secret_key))
            else:
                logger.warning(f"Wallet file not found: {expanded_path}")
                return None
        except Exception as e:
            logger.error(f"Error loading keypair: {e}")
            return None
    
    def analyze_behavioral_data(self, session_data: Dict) -> Dict:
        """
        Analyze behavioral data for tilt detection.
        
        This method processes gambling session data through AI models
        running on Nosana compute nodes.
        
        Args:
            session_data: Dict containing session information
            
        Returns:
            Analysis results with tilt score and recommendations
        """
        logger.info(f"Analyzing behavioral data for session {session_data.get('session_id', 'unknown')}")
        
        # Extract key metrics
        bet_frequency = session_data.get('bet_frequency', 0)
        balance_volatility = session_data.get('balance_volatility', 0)
        session_duration = session_data.get('duration_minutes', 0)
        loss_streak = session_data.get('loss_streak', 0)
        
        # Calculate tilt score (0-100)
        # This is a simplified version - production would use Nosana AI models
        tilt_score = self._calculate_tilt_score(
            bet_frequency, balance_volatility, session_duration, loss_streak
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(tilt_score, session_data)
        
        # Prepare results
        result = {
            'session_id': session_data.get('session_id'),
            'timestamp': datetime.utcnow().isoformat(),
            'tilt_score': tilt_score,
            'risk_level': self._get_risk_level(tilt_score),
            'recommendations': recommendations,
            'metrics': {
                'bet_frequency': bet_frequency,
                'balance_volatility': balance_volatility,
                'session_duration': session_duration,
                'loss_streak': loss_streak
            }
        }
        
        # Store on Solana (in production)
        # self._store_on_solana(result)
        
        return result
    
    def _calculate_tilt_score(self, bet_freq: float, balance_vol: float, 
                             duration: float, loss_streak: int) -> float:
        """Calculate tilt score from behavioral metrics."""
        # Weighted scoring algorithm
        score = 0.0
        
        # High bet frequency increases tilt score
        if bet_freq > 50:  # more than 50 bets per hour
            score += 30
        elif bet_freq > 30:
            score += 15
        
        # High balance volatility
        if balance_vol > 0.5:  # 50% balance swings
            score += 25
        elif balance_vol > 0.3:
            score += 15
        
        # Extended sessions
        if duration > 120:  # over 2 hours
            score += 20
        elif duration > 60:
            score += 10
        
        # Loss streaks
        if loss_streak > 5:
            score += 25
        elif loss_streak > 3:
            score += 15
        
        return min(score, 100)  # Cap at 100
    
    def _get_risk_level(self, tilt_score: float) -> str:
        """Convert tilt score to risk level."""
        if tilt_score >= 70:
            return "HIGH"
        elif tilt_score >= 40:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_recommendations(self, tilt_score: float, session_data: Dict) -> List[str]:
        """Generate personalized recommendations based on tilt score."""
        recommendations = []
        
        if tilt_score >= 70:
            recommendations.append("🛑 STOP: Take a mandatory break for at least 30 minutes")
            recommendations.append("💰 Vault your remaining balance to prevent further losses")
            recommendations.append("🧘 Practice deep breathing or meditation")
        elif tilt_score >= 40:
            recommendations.append("⚠️ WARNING: Consider taking a 10-minute break")
            recommendations.append("📊 Review your session stats before continuing")
            recommendations.append("🎯 Switch to lower stakes or different game")
        else:
            recommendations.append("✅ You're playing well - stay focused")
            recommendations.append("📈 Keep tracking your sessions for insights")
        
        # Add specific recommendations based on metrics
        if session_data.get('loss_streak', 0) > 3:
            recommendations.append("🔄 Loss streak detected - vary your strategy")
        
        if session_data.get('duration_minutes', 0) > 90:
            recommendations.append("⏰ Long session - fatigue may affect judgment")
        
        return recommendations
    
    def _store_on_solana(self, result: Dict) -> Optional[str]:
        """
        Store analysis results on Solana blockchain.
        
        Returns transaction signature if successful.
        """
        # This would implement actual Solana transaction in production
        logger.info(f"Storing result on Solana for session {result.get('session_id')}")
        # Placeholder for Solana transaction
        return None
    
    def get_session_history(self, user_pubkey: str, limit: int = 10) -> List[Dict]:
        """
        Retrieve session history from Solana for a user.
        
        Args:
            user_pubkey: User's Solana public key
            limit: Maximum number of sessions to retrieve
            
        Returns:
            List of session analysis results
        """
        logger.info(f"Retrieving session history for {user_pubkey}")
        # Placeholder - would query Solana in production
        return []


def main():
    """Run the Nosana agent."""
    logger.info("Starting TiltCheck Nosana AI Agent...")
    
    # Initialize agent
    agent = TiltCheckNosanaAgent()
    
    # Example session data
    example_session = {
        'session_id': 'demo-001',
        'bet_frequency': 45,
        'balance_volatility': 0.35,
        'duration_minutes': 75,
        'loss_streak': 4
    }
    
    # Analyze
    result = agent.analyze_behavioral_data(example_session)
    
    # Display results
    print("\n" + "="*60)
    print("TiltCheck Nosana AI Agent - Analysis Result")
    print("="*60)
    print(f"Session ID: {result['session_id']}")
    print(f"Tilt Score: {result['tilt_score']}/100")
    print(f"Risk Level: {result['risk_level']}")
    print(f"\nRecommendations:")
    for rec in result['recommendations']:
        print(f"  {rec}")
    print("="*60)


if __name__ == "__main__":
    main()
