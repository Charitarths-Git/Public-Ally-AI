#!/usr/bin/env python
"""
Test LLM connection and invocation
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lokmitra_backend.settings')
django.setup()

print("Testing LLM Connection...")
print("=" * 50)

# Check if API key is set
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    print(f"✅ GEMINI_API_KEY found: {gemini_key[:10]}...{gemini_key[-4:]}")
else:
    print("❌ GEMINI_API_KEY not found in environment!")
    sys.exit(1)

print("\nInitializing LLM...")
try:
    from api.views import get_llm
    llm, structured_llm = get_llm()
    print("✅ LLM initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize LLM: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\nTesting simple LLM invocation...")
try:
    test_prompt = "Analyze this dataset: Columns: ['name', 'age']. Sample: name: John, age: 25"
    print(f"Prompt: {test_prompt}")
    print("\nCalling structured_llm.invoke()...")
    
    result = structured_llm.invoke(test_prompt)
    print(f"✅ LLM invocation successful!")
    print(f"Result type: {type(result)}")
    print(f"Result: {result}")
    
    if hasattr(result, 'summary'):
        print(f"Summary: {result.summary}")
    if hasattr(result, 'tool_name'):
        print(f"Tool name: {result.tool_name}")
        
except Exception as e:
    print(f"❌ LLM invocation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 50)
print("✅ All LLM tests passed!")
