import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from './ui/Button';

export const AuthenticatedMenu = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/user/dashboard">
        <Button variant="ghost">{user.username}</Button>
      </Link>
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default AuthenticatedMenu; 