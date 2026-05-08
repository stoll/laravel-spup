# spup

Start any project with one command. No more remembering what to run.

## Install

```bash
npm install -g spup
```

## Usage

### Initialize a project

```bash
cd ~/projects/my-laravel-app
spup init laravel
```

This creates a `spup.json` in your project root:

```json
{
  "name": "my-laravel-app",
  "preset": "laravel",
  "processes": [
    { "name": "server", "command": "php artisan serve" },
    { "name": "vite", "command": "npm run dev" },
    { "name": "queue", "command": "php artisan queue:work" },
    { "name": "logs", "command": "tail -f storage/logs/laravel.log" }
  ]
}
```

### Start everything

```bash
spup start
```

All processes run concurrently with colored, labeled output. Press `Ctrl+C` to stop everything.

### List available presets

```bash
spup list
```

## Presets

| Preset | Processes |
|--------|-----------|
| `laravel` | php artisan serve, npm run dev, queue worker, log tail |
| `next` | npm run dev |

## Custom configuration

Edit `spup.json` to add, remove, or modify processes. Each process supports:

- `name` — Label shown in the terminal
- `command` — The command to run
- `cwd` — Working directory (optional, useful for monorepos)
- `env` — Environment variables (optional)

## License

MIT
