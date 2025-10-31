#!/usr/bin/env python3
"""
Validation script for TiltCheck agent registration code

This script validates that the registration code is properly structured
without requiring uagents_core to be installed.
"""

import ast
import sys


def validate_python_syntax(filepath):
    """Validate Python syntax by parsing the file"""
    print(f"\nValidating Python syntax: {filepath}")
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        ast.parse(code)
        print(f"✅ Valid Python syntax")
        return True
    except SyntaxError as e:
        print(f"❌ Syntax error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def check_imports_in_file(filepath, required_imports):
    """Check that required imports are present in the file"""
    print(f"\nChecking imports in: {filepath}")
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        
        tree = ast.parse(code)
        found_imports = set()
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    found_imports.add(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    found_imports.add(node.module)
        
        all_found = True
        for required in required_imports:
            if required in found_imports or any(required in imp for imp in found_imports):
                print(f"  ✅ Found import: {required}")
            else:
                print(f"  ❌ Missing import: {required}")
                all_found = False
        
        return all_found
    except Exception as e:
        print(f"❌ Error checking imports: {e}")
        return False


def check_function_definitions(filepath, required_functions):
    """Check that required functions are defined in the file"""
    print(f"\nChecking function definitions in: {filepath}")
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        
        tree = ast.parse(code)
        found_functions = set()
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                found_functions.add(node.name)
        
        all_found = True
        for required in required_functions:
            if required in found_functions:
                print(f"  ✅ Found function: {required}")
            else:
                print(f"  ❌ Missing function: {required}")
                all_found = False
        
        return all_found
    except Exception as e:
        print(f"❌ Error checking functions: {e}")
        return False


def check_registration_call(filepath):
    """Check that register_chat_agent is called with correct parameters"""
    print(f"\nChecking register_chat_agent call in: {filepath}")
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        
        # Check for the expected call pattern
        if 'register_chat_agent(' in code:
            print(f"  ✅ Found register_chat_agent call")
        else:
            print(f"  ❌ Missing register_chat_agent call")
            return False
        
        if '"TiltCheck"' in code or "'TiltCheck'" in code:
            print(f"  ✅ Found agent name: TiltCheck")
        else:
            print(f"  ❌ Missing agent name")
            return False
        
        if 'https://tiltcheck.it.com/agent' in code:
            print(f"  ✅ Found correct endpoint: https://tiltcheck.it.com/agent")
        else:
            print(f"  ❌ Missing or incorrect endpoint")
            return False
        
        if 'AGENTVERSE_KEY' in code:
            print(f"  ✅ Uses AGENTVERSE_KEY environment variable")
        else:
            print(f"  ❌ Missing AGENTVERSE_KEY reference")
            return False
        
        if 'AGENT_SEED_PHRASE' in code:
            print(f"  ✅ Uses AGENT_SEED_PHRASE environment variable")
        else:
            print(f"  ❌ Missing AGENT_SEED_PHRASE reference")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error checking registration call: {e}")
        return False


def check_env_example():
    """Check that .env.example has the required variables"""
    print(f"\nChecking .env.example file")
    try:
        with open('.env.example', 'r') as f:
            content = f.read()
        
        if 'AGENTVERSE_KEY' in content:
            print(f"  ✅ Found AGENTVERSE_KEY in .env.example")
        else:
            print(f"  ❌ Missing AGENTVERSE_KEY in .env.example")
            return False
        
        if 'AGENT_SEED_PHRASE' in content:
            print(f"  ✅ Found AGENT_SEED_PHRASE in .env.example")
        else:
            print(f"  ❌ Missing AGENT_SEED_PHRASE in .env.example")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error checking .env.example: {e}")
        return False


def check_requirements():
    """Check that requirements.txt has the required packages"""
    print(f"\nChecking requirements.txt")
    try:
        with open('requirements.txt', 'r') as f:
            content = f.read()
        
        if 'uagents_core' in content:
            print(f"  ✅ Found uagents_core in requirements.txt")
        else:
            print(f"  ❌ Missing uagents_core in requirements.txt")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error checking requirements.txt: {e}")
        return False


def main():
    """Run all validation checks"""
    print("=" * 70)
    print(" TiltCheck Agent Registration - Code Validation ")
    print("=" * 70)
    
    results = []
    
    # Test 1: Validate register_agent.py syntax
    results.append(("register_agent.py syntax", validate_python_syntax("register_agent.py")))
    
    # Test 2: Check imports in register_agent.py
    results.append(("register_agent.py imports", check_imports_in_file(
        "register_agent.py",
        ["os", "logging", "uagents_core"]
    )))
    
    # Test 3: Check function definitions in register_agent.py
    results.append(("register_agent.py functions", check_function_definitions(
        "register_agent.py",
        ["register_tiltcheck_agent", "main"]
    )))
    
    # Test 4: Check registration call
    results.append(("register_chat_agent call", check_registration_call("register_agent.py")))
    
    # Test 5: Validate agent.py syntax
    results.append(("agent.py syntax", validate_python_syntax("agent.py")))
    
    # Test 6: Check agent.py imports os
    results.append(("agent.py imports", check_imports_in_file(
        "agent.py",
        ["os"]
    )))
    
    # Test 7: Check .env.example
    results.append((".env.example", check_env_example()))
    
    # Test 8: Check requirements.txt
    results.append(("requirements.txt", check_requirements()))
    
    # Print summary
    print("\n" + "=" * 70)
    print(" Validation Summary ")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("=" * 70)
    print(f"Results: {passed}/{total} checks passed")
    print("=" * 70)
    
    if passed == total:
        print("\n🎉 All validation checks passed!")
        print("\nThe registration code is properly structured and ready to use.")
        print("To complete registration:")
        print("  1. Install dependencies: pip install -r requirements.txt")
        print("  2. Set environment variables: AGENTVERSE_KEY and AGENT_SEED_PHRASE")
        print("  3. Run: python register_agent.py")
        return 0
    else:
        print(f"\n⚠️  {total - passed} check(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
