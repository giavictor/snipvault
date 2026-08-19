import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Snippet } from "./types.js";

// Resolve data/snippets.json relative to this file, not process.cwd(),
// so the CLI works the same no matter which directory you run it from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "snippets.json");

/**
 * Reads all snippets from disk.
 * If the file is missing, returns an empty list instead of crashing
 * (satisfies the "missing JSON file" error-handling requirement).
 */
export async function loadSnippets(): Promise<Snippet[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("snippets.json does not contain a JSON array");
    }
    return parsed as Snippet[];
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return [];
    }
    if (err instanceof SyntaxError) {
      throw new Error("snippets.json contains invalid JSON.");
    }
    throw err;
  }
}

/** Writes the full snippet list back to disk, creating data/ if needed. */
export async function saveSnippets(snippets: Snippet[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(snippets, null, 2), "utf-8");
}

export async function getAllSnippets(): Promise<Snippet[]> {
  return loadSnippets();
}

export async function getSnippet(id: string): Promise<Snippet | undefined> {
  const snippets = await loadSnippets();
  return snippets.find((s) => s.id === id);
}

export async function addSnippet(input: {
  title: string;
  code: string;
  language: string;
  tags: string[];
}): Promise<Snippet> {
  const snippets = await loadSnippets();

  const snippet: Snippet = {
    id: crypto.randomUUID().slice(0, 8),
    title: input.title,
    code: input.code,
    language: input.language,
    tags: input.tags,
    createdAt: new Date().toISOString(),
  };

  snippets.push(snippet);
  await saveSnippets(snippets);
  return snippet;
}

/** Returns true if a snippet was removed, false if the id didn't exist. */
export async function removeSnippet(id: string): Promise<boolean> {
  const snippets = await loadSnippets();
  const index = snippets.findIndex((s) => s.id === id);
  if (index === -1) return false;

  snippets.splice(index, 1);
  await saveSnippets(snippets);
  return true;
}

export async function searchSnippets(query: string): Promise<Snippet[]> {
  const q = query.toLowerCase();
  const snippets = await loadSnippets();
  return snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function listSnippets(filters: {
  tag?: string;
  lang?: string;
}): Promise<Snippet[]> {
  const snippets = await loadSnippets();
  return snippets.filter((s) => {
    const tagOk = filters.tag
      ? s.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase())
      : true;
    const langOk = filters.lang
      ? s.language.toLowerCase() === filters.lang.toLowerCase()
      : true;
    return tagOk && langOk;
  });
}