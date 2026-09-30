'use client';

import CreateCommunityForm from '@/components/community/CreateCommunityForm';
import FormDialog from '@/components/utility/FormDialog';
import { useCreateCommunityStore } from '@/store/useCreateCommunityStore';

export default function CreateCommunityDialog() {
  const open = useCreateCommunityStore((s) => s.open);
  const close = useCreateCommunityStore((s) => s.close);

  if (!open) return null;

  return (
    <FormDialog title="Create community" onClose={close} className="w-[600px]">
      <CreateCommunityForm onDone={close} />
    </FormDialog>
  );
}
