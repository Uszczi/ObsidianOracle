import { Extension, Text } from "@codemirror/state";
import {
  App,
  Editor,
  MarkdownPostProcessorContext,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from "obsidian";
import { CodeBlock, findBlocks, oracleEditorExtension } from "./editorExtension";
import { FormatOptions, formatOracle, KeywordCase } from "./formatter";
import { tokenize } from "./tokenizer";

interface OracleSettings {
  /** Comma-separated code block languages to highlight. */
  languages: string;
  /** Also take over plain ```sql blocks. */
  overrideSql: boolean;
  keywordCase: KeywordCase;
  /** Number of spaces, or 0 for tabs. */
  indent: number;
  /** Show a "Format" button on code blocks in reading view. */
  formatButton: boolean;
}

const DEFAULT_SETTINGS: OracleSettings = {
  languages: "oracle, plsql, ora, oraclesql",
  overrideSql: false,
  keywordCase: "upper",
  indent: 2,
  formatButton: true,
};

export default class OracleHighlightPlugin extends Plugin {
  settings!: OracleSettings;
  private languages = new Set<string>();
  private editorExtensions: Extension[] = [];

  async onload() {
    await this.loadSettings();
    this.computeLanguages();

    // Reading view: languages are registered once, changes need a plugin reload.
    for (const lang of this.languages) {
      try {
        this.registerMarkdownCodeBlockProcessor(lang, (source, el, ctx) => this.render(source, el, ctx, lang));
      } catch (e) {
        console.warn(`[oracle-syntax-highlight] could not register "${lang}"`, e);
      }
    }

    // Editor (Live Preview + Source mode)
    this.editorExtensions.push(oracleEditorExtension(() => this.languages));
    this.registerEditorExtension(this.editorExtensions);

    this.addCommand({
      id: "format-block",
      name: "Format Oracle code (selection or block under cursor)",
      editorCallback: (editor) => this.formatAtCursor(editor),
    });
    this.addCommand({
      id: "format-all-blocks",
      name: "Format all Oracle code blocks in this note",
      editorCallback: (editor) => this.formatAll(editor),
    });

    this.addSettingTab(new OracleSettingTab(this.app, this));
  }

  computeLanguages() {
    const langs = this.settings.languages
      .split(/[,\s]+/)
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);
    if (this.settings.overrideSql) langs.push("sql");
    this.languages = new Set(langs);
  }

  /** Re-creates the editor extension so open editors pick up new settings. */
  refreshEditors() {
    this.computeLanguages();
    this.editorExtensions.length = 0;
    this.editorExtensions.push(oracleEditorExtension(() => this.languages));
    this.app.workspace.updateOptions();
  }

  // ---------- formatting ----------

  formatOptions(): Partial<FormatOptions> {
    return {
      keywordCase: this.settings.keywordCase,
      indentSize: this.settings.indent || 2,
      useTabs: this.settings.indent === 0,
    };
  }

  /** Formats code, keeping the indentation of a fence that sits e.g. inside a list. */
  format(code: string, indent = ""): string {
    const stripped = indent
      ? code.split("\n").map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l.trimStart())).join("\n")
      : code;
    const out = formatOracle(stripped, this.formatOptions());
    return indent ? out.split("\n").map((l) => (l ? indent + l : l)).join("\n") : out;
  }

  private blocksIn(editor: Editor): CodeBlock[] {
    return findBlocks(Text.of(editor.getValue().split("\n")), this.languages);
  }

  private formatAtCursor(editor: Editor) {
    const selection = editor.getSelection();
    if (selection.trim()) {
      editor.replaceSelection(this.format(selection));
      return;
    }
    const cursor = editor.posToOffset(editor.getCursor());
    const block = this.blocksIn(editor).find((b) => cursor >= b.from && cursor <= b.to);
    if (!block) {
      new Notice("Place the cursor inside an Oracle code block (or select some SQL).");
      return;
    }
    const text = editor.getValue().slice(block.from, block.to);
    const formatted = this.format(text, block.indent);
    if (formatted !== text) {
      editor.replaceRange(formatted, editor.offsetToPos(block.from), editor.offsetToPos(block.to));
    }
  }

  private formatAll(editor: Editor) {
    const value = editor.getValue();
    const changes = this.blocksIn(editor)
      .map((b) => ({ b, text: this.format(value.slice(b.from, b.to), b.indent) }))
      .filter(({ b, text }) => text !== value.slice(b.from, b.to))
      .map(({ b, text }) => ({ from: editor.offsetToPos(b.from), to: editor.offsetToPos(b.to), text }));
    if (!changes.length) {
      new Notice("Oracle code blocks are already formatted.");
      return;
    }
    editor.transaction({ changes });
    new Notice(`Formatted ${changes.length} Oracle code block(s).`);
  }

  /** Reading view "Format" button: rewrites the block in the note file. */
  private async formatInFile(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const info = ctx.getSectionInfo(el);
    const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!info || !(file instanceof TFile)) {
      new Notice("Could not locate this code block in the note.");
      return;
    }
    await this.app.vault.process(file, (data) => {
      const lines = data.split("\n");
      const fence = lines[info.lineStart] ?? "";
      const indent = /^[ \t]*/.exec(fence)![0];
      const start = info.lineStart + 1;
      const end = info.lineEnd; // closing fence line
      if (end <= start) return data;
      const code = lines.slice(start, end).join("\n");
      lines.splice(start, end - start, ...this.format(code, indent).split("\n"));
      return lines.join("\n");
    });
  }

  // ---------- reading view ----------

  private render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext, lang: string) {
    const pre = el.createEl("pre", { cls: `language-${lang}` });
    const code = pre.createEl("code", { cls: `language-${lang} is-loaded` });

    let pos = 0;
    for (const t of tokenize(source)) {
      if (t.from > pos) code.appendText(source.slice(pos, t.from));
      code.createSpan({ cls: `ora-${t.type}`, text: source.slice(t.from, t.to) });
      pos = t.to;
    }
    if (pos < source.length) code.appendText(source.slice(pos));

    const buttons = pre.createDiv({ cls: "ora-buttons" });
    if (this.settings.formatButton) {
      const fmt = buttons.createEl("button", { cls: "ora-format-button", text: "Format" });
      fmt.addEventListener("click", () => this.formatInFile(el, ctx));
    }
    const copy = buttons.createEl("button", { cls: "ora-copy-button", text: "Copy" });
    copy.addEventListener("click", async () => {
      await navigator.clipboard.writeText(source.replace(/\n$/, ""));
      copy.setText("Copied!");
      window.setTimeout(() => copy.setText("Copy"), 1500);
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshEditors();
  }
}

class OracleSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: OracleHighlightPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const s = this.plugin.settings;
    const reloadHint = () =>
      new Notice("Oracle Syntax Highlight: reload the plugin (or Obsidian) to apply this in reading view.");

    new Setting(containerEl).setName("Highlighting").setHeading();

    new Setting(containerEl)
      .setName("Code block languages")
      .setDesc("Comma-separated languages treated as Oracle, e.g. ```plsql. Reading view needs a plugin reload after changes.")
      .addText((t) =>
        t
          .setPlaceholder(DEFAULT_SETTINGS.languages)
          .setValue(s.languages)
          .onChange(async (v) => {
            s.languages = v;
            await this.plugin.saveSettings();
          }),
      )
      .then((setting) => setting.controlEl.querySelector("input")?.addEventListener("blur", reloadHint));

    new Setting(containerEl)
      .setName("Highlight ```sql blocks too")
      .setDesc("Use Oracle highlighting instead of Obsidian's generic SQL highlighting. Needs a plugin reload for reading view.")
      .addToggle((t) =>
        t.setValue(s.overrideSql).onChange(async (v) => {
          s.overrideSql = v;
          await this.plugin.saveSettings();
          reloadHint();
        }),
      );

    new Setting(containerEl).setName("Formatting").setHeading();

    new Setting(containerEl)
      .setName("Keyword case")
      .setDesc("Case of keywords, types and built-in functions. Your own identifiers are never changed.")
      .addDropdown((d) =>
        d
          .addOptions({ upper: "UPPER", lower: "lower", preserve: "Keep as written" })
          .setValue(s.keywordCase)
          .onChange(async (v) => {
            s.keywordCase = v as KeywordCase;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl).setName("Indentation").addDropdown((d) =>
      d
        .addOptions({ "2": "2 spaces", "4": "4 spaces", "0": "Tab" })
        .setValue(String(s.indent))
        .onChange(async (v) => {
          s.indent = Number(v);
          await this.plugin.saveSettings();
        }),
    );

    new Setting(containerEl)
      .setName("Format button in reading view")
      .setDesc("Shows a Format button next to Copy on Oracle code blocks.")
      .addToggle((t) =>
        t.setValue(s.formatButton).onChange(async (v) => {
          s.formatButton = v;
          await this.plugin.saveSettings();
        }),
      );
  }
}
