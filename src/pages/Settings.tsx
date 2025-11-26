import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Bell, Shield, CreditCard } from "lucide-react";

interface SettingsProps {
  userType: "developer" | "agent" | "broker";
}

const Settings = ({ userType }: SettingsProps) => {
  return (
    <DashboardLayout title="Settings" userType={userType}>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Profile Settings</h3>
            </div>
            <div className="space-y-4 max-w-xl">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.smith@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+44 7700 900123" />
              </div>
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" defaultValue="Senior Property Developer" />
              </div>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Company Information</h3>
            </div>
            <div className="space-y-4 max-w-xl">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="Premier Developments Ltd" />
              </div>
              <div>
                <Label htmlFor="companyWebsite">Website</Label>
                <Input id="companyWebsite" defaultValue="https://premierdevelopments.com" />
              </div>
              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Input id="companyAddress" defaultValue="123 Business Street, London, UK" />
              </div>
              <div>
                <Label htmlFor="companyPhone">Company Phone</Label>
                <Input id="companyPhone" defaultValue="+44 20 1234 5678" />
              </div>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Notification Preferences</h3>
            </div>
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">New Lead Notifications</div>
                  <p className="text-sm text-muted-foreground">Get notified when new leads arrive</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <p className="text-sm text-muted-foreground">Receive SMS alerts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">WhatsApp Notifications</div>
                  <p className="text-sm text-muted-foreground">Get updates on WhatsApp</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly Summary</div>
                  <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Security Settings</h3>
            </div>
            <div className="space-y-6 max-w-xl">
              <div>
                <h4 className="font-semibold mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Billing & Subscription</h3>
            </div>
            <div className="space-y-6 max-w-xl">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-lg">Professional Plan</div>
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$99</div>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Next billing date: Dec 1, 2024</div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Payment Method</h4>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CreditCard className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">•••• •••• •••• 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 12/25</div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
              <div>
                <Button variant="outline" className="w-full">View Billing History</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
