#!/usr/bin/env python
"""
Test script to debug Google Sheets connection
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lokmitra_backend.settings')
django.setup()

from api.utils import fetch_google_sheet_as_df

# Test with a sample public sheet (Google's example sheet)
sample_sheet_id = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

print("Testing Google Sheets connection...")
print(f"Sheet ID: {sample_sheet_id}")
print("-" * 50)

try:
    df, columns = fetch_google_sheet_as_df(sample_sheet_id)
    print(f"\n✅ SUCCESS!")
    print(f"Rows: {len(df)}")
    print(f"Columns: {columns}")
    print(f"\nFirst 3 rows:")
    print(df.head(3))
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
