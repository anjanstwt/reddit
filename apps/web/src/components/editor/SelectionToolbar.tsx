'use client';

import type { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import { ChevronDown, Link2, List, TextQuote, Type } from 'lucide-react';
import { useState } from 'react';

import { HEADING_ITEMS, LIST_ITEMS, MARK_ITEMS, type SlashCommandItem } from '@/components/editor/commandItems';
import { FLOATING_SHADOW, MENU_ITEM } from '@/components/editor/styles';
import Block from '@/components/utility/Block';
import Divider from '@/components/utility/Divider';
import { cn } from '@/lib/utils';

type Dropdown = 'text' | 'list' | null;

const PARAGRAPH: SlashCommandItem = {
  title: 'Text',
  icon: Type,
  command: ({ editor }) => editor.chain().focus().setParagraph().run(),
};

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 text-neutral-300 transition-colors',
        active ? 'bg-white/15 text-neutral-100' : 'hover:bg-white/10',
      )}
    >
      {children}
    </button>
  );
}

export default function SelectionToolbar({ editor }: { editor: Editor }) {
  const [dropdown, setDropdown] = useState<Dropdown>(null);

  const run = (item: SlashCommandItem) => {
    const { from } = editor.state.selection;
    item.command({ editor, range: { from, to: from } });
    setDropdown(null);
  };

  const menu = (items: SlashCommandItem[]) => (
    <Block className={cn('absolute top-full left-0 mt-1 w-44 gap-px p-1', FLOATING_SHADOW)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(item)}
            className={cn(MENU_ITEM, 'hover:bg-white/10')}
          >
            <Icon size={16} />
            {item.title}
          </button>
        );
      })}
    </Block>
  );

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top' }}
      shouldShow={({ editor: e, state }) =>
        e.isEditable && !state.selection.empty && state.selection instanceof TextSelection
      }
    >
      <Block className={cn('flex-row items-center gap-0.5 overflow-visible p-1', FLOATING_SHADOW)}>
        <div className="relative">
          <ToolbarButton
            label="Text style"
            active={dropdown === 'text'}
            onClick={() => setDropdown(dropdown === 'text' ? null : 'text')}
          >
            <span className="text-[13px]">Aa</span>
            <ChevronDown size={12} className="text-steel" />
          </ToolbarButton>
          {dropdown === 'text' && menu([PARAGRAPH, ...HEADING_ITEMS])}
        </div>

        <Divider orientation="vertical" />

        {MARK_ITEMS.map(({ name, icon: Icon, label }) => (
          <ToolbarButton
            key={name}
            label={label}
            active={editor.isActive(name)}
            onClick={() => editor.chain().focus().toggleMark(name).run()}
          >
            <Icon size={16} />
          </ToolbarButton>
        ))}

        <Divider orientation="vertical" />

        <ToolbarButton
          label="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <TextQuote size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive('link')}
          onClick={() => editor.chain().focus().openLinkPrompt().run()}
        >
          <Link2 size={16} />
        </ToolbarButton>
        <div className="relative">
          <ToolbarButton
            label="Lists"
            active={dropdown === 'list'}
            onClick={() => setDropdown(dropdown === 'list' ? null : 'list')}
          >
            <List size={16} />
            <ChevronDown size={12} className="text-steel" />
          </ToolbarButton>
          {dropdown === 'list' && menu(LIST_ITEMS)}
        </div>
      </Block>
    </BubbleMenu>
  );
}
