import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { UserRole } from '@/types';

const AdminDashboard: NextPage = () => {
  const router = useRouter();
  // TODO: Implement permission checks when auth system is integrated
  const canViewUsers = true; // useHasPermission([UserRole.ADMIN]);
  const canViewSystemActivity = true; // useHasPermission([UserRole.ADMIN]);

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: '👥',
      path: '/admin/users',
      enabled: canViewUsers,
    },
    {
      title: 'System Activity',
      description: 'View system logs and activity',
      icon: '📊',
      path: '/admin/system-activity',
      enabled: canViewSystemActivity,
    },
  ];

  return (
    <Layout title="Admin Dashboard">
      <div style={{ padding: '3rem 2rem' }}>
        <h1 style={{ marginBottom: '2.5rem', fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {adminCards.map((card, index) => (
            card.enabled && (
              <div 
                key={index}
                onClick={() => router.push(card.path)}
                style={{
                  height: '200px',
                  padding: '1.5rem',
                  backgroundColor: '#1f2937',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid #374151',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{card.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>{card.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{card.description}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
