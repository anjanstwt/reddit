import Content from '@/components/base/Content';
import CreateCommunityForm from '@/components/community/CreateCommunityForm';

export default function CreateCommunity() {
  return (
    <Content className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Start a community</h1>
      <CreateCommunityForm />
    </Content>
  );
}
