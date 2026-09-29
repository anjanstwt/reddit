'use client';

import { Cake, Users } from 'lucide-react';

import SidebarCard from '@/components/utility/SidebarCard';
import { useCommunity } from '@/hooks/useCommunity';
import { compactNumber } from '@/lib/format';

const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });

export default function CommunityAbout({ name }: { name: string }) {
  const { data: community } = useCommunity(name);
  if (!community) return null;

  return (
    <SidebarCard title="About">
      <div className="flex flex-col gap-3 px-4 pb-4 text-sm">
        <p className="font-semibold text-neutral-100">{community.title}</p>
        {community.description && <p className="whitespace-pre-line text-neutral-400">{community.description}</p>}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-3 text-steel">
          <span className="flex items-center gap-2">
            <Users size={16} />
            {compactNumber(community.memberCount)} {community.memberCount === 1 ? 'member' : 'members'}
          </span>
          <span className="flex items-center gap-2">
            <Cake size={16} />
            Created {dateFormat.format(new Date(community.createdAt))}
          </span>
        </div>
      </div>
    </SidebarCard>
  );
}
