import Content from '@/components/base/Content';
import RightSidebar from '@/components/base/RightSidebar';
import PostSkeleton from '@/components/utility/PostSkeleton';

export default function Home() {
  return (
    <Content aside={<RightSidebar />}>
      {Array.from({ length: 3 }, (_, i) => (
        <PostSkeleton key={i} />
      ))}
    </Content>
  );
}
