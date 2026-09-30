import Content from '@/components/base/Content';
import Feed from '@/components/utility/Feed';

export default function Popular() {
  return (
    <Content>
      <Feed source="all" defaultSort="top" />
    </Content>
  );
}
