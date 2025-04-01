"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Quote,
  Code,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TipTapEditorProps {
  onChange?: (content: string) => void;
  initialContent?: string;
  maxCharacters?: number;
}

// Memoize the editor toolbar buttons for better performance
const MenuButton = memo(({ onClick, isActive, disabled, icon: Icon, title, shortcut }: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: any;
  title: string;
  shortcut?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "default" : "ghost"}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          title={title}
          className="h-8 w-8 p-0"
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title} {shortcut && <span className="text-xs text-muted-foreground ml-1">({shortcut})</span>}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));
MenuButton.displayName = 'MenuButton';

export function TipTapEditor({ onChange, initialContent, maxCharacters = 5000 }: TipTapEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);
  const debouncedOnChangeRef = useRef<Function | null>(null);
  
  // Create a debounced change handler
  useEffect(() => {
    if (onChange) {
      debouncedOnChangeRef.current = debounce((html: string, text: string) => {
        onChange(html);
        setCharacterCount(text.length);
      }, 300);
    }
    
    return () => {
      // Clean up debounced function
      if (debouncedOnChangeRef.current && 'cancel' in debouncedOnChangeRef.current) {
        (debouncedOnChangeRef.current as any).cancel();
      }
    };
  }, [onChange]);

  // Initialize editor with only necessary extensions for better performance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions you don't need for better performance
        history: {
          depth: 10, // Limit history depth
        },
      }),
    ],
    content: initialContent || '<p>Start writing your content here...</p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      // Use the debounced callback to avoid too many updates
      if (debouncedOnChangeRef.current) {
        debouncedOnChangeRef.current(html, text);
      }
    },
    editorProps: {
      // Optimize rendering by avoiding excessive DOM operations
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none dark:prose-invert',
      },
    },
  });

  // Set initial character count on mount
  useEffect(() => {
    if (editor) {
      setCharacterCount(editor.getText().length);
    }
  }, [editor]);

  // Create optimized handlers - move these before conditional rendering
  const handleBold = useCallback(() => 
    editor ? editor.chain().focus().toggleBold().run() : () => {}, 
    [editor]
  );
  const handleItalic = useCallback(() => 
    editor ? editor.chain().focus().toggleItalic().run() : () => {}, 
    [editor]
  );
  const handleH1 = useCallback(() => 
    editor ? editor.chain().focus().toggleHeading({ level: 1 }).run() : () => {}, 
    [editor]
  );
  const handleH2 = useCallback(() => 
    editor ? editor.chain().focus().toggleHeading({ level: 2 }).run() : () => {}, 
    [editor]
  );
  const handleBulletList = useCallback(() => 
    editor ? editor.chain().focus().toggleBulletList().run() : () => {}, 
    [editor]
  );
  const handleOrderedList = useCallback(() => 
    editor ? editor.chain().focus().toggleOrderedList().run() : () => {}, 
    [editor]
  );
  const handleBlockquote = useCallback(() => 
    editor ? editor.chain().focus().toggleBlockquote().run() : () => {}, 
    [editor]
  );
  const handleCodeBlock = useCallback(() => 
    editor ? editor.chain().focus().toggleCodeBlock().run() : () => {}, 
    [editor]
  );
  const handleUndo = useCallback(() => 
    editor ? editor.chain().focus().undo().run() : () => {}, 
    [editor]
  );
  const handleRedo = useCallback(() => 
    editor ? editor.chain().focus().redo().run() : () => {}, 
    [editor]
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  // Calculate character count percentage
  const characterPercentage = Math.min((characterCount / maxCharacters) * 100, 100);
  const isNearLimit = characterCount > maxCharacters * 0.8;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b">
        <MenuButton 
          onClick={handleBold}
          isActive={editor?.isActive('bold')}
          icon={Bold}
          title="Bold"
          shortcut="Ctrl+B"
        />
        <MenuButton 
          onClick={handleItalic}
          isActive={editor?.isActive('italic')} 
          icon={Italic}
          title="Italic"
          shortcut="Ctrl+I"
        />
        <Separator orientation="vertical" className="mx-1 h-8" />
        <MenuButton 
          onClick={handleH1}
          isActive={editor?.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Heading 1"
          shortcut="Ctrl+Alt+1"
        />
        <MenuButton 
          onClick={handleH2}
          isActive={editor?.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Heading 2"
          shortcut="Ctrl+Alt+2"
        />
        <Separator orientation="vertical" className="mx-1 h-8" />
        <MenuButton 
          onClick={handleBulletList}
          isActive={editor?.isActive('bulletList')}
          icon={List}
          title="Bullet List"
          shortcut="Ctrl+Shift+8"
        />
        <MenuButton 
          onClick={handleOrderedList}
          isActive={editor?.isActive('orderedList')}
          icon={ListOrdered}
          title="Ordered List"
          shortcut="Ctrl+Shift+7"
        />
        <Separator orientation="vertical" className="mx-1 h-8" />
        <MenuButton 
          onClick={handleBlockquote}
          isActive={editor?.isActive('blockquote')}
          icon={Quote}
          title="Blockquote"
          shortcut="Ctrl+Shift+B"
        />
        <MenuButton 
          onClick={handleCodeBlock}
          isActive={editor?.isActive('codeBlock')}
          icon={Code}
          title="Code Block"
          shortcut="Ctrl+Alt+C"
        />
        <Separator orientation="vertical" className="mx-1 h-8" />
        <MenuButton 
          onClick={handleUndo}
          disabled={!editor?.can().undo()}
          icon={Undo}
          title="Undo"
          shortcut="Ctrl+Z"
        />
        <MenuButton 
          onClick={handleRedo}
          disabled={!editor?.can().redo()}
          icon={Redo}
          title="Redo"
          shortcut="Ctrl+Shift+Z"
        />
      </div>
      <div className="p-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
      <div className="flex justify-between items-center px-4 py-2 border-t text-xs text-muted-foreground">
        <div>
          {isOverLimit ? (
            <span className="text-destructive font-medium">
              Character limit exceeded
            </span>
          ) : (
            "Text editor"
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full", 
                isOverLimit 
                  ? "bg-destructive" 
                  : isNearLimit 
                    ? "bg-warning" 
                    : "bg-primary"
              )}
              style={{ width: `${characterPercentage}%` }}
            />
          </div>
          <span className={cn(
            isOverLimit ? "text-destructive font-medium" : ""
          )}>
            {characterCount}/{maxCharacters}
          </span>
        </div>
      </div>
    </div>
  );
} 