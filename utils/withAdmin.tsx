import { useSession } from 'next-auth/react';
import type { NextPage } from 'next';

export function withAdmin<P>(Page: NextPage<P>) {
  return function AdminProtectedPage(props: P) {
    const { data: session, status } = useSession();
    if (status === 'loading') return <div>Loading...</div>;
    if (!session?.user || session.user.role !== 'ADMIN') {
      if (typeof window !== 'undefined') window.location.href = '/';
      return null;
    }
    return <Page {...props} />;
  };
}

// For App Router/server components, use getServerSession for admin checks instead of this HOC.
