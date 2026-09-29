import Content from '@/components/base/Content';
import RightSidebar from '@/components/base/RightSidebar';
import CommunityAbout from '@/components/community/CommunityAbout';
import CommunityView from '@/components/community/CommunityView';

export default async function CommunityPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const community = name.toLowerCase();

  return (
    <Content
      aside={
        <RightSidebar>
          <CommunityAbout name={community} />
        </RightSidebar>
      }
    >
      <CommunityView name={community} />
    </Content>
  );
}
