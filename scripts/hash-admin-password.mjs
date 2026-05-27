#!/usr/bin/env node
// Small helper to print the SHA-256 hex hash for an admin password
// Usage:
//   node scripts/hash-admin-password.mjs "your-strong-password"
//   echo -n "your-strong-password" | node scripts/hash-admin-password.mjs

import { createHash } from 'node:crypto';

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
};

async function main() {
  let pwd = process.argv[2];
  if (!pwd) {
    const fromStdin = (await readStdin()).trim();
    if (fromStdin) pwd = fromStdin;
  }
  if (!pwd) {
    console.error('Usage: node scripts/hash-admin-password.mjs "your-strong-password"');
    process.exit(1);
  }
  const hash = createHash('sha256').update(pwd).digest('hex');
  console.log(hash);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
