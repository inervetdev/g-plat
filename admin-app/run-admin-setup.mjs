import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzI4MTY5MywiZXhwIjoyMDQyODU3NjkzfQ.vR8vwKKNWFbNHnxWXCfPQvZSjPdTcC9cqFW0lFc5gNs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUsers() {
  console.log('🚀 Setting up admin_users table and super admin account...\n');

  try {
    // 슈퍼 관리자 계정 직접 생성
    console.log('Creating super admin account...');
    const adminEmail = 'admin@g-plat.com';
    const adminName = '슈퍼 관리자';

    const { data: existingAdmin, error: selectError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', adminEmail)
      .maybeSingle();

    if (selectError && !selectError.message.includes('relation "admin_users" does not exist')) {
      console.error('❌ Error checking existing admin:', selectError);
      return;
    }

    if (existingAdmin) {
      console.log('✅ Super admin account already exists:', adminEmail);
    } else {
      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert([
          {
            email: adminEmail,
            name: adminName,
            role: 'super_admin',
            is_active: true
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating admin:', insertError.message);
        if (insertError.message.includes('relation "admin_users" does not exist')) {
          console.log('\n⚠️  admin_users table does not exist!');
          console.log('Please run the SQL from setup_admin_users.sql in Supabase Dashboard first.\n');
        }
      } else {
        console.log('✅ Super admin created successfully!');
        console.log('   Email:', adminEmail);
        console.log('   Name:', adminName);
        console.log('   Role: super_admin');
      }
    }

    console.log('\n🎉 Admin setup complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Go to Supabase Dashboard → Authentication → Users');
    console.log('2. Click "Add user" → "Create new user"');
    console.log('3. Email: admin@g-plat.com');
    console.log('4. Password: (set your secure password)');
    console.log('5. Email Confirm: ON');
    console.log('6. Login at http://localhost:5174/login\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupAdminUsers();
