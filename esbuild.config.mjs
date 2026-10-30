import esbuild from "esbuild";
import { builtinModules } from "node:module";

const mode = process.argv[2];
const prod = mode === "production";

if (mode === "test") {
  await esbuild.build({
    entryPoints: ["test/tokenizer.test.ts", "test/formatter.test.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    outdir: "test/out",
    logLevel: "info",
  });
  process.exit(0);
}

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtinModules,
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (prod) {
  await ctx.rebuild();
  process.exit(0);
} else {
  await ctx.watch();
}
