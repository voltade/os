import { redirect, useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import { Skeleton } from '@voltade/ui/skeleton.tsx';
import { CircleUser, LogOut, Settings, User, Users } from 'lucide-react';

import { authClient } from '#src/lib/auth.ts';

export function UserButton() {
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!sessionData) {
    redirect({ to: '/signin' });
    return null;
  }

  const handleLogout = async () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          localStorage.removeItem('voltade-jwt');
          navigate({ to: '/signin' });
        },
      },
    });
  };

  const handleTeam = () => {
    navigate({ to: '/team' });
  };

  const handleProfile = () => {
    navigate({ to: '/profile' });
  };

  const handleSettings = () => {
    console.log('Settings clicked');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-accent"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={sessionData.user.image ?? undefined}
              alt={sessionData.user.name ?? 'User'}
            />
            <AvatarFallback>
              <CircleUser className="size-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="size-10">
            <AvatarImage
              src={sessionData.user.image ?? undefined}
              alt={sessionData.user.name ?? 'User'}
            />
            <AvatarFallback>
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {sessionData.user.name || 'User'}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {sessionData.user.email}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <User className="mr-2 size-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Organization</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleTeam} className="cursor-pointer">
          <Users className="mr-2 size-4" /> Team
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-700"
        >
          <LogOut className="mr-2 size-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
