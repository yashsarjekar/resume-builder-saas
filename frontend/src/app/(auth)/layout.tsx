import { Metadata } from 'next';
import GoogleOAuthWrapper from '@/components/auth/GoogleOAuthWrapper';

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoogleOAuthWrapper>{children}</GoogleOAuthWrapper>;
}
