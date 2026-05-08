// Minimal ANSI color helpers — zero dependencies

const esc = (code) => (str) => `\x1b[${code}m${str}\x1b[0m`;

export const colors = {
  red: esc('31'),
  green: esc('32'),
  yellow: esc('33'),
  blue: esc('34'),
  magenta: esc('35'),
  cyan: esc('36'),
  dim: esc('2'),
  bold: esc('1'),
};

const PROCESS_COLORS = [
  esc('36'), // cyan
  esc('33'), // yellow
  esc('35'), // magenta
  esc('32'), // green
  esc('34'), // blue
  esc('91'), // bright red
  esc('93'), // bright yellow
  esc('95'), // bright magenta
  esc('92'), // bright green
  esc('94'), // bright blue
];

export function processColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}
