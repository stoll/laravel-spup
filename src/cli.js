import { init } from './commands/init.js';
import { start } from './commands/start.js';
import { list } from './commands/list.js';

const HELP = `
spup - Start any project with one command.

Usage:
  spup init <preset>   Initialize spup.json with a preset
  spup start           Start all processes defined in spup.json
  spup list            List available presets
  spup help            Show this help message

Presets:
  laravel, next

Examples:
  spup init laravel
  spup start
`;

export function run(args) {
  const command = args[0];

  switch (command) {
    case 'init':
      return init(args[1]);
    case 'start':
      return start();
    case 'list':
      return list();
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "spup help" for usage.');
      process.exit(1);
  }
}
