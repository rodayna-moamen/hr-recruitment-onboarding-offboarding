import { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { UserRole } from '@/types';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  roles?: UserRole[];
}

export const Layout = ({
  children,
  title = 'Admin Dashboard',
  description = 'System Administration Panel',
  roles = [],
}: LayoutProps) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`${title} | Admin Dashboard`}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <nav style={{ 
          borderBottom: '1px solid #e5e7eb', 
          padding: '1rem 2rem',
          backgroundColor: '#1f2937',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
              HR System
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <a 
                href="/admin" 
                style={{ 
                  color: router.pathname === '/admin' ? '#60a5fa' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem'
                }}
              >
                Dashboard
              </a>
              <a 
                href="/admin/users" 
                style={{ 
                  color: router.pathname.startsWith('/admin/users') ? '#60a5fa' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem'
                }}
              >
                Users
              </a>
              <a 
                href="/admin/system-activity" 
                style={{ 
                  color: router.pathname.startsWith('/admin/system-activity') ? '#60a5fa' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem'
                }}
              >
                System Activity
              </a>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '20px 0' }}>
          {children}
        </main>

        <footer style={{ 
          padding: '20px', 
          textAlign: 'center', 
          borderTop: '1px solid #e5e7eb',
          marginTop: 'auto',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          © {new Date().getFullYear()} HR System. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default Layout;
