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
