'use client';

// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, LogOut, User, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const dashboardLink = user?.role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Camera className="size-7 text-foreground" strokeWidth={1.5} />
          <span className="text-xl font-light tracking-tight">jashnify</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="hidden sm:block">
            <Button variant="ghost" className="rounded-full font-light gap-2">
              <ShoppingBag className="size-4" strokeWidth={1.5} />
              Explore
            </Button>
          </Link>

          {user && (
            <>
              <Link href={dashboardLink}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-10 rounded-full font-normal"
                >
                  <LayoutDashboard className="size-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-light px-3">
                <User className="size-4" strokeWidth={1.5} />
                <span>{user.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 h-10 rounded-full font-normal"
              >
                <LogOut className="size-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
          {!user && (
             <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full font-light">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full font-light px-6">Join</Button>
                </Link>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
