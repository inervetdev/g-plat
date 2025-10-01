#!/bin/bash
# Execute SQL via Supabase Management API
# This script uses the Supabase Management API to execute SQL statements

SUPABASE_ACCESS_TOKEN="sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb"
PROJECT_REF="anwwjowwrxdygqyhhckr"

# Read the SQL file and escape it for JSON
SQL_FILE="FIX_RLS_POLICIES.sql"

echo "🔧 Executing RLS Policy Fix via Supabase Management API..."
echo ""

# Remove comments and SELECT queries, split into individual statements
SQL_CONTENT=$(cat "$SQL_FILE" | \
    grep -v "^--" | \
    grep -v "^SELECT" | \
    sed '/SELECT/,/;/d' | \
    tr '\n' ' ' | \
    sed 's/  */ /g')

# Split by semicolon and execute each statement
IFS=';' read -ra STATEMENTS <<< "$SQL_CONTENT"

success_count=0
error_count=0
total=${#STATEMENTS[@]}

for i in "${!STATEMENTS[@]}"; do
    stmt="${STATEMENTS[$i]}"
    stmt=$(echo "$stmt" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    # Skip empty statements
    if [ -z "$stmt" ]; then
        continue
    fi

    echo "[$((i+1))/$total] Executing: ${stmt:0:80}..."

    # Escape the SQL for JSON
    sql_escaped=$(echo "$stmt" | sed 's/"/\\"/g' | tr '\n' ' ')

    # Execute via Management API
    response=$(curl -s -X POST \
        "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
        -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$sql_escaped\"}")

    if echo "$response" | grep -q "error"; then
        echo "❌ Error: $response"
        ((error_count++))
    else
        echo "✅ Success"
        ((success_count++))
    fi
    echo ""
done

echo "═══════════════════════════════════════════════════════════"
echo "📊 Execution Summary:"
echo "   ✅ Successful: $success_count"
echo "   ❌ Failed: $error_count"
echo "   📝 Total: $total"
echo "═══════════════════════════════════════════════════════════"

if [ $error_count -eq 0 ]; then
    echo ""
    echo "✅ All RLS policies have been successfully updated!"
    echo "   You can now create business cards in your application."
else
    echo ""
    echo "⚠️  Some statements failed. You may need to execute manually."
    echo "   Run: node execute-rls-fix.cjs"
    echo "   for detailed instructions."
fi