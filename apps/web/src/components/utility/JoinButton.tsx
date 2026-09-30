'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useMembership } from '@/hooks/useCommunity';
import type { Community } from '@/lib/server/types';

interface JoinButtonProps extends React.ComponentProps<typeof Button> {
  community: Pick<Community, 'name' | 'viewerRole'>;
}

export default function JoinButton({ community, ...props }: JoinButtonProps) {
  const { token } = useAccessToken();
  const membership = useMembership(community.name);
  const role = community.viewerRole;

  if (role === 'owner') return null;

  return (
    <Button
      variant={role ? 'outline' : 'default'}
      disabled={membership.isPending}
      onClick={() => (token ? membership.mutate(!role) : signIn('google'))}
      {...props}
    >
      {role ? 'Joined' : 'Join'}
    </Button>
  );
}
