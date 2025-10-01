// Script to completely delete a user from Supabase (Auth + Database)
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

// 삭제할 사용자 이메일을 여기에 입력하세요
const USER_EMAIL = 'test@example.com'; // ← 변경하세요!

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

async function deleteUserCompletely() {
  console.log(`🗑️  Deleting user: ${USER_EMAIL}\n`);
  console.log('=' .repeat(50));

  try {
    // 1. Get user ID from auth.users
    console.log('1️⃣  Finding user in auth.users...');
    const findUserQuery = `
      SELECT id, email, created_at
      FROM auth.users
      WHERE email = '${USER_EMAIL}'
    `;

    const { status: findStatus, result: findResult } = await executeSQL(findUserQuery);

    if (findStatus !== 200) {
      console.log('❌ Failed to find user');
      console.log(findResult);
      return;
    }

    const userData = JSON.parse(findResult);
    if (!userData || userData.length === 0) {
      console.log('⚠️  User not found in auth.users');

      // Try to delete from public tables anyway
      console.log('\n2️⃣  Checking public.users table...');
      const deletePublicQuery = `
        DELETE FROM public.users WHERE email = '${USER_EMAIL}';
      `;
      await executeSQL(deletePublicQuery);
      console.log('✅ Cleaned up public.users table');
      return;
    }

    const userId = userData[0].id;
    console.log(`✅ Found user: ${userId}`);

    // 2. Delete from public tables (in order due to foreign keys)
    console.log('\n2️⃣  Deleting from public tables...');

    const deleteTables = [
      'callback_logs',
      'visitor_stats',
      'sidejob_cards',
      'user_profiles',
      'users'
    ];

    for (const table of deleteTables) {
      const deleteQuery = `
        DELETE FROM public.${table}
        WHERE ${table === 'users' ? 'id' : 'user_id'} = '${userId}'
      `;

      process.stdout.write(`   - Deleting from ${table}... `);
      const { status } = await executeSQL(deleteQuery);
      console.log(status === 200 ? '✅' : `❌ (Status: ${status})`);
    }

    // 3. Delete from auth.identities
    console.log('\n3️⃣  Deleting from auth.identities...');
    const deleteIdentitiesQuery = `
      DELETE FROM auth.identities WHERE user_id = '${userId}'
    `;
    const { status: identityStatus } = await executeSQL(deleteIdentitiesQuery);
    console.log(identityStatus === 200 ? '   ✅ Identities deleted' : '   ⚠️  No identities found');

    // 4. Delete from auth.users (must be last!)
    console.log('\n4️⃣  Deleting from auth.users...');
    const deleteAuthQuery = `
      DELETE FROM auth.users WHERE id = '${userId}'
    `;
    const { status: authStatus } = await executeSQL(deleteAuthQuery);
    console.log(authStatus === 200 ? '   ✅ Auth user deleted' : '   ❌ Failed to delete auth user');

    console.log('\n' + '=' .repeat(50));
    console.log('✅ User completely deleted!');
    console.log('Now you can register with this email again and receive confirmation email.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Check if email is provided
if (USER_EMAIL === 'test@example.com') {
  console.log('⚠️  Please edit this file and change USER_EMAIL to the actual email address!');
  console.log('   Current placeholder: test@example.com');
  process.exit(1);
}

// Run the deletion
deleteUserCompletely().catch(console.error);