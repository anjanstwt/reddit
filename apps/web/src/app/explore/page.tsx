import Content from '@/components/base/Content';
import ExploreView, { type ExploreTab } from '@/components/explore/ExploreView';

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const { q = '', tab } = await searchParams;
  const initialTab: ExploreTab = tab === 'people' ? 'people' : 'communities';

  return (
    <Content>
      <ExploreView key={`${q}-${initialTab}`} initialQuery={q} initialTab={initialTab} />
    </Content>
  );
}
