import fs from 'node:fs';
import path from 'node:path';
import { colors } from '../colors.js';

const DEFAULT_PROCESSES = [
  { name: 'serve', command: 'php artisan serve' },
  { name: 'vite', command: 'npm run dev' },
  { name: 'queue', command: 'php artisan queue:work' },
  { name: 'logs', command: 'tail -f storage/logs/laravel.log' },
  { name: 'schedule', command: 'php artisan schedule:work' },
];

export function init() {
  const targetPath = path.join(process.cwd(), 'spup.json');

  if (fs.existsSync(targetPath)) {
    console.error(colors.yellow('spup.json already exists in this directory.'));
    console.log('Delete it first if you want to re-initialize.');
    process.exit(1);
  }

  // Check if this looks like a Laravel project
  const artisanExists = fs.existsSync(path.join(process.cwd(), 'artisan'));
  if (!artisanExists) {
    console.error(colors.yellow('Warning: No artisan file found. Are you in a Laravel project?'));
  }

  const projectName = path.basename(process.cwd());

  const config = {
    name: projectName,
    processes: DEFAULT_PROCESSES,
  };

  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + '\n');

  console.log(colors.green('Initialized spup.json'));
  console.log('');
  console.log('Processes:');
  for (const proc of config.processes) {
    console.log(`  ${colors.cyan(proc.name.padEnd(12))} ${proc.command}`);
  }
  console.log('');
  console.log(`Edit spup.json to add/remove processes, then run ${colors.bold('spup start')}.`);
}
