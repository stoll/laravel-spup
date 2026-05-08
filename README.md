# spup

Laravel process manager with a tabbed TUI. One command to start everything.

## Install

```bash
npm install -g spup
```

## Usage

### Initialize

```bash
cd ~/projects/my-laravel-app
spup init
```

Creates a `spup.json` with Laravel defaults:

```json
{
  "name": "my-laravel-app",
  "processes": [
    { "name": "serve", "command": "php artisan serve" },
    { "name": "vite", "command": "npm run dev" },
    { "name": "queue", "command": "php artisan queue:work" },
    { "name": "logs", "command": "tail -f storage/logs/laravel.log" },
    { "name": "schedule", "command": "php artisan schedule:work" }
  ]
}
```

### Start

```bash
spup start
```

Opens a full-screen tabbed UI where each process has its own tab with dedicated output.

### Navigation

| Key | Action |
|-----|--------|
| `1`-`9` | Switch to tab by number |
| `Tab` | Next tab |
| `Shift+Tab` | Previous tab |
| `↑` / `↓` | Scroll output |
| `PgUp` / `PgDn` | Scroll by page |
| `q` / `Ctrl+C` | Quit all processes |

## Configuration

Edit `spup.json` to customize. Each process supports:

- `name` — Tab label
- `command` — The command to run
- `cwd` — Working directory (optional)
- `env` — Environment variables (optional)

## License

MIT
