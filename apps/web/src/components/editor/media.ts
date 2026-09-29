import { type Editor, Extension, Node, type Range } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import MediaNodeView from '@/components/editor/MediaNodeView';
import type { MediaKind } from '@/lib/server/types';

export interface UploadedMedia {
  id: string;
  url: string;
  kind: MediaKind;
}

export type MediaUploader = (file: File) => Promise<UploadedMedia>;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mediaUpload: {
      insertMedia: (media: UploadedMedia) => ReturnType;
    };
  }

  interface Storage {
    mediaUpload: { upload: MediaUploader | null };
  }
}

function mediaNode(kind: MediaKind) {
  const tag = kind === 'image' ? 'img' : 'video';

  return Node.create({
    name: kind,
    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
      return {
        mediaId: {
          default: null,
          parseHTML: (el) => el.getAttribute('data-media-id'),
          renderHTML: (attrs) => ({ 'data-media-id': attrs.mediaId }),
        },
        src: { default: null },
      };
    },

    parseHTML() {
      return [{ tag: `${tag}[data-media-id]` }];
    },

    renderHTML({ HTMLAttributes }) {
      return [tag, HTMLAttributes];
    },

    addNodeView() {
      return ReactNodeViewRenderer(MediaNodeView);
    },
  });
}

export const MediaImage = mediaNode('image');
export const MediaVideo = mediaNode('video');

export const MediaUpload = Extension.create<{ upload: MediaUploader | null }, { upload: MediaUploader | null }>({
  name: 'mediaUpload',

  addOptions() {
    return { upload: null };
  },

  addStorage() {
    return { upload: this.options.upload };
  },

  addCommands() {
    return {
      insertMedia:
        (media) =>
        ({ commands }) =>
          commands.insertContent({ type: media.kind, attrs: { mediaId: media.id, src: media.url } }),
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const handleFiles = (files?: FileList | null) => {
      const media = Array.from(files ?? []).filter((f) => /^(image|video)\//.test(f.type));
      if (!media.length || !editor.storage.mediaUpload.upload) return false;
      media.forEach((file) => uploadAndInsert(editor, file));
      return true;
    };

    return [
      new Plugin({
        key: new PluginKey('mediaUploadDrop'),
        props: {
          handlePaste: (_view, event) => handleFiles(event.clipboardData?.files),
          handleDrop: (_view, event) => handleFiles((event as DragEvent).dataTransfer?.files),
        },
      }),
    ];
  },
});

async function uploadAndInsert(editor: Editor, file: File) {
  const upload = editor.storage.mediaUpload.upload;
  if (!upload) return;
  try {
    const media = await upload(file);
    editor.chain().focus().insertMedia(media).run();
  } catch {
    return;
  }
}

export function pickMedia(editor: Editor, kind: MediaKind, range?: Range) {
  if (range) editor.chain().focus().deleteRange(range).run();

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = kind === 'image' ? 'image/*' : 'video/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) uploadAndInsert(editor, file);
  };
  input.click();
}
