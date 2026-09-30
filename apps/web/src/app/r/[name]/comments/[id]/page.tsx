import Content from '@/components/base/Content';
import CommunityAbout from '@/components/community/CommunityAbout';
import PostDetail from '@/components/post/PostDetail';
import RightSidebarContent from '@/components/utility/RightSidebarContent';

export default async function PostPage({ params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;
  const community = name.toLowerCase();

  return (
    <Content>
      <PostDetail id={id} />
      <RightSidebarContent title={`About r/${community}`}>
        <CommunityAbout name={community} />
      </RightSidebarContent>
    </Content>
  );
}
