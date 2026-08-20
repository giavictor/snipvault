# SnipVault

A lightweight command-line code-snippet manager built with TypeScript. Add, list, search, view, and remove code snippets, all persisted to a local JSON file.
> ⚠️ This is a CLI-based application and does not have a live web deployment.

## Features

- Add snippets with a title, language, tags, and code body
- List all snippets, optionally filtered by tag or language
- Search across title, tags, and code body
- View a single snippet in full
- Remove a snippet by ID
- Data persists across runs in `data/snippets.json`
- Graceful error handling for missing commands, invalid IDs, and missing data files

## Tech Stack

- TypeScript
- Node.js
- `fs/promises` for file-based persistence
- [tsx](https://github.com/privatenumber/tsx) for running TypeScript directly, no build step required

## Installation

```bash
git clone https://github.com/giavictor/snipvault.git
cd snipvault
npm install
```

## Usage

All commands are run via `npx tsx src/index.ts <command>`.

### Add a snippet

```bash
npx tsx src/index.ts add \
  --title "Binary Search" \
  --lang javascript \
  --tags dsa,search \
  --body "function binarySearch() {}"
```

```
Snippet added successfully.
ID: f371a929
```

`--title`, `--lang`, and `--body` are required. `--tags` is optional and accepts a comma-separated list.

### List snippets

```bash
npx tsx src/index.ts list
```

```
4c8984f8	Merge Sort	javascript	dsa, sorting
f371a929	Binary Search	javascript	dsa, search
```

Filter by tag or language:

```bash
npx tsx src/index.ts list --tag dsa
npx tsx src/index.ts list --lang javascript
```

### Search snippets

Matches against title, tags, and code body:

```bash
npx tsx src/index.ts search binary
```

```
f371a929	Binary Search	javascript	dsa, search
```

### Show a snippet

```bash
npx tsx src/index.ts show f371a929
```

```
ID: f371a929
Title: Binary Search
Language: javascript
Tags: dsa, search

function binarySearch() {}
```

### Remove a snippet

```bash
npx tsx src/index.ts remove f371a929
```

```
Snippet f371a929 removed successfully.
```

## Error Handling

- Running with no command prints usage instructions instead of crashing.
- `show`/`remove` with an ID that doesn't exist returns `Error: Snippet with ID <id> not found.`
- `search` with no query returns `Error: Search query is required.`
- If `data/snippets.json` is missing, SnipVault treats the vault as empty rather than crashing, and recreates the file on the next write.

> **Note on IDs:** snippet IDs are randomly generated 8-character hex strings (not sequential numbers), so an ID like `abc` will simply return a "not found" error rather than a separate "invalid format" error.

## Storage

Snippets are stored as a JSON array in `data/snippets.json`:

```json
{
  "id": "f371a929",
  "title": "Binary Search",
  "language": "javascript",
  "tags": ["dsa", "search"],
  "code": "function binarySearch() {}",
  "createdAt": "2026-08-20T11:39:47.105Z"
}
```

## Demo

<img width="640" height="352" alt="demo (1)" src="https://github.com/user-attachments/assets/1ca945b2-a304-4521-b5ec-c393cd0fd3f2" />


## Project Structure

```
snipvault/
├── src/
│   ├── index.ts    # CLI argument parsing and command handling
│   ├── store.ts    # Persistence layer (load/save/add/search/remove)
│   └── types.ts    # Snippet type definition
├── data/
│   └── snippets.json
├── package.json
├── tsconfig.json
└── README.md
```
