'use client';

import { ChevronRight } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import {
  isSlashCommandGroup,
  isSlashCommandTableInsert,
  type SlashCommandEntry,
  type SlashCommandSelection,
} from '@/components/editor/commandItems';
import { FLOATING_SHADOW, MENU_ITEM } from '@/components/editor/styles';
import TableSizePicker, { TABLE_PICKER_MAX_COLS, TABLE_PICKER_MAX_ROWS } from '@/components/editor/TableSizePicker';
import Block from '@/components/utility/Block';
import { cn } from '@/lib/utils';

interface SlashCommandListProps {
  items: SlashCommandEntry[];
  command: (selection: SlashCommandSelection) => void;
}

export interface SlashCommandListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

type TableSize = { rows: number; cols: number };

const PANEL = cn('w-56 gap-px p-1', FLOATING_SHADOW);

const clamp = (value: number, max: number) => Math.min(Math.max(value, 1), max);

const SlashCommandList = forwardRef<SlashCommandListHandle, SlashCommandListProps>(function SlashCommandList(
  { items, command },
  ref,
) {
  const [selected, setSelected] = useState(0);
  const [nested, setNested] = useState<number | null>(null);
  const [size, setSize] = useState<TableSize | null>(null);

  useEffect(() => {
    setSelected(0);
    setNested(null);
    setSize(null);
  }, [items]);

  const entry = items[selected];
  const group = entry && isSlashCommandGroup(entry) ? entry : null;
  const table = entry && isSlashCommandTableInsert(entry) ? entry : null;

  const select = (index: number) => {
    setSelected(index);
    setNested(null);
    setSize(null);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        if (group && nested !== null) {
          setNested((nested + step + group.items.length) % group.items.length);
        } else if (table && size) {
          setSize({ ...size, rows: clamp(size.rows + step, TABLE_PICKER_MAX_ROWS) });
        } else {
          select((selected + step + items.length) % items.length);
        }
        return true;
      }
      if (event.key === 'ArrowRight') {
        if (group && nested === null) {
          setNested(0);
          return true;
        }
        if (table) {
          setSize(size ? { ...size, cols: clamp(size.cols + 1, TABLE_PICKER_MAX_COLS) } : { rows: 2, cols: 2 });
          return true;
        }
        return false;
      }
      if (event.key === 'ArrowLeft') {
        if (table && size) {
          setSize(size.cols > 1 ? { ...size, cols: size.cols - 1 } : null);
          return true;
        }
        if (nested === null) return false;
        setNested(null);
        return true;
      }
      if (event.key === 'Enter') {
        if (table) {
          if (size) command({ ...table, size });
          else setSize({ rows: 2, cols: 2 });
        } else if (group) {
          if (nested === null) setNested(0);
          else command(group.items[nested]);
        } else if (entry) {
          command(entry);
        }
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return <Block className={cn('w-56 py-6 text-center text-sm text-steel', FLOATING_SHADOW)}>No matches</Block>;
  }

  return (
    <div onMouseDown={(e) => e.preventDefault()} className="relative">
      <Block className={PANEL}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const hasSubmenu = isSlashCommandGroup(item) || isSlashCommandTableInsert(item);
          return (
            <button
              key={item.title}
              type="button"
              data-selected={index === selected}
              onMouseEnter={() => select(index)}
              onClick={() => {
                if (isSlashCommandGroup(item)) setNested(0);
                else if (isSlashCommandTableInsert(item)) setSize({ rows: 2, cols: 2 });
                else command(item);
              }}
              className={MENU_ITEM}
            >
              <Icon size={16} />
              {item.title}
              {hasSubmenu && <ChevronRight size={14} className="ml-auto" />}
            </button>
          );
        })}
      </Block>

      {group && (
        <Block className={cn(PANEL, 'absolute top-0 left-full ml-1')}>
          {group.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                data-selected={index === nested}
                onMouseEnter={() => setNested(index)}
                onClick={() => command(item)}
                className={MENU_ITEM}
              >
                <Icon size={16} />
                {item.title}
              </button>
            );
          })}
        </Block>
      )}

      {table && (
        <div className="absolute top-0 left-full ml-1">
          <TableSizePicker
            rows={size?.rows ?? 2}
            cols={size?.cols ?? 2}
            onHover={setSize}
            onSelect={(picked) => command({ ...table, size: picked })}
          />
        </div>
      )}
    </div>
  );
});

export default SlashCommandList;
