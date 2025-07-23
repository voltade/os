#!/usr/bin/env bun

import { SignJWT } from 'jose';

const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
};

const generateSupabaseKeys = async (secret: string) => {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  // Common payload fields
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 10 * 365 * 24 * 60 * 60; // 10 years

  // Generate service role key
  const servicePayload = {
    iss: 'supabase',
    iat,
    exp,
    aud: 'authenticated',
    role: 'service_role',
  };

  const serviceKey = await new SignJWT(servicePayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);

  // Generate anon key
  const anonPayload = {
    iss: 'supabase',
    iat,
    exp,
    aud: 'authenticated',
    role: 'anon',
  };

  const anonKey = await new SignJWT(anonPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);

  return { serviceKey, anonKey };
};

const main = async () => {
  console.log('🔑 Supabase JWT Key Generator\n');

  const secret = await prompt('Enter your JWT secret: ');

  if (!secret) {
    console.error('❌ JWT secret is required');
    process.exit(1);
  }

  try {
    console.log('\n🔄 Generating keys...\n');

    const { serviceKey, anonKey } = await generateSupabaseKeys(secret);

    console.log('✅ Keys generated successfully!\n');
    console.log('📋 Service Role Key (full database access):');
    console.log(`SUPABASE_SERVICE_ROLE_KEY="${serviceKey}"\n`);

    console.log('📋 Anon Key (public access):');
    console.log(`SUPABASE_ANON_KEY="${anonKey}"\n`);

    console.log('💡 Copy these to your .env file');
  } catch (error) {
    console.error('❌ Error generating keys:', error);
    process.exit(1);
  }

  process.exit(0);
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

main().catch(console.error);
