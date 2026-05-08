import { loadPreset, listPresets } from '../presets.js';
import { colors } from '../colors.js';

export function list() {
  const presets = listPresets();

  console.log(colors.bold('Available presets:'));
  console.log('');

  for (const name of presets) {
    const preset = loadPreset(name);
    console.log(`  ${colors.cyan(name.padEnd(12))} ${preset.description}`);
  }

  console.log('');
  console.log(`Usage: spup init <preset>`);
}
