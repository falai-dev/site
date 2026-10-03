import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const self = fileURLToPath(import.meta.url);
const forbidden = /—|&mdash;|&#0*8212;|&#x0*2014;/i;
const message =
  "No em dash in public text. Use a period, comma, colon or parentheses.";
const problems: string[] = [];
const codeExtensions = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);
const textExtensions = new Set([".json", ".html", ".md", ".css", ".svg"]);
// The package docs quote this exact error from @providerkit/core.
const externalError =
  "`the output cap ran out before any answer (2048 of 2048 output tokens went to reasoning) — raise maxTokens or lower effort`";

function filesIn(path: string): string[] {
  if (statSync(path).isDirectory()) {
    return readdirSync(path).flatMap((name) => filesIn(join(path, name)));
  }
  if (path === self) return [];
  return codeExtensions.has(extname(path)) || textExtensions.has(extname(path))
    ? [path]
    : [];
}

function report(file: string, line: number): void {
  problems.push(`${relative(root, file)}:${line}: ${message}`);
}

function checkCode(
  file: string,
  text: string,
  firstLine = 1,
  displayed = false,
): void {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node): void {
    if (
      (ts.isStringLiteral(node) ||
        ts.isTemplateLiteralToken(node) ||
        ts.isJsxText(node)) &&
      forbidden.test(node.text)
    ) {
      report(
        file,
        firstLine +
          source.getLineAndCharacterOfPosition(node.getStart(source)).line,
      );
    }
    ts.forEachChild(node, visit);
  }
  ts.forEachChild(source, visit);
  if (displayed) {
    // The code viewer shows the whole example, including its comments.
    const scanner = ts.createScanner(
      ts.ScriptTarget.Latest,
      false,
      ts.LanguageVariant.Standard,
      text,
    );
    let token = scanner.scan();
    while (token !== ts.SyntaxKind.EndOfFileToken) {
      if (
        (token === ts.SyntaxKind.SingleLineCommentTrivia ||
          token === ts.SyntaxKind.MultiLineCommentTrivia) &&
        forbidden.test(scanner.getTokenText())
      ) {
        report(
          file,
          firstLine +
            source.getLineAndCharacterOfPosition(scanner.getTokenPos()).line,
        );
      }
      token = scanner.scan();
    }
  }
}

function jsonContainsDash(value: unknown): boolean {
  if (typeof value === "string") return forbidden.test(value);
  if (Array.isArray(value)) return value.some(jsonContainsDash);
  if (value !== null && typeof value === "object")
    return Object.values(value).some(jsonContainsDash);
  return false;
}

const copiedFiles = process.argv
  .slice(2)
  .flatMap((path) => filesIn(resolve(root, path)));
const copied = new Set(copiedFiles);
const files = [
  ...new Set([
    ...[
      "src",
      "public",
      "scripts",
      "README.md",
      "index.html",
      "package.json",
    ].flatMap((path) => filesIn(join(root, path))),
    ...copiedFiles,
  ]),
];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const extension = extname(file);
  if (codeExtensions.has(extension)) {
    checkCode(file, text, 1, copied.has(file));
  } else if (extension === ".json") {
    if (jsonContainsDash(JSON.parse(text))) report(file, 1);
  } else {
    const comments =
      extension === ".css" ? /\/\*[\s\S]*?\*\//g : /<!--[\s\S]*?-->/g;
    let visible = text.replace(comments, (comment) =>
      comment.replace(/[^\n]/g, " "),
    );
    if (copied.has(file) && file.endsWith("/docs/reference/providers.md")) {
      visible = visible.replace(
        externalError,
        " ".repeat(externalError.length),
      );
    }
    visible.split("\n").forEach((line, index) => {
      const escapedCssDash =
        extension === ".css" &&
        /\\(?:002014|0?2014(?:\s|(?=[^0-9a-f]|$)))/i.test(line);
      if (forbidden.test(line) || escapedCssDash) report(file, index + 1);
    });
    if (extension === ".md") {
      for (const fence of visible.matchAll(
        /^```(ts|typescript|js|javascript|tsx|jsx)[^\n]*\n([\s\S]*?)^```/gm,
      )) {
        const line = visible.slice(0, fence.index).split("\n").length + 1;
        checkCode(file, fence[2], line);
      }
    }
    if (extension === ".html") {
      for (const script of visible.matchAll(
        /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
      )) {
        const line = visible.slice(0, script.index).split("\n").length;
        checkCode(file, script[1], line);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Checked ${files.length} public files: no em dashes.`);
