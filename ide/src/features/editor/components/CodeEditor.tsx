import React, { useEffect, useRef, useCallback } from "react";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEditorStore } from "../store/editor-store";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { InlineEdit } from "./InlineEdit";
import { TabCompletion, useTabCompletion } from "./TabCompletion";

interface CodeEditorProps {
  filePath: string;
  language?: string;
}

function getLanguageExtension(language?: string): Extension {
  switch (language) {
    case "typescript":
    case "javascript":
      return javascript({ jsx: true, typescript: language === "typescript" });
    case "python":
      return python();
    case "rust":
      return rust();
    case "css":
      return css();
    case "html":
      return html();
    case "json":
      return json();
    case "markdown":
      return markdown();
    case "sql":
      return sql();
    default:
      return javascript({ jsx: true });
  }
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, language }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const { tabs, activeTabId, updateContent, saveTab } = useEditorStore();
  const { fontSize, fontFamily, lineNumbers: showLineNumbers, wordWrap, tabSize } = useSettingsStore();
  const tabCompletion = useTabCompletion();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const content = activeTab?.content ?? "";

  const initEditor = useCallback(() => {
    if (!containerRef.current) return;

    // Destroy previous editor
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }

    // Build settings-driven theme override
    const settingsTheme = EditorView.theme({
      "&": {
        fontSize: `${fontSize}px`,
        fontFamily: `'${fontFamily}', 'JetBrains Mono', 'Fira Code', monospace`,
      },
      ".cm-scroller": {
        fontFamily: `'${fontFamily}', 'JetBrains Mono', 'Fira Code', monospace`,
        overflowX: wordWrap ? "auto" : "auto",
      },
    });

    const wordWrapExtension = wordWrap ? EditorView.lineWrapping : [];

    const startState = EditorState.create({
      doc: content,
      extensions: [
        ...(showLineNumbers ? [lineNumbers()] : []),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        EditorState.tabSize.of(tabSize),
        wordWrapExtension,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...completionKeymap,
          indentWithTab,
          // Cmd+K opens Inline Edit (overrides CodeMirror's default Mod-k binding)
          {
            key: "Mod-k",
            run: () => {
              // Dispatch a custom event that InlineEdit listens for
              window.dispatchEvent(new CustomEvent("xcursor:inline-edit-open"));
              return true; // prevent CodeMirror's fold/search from handling Mod-k
            },
          },
        ]),
        getLanguageExtension(language),
        oneDark,
        xcursorTheme,
        settingsTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && activeTabId) {
            updateContent(activeTabId, update.state.doc.toString());
          }
        }),
        // Cmd+S to save
        keymap.of([
          {
            key: "Mod-s",
            run: () => {
              if (activeTabId) saveTab(activeTabId);
              return true;
            },
          },
        ]),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    editorRef.current = view;
  }, [filePath, language, fontSize, fontFamily, showLineNumbers, wordWrap, tabSize, activeTabId, updateContent, saveTab]);

  useEffect(() => {
    initEditor();
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [initEditor]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ fontFamily: `'${fontFamily}', 'JetBrains Mono', 'Fira Code', monospace` }}
      />
      <InlineEdit />
      <TabCompletion
        suggestion={tabCompletion.suggestion ?? undefined}
        visible={tabCompletion.visible}
        onAccept={tabCompletion.accept}
        onReject={tabCompletion.reject}
      />
    </div>
  );
};

// ── Custom X-CURSOR editor theme overlay ──────

const xcursorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    backgroundColor: "#1e1e1e",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    lineHeight: "1.6",
  },
  ".cm-content": {
    padding: "8px 0",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e1e",
    borderRight: "1px solid #3e3e42",
    color: "#858585",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    paddingRight: "12px",
    minWidth: "40px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#252526",
  },
  ".cm-cursor": {
    borderLeftColor: "#aeafad",
    borderLeftWidth: "2px",
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "#264f78 !important",
  },
});
