import './global.css';

import LeftSidebar from '@/components/base/LeftSidebar';
import Navbar from '@/components/base/Navbar';
import CreatePostDialog from '@/components/post/CreatePostDialog';
import Providers from '@/components/providers';

export const metadata = {
  title: 'reddit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scheme-dark">
      <body className="bg-cement text-neutral-200 antialiased">
        <Providers>
          <Navbar />
          <div className="flex">
            <LeftSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
          <CreatePostDialog />
        </Providers>
      </body>
    </html>
  );
}
