#!/usr/bin/env node
/**
 * Execute RLS Policy Fix for business_cards table
 * This script reads FIX_RLS_POLICIES.sql and prints instructions for manual execution
 */

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'FIX_RLS_POLICIES.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║         RLS Policy Fix for business_cards Table                           ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📋 SQL Script to Execute:');
console.log('');
console.log('─'.repeat(80));
console.log(sqlContent);
console.log('─'.repeat(80));
console.log('');
console.log('📍 How to Execute:');
console.log('');
console.log('   1. Open Supabase Dashboard: https://supabase.com/dashboard');
console.log('   2. Select your project: anwwjowwrxdygqyhhckr');
console.log('   3. Navigate to: SQL Editor');
console.log('   4. Click "New Query"');
console.log('   5. Copy and paste the SQL above');
console.log('   6. Click "Run" button');
console.log('');
console.log('✨ Alternative: Direct Database URL');
console.log('');
console.log('   You can also execute this using psql:');
console.log('');
console.log('   psql "postgresql://postgres.anwwjowwrxdygqyhhckr:gPlat2024!Secure@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" < FIX_RLS_POLICIES.sql');
console.log('');
console.log('─'.repeat(80));
console.log('');
console.log('🔍 What this script does:');
console.log('');
console.log('   ✓ Drops duplicate "Anyone can view active business cards" policy');
console.log('   ✓ Recreates "Users can view own business cards" policy (SELECT)');
console.log('   ✓ Creates "Public can view active business cards" policy');
console.log('   ✓ Ensures "Users can create own business cards" policy (INSERT)');
console.log('   ✓ Ensures "Users can update own business cards" policy (UPDATE)');
console.log('   ✓ Ensures "Users can delete own business cards" policy (DELETE)');
console.log('');
console.log('─'.repeat(80));
console.log('');
console.log('💡 After execution, you should be able to:');
console.log('');
console.log('   • Create new business cards as an authenticated user');
console.log('   • View your own business cards');
console.log('   • Update and delete your own business cards');
console.log('   • Anyone can view active (published) business cards');
console.log('');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log('');