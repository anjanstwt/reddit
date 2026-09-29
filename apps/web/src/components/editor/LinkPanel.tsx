'use client';

import type { Editor } from '@tiptap/core';
import { Link2, Type, Unlink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { LinkPromptRequest } from '@/components/editor/link';
import { FLOATING_SHADOW } from '@/components/editor/styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Block from '@/components/utility/Block';
import { withProtocol } from '@/lib/urls';
import { cn } from '@/lib/utils';

interface LinkPanelProps {
  editor: Editor;
  request: LinkPromptRequest;
  onClose: () => void;
}

const FIELD_ROW = 'flex items-center gap-2 rounded-lg bg-white/5 px-2.5 transition-colors focus-within:bg-white/[0.08]';
const FIELD = 'h-9 rounded-none bg-transparent px-0 text-[13px] hover:bg-transparent focus-visible:bg-transparent';

export default function LinkPanel({ editor, request, onClose }: LinkPanelProps) {
  const [label, setLabel] = useState(request.label);
  const [href, setHref] = useState(request.href);
  const hrefInput = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hrefInput.current?.focus();
    hrefInput.current?.select();
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [onClose]);

  const coords = editor.view.coordsAtPos(request.to);
  const container = editor.view.dom.closest<HTMLElement>('[data-slot="dialog-content"]') ?? document.body;
  const origin = container === document.body ? { top: 0, left: 0 } : container.getBoundingClientRect();

  const apply = () => {
    const url = href.trim();
    if (!url) return;
    const text = label.trim() || url;
    editor
      .chain()
      .focus()
      .insertContentAt(
        { from: request.from, to: request.to },
        { type: 'text', text, marks: [{ type: 'link', attrs: { href: withProtocol(url) } }] },
      )
      .setTextSelection(request.from + text.length)
      .run();
    onClose();
  };

  const remove = () => {
    editor.chain().focus().setTextSelection({ from: request.from, to: request.to }).unsetLink().run();
    onClose();
  };

  return createPortal(
    <Block
      ref={panel}
      data-editor-floating
      style={{ top: coords.bottom + 8 - origin.top, left: coords.left - origin.left }}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          onClose();
          editor.commands.focus();
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          apply();
        }
      }}
      className={cn('pointer-events-auto fixed z-[100] w-80 gap-1.5 p-2', FLOATING_SHADOW)}
    >
      <label className={FIELD_ROW}>
        <Link2 size={15} className="shrink-0 text-steel" />
        <Input
          ref={hrefInput}
          value={href}
          placeholder="Paste or type a link"
          onChange={(e) => setHref(e.target.value)}
          className={FIELD}
        />
      </label>
      <label className={FIELD_ROW}>
        <Type size={15} className="shrink-0 text-steel" />
        <Input
          value={label}
          placeholder="Text to show (optional)"
          onChange={(e) => setLabel(e.target.value)}
          className={FIELD}
        />
      </label>

      <div className="flex items-center justify-between px-0.5 pt-0.5">
        {request.href ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={remove}
            className="h-7 gap-1.5 px-2 text-xs text-red-400 hover:bg-red-500/10"
          >
            <Unlink size={14} />
            Remove
          </Button>
        ) : (
          <span className="px-1 text-[11px] text-steel">Press ↵ to apply</span>
        )}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              editor.commands.focus();
            }}
            className="h-7 px-3 text-xs"
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={!href.trim()} className="h-7 px-3 text-xs">
            Apply
          </Button>
        </div>
      </div>
    </Block>,
    container,
  );
}
