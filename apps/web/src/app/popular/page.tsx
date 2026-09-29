import Content from '@/components/base/Content';
import RightSidebar from '@/components/base/RightSidebar';
import Feed from '@/components/utility/Feed';

export default function Popular() {
  return (
    <Content aside={<RightSidebar />}>
      <Feed source="all" defaultSort="top" />
    </Content>
  );
}
