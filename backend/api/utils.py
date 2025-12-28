import requests
import re
import pandas as pd

def deploy_supabase_edge_logic(db_details, user_access_token):
    # 1. ROBUST PROJECT REF EXTRACTION
    # Handles: 'db.abc.supabase.co', 'abc.supabase.co', or just 'abc'
    host = db_details.get('host', '').replace('https://', '').replace('http://', '')
    parts = host.split('.')
    
    if len(parts) > 1:
        # If host starts with 'db.', the ref is the second part
        project_ref = parts[1] if parts[0] == 'db' else parts[0]
    else:
        project_ref = host # Fallback if user just entered the ID

    # 2. SANITIZE FUNCTION SLUG (Critical for Supabase API)
    # Slugs must be lowercase, numbers, and hyphens only. No underscores.
    raw_name = db_details.get('name', 'query_tool')
    function_slug = re.sub(r'[^a-z0-9]+', '-', raw_name.lower()).strip('-')

    # 3. CLEAN HOSTNAME FOR THE EDGE FUNCTION
    # The Edge Function code needs the DB host without https://
    clean_hostname = host.split('/')[0]

    # 4. DYNAMIC SQL QUERY LOGIC
    # Since you are testing MCD Garbage Data, we search relevant columns
    table = db_details['table_name']
    
    edge_code = f"""
import {{ serve }} from "https://deno.land/std@0.131.0/http/server.ts"
import {{ Client }} from "https://deno.land/x/postgres@v0.14.2/mod.ts"

const config = {{
  user: "{db_details['username']}",
  hostname: "{clean_hostname}",
  password: "{db_details['password']}",
  port: {db_details['port']},
  database: "{db_details['database']}",
}};

serve(async (req) => {{
  try {{
    const {{ message }} = await req.json();
    const toolCall = message.toolCalls[0];
    const searchQuery = toolCall.function.arguments.search_query;

    const client = new Client(config);
    await client.connect();

    // Use a broad search for MCD data (region, ward, vehicle, driver)
    const result = await client.queryObject(
      `SELECT * FROM {table} 
       WHERE region_zone ILIKE $1 
       OR ward_name ILIKE $1 
       OR vehicle_no ILIKE $1 
       OR driver_name ILIKE $1 
       LIMIT 3`,
      [`%${{searchQuery}}%`]
    );
    
    await client.end();

    return new Response(
      JSON.stringify({{
        results: [{{
          toolCallId: toolCall.id,
          result: JSON.stringify(result.rows)
        }}]
      }}),
      {{ headers: {{ "Content-Type": "application/json" }} }}
    );
  }} catch (err) {{
    return new Response(JSON.stringify({{ error: err.message }}), {{ status: 500 }});
  }}
}})
"""

    # 5. DEPLOYMENT CALL
    mgmt_headers = {
        "Authorization": f"Bearer {user_access_token}",
        "Content-Type": "application/json"
    }
    
    # Supabase Management API URL
    deploy_url = f"https://api.supabase.com/v1/projects/{project_ref}/functions"
    
    payload = {
        "slug": function_slug,
        "name": function_slug.replace('-', ' ').title(),
        "verify_jwt": False,
        "import_map": True,
        "body": edge_code
    }

    # First attempt: POST to create
    res = requests.post(deploy_url, json=payload, headers=mgmt_headers)
    
    # Second attempt: PATCH if it already exists (409 Conflict)
    if res.status_code == 409:
        res = requests.patch(f"{deploy_url}/{function_slug}", json=payload, headers=mgmt_headers)

    if res.status_code in [200, 201]:
        return f"https://{project_ref}.supabase.functions.co/{function_slug}"
    else:
        # Debugging the exact error from Supabase
        error_json = res.json()
        print(f"❌ Deployment Failed for {project_ref}. API Response: {error_json}")
        raise Exception(f"Supabase Deployment Error: {error_json.get('message', 'Unknown Error')}")
    


def fetch_google_sheet_as_df(spreadsheet_id):
    """
    Reads a public or 'anyone with link' Google Sheet into a Pandas DataFrame.
    """
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv"
    df = pd.read_csv(url)
    # Clean up empty columns or rows
    df = df.dropna(how='all', axis=1).dropna(how='all', axis=0)
    return df, df.columns.tolist()