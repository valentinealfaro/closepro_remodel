import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Image as ImageIcon,
  Globe,
  Settings,
  Zap,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  FileText,
  DollarSign,
  Briefcase as BriefcaseIcon,
  Megaphone,
  ShieldCheck,
  User,
  Lock,
  CreditCard,
  Building2,
  Save,
  ChevronRight,
  Bot
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AutomationService } from '../services/AutomationService';

import AIVisualizer from '../components/AIVisualizer';
import LeadsManager from '../components/LeadsManager';
import CRMPipeline from '../components/CRMPipeline';
import WebsiteEditor from '../components/WebsiteEditor';
import AutomationEngine from '../components/AutomationEngine';
import EstimatesManager from '../components/EstimatesManager';
import InvoiceManager from '../components/InvoiceManager';
import ProjectManager from '../components/ProjectManager';
import AdsManager from '../components/AdsManager';
import AdminPanel from '../components/AdminPanel';
import AgentsPanel from '../components/AgentsPanel';

// ─── Account Settings Page ─────────────────────────────────────────────────

const AccountSettings = () => {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'billing' | 'business'>('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    displayName: userData?.displayName || '',
    email: user?.email || '',
    phone: '',
    timezone: 'America/Chicago'
  });

  const [business, setBusiness] = useState({
    businessName: userData?.businessName || '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    businessType: 'Kitchen Remodeler'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ] as const;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-6">Account Settings</h1>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === id
                ? 'bg-white text-navy shadow-sm'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="font-bold text-navy text-lg">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">Email cannot be changed. Contact support if needed.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Timezone</label>
              <select
                value={profile.timezone}
                onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric outline-none text-sm bg-white"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
            {saved && <span className="text-green-600 text-sm font-bold">Saved!</span>}
          </div>
        </form>
      )}

      {/* Business Tab */}
      {activeTab === 'business' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="font-bold text-navy text-lg">Business Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Business Name</label>
              <input
                type="text"
                value={business.businessName}
                onChange={e => setBusiness(b => ({ ...b, businessName: e.target.value }))}
                placeholder="e.g. Elite Kitchens & Baths"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Business Type</label>
              <select
                value={business.businessType}
                onChange={e => setBusiness(b => ({ ...b, businessType: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric outline-none text-sm bg-white"
              >
                <option>Kitchen Remodeler</option>
                <option>Bathroom Remodeler</option>
                <option>General Contractor</option>
                <option>Home Remodeler</option>
                <option>Roofing Company</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Website</label>
              <input
                type="url"
                value={business.website}
                onChange={e => setBusiness(b => ({ ...b, website: e.target.value }))}
                placeholder="https://yoursite.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Business Address</label>
              <input
                type="text"
                value={business.address}
                onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))}
                placeholder="123 Main St"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">City</label>
              <input
                type="text"
                value={business.city}
                onChange={e => setBusiness(b => ({ ...b, city: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">State</label>
                <input
                  type="text"
                  value={business.state}
                  onChange={e => setBusiness(b => ({ ...b, state: e.target.value }))}
                  placeholder="TX"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={business.zip}
                  onChange={e => setBusiness(b => ({ ...b, zip: e.target.value }))}
                  placeholder="78701"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
            {saved && <span className="text-green-600 text-sm font-bold">Saved!</span>}
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="font-bold text-navy text-lg">Change Password</h2>
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Current Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
              <p className="text-xs text-gray-400">Minimum 8 characters</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Lock size={16} /> Update Password
            </button>
            {saved && <span className="text-green-600 text-sm font-bold">Password updated!</span>}
          </div>
        </form>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-bold text-navy text-lg mb-6">Current Plan</h2>
            <div className="flex items-center justify-between p-6 bg-blue-electric/5 border border-blue-electric/20 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Plan</p>
                <h3 className="text-2xl font-black text-navy capitalize">{userData?.plan || 'Starter'}</h3>
                <p className="text-sm text-gray-500 mt-1">Renews on May 1, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-navy">
                  {userData?.plan === 'pro' ? '$497' : userData?.plan === 'growth' ? '$197' : '$97'}
                  <span className="text-sm font-normal text-gray-400">/mo</span>
                </p>
                <Link to="/pricing" className="text-xs text-blue-electric hover:underline font-bold flex items-center gap-1 justify-end mt-1">
                  Upgrade plan <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-bold text-navy text-lg mb-4">Plan Features</h2>
            <div className="space-y-3">
              {[
                { feature: 'Lead Management', included: true },
                { feature: 'CRM Pipeline', included: true },
                { feature: 'Estimates & Invoices', included: true },
                { feature: 'AI Remodel Visualizer', included: (userData?.plan === 'growth' || userData?.plan === 'pro') },
                { feature: 'Marketing Automation', included: (userData?.plan === 'growth' || userData?.plan === 'pro') },
                { feature: 'AI Copy Generator', included: userData?.plan === 'pro' },
                { feature: 'Priority Support', included: userData?.plan === 'pro' }
              ].map(({ feature, included }) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {included ? '✓' : '✕'}
                  </span>
                  <span className={`text-sm ${included ? 'text-navy font-medium' : 'text-gray-400'}`}>{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/pricing" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
              Upgrade Your Plan <ChevronRight size={16} />
            </Link>
          </div>

          {/* Cancel */}
          <div className="bg-white rounded-2xl border border-red-100 p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-navy text-sm">Cancel Subscription</p>
              <p className="text-xs text-gray-400 mt-1">You'll retain access until the end of your billing period.</p>
            </div>
            <button className="text-sm font-bold text-red-500 hover:text-red-700 hover:underline border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-all">
              Cancel Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Dashboard Overview ────────────────────────────────────────────────────

const Overview = () => {
  const { user, userData } = useAuth();
  const isSuperAdmin = userData?.role === 'super_admin' ||
                       user?.email?.toLowerCase().trim() === 'info@vcvservices.com' ||
                       user?.email?.toLowerCase().trim() === 'lawtonroofer@gmail.com';

  if (isSuperAdmin && !userData?.isImpersonating) {
    return <AdminPanel />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {userData?.displayName || 'there'}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: '124', change: '+12%', color: 'bg-blue-500', icon: '👥' },
          { label: 'Pending Estimates', value: '18', change: '+5%', color: 'bg-yellow-500', icon: '📋' },
          { label: 'Active Projects', value: '12', change: '+2%', color: 'bg-purple-500', icon: '🏗️' },
          { label: 'Monthly Revenue', value: '$84k', change: '+15%', color: 'bg-green-500', icon: '💰' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-navy">{stat.value}</h3>
              <span className="text-xs font-bold text-green-500">{stat.change}</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className={`h-full ${stat.color}`} style={{ width: '60%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy">Recent Leads</h3>
            <Link to="/app/leads" className="text-xs text-blue-electric font-bold hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'John Doe', type: 'Kitchen Remodel', time: '2 hours ago', status: 'New' },
              { name: 'Sarah Kim', type: 'Bathroom Remodel', time: '4 hours ago', status: 'Contacted' },
              { name: 'Mike Torres', type: 'Full Home Reno', time: '1 day ago', status: 'Estimate Sent' },
              { name: 'Linda Park', type: 'Kitchen Remodel', time: '2 days ago', status: 'New' }
            ].map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-electric/10 rounded-full flex items-center justify-center font-bold text-blue-electric text-sm">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-navy">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.type} · {lead.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  lead.status === 'New' ? 'bg-blue-100 text-blue-600' :
                  lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{lead.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy">Upcoming Appointments</h3>
            <Link to="/app/pipeline" className="text-xs text-blue-electric font-bold hover:underline">Pipeline →</Link>
          </div>
          <div className="space-y-3">
            {[
              { month: 'Apr', day: 29, title: 'Consultation: Smith Residence', time: '10:00 AM', address: '123 Maple St.' },
              { month: 'Apr', day: 30, title: 'Estimate: Johnson Kitchen', time: '2:00 PM', address: '456 Oak Ave.' },
              { month: 'May', day: 2, title: 'Walkthrough: Williams Bath', time: '11:00 AM', address: '789 Pine Rd.' }
            ].map((appt, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-l-4 border-electric bg-blue-50 rounded-r-lg">
                <div className="text-center min-w-[44px]">
                  <p className="text-[10px] font-bold text-electric uppercase">{appt.month}</p>
                  <p className="text-xl font-black text-navy leading-none">{appt.day}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-navy">{appt.title}</p>
                  <p className="text-xs text-gray-500">{appt.time} · {appt.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-navy mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add New Lead', icon: '➕', to: '/app/leads' },
              { label: 'Create Estimate', icon: '📄', to: '/app/estimates' },
              { label: 'View Pipeline', icon: '📊', to: '/app/pipeline' },
              { label: 'AI Visualizer', icon: '🤖', to: '/app/visualizer' }
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-electric hover:bg-blue-electric/5 transition-all group"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-bold text-navy group-hover:text-blue-electric">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy">Revenue This Month</h3>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+15% vs last month</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-electric/20 hover:bg-blue-electric/40 rounded-t transition-all cursor-pointer"
                style={{ height: `${h}%` }}
                title={`Week ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Apr 1</span>
            <span>Apr 15</span>
            <span>Apr 28</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar Link ───────────────────────────────────────────────────────────

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }: { to: string, icon: any, label: string, active: boolean, collapsed: boolean }) => (
  <Link
    to={to}
    title={collapsed ? label : undefined}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-electric text-white shadow-lg shadow-blue-500/30'
        : 'text-gray-400 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon size={20} className="flex-shrink-0" />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </Link>
);

// ─── Main Dashboard Component ───────────────────────────────────────────────

export default function Dashboard() {
  const { user, userData, signOut, impersonate } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  // Check for pending automations periodically
  useEffect(() => {
    if (!userData?.tenantId) return;
    const check = () => AutomationService.checkPending(userData.tenantId);
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [userData?.tenantId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isImpersonating = userData?.isImpersonating;
  const isSuperAdmin = userData?.role === 'super_admin' ||
                       user?.email?.toLowerCase().trim() === 'info@vcvservices.com' ||
                       user?.email?.toLowerCase().trim() === 'lawtonroofer@gmail.com';

  const navItems = (isSuperAdmin && !isImpersonating)
    ? [
        { to: '/app', icon: ShieldCheck, label: 'Super Admin Dashboard' },
        { to: '/app/settings', icon: Settings, label: 'System Settings' },
      ]
    : [
        { to: '/app', icon: LayoutDashboard, label: 'Overview' },
        { to: '/app/leads', icon: Users, label: 'Leads' },
        { to: '/app/pipeline', icon: Kanban, label: 'Pipeline' },
        { to: '/app/estimates', icon: FileText, label: 'Estimates' },
        { to: '/app/invoices', icon: DollarSign, label: 'Invoices' },
        { to: '/app/projects', icon: BriefcaseIcon, label: 'Projects' },
        { to: '/app/marketing', icon: Megaphone, label: 'Marketing' },
        { to: '/app/visualizer', icon: ImageIcon, label: 'AI Visualizer' },
        { to: '/app/agents', icon: Bot, label: 'AI Agents' },
        { to: '/app/website', icon: Globe, label: 'Website' },
        { to: '/app/automation', icon: Zap, label: 'Automation' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
      ];

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3 py-5' : 'justify-between px-5 py-5'}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-black">C</div>
            <div className="flex flex-col">
              <span className="leading-none">ClosePro</span>
              {isSuperAdmin && (
                <span className="text-[8px] font-black text-electric uppercase tracking-widest">Admin Mode</span>
              )}
            </div>
          </Link>
        )}
        <button
          onClick={() => { setIsSidebarCollapsed(!isSidebarCollapsed); setIsMobileNavOpen(false); }}
          className="p-1.5 hover:bg-white/10 rounded-lg hidden lg:flex items-center justify-center"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} space-y-1 mt-2`}>
        {navItems.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            active={location.pathname === item.to}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className={`${collapsed ? 'px-2 pb-4' : 'px-3 pb-4'} space-y-2`}>
        {isSuperAdmin && !collapsed && (
          <div className="p-3 bg-white/5 rounded-xl text-[10px] font-mono border border-white/10">
            <p className="font-bold text-electric mb-1 uppercase tracking-wider">Super Admin</p>
            <div className="space-y-0.5 text-gray-400">
              <p>Role: <span className="text-white">{userData?.role}</span></p>
              <p className="truncate">User: <span className="text-white">{user?.email}</span></p>
              <p>Impersonating: <span className={isImpersonating ? "text-green-400" : "text-white"}>{isImpersonating ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`bg-navy text-white transition-all duration-300 flex-shrink-0 ${isSidebarCollapsed ? 'w-16' : 'w-60'} hidden lg:flex flex-col`}>
        <SidebarContent collapsed={isSidebarCollapsed} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-navy text-white z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-5">
                <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-black">C</div>
                  <span>ClosePro</span>
                </Link>
                <button onClick={() => setIsMobileNavOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <SidebarLink key={item.to} {...item} active={location.pathname === item.to} collapsed={false} />
                ))}
              </nav>
              <div className="px-3 pb-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-electric text-white px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck size={16} />
              <span>Impersonating Tenant: <span className="underline">{userData.tenantId}</span></span>
            </div>
            <button
              onClick={() => impersonate(null)}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all"
            >
              Stop Impersonating
            </button>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search leads, projects..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-electric focus:border-electric outline-none w-56"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-7 w-px bg-gray-100"></div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-navy leading-none">{userData?.displayName || 'User'}</p>
                <p className="text-[10px] text-electric font-bold capitalize leading-none mt-0.5">{userData?.plan || 'Starter'} Plan</p>
              </div>
              <Link to="/app/settings" className="w-9 h-9 bg-electric rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-blue-700 transition-colors">
                {userData?.displayName?.[0] || (user?.email?.[0] || '').toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/leads" element={<LeadsManager />} />
            <Route path="/pipeline" element={<CRMPipeline />} />
            <Route path="/estimates" element={<EstimatesManager />} />
            <Route path="/invoices" element={<InvoiceManager />} />
            <Route path="/projects" element={<ProjectManager />} />
            <Route path="/marketing" element={<AdsManager />} />
            <Route path="/visualizer" element={<AIVisualizer />} />
            <Route path="/agents" element={<AgentsPanel />} />
            <Route path="/website" element={<WebsiteEditor />} />
            <Route path="/automation" element={<AutomationEngine />} />
            <Route path="/settings" element={
              isSuperAdmin && !isImpersonating ? (
                <AdminPanel initialTab="settings" />
              ) : (
                <AccountSettings />
              )
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}
