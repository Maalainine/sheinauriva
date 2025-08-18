"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Extend the TextAlign extension to include toggleTextAlign
declare module '@tiptap/extension-text-align' {
  interface TextAlignOptions {
    types: string[];
    alignments: string[];
    defaultAlignment: string | null;
  }

  interface TextAlignAttributes {
    textAlign: string | null;
  }
}

type TextAlignOption = 'left' | 'center' | 'right' | 'justify';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something amazing...",
  className,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "min-h-[150px] outline-none p-3",
      },
    },
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        heading: {
          HTMLAttributes: {
            class: "text-xl font-bold",
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'] as TextAlignOption[],
        defaultAlignment: 'left',
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Prevent hydration mismatch by not rendering on server
    immediatelyRender: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!isMounted) {
    return (
      <div className={cn("min-h-[150px] rounded-md border p-3 prose prose-sm max-w-none", className)}>
        {value ? (
          <div dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <p className="text-muted-foreground">{placeholder}</p>
        )}
      </div>
    );
  }

  if (!editor) {
    return (
      <div className={cn("min-h-[150px] rounded-md border p-3 prose prose-sm max-w-none", className)}>
        {value ? (
          <div dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <p className="text-muted-foreground">{placeholder}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1 p-1 border rounded-t-md bg-muted/50">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <div className="h-6 w-px bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="h-6 w-px bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left' as const).run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center' as const).run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right' as const).run()}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'justify' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('justify' as const).run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>
      </div>
      <div ref={editorContainerRef} className="border rounded-b-md overflow-hidden">
        <EditorContent 
          editor={editor} 
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
}
