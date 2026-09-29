'use client';

import CreatePostForm from '@/components/post/CreatePostForm';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Block from '@/components/utility/Block';
import { useCreatePostStore } from '@/store/useCreatePostStore';

const isEditorFloating = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('[data-editor-floating]');

export default function CreatePostDialog() {
  const open = useCreatePostStore((s) => s.open);
  const community = useCreatePostStore((s) => s.community);
  const close = useCreatePostStore((s) => s.close);

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => isEditorFloating(e.target) && e.preventDefault()}
        className="flex max-h-[85vh] min-h-[45vh] w-[750px] max-w-[calc(100%-2rem)] flex-col rounded-xl border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">Create post</DialogTitle>
        <Block className="min-h-0 flex-1 shadow-2xl shadow-black/60">
          <CreatePostForm initialCommunity={community} onDone={close} />
        </Block>
      </DialogContent>
    </Dialog>
  );
}
