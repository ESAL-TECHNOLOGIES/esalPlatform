import { useState } from 'react'
import { useAuth } from '@esal/auth'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@esal/ui'
import { Bell, Shield, User, Mail, Lock, Eye, Trash2, Download } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState({
    emailMatches: true,
    emailMessages: true,
    emailUpdates: false,
    pushMatches: true,
    pushMessages: true,
    pushUpdates: false
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePrivacyChange = (key: keyof typeof privacy, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handlePasswordChange = () => {
    if (password.new !== password.confirm) {
      alert('New passwords do not match')
      return
    }
    // TODO: Implement password change API call
    alert('Password changed successfully')
    setPassword({ current: '', new: '', confirm: '' })
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion API call
      alert('Account deletion requested')
    }
  }

  const handleExportData = () => {
    // TODO: Implement data export API call
    alert('Data export will be sent to your email')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Matches</Label>
                  <p className="text-sm text-gray-600">Get notified when you have new potential matches</p>
                </div>
                <Switch
                  checked={notifications.emailMatches}
                  onCheckedChange={() => handleNotificationChange('emailMatches')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                </div>
                <Switch
                  checked={notifications.emailMessages}
                  onCheckedChange={() => handleNotificationChange('emailMessages')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Platform Updates</Label>
                  <p className="text-sm text-gray-600">Receive updates about new features and improvements</p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={() => handleNotificationChange('emailUpdates')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Matches</Label>
                  <p className="text-sm text-gray-600">Push notifications for new matches</p>
                </div>
                <Switch
                  checked={notifications.pushMatches}
                  onCheckedChange={() => handleNotificationChange('pushMatches')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-gray-600">Push notifications for new messages</p>
                </div>
                <Switch
                  checked={notifications.pushMessages}
                  onCheckedChange={() => handleNotificationChange('pushMessages')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Platform Updates</Label>
                  <p className="text-sm text-gray-600">Push notifications for platform updates</p>
                </div>
                <Switch
                  checked={notifications.pushUpdates}
                  onCheckedChange={() => handleNotificationChange('pushUpdates')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Who can see your profile</Label>
                <Select value={privacy.profileVisibility} onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Everyone</SelectItem>
                    <SelectItem value="verified">Verified investors only</SelectItem>
                    <SelectItem value="connections">Connections only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Email Address</Label>
                  <p className="text-sm text-gray-600">Display your email on your public profile</p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Phone Number</Label>
                  <p className="text-sm text-gray-600">Display your phone number on your public profile</p>
                </div>
                <Switch
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Direct Messages</Label>
                  <p className="text-sm text-gray-600">Let other users send you direct messages</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-gray-600">Let others see when you're active on the platform</p>
                </div>
                <Switch
                  checked={privacy.showOnlineStatus}
                  onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                />
              </div>
              
              <Button onClick={handlePasswordChange} disabled={!password.current || !password.new || !password.confirm}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline">
                  Set Up 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-gray-600">Windows • Chrome • New York, NY</p>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Jan 14, 2024 2:30 PM</p>
                    <p className="text-sm text-gray-600">iPhone • Safari • New York, NY</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Jan 12, 2024 9:15 AM</p>
                    <p className="text-sm text-gray-600">Windows • Firefox • New York, NY</p>
                  </div>
                  <span className="text-sm text-gray-500">Expired</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Account Type</Label>
                <Input value="Innovator" disabled className="mt-1" />
              </div>
              
              <div>
                <Label>Member Since</Label>
                <Input value={new Date().toLocaleDateString()} disabled className="mt-1" />
              </div>
              
              <div>
                <Label>Email Address</Label>
                <Input value={user?.email || ''} disabled className="mt-1" />
              </div>
              
              <div>
                <Label>Account Status</Label>
                <Input value="Active" disabled className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                You can request a copy of all your data stored on our platform. 
                This includes your profile information, matches, messages, and activity history.
              </p>
              <Button onClick={handleExportData} variant="outline">
                Export My Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-red-600">Delete Account</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button 
                  onClick={handleDeleteAccount} 
                  variant="outline" 
                  className="mt-3 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
