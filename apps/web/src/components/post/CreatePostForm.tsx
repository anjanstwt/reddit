'use client';

import type { Editor } from '@tiptap/react';
import { ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import EditorToolbar from '@/components/editor/EditorToolbar';
import type { MediaUploader } from '@/components/editor/media';
import RichTextEditor, { type RichTextEditorState } from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Avatar from '@/components/utility/Avatar';
import Divider from '@/components/utility/Divider';
import IconButton from '@/components/utility/IconButton';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useMyCommunities } from '@/hooks/useMyCommunities';
import { useCreatePost } from '@/hooks/useThread';
import { MEDIA_LIMITS, mediaKindOf, readImageSize } from '@/lib/media';
import { api } from '@/lib/server/api';
import { errorMessage } from '@/lib/server/fetcher';
import type { TiptapNode } from '@/lib/server/types';
import { toStoredDoc } from '@/lib/tiptap';
import { cn } from '@/lib/utils';

const MAX_TITLE_LENGTH = 300;

interface CreatePostFormProps {
  initialCommunity: string | null;
  onDone: () => void;
}

export default function CreatePostForm({ initialCommunity, onDone }: CreatePostFormProps) {
  const router = useRouter();
  const { token } = useAccessToken();
  const { data: joined } = useMyCommunities();
  const createPost = useCreatePost();

  const [community, setCommunity] = useState(initialCommunity ?? '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState<RichTextEditorState | null>(null);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const isMac = useIsMac();

  const options = joined?.map((c) => ({ name: c.name, icon: c.iconUrl })) ?? [];
  if (initialCommunity && !options.some((o) => o.name === initialCommunity)) {
    options.unshift({ name: initialCommunity, icon: null });
  }

  const upload = useCallback<MediaUploader>(
    async (file) => {
      setUploadError(null);
      const kind = mediaKindOf(file);
      if (!kind) {
        setUploadError('Only jpeg, png, gif, webp, mp4, webm and mov files are supported.');
        throw new Error('unsupported type');
      }
      if (file.size > MEDIA_LIMITS[kind]) {
        setUploadError(kind === 'image' ? 'Images can be up to 10 MB.' : 'Videos can be up to 100 MB.');
        throw new Error('file too large');
      }

      setUploading((n) => n + 1);
      try {
        const size = kind === 'image' ? await readImageSize(file) : {};
        const media = await api.media.uploadFile(file, token!, size);
        return { id: media.id, url: media.url!, kind: media.kind };
      } catch (err) {
        setUploadError(errorMessage(err));
        throw err;
      } finally {
        setUploading((n) => n - 1);
      }
    },
    [token],
  );

  const canSubmit = !!community && !!title.trim() && uploading === 0 && !createPost.isPending;

  const submit = () => {
    if (!canSubmit) return;
    createPost.mutate(
      {
        community,
        title: title.trim(),
        body: body && !body.isEmpty ? toStoredDoc(body.json as TiptapNode) : undefined,
      },
      {
        onSuccess: (post) => {
          onDone();
          router.push(`/r/${community}/comments/${post.id}`);
        },
      },
    );
  };

  const error = uploadError ?? (createPost.isError ? errorMessage(createPost.error) : null);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          submit();
        }
      }}
    >
      <section className="flex flex-col gap-4 px-5 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Select value={community} onValueChange={setCommunity}>
              <SelectTrigger className="h-8 w-auto gap-2 rounded-full border border-white/[0.06] bg-transparent pr-3 pl-1.5">
                <SelectValue placeholder="Choose a community" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    <span className="flex items-center gap-2">
                      <Avatar src={option.icon} name={option.name} size={20} />
                      r/{option.name}
                    </span>
                  </SelectItem>
                ))}
                {options.length === 0 && <p className="px-3 py-2 text-xs text-steel">Join a community to post.</p>}
              </SelectContent>
            </Select>
            <ChevronRight size={16} className="text-steel" />
            <span>New post</span>
          </div>
          <IconButton icon={X} label="Close" onClick={onDone} className="-mr-2 size-8" />
        </div>

        <Textarea
          rows={1}
          autoFocus
          placeholder="Title"
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              editor?.commands.focus('start');
            }
          }}
          className={cn(
            'field-sizing-content min-h-0 resize-none rounded-none bg-transparent p-0 text-2xl leading-tight font-semibold',
            'text-neutral-100 placeholder:text-white/25 hover:bg-transparent focus-visible:bg-transparent',
          )}
        />
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 [scrollbar-width:thin]">
        <RichTextEditor onUpload={upload} onChange={setBody} onReady={setEditor} />
        <div
          aria-hidden
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.commands.focus('end');
          }}
          className="min-h-16 flex-1 cursor-text"
        />
      </section>

      {(error || uploading > 0) && (
        <p className={cn('truncate px-5 pb-2 text-xs', error ? 'text-red-400' : 'text-steel')}>
          {error ?? `Uploading ${uploading} file${uploading === 1 ? '' : 's'}…`}
        </p>
      )}

      <Divider />

      <footer className="flex items-center gap-3 px-5 py-4">
        <div className="-ml-2 min-w-0 flex-1">{editor && <EditorToolbar editor={editor} />}</div>

        <Button onClick={submit} disabled={!canSubmit} className="h-8 shrink-0 gap-1.5">
          {createPost.isPending ? 'Posting…' : 'Post'}
          <kbd className="text-xs opacity-60">{isMac ? '⌘' : 'Ctrl'}↵</kbd>
        </Button>
      </footer>
    </div>
  );
}

function useIsMac() {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => setIsMac(/mac/i.test(navigator.userAgent)), []);
  return isMac;
}
