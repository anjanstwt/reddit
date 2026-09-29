import Content from '@/components/base/Content';
import RightSidebar from '@/components/base/RightSidebar';
import Feed from '@/components/utility/Feed';

export default function Home() {
  return (
    <Content aside={<RightSidebar />}>
      <Feed source="home" />
    </Content>
  );
}
