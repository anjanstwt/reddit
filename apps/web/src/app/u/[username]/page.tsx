import Content from '@/components/base/Content';
import ProfileView from '@/components/profile/ProfileView';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  return (
    <Content>
      <ProfileView username={username.toLowerCase()} />
    </Content>
  );
}
