import './global.css';

import LeftSidebar from '@/components/base/LeftSidebar';
import Navbar from '@/components/base/Navbar';
import PaneFrame from '@/components/base/PaneFrame';
import RightSidebar from '@/components/base/RightSidebar';
import CreateCommunityDialog from '@/components/community/CreateCommunityDialog';
import OnboardingDialog from '@/components/onboarding/OnboardingDialog';
import CreatePostDialog from '@/components/post/CreatePostDialog';
import Providers from '@/components/providers';

export const metadata = {
  title: 'reddit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scheme-dark">
      <body className="h-dvh overflow-hidden bg-cement text-neutral-200 antialiased">
        <Providers>
          <div className="flex h-dvh flex-col">
            <Navbar />
            <div className="flex min-h-0 flex-1 p-1.5">
              <LeftSidebar />
              <PaneFrame>{children}</PaneFrame>
              <RightSidebar />
            </div>
          </div>
          <CreatePostDialog />
          <CreateCommunityDialog />
          <OnboardingDialog />
        </Providers>
      </body>
    </html>
  );
}
