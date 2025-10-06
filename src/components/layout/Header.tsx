import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LogoutButton from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button'; // For styling links like buttons

export function Header() {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <header className="bg-card text-card-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
          LitasDark PDF Tools
        </Link>
        <nav>
          <ul className="flex items-center space-x-4">
            {isAuthenticated && currentUser ? (
              <>
                <li className="text-sm text-gray-600">
                  {currentUser.email}
                </li>
                <li>
                  <LogoutButton />
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                </li>
                <li>
                  <Link to="/signup">
                    <Button variant="default">Sign Up</Button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
