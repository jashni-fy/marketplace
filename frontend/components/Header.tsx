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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all group">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Camera className="size-5 text-primary" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            jashnify
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/marketplace" className="hidden sm:block">
            <Button variant="ghost" className="rounded-full font-medium gap-2 text-slate-300 hover:text-white hover:bg-secondary">
              <ShoppingBag className="size-4" strokeWidth={2} />
              Explore
            </Button>
          </Link>

          {user && (
            <>
              <Link href={dashboardLink}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-10 rounded-full font-medium text-slate-300 hover:text-white hover:bg-secondary"
                >
                  <LayoutDashboard className="size-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium border-l border-border pl-4 px-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="size-4 text-primary" strokeWidth={2} />
                </div>
                <span className="max-w-[120px] truncate text-slate-200">{user.first_name || user.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 h-10 rounded-full font-medium border-border/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
              >
                <LogOut className="size-4" strokeWidth={2} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
          {!user && (
             <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full font-medium text-slate-300 hover:text-white hover:bg-secondary">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-6 shadow-lg shadow-primary/20">Join</Button>
                </Link>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
