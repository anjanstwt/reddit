import Link from 'next/link';

import Avatar from '@/components/utility/Avatar';
import JoinButton from '@/components/utility/JoinButton';
import { compactNumber } from '@/lib/format';
import type { Community } from '@/lib/server/types';

export default function CommunityRow({ community }: { community: Community }) {
  return (
    <article className="relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-white/[0.03]">
      <Avatar src={community.iconUrl} name={community.name} size={40} />
      <div className="min-w-0 flex-1">
        <Link href={`/r/${community.name}`} className="font-semibold text-neutral-100 after:absolute after:inset-0">
          r/{community.name}
        </Link>
        <p className="truncate text-xs text-steel">
          {compactNumber(community.memberCount)} {community.memberCount === 1 ? 'member' : 'members'} · {community.title}
        </p>
        {community.description && <p className="mt-0.5 truncate text-sm text-neutral-400">{community.description}</p>}
      </div>
      <JoinButton community={community} size="sm" className="relative z-10" />
    </article>
  );
}
