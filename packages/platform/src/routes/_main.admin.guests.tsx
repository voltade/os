import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import { Separator } from '@voltade/ui/separator.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@voltade/ui/tabs.tsx';
import { RefreshCw, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type InviteRow,
  InvitesTable,
} from '#src/components/team/InvitesTable.tsx';
import { MembersFilters } from '#src/components/team/MembersFilters.tsx';
import {
  type MemberRow,
  MembersTable,
} from '#src/components/team/MembersTable.tsx';
import { AccessDenied } from '#src/components/utils/access-denied.tsx';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/admin/guests')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  // Only admin and owner can view organization settings
  const currentUserMember = organisation?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;
  const canView = currentUserRole === 'admin' || currentUserRole === 'owner';

  const guests: MemberRow[] = useMemo(() => {
    const list = (organisation?.members || []).filter(
      (m) => m.role === 'guest',
    );
    return list.map((m) => ({
      id: m.id,
      userId: m.userId,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      },
      role: 'member',
      createdAt: m.createdAt,
    }));
  }, [organisation?.members]);

  const fetchInvites = useCallback(async () => {
    if (!organisation?.id) return;
    setInvitesLoading(true);
    try {
      const { data, error } = await authClient.organization.listInvitations({
        query: { organizationId: organisation.id },
      });
      if (error) throw new Error(error.message);
      const onlyPending = (data || []).filter(
        (i: InviteRow) => (i.status ?? 'pending') === 'pending',
      );
      //TODO: fix this type error
      //@ts-expect-error role can be guest
      const onlyGuests = onlyPending.filter((i) => i.role === 'guest');
      setInvites(onlyGuests);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setInvitesLoading(false);
    }
  }, [organisation?.id]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleCancelInvite = async (invitationId: string) => {
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw new Error(error.message);
      showSuccess('The invite has been cancelled');
      await fetchInvites();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleResendInvite = async (email: string, role: string) => {
    try {
      const { error } = await authClient.organization.inviteMember({
        email,
        //TODO: fix this type error
        //@ts-expect-error role can be guest
        role: role as 'admin' | 'member' | 'owner' | 'developer' | 'guest',
        organizationId: organisation?.id || undefined,
        resend: true,
      });
      if (error) throw new Error(error.message);
      showSuccess('We have re-sent the invitation email');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleRemoveGuest = async (memberId: string, memberName: string) => {
    try {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: organisation?.id || '',
      });
      if (error) throw new Error(error.message);
      showSuccess(`${memberName} has been removed`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <span className="inline-block size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Guests</h2>
          <p className="text-sm text-muted-foreground">
            Manage guest members and invitations
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchInvites}>
          <RefreshCw size={16} />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'members' | 'invites')}
      >
        <TabsList>
          <TabsTrigger value="members">Guests</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <div className="mb-4">
                <MembersFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  roleFilter={null}
                  onRoleFilterChange={() => {}}
                  showRoleFilter={false}
                />
              </div>
              <Separator className="my-4" />
              <MembersTable
                rows={guests.filter(
                  (m) =>
                    m.user.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    m.user.email
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )}
                canEditRoles={false}
                showRole={false}
                onChangeRole={() => {}}
                onRemove={handleRemoveGuest}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <Card className="gap-0 py-0">
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending guest invitations
                </CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <InvitesTable
                invites={invites}
                invitesLoading={invitesLoading}
                onCancelInvite={handleCancelInvite}
                onResendInvite={handleResendInvite}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
