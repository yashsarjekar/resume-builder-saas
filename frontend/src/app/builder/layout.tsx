import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Builder | Create Your Resume',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reset the global white text colour so the light-bg builder renders correctly
  return <div style={{ color: '#111827' }}>{children}</div>;
}
