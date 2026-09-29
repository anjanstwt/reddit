'use client';

import { FLOATING_SHADOW } from '@/components/editor/styles';
import Block from '@/components/utility/Block';
import { cn } from '@/lib/utils';

export const TABLE_PICKER_MAX_ROWS = 8;
export const TABLE_PICKER_MAX_COLS = 8;

interface TableSizePickerProps {
  rows: number;
  cols: number;
  onHover: (size: { rows: number; cols: number }) => void;
  onSelect: (size: { rows: number; cols: number }) => void;
}

export default function TableSizePicker({ rows, cols, onHover, onSelect }: TableSizePickerProps) {
  return (
    <Block className={cn('items-center gap-2 p-2', FLOATING_SHADOW)}>
      <div className="flex flex-col gap-1">
        {Array.from({ length: TABLE_PICKER_MAX_ROWS }, (_, row) => (
          <div key={row} className="flex gap-1">
            {Array.from({ length: TABLE_PICKER_MAX_COLS }, (_, col) => (
              <button
                key={col}
                type="button"
                aria-label={`${row + 1} by ${col + 1} table`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => onHover({ rows: row + 1, cols: col + 1 })}
                onClick={() => onSelect({ rows: row + 1, cols: col + 1 })}
                className={cn(
                  'size-4 cursor-pointer rounded-[3px] border transition-colors',
                  row < rows && col < cols ? 'border-sky-400 bg-sky-400/40' : 'border-white/15 bg-white/5',
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="text-xs text-steel">
        {rows} x {cols}
      </span>
    </Block>
  );
}
