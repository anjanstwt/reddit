'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useFollow } from '@/hooks/useProfile';
import type { Profile } from '@/lib/server/types';

interface FollowButtonProps extends React.ComponentProps<typeof Button> {
  profile: Pick<Profile, 'id' | 'username' | 'isFollowing'>;
}

export default function FollowButton({ profile, ...props }: FollowButtonProps) {
  const { token, userId } = useAccessToken();
  const follow = useFollow(profile.username ?? '');

  if (!profile.username || profile.id === userId) return null;

  return (
    <Button
      variant={profile.isFollowing ? 'outline' : 'default'}
      disabled={follow.isPending}
      onClick={() => (token ? follow.mutate(!profile.isFollowing) : signIn('google'))}
      {...props}
    >
      {profile.isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
