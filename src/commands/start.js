import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { TUI } from '../tui.js';

export function start() {
  const configPath = path.join(process.cwd(), 'spup.json');

  if (!fs.existsSync(configPath)) {
    console.error('No spup.json found. Run "spup init" first.');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    console.error('Failed to parse spup.json.');
    process.exit(1);
  }

  if (!config.processes || config.processes.length === 0) {
    console.error('No processes defined in spup.json.');
    process.exit(1);
  }

  const tabs = config.processes.map((proc) => ({
    name: proc.name,
    command: proc.command,
    buffer: [],
    status: 'starting',
  }));

  const tui = new TUI(tabs);
  const children = [];

  for (let i = 0; i < config.processes.length; i++) {
    const proc = config.processes[i];

    const child = spawn(proc.command, {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: proc.cwd ? path.resolve(proc.cwd) : process.cwd(),
      env: { ...process.env, ...(proc.env || {}), FORCE_COLOR: '1' },
    });

    const handleData = (data) => {
      tui.appendToTab(i, data.toString());
    };

    child.stdout.on('data', handleData);
    child.stderr.on('data', handleData);

    child.on('spawn', () => {
      tui.setTabStatus(i, 'running');
    });

    child.on('error', (err) => {
      tui.appendToTab(i, `Error: ${err.message}`);
      tui.setTabStatus(i, 'stopped');
    });

    child.on('exit', (code) => {
      tui.appendToTab(i, code === 0 ? 'Process exited.' : `Process exited with code ${code}.`);
      tui.setTabStatus(i, 'stopped');
    });

    children.push(child);
  }

  const shutdown = () => {
    tui.stop();
    for (const child of children) {
      if (child.exitCode === null) {
        child.kill('SIGTERM');
      }
    }
    setTimeout(() => process.exit(0), 2000);
  };

  tui.onQuit = shutdown;
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  tui.start();
}
