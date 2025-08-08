"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node Styles (to match editor rendering) ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

interface TiptapViewerProps {
  html: string;
}

const TiptapViewer: React.FC<TiptapViewerProps> = ({ html }) => {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: false,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: true,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],
    content: html || "",
  });

  useEffect(() => {
    if (editor && typeof html === "string") {
      editor.commands.setContent(html || "", { emitUpdate: false });
    }
  }, [editor, html]);

  if (!editor) return null;

  return (
    <div
      className="tiptap-viewer-container bg-[var(--tt-viewer-bg)]"
      style={{
        border: "1px solid var(--tt-border-color, rgba(0,0,0,0.1))",
        borderRadius: "0.5rem",
        padding: "1rem",
        background: "var(--tt-viewer-bg)",
      }}
    >
      <EditorContent editor={editor} />
      <style>{`
        .tiptap-viewer-container {
          --tt-viewer-bg: #fbfbfb;
          --tt-border-color: rgba(0,0,0,0.08);
        }
        .dark .tiptap-viewer-container {
          --tt-viewer-bg: #0d0f12;
          --tt-border-color: rgba(255,255,255,0.12);
        }
        .tiptap-viewer-container .tiptap.ProseMirror {
          padding: 0.25rem 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default TiptapViewer;


