'use client';

import { Plus } from 'lucide-react';
import Image from 'next/image';

import Avatar from '@/components/utility/Avatar';
import CreatePostButton from '@/components/utility/CreatePostButton';
import JoinButton from '@/components/utility/JoinButton';
import type { Community } from '@/lib/server/types';

export default function CommunityHeader({ community }: { community: Community }) {


  return (
    <header className="mb-4">
      <div className="relative h-28 overflow-hidden rounded-2xl bg-cement">
        {community.bannerUrl && (
          <Image src={community.bannerUrl} alt="" fill sizes="1120px" className="object-cover" priority />
        )}
      </div>

      <div className="flex items-end gap-4 px-4">
        <Avatar
          src={community.iconUrl}
          name={community.name}
          size={80}
          className="-mt-8 border-4 border-ink text-3xl"
        />
        <div className="min-w-0 flex-1 pb-1">
          <h1 className="truncate text-2xl font-bold">r/{community.name}</h1>
          <p className="truncate text-sm text-steel">{community.title}</p>
        </div>

        <div className="flex shrink-0 gap-2 pb-1">
          <CreatePostButton variant="outline" community={community.name}>
            <Plus size={18} />
            Create Post
          </CreatePostButton>

          <JoinButton community={community} />
        </div>
      </div>
    </header>
  );
}
