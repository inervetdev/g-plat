# Database Query Skill

Execute PostgreSQL queries on Supabase database with proper connection handling.

## Usage

Invoke this skill when user needs to:
- Query database tables
- Check RLS policies
- Verify migrations
- Analyze data structure

## Connection Details

- **Host**: aws-0-ap-northeast-2.pooler.supabase.com
- **Port**: 6543
- **Database**: postgres
- **User**: postgres.anwwjowwrxdygqyhhckr

## Steps

1. Use psql client: `"C:\Program Files\PostgreSQL\17\bin\psql.exe"`
2. URL encode password special characters
3. Execute query with `-c` flag
4. Return results in formatted table

## Example

```bash
"C:\Program Files\PostgreSQL\17\bin\psql.exe" "postgresql://postgres.anwwjowwrxdygqyhhckr:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" -c "SELECT COUNT(*) FROM visitor_stats;"
```

## Safety

- READ operations only by default
- Ask user confirmation for UPDATE/DELETE
- Never expose passwords in output
