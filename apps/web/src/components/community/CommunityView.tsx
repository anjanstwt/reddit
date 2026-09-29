'use client';

import CommunityHeader from '@/components/community/CommunityHeader';
import Feed from '@/components/utility/Feed';
import { useCommunity } from '@/hooks/useCommunity';
import { ApiError } from '@/lib/server/fetcher';

export default function CommunityView({ name }: { name: string }) {
  const { data: community, error, isPending } = useCommunity(name);

  if (isPending) return <div className="mb-4 h-40 animate-pulse rounded-2xl bg-white/5" />;
  if (error) {
    return (
      <p className="py-16 text-center text-sm text-steel">
        {error instanceof ApiError && error.status === 404 ? `r/${name} doesn't exist.` : "Couldn't load this community."}
      </p>
    );
  }

  return (
    <>
      <CommunityHeader community={community} />
      <Feed source={{ community: community.name }} />
    </>
  );
}
