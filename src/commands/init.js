import fs from 'node:fs';
import path from 'node:path';
import { loadPreset, listPresets } from '../presets.js';
import { colors } from '../colors.js';

export function init(presetName) {
  if (!presetName) {
    console.error(colors.red('Missing preset name.'));
    console.log(`Available presets: ${listPresets().join(', ')}`);
    console.log('Usage: spup init <preset>');
    process.exit(1);
  }

  const preset = loadPreset(presetName);
  if (!preset) {
    console.error(colors.red(`Unknown preset: "${presetName}"`));
    console.log(`Available presets: ${listPresets().join(', ')}`);
    process.exit(1);
  }

  const targetPath = path.join(process.cwd(), 'spup.json');

  if (fs.existsSync(targetPath)) {
    console.error(colors.yellow('spup.json already exists in this directory.'));
    console.log('Delete it first if you want to re-initialize.');
    process.exit(1);
  }

  const projectName = path.basename(process.cwd());

  const config = {
    name: projectName,
    preset: presetName,
    processes: preset.processes,
  };

  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + '\n');

  console.log(colors.green(`Initialized spup.json with "${presetName}" preset.`));
  console.log('');
  console.log('Processes:');
  for (const proc of config.processes) {
    console.log(`  ${colors.cyan(proc.name.padEnd(12))} ${proc.command}`);
  }
  console.log('');
  console.log(`Run ${colors.bold('spup start')} to launch everything.`);
}
