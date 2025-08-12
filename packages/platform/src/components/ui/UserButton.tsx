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
import { useTheme } from '@voltade/ui/theme-provider.tsx';
import { ToggleGroup, ToggleGroupItem } from '@voltade/ui/toggle-group.tsx';
import {
  CircleUser,
  Code,
  Laptop,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from 'lucide-react';

import { authClient } from '#src/lib/auth.ts';

export function UserButton() {
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme();

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

  const handleDev = () => {
    navigate({ to: '/dev/environments' });
  };

  const handleSettings = () => {
    navigate({ to: '/settings' });
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
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <User className="mr-2 size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={theme}
            onValueChange={(v) =>
              v && setTheme(v as 'light' | 'dark' | 'system')
            }
            className="w-full"
          >
            <ToggleGroupItem
              value="light"
              aria-label="Light mode"
              className="flex-1"
            >
              <Sun className="size-4" />
              <span className="sr-only">Light</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              aria-label="Dark mode"
              className="flex-1"
            >
              <Moon className="size-4" />
              <span className="sr-only">Dark</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="system"
              aria-label="System mode"
              className="flex-1"
            >
              <Laptop className="size-4" />
              <span className="sr-only">System</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Organization</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleTeam} className="cursor-pointer">
          <Users className="mr-2 size-4" /> Team
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDev} className="cursor-pointer">
          <Code className="mr-2 size-4" /> Developer
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
