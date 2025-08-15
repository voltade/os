import { createFileRoute } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Badge } from '@voltade/ui/badge.tsx';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent } from '@voltade/ui/card.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@voltade/ui/tabs.tsx';
import { Mail, Phone, User } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              User Settings
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>

        <Card className="border border-border">
          <CardContent className="p-6">
            {/* Profile Section */}
            <div className="flex items-start gap-4 mb-8">
              <Avatar className="size-16">
                <AvatarImage src={undefined} alt="John Doe" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-foreground">
                    John Doe
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Administrator
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="size-4 mr-2" />
                    demo_en_US
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="size-4 mr-2" />
                    +1 (555) 123-4567
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </div>

            <Tabs defaultValue="preferences" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preferences">User Preferences</TabsTrigger>
                <TabsTrigger value="permissions">App Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="preferences" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="timezone"
                      className="text-sm font-medium text-foreground"
                    >
                      Timezone
                    </label>
                    <Select defaultValue="utc">
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">
                          UTC (Coordinated Universal Time)
                        </SelectItem>
                        <SelectItem value="est">
                          EST (Eastern Standard Time)
                        </SelectItem>
                        <SelectItem value="pst">
                          PST (Pacific Standard Time)
                        </SelectItem>
                        <SelectItem value="cst">
                          CST (Central Standard Time)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="language"
                      className="text-sm font-medium text-foreground"
                    >
                      Language
                    </label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="date-format"
                      className="text-sm font-medium text-foreground"
                    >
                      Date Format
                    </label>
                    <Select defaultValue="mdy">
                      <SelectTrigger id="date-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="time-format"
                      className="text-sm font-medium text-foreground"
                    >
                      Time Format
                    </label>
                    <Select defaultValue="12h">
                      <SelectTrigger id="time-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="mt-6 space-y-6">
                <div className="space-y-6">
                  {/* Sales App Permissions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Sales Application
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="sales-leads"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Lead Management
                        </label>
                        <Select defaultValue="full">
                          <SelectTrigger id="sales-leads">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="sales-opportunities"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Opportunities
                        </label>
                        <Select defaultValue="write">
                          <SelectTrigger id="sales-opportunities">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="sales-contracts"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Contract Management
                        </label>
                        <Select defaultValue="read">
                          <SelectTrigger id="sales-contracts">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="sales-reports"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Sales Reports
                        </label>
                        <Select defaultValue="full">
                          <SelectTrigger id="sales-reports">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="sales-forecasting"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Sales Forecasting
                        </label>
                        <Select defaultValue="write">
                          <SelectTrigger id="sales-forecasting">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="sales-admin"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Sales Administration
                        </label>
                        <Select defaultValue="none">
                          <SelectTrigger id="sales-admin">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Project Management Permissions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Project Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="project-create"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Create Projects
                        </label>
                        <Select defaultValue="full">
                          <SelectTrigger id="project-create">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="project-manage"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Manage Projects
                        </label>
                        <Select defaultValue="full">
                          <SelectTrigger id="project-manage">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="project-tasks"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Task Management
                        </label>
                        <Select defaultValue="write">
                          <SelectTrigger id="project-tasks">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="project-resources"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Resource Planning
                        </label>
                        <Select defaultValue="read">
                          <SelectTrigger id="project-resources">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="project-timeline"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Timeline Management
                        </label>
                        <Select defaultValue="write">
                          <SelectTrigger id="project-timeline">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="project-budget"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Budget Management
                        </label>
                        <Select defaultValue="none">
                          <SelectTrigger id="project-budget">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="project-reports"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Project Reports
                        </label>
                        <Select defaultValue="read">
                          <SelectTrigger id="project-reports">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Website Editor Permissions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Website Editor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="web-pages"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Page Management
                        </label>
                        <Select defaultValue="write">
                          <SelectTrigger id="web-pages">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="web-content"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Content Editing
                        </label>
                        <Select defaultValue="full">
                          <SelectTrigger id="web-content">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="web-media"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Media Library
                        </label>
                        <Select defaultValue="write">
                          <SelectTrigger id="web-media">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="web-templates"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Template Management
                        </label>
                        <Select defaultValue="read">
                          <SelectTrigger id="web-templates">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="web-seo"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          SEO Settings
                        </label>
                        <Select defaultValue="none">
                          <SelectTrigger id="web-seo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="web-publish"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Publishing Rights
                        </label>
                        <Select defaultValue="none">
                          <SelectTrigger id="web-publish">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="web-analytics"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Analytics Access
                        </label>
                        <Select defaultValue="read">
                          <SelectTrigger id="web-analytics">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-border">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
