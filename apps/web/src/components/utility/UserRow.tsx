import Link from 'next/link';

import Avatar from '@/components/utility/Avatar';
import FollowButton from '@/components/utility/FollowButton';
import { compactNumber } from '@/lib/format';
import type { Profile } from '@/lib/server/types';

export default function UserRow({ profile }: { profile: Profile }) {
  return (
    <article className="relative flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.03]">
      <Avatar src={profile.avatarUrl} name={profile.name} size={40} />
      <div className="min-w-0 flex-1">
        <Link href={`/u/${profile.username}`} className="font-semibold text-neutral-100 after:absolute after:inset-0">
          {profile.name}
        </Link>
        <p className="truncate text-xs text-steel">
          u/{profile.username} · {compactNumber(profile.followerCount)}{' '}
          {profile.followerCount === 1 ? 'follower' : 'followers'}
        </p>
        {profile.bio && <p className="mt-0.5 truncate text-sm text-neutral-400">{profile.bio}</p>}
      </div>
      <FollowButton profile={profile} size="sm" className="relative z-10" />
    </article>
  );
}
