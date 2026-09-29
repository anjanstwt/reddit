'use client';

import { Extension, type JSONContent } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import SuperscriptMark from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LINK_ATTRIBUTES, LinkPrompt, type LinkPromptRequest } from '@/components/editor/link';
import LinkPanel from '@/components/editor/LinkPanel';
import { MediaImage, MediaUpload, type MediaUploader, MediaVideo } from '@/components/editor/media';
import { EditorPlaceholder } from '@/components/editor/placeholder';
import SelectionToolbar from '@/components/editor/SelectionToolbar';
import { SlashCommand } from '@/components/editor/slashCommand';
import { Spoiler } from '@/components/editor/spoiler';
import TableMenu from '@/components/editor/TableMenu';
import { isSafeHref } from '@/lib/tiptap';
import { cn } from '@/lib/utils';

const ModEnterSubmits = Extension.create({
  name: 'modEnterSubmits',
  priority: 1000,
  addKeyboardShortcuts() {
    return { 'Mod-Enter': () => true };
  },
});

export interface RichTextEditorState {
  json: JSONContent;
  isEmpty: boolean;
  characters: number;
}

export interface RichTextEditorProps {
  className?: string;
  charLimit?: number;
  onUpload?: MediaUploader;
  onChange?: (state: RichTextEditorState) => void;
  onReady?: (editor: Editor) => void;
}

export default function RichTextEditor({
  className,
  charLimit = 10000,
  onUpload,
  onChange,
  onReady,
}: RichTextEditorProps) {
  const [linkRequest, setLinkRequest] = useState<LinkPromptRequest | null>(null);
  const requestLink = useCallback((request: LinkPromptRequest) => setLinkRequest(request), []);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          linkOnPaste: false,
          HTMLAttributes: LINK_ATTRIBUTES,
          isAllowedUri: (url, ctx) => ctx.defaultValidate(url) && (isSafeHref(url) || !/^[a-z][a-z\d+.-]*:/i.test(url)),
        },
      }),
      SuperscriptMark,
      Spoiler,
      TableKit.configure({ table: { resizable: false } }),
      MediaImage,
      MediaVideo,
      MediaUpload.configure({ upload: onUpload ?? null }),
      EditorPlaceholder,
      CharacterCount.configure({ limit: charLimit }),
      SlashCommand,
      LinkPrompt.configure({ onRequest: requestLink }),
      ModEnterSubmits,
    ],
    [charLimit, onUpload, requestLink],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editorProps: { attributes: { class: cn('tiptap', className) } },
    onCreate: ({ editor: created }) => {
      report(created);
      onReady?.(created);
    },
    onUpdate: ({ editor: updated }) => report(updated),
  });

  function report(instance: Editor) {
    onChangeRef.current?.({
      json: instance.getJSON(),
      isEmpty: instance.isEmpty,
      characters: instance.storage.characterCount.characters(),
    });
  }

  return (
    <>
      {editor && <SelectionToolbar editor={editor} />}
      {editor && <TableMenu editor={editor} />}
      <EditorContent editor={editor} />
      {editor && linkRequest && (
        <LinkPanel
          key={`${linkRequest.from}-${linkRequest.to}`}
          editor={editor}
          request={linkRequest}
          onClose={() => setLinkRequest(null)}
        />
      )}
    </>
  );
}
