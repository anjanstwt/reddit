'use client';

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Film, ImageIcon, Link2, List, ListOrdered, SquareCode, Table, TextQuote, Type } from 'lucide-react';
import { useState } from 'react';

import { HEADING_ITEMS, MARK_ITEMS, type SlashCommandItem } from '@/components/editor/commandItems';
import { pickMedia } from '@/components/editor/media';
import { FLOATING_SHADOW, MENU_ITEM } from '@/components/editor/styles';
import TableSizePicker from '@/components/editor/TableSizePicker';
import ToolButton from '@/components/editor/ToolButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Block from '@/components/utility/Block';
import UtilityDivider from '@/components/utility/Divider';
import { cn } from '@/lib/utils';

type PopoverName = 'text' | 'table' | null;

const PARAGRAPH: SlashCommandItem = {
  title: 'Text',
  icon: Type,
  command: ({ editor }) => editor.chain().focus().setParagraph().run(),
};

const Divider = () => <UtilityDivider orientation="vertical" />;

export default function EditorToolbar({ editor }: { editor: Editor }) {
  const [popover, setPopover] = useState<PopoverName>(null);
  const [tableSize, setTableSize] = useState({ rows: 2, cols: 2 });

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      marks: Object.fromEntries(MARK_ITEMS.map((m) => [m.name, e.isActive(m.name)])),
      heading: e.isActive('heading'),
      link: e.isActive('link'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      table: e.isActive('table'),
    }),
  });

  const chain = () => editor.chain().focus();
  const openChange = (name: Exclude<PopoverName, null>) => (open: boolean) => setPopover(open ? name : null);

  return (
    <div className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none]">
      <ToolButton icon={ImageIcon} label="Add image" onClick={() => pickMedia(editor, 'image')} />
      <ToolButton icon={Film} label="Add video" onClick={() => pickMedia(editor, 'video')} />

      <Divider />

      {MARK_ITEMS.filter((m) => m.name !== 'code' && m.name !== 'spoiler').map((mark) => (
        <ToolButton
          key={mark.name}
          icon={mark.icon}
          label={mark.label}
          active={active.marks[mark.name]}
          onClick={() => chain().toggleMark(mark.name).run()}
        />
      ))}
      <Popover open={popover === 'text'} onOpenChange={openChange('text')}>
        <PopoverTrigger asChild>
          <ToolButton icon={Type} label="Text size" active={active.heading || popover === 'text'} />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="border-0 bg-transparent p-0 shadow-none"
        >
          <Block className={cn('w-40 gap-px p-1', FLOATING_SHADOW)}>
            {[PARAGRAPH, ...HEADING_ITEMS].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const { from } = editor.state.selection;
                    item.command({ editor, range: { from, to: from } });
                    setPopover(null);
                  }}
                  className={cn(MENU_ITEM, 'hover:bg-white/10')}
                >
                  <Icon size={16} />
                  {item.title}
                </button>
              );
            })}
          </Block>
        </PopoverContent>
      </Popover>

      <Divider />

      <ToolButton icon={Link2} label="Link" active={active.link} onClick={() => chain().openLinkPrompt().run()} />
      <ToolButton
        icon={List}
        label="Bulleted list"
        active={active.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolButton
        icon={ListOrdered}
        label="Numbered list"
        active={active.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />

      <Divider />

      {MARK_ITEMS.filter((m) => m.name === 'spoiler' || m.name === 'code').map((mark) => (
        <ToolButton
          key={mark.name}
          icon={mark.icon}
          label={mark.label}
          active={active.marks[mark.name]}
          onClick={() => chain().toggleMark(mark.name).run()}
        />
      ))}
      <ToolButton
        icon={TextQuote}
        label="Blockquote"
        active={active.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <ToolButton
        icon={SquareCode}
        label="Code block"
        active={active.codeBlock}
        onClick={() => chain().toggleCodeBlock().run()}
      />
      <Popover open={popover === 'table'} onOpenChange={openChange('table')}>
        <PopoverTrigger asChild>
          <ToolButton icon={Table} label="Table" active={active.table || popover === 'table'} />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="border-0 bg-transparent p-0 shadow-none"
        >
          <TableSizePicker
            rows={tableSize.rows}
            cols={tableSize.cols}
            onHover={setTableSize}
            onSelect={({ rows, cols }) => {
              chain().insertTable({ rows, cols, withHeaderRow: true }).run();
              setPopover(null);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
