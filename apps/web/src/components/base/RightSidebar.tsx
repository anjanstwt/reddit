import Link from 'next/link';

import SidebarCard from '@/components/utility/SidebarCard';

const footerLinks = [
  { href: '/rules', label: 'Rules' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'User Agreement' },
];

export default function RightSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {children ?? (
        <SidebarCard title="Recent posts">
          <p className="px-4 pb-4 text-sm text-steel">Posts you visit will show up here.</p>
        </SidebarCard>
      )}

      <footer className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-xs text-steel">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-neutral-200">
            {link.label}
          </Link>
        ))}
        <span className="w-full pt-2">reddit clone © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
