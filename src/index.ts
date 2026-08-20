import {
  addSnippet,
  listSnippets,
  searchSnippets,
  getSnippet,
  removeSnippet,
} from "./store.js";

function printUsage(): void {
  console.log(`Usage: snipvault <command>

Commands:
  add
  list
  search <query>
  show <id>
  remove <id>`);
}

/** Parses simple --flag value pairs out of an argv slice. */
function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      flags[key] = value ?? "";
      i++;
    }
  }
  return flags;
}

async function handleAdd(args: string[]): Promise<void> {
  const flags = parseFlags(args);

  if (!flags.title || !flags.lang || !flags.body) {
    console.log(
      "Error: --title, --lang, and --body are required (--tags is optional)."
    );
    return;
  }

  const tags = flags.tags
    ? flags.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const snippet = await addSnippet({
    title: flags.title,
    language: flags.lang,
    tags,
    code: flags.body,
  });

  console.log("Snippet added successfully.");
  console.log(`ID: ${snippet.id}`);
}

async function handleList(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const snippets = await listSnippets({ tag: flags.tag, lang: flags.lang });

  if (snippets.length === 0) {
    console.log("No snippets found.");
    return;
  }

  for (const s of snippets) {
    console.log(
      `${s.id}\t${s.title}\t${s.language}\t${s.tags.join(", ")}`
    );
  }
}

async function handleSearch(args: string[]): Promise<void> {
  const query = args[0];

  if (!query) {
    console.log("Error: Search query is required.");
    return;
  }

  const results = await searchSnippets(query);

  if (results.length === 0) {
    console.log(`No snippets matched "${query}".`);
    return;
  }

  for (const s of results) {
    console.log(
      `${s.id}\t${s.title}\t${s.language}\t${s.tags.join(", ")}`
    );
  }
}

async function handleShow(args: string[]): Promise<void> {
  const id = args[0];

  if (!id) {
    console.log("Error: Snippet ID is required.");
    return;
  }

  const snippet = await getSnippet(id);

  if (!snippet) {
    console.log(`Error: Snippet with ID ${id} not found.`);
    return;
  }

  console.log(`ID: ${snippet.id}`);
  console.log(`Title: ${snippet.title}`);
  console.log(`Language: ${snippet.language}`);
  console.log(`Tags: ${snippet.tags.join(", ")}`);
  console.log("");
  console.log(snippet.code);
}

async function handleRemove(args: string[]): Promise<void> {
  const id = args[0];

  if (!id) {
    console.log("Error: Snippet ID is required.");
    return;
  }

  const removed = await removeSnippet(id);

  if (!removed) {
    console.log(`Error: Snippet with ID ${id} not found.`);
    return;
  }

  console.log(`Snippet ${id} removed successfully.`);
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command) {
    printUsage();
    return;
  }

  switch (command) {
    case "add":
      await handleAdd(args);
      break;
    case "list":
      await handleList(args);
      break;
    case "search":
      await handleSearch(args);
      break;
    case "show":
      await handleShow(args);
      break;
    case "remove":
      await handleRemove(args);
      break;
    default:
      console.log(`Error: Unknown command "${command}".`);
      printUsage();
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err instanceof Error ? err.message : err);
  process.exit(1);
});