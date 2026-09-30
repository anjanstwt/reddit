import Content from '@/components/base/Content';
import CommunityAbout from '@/components/community/CommunityAbout';
import CommunityView from '@/components/community/CommunityView';
import RightSidebarContent from '@/components/utility/RightSidebarContent';

export default async function CommunityPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const community = name.toLowerCase();

  return (
    <Content>
      <CommunityView name={community} />
      <RightSidebarContent title={`About r/${community}`}>
        <CommunityAbout name={community} />
      </RightSidebarContent>
    </Content>
  );
}
