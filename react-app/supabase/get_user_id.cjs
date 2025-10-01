// Get the actual user ID from database
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

async function executeSQL(query) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const result = await response.text();
  return { status: response.status, result };
}

async function getUserId() {
  console.log('🔍 Getting User IDs from Database\n');
  console.log('=' .repeat(50));

  const query = `
    SELECT id, email, name, created_at
    FROM public.users
    ORDER BY created_at DESC
    LIMIT 5;
  `;

  const { status, result } = await executeSQL(query);

  if (status === 200 || status === 201) {
    try {
      const users = JSON.parse(result);
      if (users && users.length > 0) {
        console.log(`Found ${users.length} user(s):\n`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. User Details:`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Created: ${user.created_at}`);
          console.log(`\n   📱 Card URL:`);
          console.log(`   http://localhost:5175/card/${user.id}`);
          console.log('   ' + '-'.repeat(45));
        });

        if (users[0]) {
          console.log(`\n✅ To view the most recent user's card:`);
          console.log(`   http://localhost:5175/card/${users[0].id}`);
        }
      } else {
        console.log('No users found.');
      }
    } catch (e) {
      console.log('Result:', result);
    }
  } else {
    console.log('Error fetching users. Status:', status);
  }
}

getUserId().catch(console.error);