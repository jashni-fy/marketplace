import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Camera, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Camera className="size-7 text-foreground" strokeWidth={1.5} />
          <span className="text-xl font-light tracking-tight">jashnify</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link to="/dashboard">
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
        </div>
      </div>
    </header>
  );
}