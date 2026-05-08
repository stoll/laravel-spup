import { colors } from './colors.js';

const ESC = '\x1b[';

const ansi = {
  enterAlt: '\x1b[?1049h',
  leaveAlt: '\x1b[?1049l',
  clearScreen: `${ESC}2J`,
  hideCursor: `${ESC}?25l`,
  showCursor: `${ESC}?25h`,
  moveTo: (row, col) => `${ESC}${row};${col}H`,
  clearLine: `${ESC}K`,
  reset: `${ESC}0m`,
  bold: `${ESC}1m`,
  dim: `${ESC}2m`,
  inverse: `${ESC}7m`,
  fg: {
    black: `${ESC}30m`,
    white: `${ESC}37m`,
    cyan: `${ESC}36m`,
    yellow: `${ESC}33m`,
    green: `${ESC}32m`,
    red: `${ESC}31m`,
    gray: `${ESC}90m`,
  },
  bg: {
    black: `${ESC}40m`,
    white: `${ESC}47m`,
    cyan: `${ESC}46m`,
    gray: `${ESC}100m`,
  },
};

export class TUI {
  constructor(tabs) {
    this.tabs = tabs; // [{ name, buffer: string[] }]
    this.activeTab = 0;
    this.scrollOffset = 0; // lines from bottom (0 = follow tail)
    this.cols = process.stdout.columns || 80;
    this.rows = process.stdout.rows || 24;
  }

  start() {
    process.stdout.write(ansi.enterAlt + ansi.hideCursor + ansi.clearScreen);

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (data) => this.handleInput(data));

    process.stdout.on('resize', () => {
      this.cols = process.stdout.columns;
      this.rows = process.stdout.rows;
      this.render();
    });

    this.render();
  }

  stop() {
    process.stdout.write(ansi.showCursor + ansi.leaveAlt);
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }

  appendToTab(index, text) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line !== '') {
        this.tabs[index].buffer.push(line);
        // Keep buffer at a reasonable size
        if (this.tabs[index].buffer.length > 5000) {
          this.tabs[index].buffer.splice(0, 1000);
        }
      }
    }
    if (index === this.activeTab) {
      this.render();
    }
  }

  setTabStatus(index, status) {
    this.tabs[index].status = status;
    this.render();
  }

  handleInput(data) {
    const key = data.toString();

    // Ctrl+C or q
    if (key === '\x03' || key === 'q') {
      this.onQuit?.();
      return;
    }

    // Tab key
    if (key === '\t') {
      this.activeTab = (this.activeTab + 1) % this.tabs.length;
      this.scrollOffset = 0;
      this.render();
      return;
    }

    // Shift+Tab
    if (key === '\x1b[Z') {
      this.activeTab = (this.activeTab - 1 + this.tabs.length) % this.tabs.length;
      this.scrollOffset = 0;
      this.render();
      return;
    }

    // Number keys 1-9
    const num = parseInt(key);
    if (num >= 1 && num <= this.tabs.length) {
      this.activeTab = num - 1;
      this.scrollOffset = 0;
      this.render();
      return;
    }

    // Arrow up / scroll up
    if (key === '\x1b[A' || key === 'k') {
      const tab = this.tabs[this.activeTab];
      const contentHeight = this.rows - 4; // tab bar + status bar + borders
      const maxScroll = Math.max(0, tab.buffer.length - contentHeight);
      this.scrollOffset = Math.min(this.scrollOffset + 1, maxScroll);
      this.render();
      return;
    }

    // Arrow down / scroll down
    if (key === '\x1b[B' || key === 'j') {
      this.scrollOffset = Math.max(0, this.scrollOffset - 1);
      this.render();
      return;
    }

    // Page up
    if (key === '\x1b[5~') {
      const tab = this.tabs[this.activeTab];
      const contentHeight = this.rows - 4;
      const maxScroll = Math.max(0, tab.buffer.length - contentHeight);
      this.scrollOffset = Math.min(this.scrollOffset + contentHeight, maxScroll);
      this.render();
      return;
    }

    // Page down
    if (key === '\x1b[6~') {
      const contentHeight = this.rows - 4;
      this.scrollOffset = Math.max(0, this.scrollOffset - contentHeight);
      this.render();
      return;
    }

    // Home — scroll to top
    if (key === '\x1b[H' || key === 'g') {
      const tab = this.tabs[this.activeTab];
      const contentHeight = this.rows - 4;
      this.scrollOffset = Math.max(0, tab.buffer.length - contentHeight);
      this.render();
      return;
    }

    // End — scroll to bottom
    if (key === '\x1b[F' || key === 'G') {
      this.scrollOffset = 0;
      this.render();
      return;
    }
  }

  render() {
    const out = [];
    out.push(ansi.moveTo(1, 1));

    // Tab bar
    out.push(this.renderTabBar());

    // Separator
    out.push(ansi.moveTo(2, 1));
    out.push(ansi.fg.gray + '─'.repeat(this.cols) + ansi.reset);

    // Content area
    const contentHeight = this.rows - 4;
    const tab = this.tabs[this.activeTab];
    const buffer = tab.buffer;

    const end = buffer.length - this.scrollOffset;
    const start = Math.max(0, end - contentHeight);
    const visible = buffer.slice(start, end);

    for (let i = 0; i < contentHeight; i++) {
      out.push(ansi.moveTo(i + 3, 1));
      out.push(ansi.clearLine);
      if (i < visible.length) {
        const line = visible[i];
        // Truncate to terminal width (accounting for ANSI codes is hard, so just cap it)
        out.push(line.length > this.cols ? line.substring(0, this.cols) : line);
      }
    }

    // Bottom separator
    out.push(ansi.moveTo(this.rows - 1, 1));
    out.push(ansi.fg.gray + '─'.repeat(this.cols) + ansi.reset);

    // Status bar
    out.push(ansi.moveTo(this.rows, 1));
    out.push(ansi.clearLine);
    out.push(this.renderStatusBar());

    process.stdout.write(out.join(''));
  }

  renderTabBar() {
    let bar = '';
    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      const label = ` ${i + 1}:${tab.name} `;

      if (i === this.activeTab) {
        bar += `${ansi.bold}${ansi.inverse}${label}${ansi.reset}`;
      } else {
        const statusColor = tab.status === 'running' ? ansi.fg.green
          : tab.status === 'stopped' ? ansi.fg.red
          : ansi.fg.gray;
        bar += `${statusColor}${label}${ansi.reset}`;
      }
      bar += ' ';
    }
    return bar + ansi.clearLine;
  }

  renderStatusBar() {
    const tab = this.tabs[this.activeTab];
    const status = tab.status || 'starting';
    const statusColor = status === 'running' ? ansi.fg.green
      : status === 'stopped' ? ansi.fg.red
      : ansi.fg.yellow;

    const left = `${statusColor}● ${status}${ansi.reset} ${ansi.dim}${tab.command}${ansi.reset}`;
    const right = `${ansi.dim}Tab/1-${this.tabs.length}: switch  ↑↓: scroll  q: quit${ansi.reset}`;

    return left + ansi.clearLine + ansi.moveTo(this.rows, Math.max(1, this.cols - 45)) + right;
  }
}
