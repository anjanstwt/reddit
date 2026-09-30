'use client';

import CreatePostForm from '@/components/post/CreatePostForm';
import FormDialog from '@/components/utility/FormDialog';
import { useCreatePostStore } from '@/store/useCreatePostStore';

export default function CreatePostDialog() {
  const open = useCreatePostStore((s) => s.open);
  const community = useCreatePostStore((s) => s.community);
  const close = useCreatePostStore((s) => s.close);

  if (!open) return null;

  return (
    <FormDialog title="Create post" onClose={close} className="min-h-[45vh] w-[750px]">
      <CreatePostForm initialCommunity={community} onDone={close} />
    </FormDialog>
  );
}
