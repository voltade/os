import { createFileRoute, Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Badge } from '@voltade/ui/badge.tsx';
import { Card, CardContent } from '@voltade/ui/card.tsx';
import { Input } from '@voltade/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { Separator } from '@voltade/ui/separator.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@voltade/ui/table.tsx';
import { Edit, Mail, Search, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

// Hardcoded user data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@voltade.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15',
    createdAt: '2024-01-01',
    image: null,
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@voltade.com',
    role: 'member',
    status: 'active',
    lastLogin: '2024-01-14',
    createdAt: '2024-01-02',
    image: null,
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@voltade.com',
    role: 'developer',
    status: 'active',
    lastLogin: '2024-01-13',
    createdAt: '2024-01-03',
    image: null,
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@voltade.com',
    role: 'member',
    status: 'inactive',
    lastLogin: '2024-01-10',
    createdAt: '2024-01-04',
    image: null,
  },
  {
    id: '5',
    name: 'Alex Thompson',
    email: 'alex.thompson@voltade.com',
    role: 'owner',
    status: 'active',
    lastLogin: '2024-01-15',
    createdAt: '2023-12-15',
    image: null,
  },
];

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              User Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>

        <Card className="gap-0 py-0">
          <CardContent className="p-6">
            {/* Filters in Card Header */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex-1 min-w-[260px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      className="pl-8 w-full"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <Select
                  value={roleFilter ?? 'all'}
                  onValueChange={(val) =>
                    setRoleFilter(val === 'all' ? null : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Users Table */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[220px]">Role</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.image ? (
                              <AvatarImage src={user.image} alt={user.name} />
                            ) : (
                              <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.name}</span>
                              {user.role === 'owner' && (
                                <Badge variant="secondary">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/settings"
                          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md p-1"
                        >
                          <Edit size={16} />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-medium text-foreground">
                No members found
              </h3>
              <p className="text-sm text-muted-foreground">
                No members found matching your criteria
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
