#!/usr/bin/env python3
"""
TiltCheck Agent Registration Script

This script registers the TiltCheck agent with Agentverse for discoverability
and enables integration with the ASI Chat Protocol.

Requirements:
- AGENTVERSE_KEY: Your Agentverse API key
- AGENT_SEED_PHRASE: Your agent's seed phrase

Environment Variables:
Set these in your environment or .env file before running this script.
"""

import os
import logging
from uagents_core.utils.registration import (
    register_chat_agent,
    RegistrationRequestCredentials,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def register_tiltcheck_agent():
    """
    Register the TiltCheck agent with Agentverse.
    
    This function registers the agent at the endpoint https://tiltcheck.it.com/agent
    and enables it for ASI Chat Protocol communication.
    """
    try:
        # Validate environment variables
        agentverse_key = os.environ.get("AGENTVERSE_KEY")
        agent_seed = os.environ.get("AGENT_SEED_PHRASE")
        
        if not agentverse_key:
            raise ValueError("AGENTVERSE_KEY environment variable is not set")
        
        if not agent_seed:
            raise ValueError("AGENT_SEED_PHRASE environment variable is not set")
        
        logger.info("Starting TiltCheck agent registration...")
        logger.info("Agent Name: TiltCheck")
        logger.info("Endpoint: https://tiltcheck.it.com/agent")
        
        # Register the chat agent
        register_chat_agent(
            "TiltCheck",
            "https://tiltcheck.it.com/agent",
            active=True,
            credentials=RegistrationRequestCredentials(
                agentverse_api_key=agentverse_key,
                agent_seed_phrase=agent_seed,
            ),
        )
        
        logger.info("=" * 70)
        logger.info("✅ TiltCheck agent successfully registered with Agentverse!")
        logger.info("=" * 70)
        logger.info("Your agent is now:")
        logger.info("  - Discoverable on Agentverse")
        logger.info("  - Enabled for ASI Chat Protocol")
        logger.info("  - Available at: https://tiltcheck.it.com/agent")
        logger.info("=" * 70)
        
    except ValueError as ve:
        logger.error(f"❌ Configuration error: {ve}")
        logger.error("Please set the required environment variables:")
        logger.error("  - AGENTVERSE_KEY: Your Agentverse API key")
        logger.error("  - AGENT_SEED_PHRASE: Your agent's seed phrase")
        logger.error("\nYou can set these in:")
        logger.error("  1. Environment variables (export AGENTVERSE_KEY=...)")
        logger.error("  2. A .env file in the project directory")
        raise
    
    except Exception as e:
        logger.error(f"❌ Registration failed: {e}")
        logger.error("Please check:")
        logger.error("  - Your Agentverse API key is valid")
        logger.error("  - Your agent seed phrase is correct")
        logger.error("  - You have internet connectivity")
        logger.error("  - The Agentverse service is available")
        raise


def main():
    """Main entry point for the registration script"""
    logger.info("=" * 70)
    logger.info(" TiltCheck Agent - Agentverse Registration ")
    logger.info("=" * 70)
    
    try:
        register_tiltcheck_agent()
        logger.info("\n🎉 Registration complete!")
        logger.info("You can now use the TiltCheck agent in your applications.")
        
    except Exception:
        logger.error("\n❌ Registration failed. Please fix the errors above and try again.")
        return 1
    
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
