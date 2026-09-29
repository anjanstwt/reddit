'use client';

import { Plus } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useCreatePostStore } from '@/store/useCreatePostStore';

interface CreatePostButtonProps extends React.ComponentProps<typeof Button> {
  community?: string;
  label?: string;
}

export default function CreatePostButton({ community, label = 'Create', children, ...props }: CreatePostButtonProps) {
  const { token } = useAccessToken();
  const openDialog = useCreatePostStore((s) => s.openDialog);

  return (
    <Button onClick={() => (token ? openDialog(community) : signIn('google'))} {...props}>
      {children ?? (
        <>
          <Plus size={20} strokeWidth={1.75} />
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </Button>
  );
}
