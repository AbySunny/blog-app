"use client";

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from "@tiptap/starter-kit";
import { EditorContent } from "@tiptap/react";


const Tiptap = () => {
  const editor = new Editor({
    content: "<p>Hello World! 🌎️</p>",
    // Don't render immediately on the server to avoid SSR issues
    // bind Tiptap to the `.element`
    // register extensions
    extensions: [Document,Paragraph,  Text, StarterKit],
    // set the initial content
    // place the cursor in the editor after initialization
    autofocus: true,
    // make the text editable (default is true)
    editable: true,
    // prevent loading the default ProseMirror CSS that comes with Tiptap
    // should be kept as `true` for most cases as it includes styles
    // important for Tiptap to work correctly
    injectCSS: false,
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
