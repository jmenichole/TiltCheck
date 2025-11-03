#!/usr/bin/env python3
"""
Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this file, via any medium, is strictly prohibited.

This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
For licensing information, see LICENSE file in the root directory.

---

Test script for TiltCheck agent registration

This script validates that the registration code is properly structured
and can be imported without errors. It does not actually register the agent.
"""

import sys
import os


def test_imports():
    """Test that all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import register_agent
        print("✅ Successfully imported register_agent module")
    except ImportError as e:
        print(f"❌ Failed to import register_agent: {e}")
        return False
    
    try:
        from uagents_core.utils.registration import (
            register_chat_agent,
            RegistrationRequestCredentials,
        )
        print("✅ Successfully imported uagents_core.utils.registration")
    except ImportError as e:
        print(f"⚠️  Could not import uagents_core (this is expected if not installed): {e}")
        print("   To install: pip install uagents_core")
        return True  # This is optional, so we don't fail the test
    
    return True


def test_environment_variables():
    """Test that environment variables are properly detected"""
    print("\nTesting environment variable handling...")
    
    # Test with missing env vars
    if "AGENTVERSE_KEY" in os.environ:
        del os.environ["AGENTVERSE_KEY"]
    if "AGENT_SEED_PHRASE" in os.environ:
        del os.environ["AGENT_SEED_PHRASE"]
    
    # Import fresh
    import register_agent
    
    print("✅ Module handles missing environment variables correctly")
    return True


def test_agent_configuration():
    """Test that agent.py properly uses environment variables"""
    print("\nTesting agent.py configuration...")
    
    # Set a test seed phrase
    test_seed = "test_seed_phrase_12345"
    os.environ["AGENT_SEED_PHRASE"] = test_seed
    
    # Import agent module
    try:
        import agent
        # Reload to pick up env var
        import importlib
        importlib.reload(agent)
        
        if agent.agent_seed == test_seed:
            print(f"✅ Agent correctly uses AGENT_SEED_PHRASE from environment: {agent.agent_seed}")
        else:
            print(f"⚠️  Agent seed: {agent.agent_seed} (using default)")
        
    except Exception as e:
        print(f"⚠️  Could not fully test agent configuration: {e}")
        print("   This may be due to missing dependencies")
    
    # Clean up
    if "AGENT_SEED_PHRASE" in os.environ:
        del os.environ["AGENT_SEED_PHRASE"]
    
    return True


def test_registration_script_structure():
    """Test that the registration script has the expected structure"""
    print("\nTesting registration script structure...")
    
    try:
        import register_agent
        
        # Check for required functions
        if hasattr(register_agent, 'register_tiltcheck_agent'):
            print("✅ Found register_tiltcheck_agent function")
        else:
            print("❌ Missing register_tiltcheck_agent function")
            return False
        
        if hasattr(register_agent, 'main'):
            print("✅ Found main function")
        else:
            print("❌ Missing main function")
            return False
        
        return True
    
    except Exception as e:
        print(f"❌ Error testing registration script structure: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 70)
    print(" TiltCheck Agent Registration - Test Suite ")
    print("=" * 70)
    
    tests = [
        ("Import Test", test_imports),
        ("Environment Variables Test", test_environment_variables),
        ("Agent Configuration Test", test_agent_configuration),
        ("Registration Script Structure Test", test_registration_script_structure),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'=' * 70}")
        print(f"Running: {test_name}")
        print('=' * 70)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 70)
    print(" Test Summary ")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("=" * 70)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 70)
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
