'use client';

import type { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  PanelTop,
  TableColumnsSplit,
  TableRowsSplit,
  Trash2,
} from 'lucide-react';

import { FLOATING_SHADOW } from '@/components/editor/styles';
import ToolButton from '@/components/editor/ToolButton';
import Block from '@/components/utility/Block';
import Divider from '@/components/utility/Divider';
import { cn } from '@/lib/utils';

export default function TableMenu({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      options={{ placement: 'top' }}
      shouldShow={({ editor: e, state }) => e.isEditable && state.selection.empty && e.isActive('table')}
    >
      <Block className={cn('flex-row items-center gap-0.5 p-1', FLOATING_SHADOW)}>
        <ToolButton icon={BetweenHorizontalStart} label="Add row above" onClick={() => chain().addRowBefore().run()} />
        <ToolButton icon={BetweenHorizontalEnd} label="Add row below" onClick={() => chain().addRowAfter().run()} />
        <ToolButton
          icon={BetweenVerticalStart}
          label="Add column left"
          onClick={() => chain().addColumnBefore().run()}
        />
        <ToolButton icon={BetweenVerticalEnd} label="Add column right" onClick={() => chain().addColumnAfter().run()} />

        <Divider orientation="vertical" />

        <ToolButton icon={TableRowsSplit} label="Delete row" danger onClick={() => chain().deleteRow().run()} />
        <ToolButton
          icon={TableColumnsSplit}
          label="Delete column"
          danger
          onClick={() => chain().deleteColumn().run()}
        />

        <Divider orientation="vertical" />

        <ToolButton icon={PanelTop} label="Toggle header row" onClick={() => chain().toggleHeaderRow().run()} />
        <ToolButton icon={Trash2} label="Delete table" danger onClick={() => chain().deleteTable().run()} />
      </Block>
    </BubbleMenu>
  );
}
