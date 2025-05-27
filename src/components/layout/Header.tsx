import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button'; // For styling links like buttons

export function Header() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="bg-secondary text-secondary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">LitasDark PDF Tools</Link>
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card text-card-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
          LitasDark PDF Tools
        </Link>
        <nav>
          <ul className="flex items-center space-x-4">
            {currentUser ? (
              <>
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
