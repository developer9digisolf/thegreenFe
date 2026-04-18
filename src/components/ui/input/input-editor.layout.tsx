import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface IPropsEditor {
  content?: string;
  setDescription: (value: string) => void;
  height?: string;
  placeholder?: string;
}

export default function FieldEditor(props: IPropsEditor): React.JSX.Element {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: props.placeholder || "Type something...",
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: props.content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      props.setDescription(html);
    },
  });

  useEffect(() => {
    if (editor && props.content !== editor.getHTML()) {
      editor.commands.setContent(props.content || "");
    }
  }, [props.content, editor]);

  return (
    <EditorContent
      editor={editor}
      className={`prose prose-sm max-w-none p-2 border rounded ${
        props.height || "min-h-[200px]"
      }`}
    />
  );
}
