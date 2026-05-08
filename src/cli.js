import { init } from './commands/init.js';
import { start } from './commands/start.js';

const HELP = `
spup - Laravel process manager with a tabbed TUI.

Usage:
  spup init    Initialize spup.json with Laravel defaults
  spup start   Start all processes in a tabbed terminal UI
  spup help    Show this help message

Examples:
  spup init
  spup start

Navigation (during spup start):
  1-9          Switch to tab by number
  Tab          Next tab
  Shift+Tab    Previous tab
  q / Ctrl+C   Quit
`;

export function run(args) {
  const command = args[0];

  switch (command) {
    case 'init':
      return init();
    case 'start':
      return start();
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
