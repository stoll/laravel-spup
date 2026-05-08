import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { colors, processColor } from '../colors.js';

export function start() {
  const configPath = path.join(process.cwd(), 'spup.json');

  if (!fs.existsSync(configPath)) {
    console.error(colors.red('No spup.json found in this directory.'));
    console.log('Run "spup init <preset>" first.');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    console.error(colors.red('Failed to parse spup.json.'));
    process.exit(1);
  }

  if (!config.processes || config.processes.length === 0) {
    console.error(colors.red('No processes defined in spup.json.'));
    process.exit(1);
  }

  const maxNameLen = Math.max(...config.processes.map(p => p.name.length));

  console.log(colors.bold(`Spinning up ${config.name || 'project'}...`));
  console.log('');

  const children = [];

  for (let i = 0; i < config.processes.length; i++) {
    const proc = config.processes[i];
    const color = processColor(i);
    const label = proc.name.padEnd(maxNameLen);

    const child = spawn(proc.command, {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: proc.cwd ? path.resolve(proc.cwd) : process.cwd(),
      env: { ...process.env, ...(proc.env || {}), FORCE_COLOR: '1' },
    });

    const prefix = color(`[${label}]`);

    const prefixLines = (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`${prefix} ${line}`);
        }
      }
    };

    child.stdout.on('data', prefixLines);
    child.stderr.on('data', prefixLines);

    child.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.log(`${prefix} ${colors.red(`exited with code ${code}`)}`);
      } else {
        console.log(`${prefix} ${colors.dim('stopped')}`);
      }

      // If all children have exited, exit the parent
      if (children.every(c => c.exitCode !== null)) {
        process.exit(1);
      }
    });

    children.push(child);
    console.log(`${prefix} ${colors.dim(proc.command)}`);
  }

  console.log('');
  console.log(colors.dim('Press Ctrl+C to stop all processes.'));

  // Forward SIGINT/SIGTERM to all children
  const shutdown = (signal) => {
    console.log('');
    console.log(colors.dim('Shutting down...'));
    for (const child of children) {
      if (child.exitCode === null) {
        child.kill(signal);
      }
    }
    // Give processes a moment to clean up, then force exit
    setTimeout(() => process.exit(0), 2000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
