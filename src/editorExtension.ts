import { RangeSetBuilder, Text } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { tokenize, TokenType } from "./tokenizer";

const markCache = new Map<TokenType, Decoration>();
const mark = (type: TokenType) => {
  let d = markCache.get(type);
  if (!d) {
    d = Decoration.mark({ class: `ora-${type}` });
    markCache.set(type, d);
  }
  return d;
};

const OPEN_FENCE = /^[ \t]*(`{3,}|~{3,})[ \t]*([^\s`{]*)/;

export interface CodeBlock {
  from: number; // first char of the content
  to: number; // end of the last content line
  indent: string; // indentation of the opening fence (e.g. inside a list)
}

/** Finds fenced code blocks whose language is in `languages`. */
export function findBlocks(doc: Text, languages: Set<string>): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let open: { fence: string; lang: string; contentFrom: number; indent: string } | null = null;

  for (let ln = 1; ln <= doc.lines; ln++) {
    const line = doc.line(ln);
    const text = line.text;
    if (!open) {
      const m = OPEN_FENCE.exec(text);
      if (m) {
        const indent = /^[ \t]*/.exec(text)![0];
        open = { fence: m[1], lang: m[2].toLowerCase(), contentFrom: line.to + 1, indent };
      }
      continue;
    }
    const trimmed = text.trim();
    if (
      trimmed.length >= open.fence.length &&
      trimmed[0] === open.fence[0] &&
      /^(`+|~+)$/.test(trimmed)
    ) {
      if (languages.has(open.lang) && line.from - 1 >= open.contentFrom) {
        blocks.push({ from: open.contentFrom, to: line.from - 1, indent: open.indent });
      }
      open = null;
    }
  }
  // unclosed block: Obsidian still renders it as code until the end of the note
  if (open && languages.has(open.lang) && doc.length >= open.contentFrom) {
    blocks.push({ from: open.contentFrom, to: doc.length, indent: open.indent });
  }
  return blocks;
}

export function oracleEditorExtension(getLanguages: () => Set<string>) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }

      update(u: ViewUpdate) {
        if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view);
      }

      build(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const doc = view.state.doc;
        const visible = view.visibleRanges;
        if (!visible.length) return builder.finish();
        const vFrom = visible[0].from;
        const vTo = visible[visible.length - 1].to;

        for (const block of findBlocks(doc, getLanguages())) {
          if (block.to < vFrom || block.from > vTo) continue;
          const text = doc.sliceString(block.from, block.to);
          for (const t of tokenize(text)) {
            builder.add(block.from + t.from, block.from + t.to, mark(t.type));
          }
        }
        return builder.finish();
      }
    },
    { decorations: (v) => v.decorations },
  );
}
