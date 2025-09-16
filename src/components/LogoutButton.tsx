import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { IconLogout } from '@tabler/icons-react';

const LogoutButton = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return null; // No session means already logged out

  return (
    <Button
      onClick={() => signOut({ redirect: false }).then(() => router.push('/'))}
      className="rounded-xl gap-4 text-white"
    >
      <div>
        <IconLogout />
      </div>
      <div>Logout</div>
    </Button>
  );
};

export default LogoutButton;
