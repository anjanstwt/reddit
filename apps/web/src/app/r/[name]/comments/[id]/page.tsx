import Content from '@/components/base/Content';
import RightSidebar from '@/components/base/RightSidebar';
import CommunityAbout from '@/components/community/CommunityAbout';
import PostDetail from '@/components/post/PostDetail';

export default async function PostPage({ params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;

  return (
    <Content
      aside={
        <RightSidebar>
          <CommunityAbout name={name.toLowerCase()} />
        </RightSidebar>
      }
    >
      <PostDetail id={id} />
    </Content>
  );
}
