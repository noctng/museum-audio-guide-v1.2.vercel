import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { createPageUrl } from '@/lib/utils';
import { Home, UploadCloud, ListVideo, LogOut, Users, UserPlus } from 'lucide-react'; // Import Users icon
import { Button } from './ui/button';

const navigationItems = [
  {
    title: 'Artifacts',
    url: '/admin/artifacts', 
    icon: ListVideo,
    section: 'admin'
  },
  {
    title: 'Visitor Management', // Mục mới
    url: '/admin/visitors',
    icon: Users,
    section: 'admin'
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: UserPlus,
    section: 'admin'
  },
  {
    title: 'Upload Audio',
    url: '/admin/upload',
    icon: UploadCloud,
    section: 'admin'
  }
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth(); // Lấy hàm signOut

  const handleLogout = async () => {
    await signOut();
    navigate('/login'); // Chuyển hướng về trang login sau khi đăng xuất
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <nav className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <div>
           <img src="/assets/logoBTCP.png" alt="Museum Logo" className="w-20 h-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 text-center">Museum Guide</h1>
          <p className="text-sm text-slate-500 text-center">Admin Panel</p>
        </div>

        <div className="space-y-2 mt-8 flex-1">
            {navigationItems.map(item => (
                 <Link key={item.title} to={item.url}>
                    <Button
                        variant={location.pathname === item.url ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                    </Button>
                </Link>
            ))}
        </div>

        {/* Nút Logout ở cuối */}
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
        </Button>
      </nav>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}