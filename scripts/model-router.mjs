#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

async function loadLocalEnvironment(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const cleaned = line.trim();
      if (!cleaned || cleaned.startsWith('#')) continue;

      const match = cleaned.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      const value = rawValue.replace(/^(['"])(.*)\1$/, '$2').trim();
      process.env[key] = value;
    }
  } catch {
    // Local secret file is optional and intentionally outside version control.
  }
}

await loadLocalEnvironment(path.join(workspaceRoot, '.env.local'));

const configPath = path.join(workspaceRoot, 'config', 'model-routing.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

const availableAccounts = config.accounts.map((account) => ({
  ...account,
  present: Boolean(process.env[account.envVar])
}));

const requestedText = process.argv.slice(2).join(' ').trim().toLowerCase();

function pickRoute(text) {
  const taskText = text || config.defaultRoute;

  if (/debug|error|trace|test|verify|lint|check/.test(taskText)) {
    return 'debug-and-verification';
  }

  if (/doc|readme|write|garden|essay|copy|story|poem|prose/.test(taskText)) {
    return 'docs-and-garden';
  }

  return config.defaultRoute;
}

function mask(value) {
  if (!value) return 'not-set';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

const routeName = pickRoute(requestedText);
const route = config.routes[routeName];
const preferredAccount = config.accounts.find((a) => a.envVar === route.preferredAccount) || config.accounts[0];
const fallback = config.accounts.filter((a) => a.envVar !== route.preferredAccount)
  .find((account) => Boolean(process.env[account.envVar])) ?? null;

const status = {
  routeName,
  routeDescription: route.description,
  primaryProvider: route.primaryProvider,
  primaryModel: route.primaryModel,
  fallbackProviders: route.fallbackProviders,
  preferredAccount: preferredAccount.name,
  preferredAccountEnv: preferredAccount.envVar,
  preferredAccountStatus: Boolean(process.env[preferredAccount.envVar]) ? 'available' : 'missing',
  alternateAccount: fallback ? { name: fallback.name, envVar: fallback.envVar, status: 'available' } : null,
  availableAccounts: availableAccounts.map((account) => ({
    name: account.name,
    envVar: account.envVar,
    role: account.role,
    present: account.present,
    maskedValue: mask(process.env[account.envVar])
  })),
  providerRoutingStrategy: config.strategy,
  recommendation: 'Use the first available OpenCode Zen account for frontend design/dev work, then fall back to the other accounts for docs, debugging, and verification.'
};

console.log(JSON.stringify(status, null, 2));
