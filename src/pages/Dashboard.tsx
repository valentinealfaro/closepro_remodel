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
  Bot,
  CheckCircle2,
  Circle,
  PartyPopper
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

import LeadsManager from '../components/LeadsManager';
import AdminPanel from '../components/AdminPanel';
import AgentsPanel from '../components/AgentsPanel';
import EmbedCodePanel from '../components/EmbedCodePanel';
import ProjectsPanel from '../components/ProjectsPanel';

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

// ─── Onboarding Checklist ──────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  { id: 'embed',    label: 'Get your embed code',                   link: '/app/embed',       icon: '🔗' },
  { id: 'install',  label: 'Add the widget to your website',        link: '/app/embed',       icon: '💻' },
  { id: 'profile',  label: 'Complete your business profile',        link: '/app/settings',    icon: '👤' },
  { id: 'lead',     label: 'Receive your first widget lead',        link: '/app/leads',       icon: '📥' },
  { id: 'project',  label: 'Save a lead into a project folder',     link: '/app/projects',    icon: '📁' },
];

const OnboardingChecklist = () => {
  const STORAGE_KEY = 'cp_onboarding_v1';
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('cp_onboarding_dismissed') === '1');

  const toggle = (id: string) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const dismiss = () => {
    localStorage.setItem('cp_onboarding_dismissed', '1');
    setDismissed(true);
  };

  const doneCount = completed.length;
  const total = ONBOARDING_STEPS.length;
  const allDone = doneCount === total;

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 rounded-2xl border p-5 relative ${allDone ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-100'}`}
    >
      <button onClick={dismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
        <X size={16} />
      </button>
      <div className="flex items-center gap-3 mb-4">
        {allDone
          ? <PartyPopper size={22} className="text-green-500" />
          : <Zap size={22} className="text-blue-electric" />}
        <div>
          <h3 className="font-bold text-navy text-sm">
            {allDone ? 'Setup Complete! You\'re ready to close jobs.' : `Get set up — ${doneCount} of ${total} done`}
          </h3>
          {!allDone && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden w-40">
                <div className="h-full bg-blue-electric rounded-full transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
              </div>
              <span className="text-xs text-blue-electric font-bold">{Math.round((doneCount / total) * 100)}%</span>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ONBOARDING_STEPS.map(step => {
          const done = completed.includes(step.id);
          return (
            <div key={step.id} className="flex items-center gap-3 group">
              <button onClick={() => toggle(step.id)} className="shrink-0">
                {done
                  ? <CheckCircle2 size={18} className="text-green-500" />
                  : <Circle size={18} className="text-gray-300 group-hover:text-blue-electric transition-colors" />}
              </button>
              <Link to={step.link}
                className={`text-sm font-medium flex items-center gap-1.5 ${done ? 'line-through text-gray-400' : 'text-navy hover:text-blue-electric'} transition-colors`}>
                <span>{step.icon}</span> {step.label}
              </Link>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="mt-4 flex gap-3">
          <button onClick={dismiss} className="text-xs font-bold text-green-600 hover:underline">Dismiss checklist</button>
        </div>
      )}
    </motion.div>
  );
};

// ─── Recent Leads (real data) ─────────────────────────────────────────────

const RecentLeads = ({ tenantId }: { tenantId?: string }) => {
  const [leads, setLeads] = useState<any[]>([]);
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(
      query(collection(db, `tenants/${tenantId}/widgetLeads`), orderBy('createdAt', 'desc'), limit(5)),
      (snap) => setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [tenantId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-navy">Recent Widget Leads</h3>
        <Link to="/app/leads" className="text-xs text-blue-electric font-bold hover:underline">View all →</Link>
      </div>
      {leads.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-3xl">📭</p>
          <p className="text-sm font-bold text-gray-500">No leads yet</p>
          <p className="text-xs text-gray-400">Leads from your embedded widget appear here automatically</p>
          <Link to="/app/embed" className="text-xs text-blue-electric font-bold hover:underline">
            Get your embed code →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-9 h-9 bg-blue-electric/10 rounded-full flex items-center justify-center font-bold text-blue-electric text-sm shrink-0">
                {(lead.name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-navy truncate">{lead.name}</p>
                <p className="text-xs text-gray-500 capitalize">{lead.roomType} · {lead.style}</p>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full shrink-0">New</span>
            </div>
          ))}
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

      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embed code CTA — most important action */}
        <div className="bg-navy rounded-xl p-6 text-white space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔗</span>
            <div>
              <h3 className="font-bold text-lg">Add the Widget to Your Website</h3>
              <p className="text-gray-300 text-sm">Paste one snippet. Homeowners generate → you get leads.</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 font-mono text-xs text-gray-300 break-all">
            {`<iframe src="https://closepro-remodel.vercel.app/widget/${userData?.tenantId || '...'}" width="100%" height="750" frameborder="0" style="border-radius:16px"/>`}
          </div>
          <Link to="/app/embed" className="inline-flex items-center gap-2 bg-blue-electric text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">
            Get Full Embed Code + Instructions →
          </Link>
        </div>

        {/* Recent widget leads */}
        <RecentLeads tenantId={userData?.tenantId} />

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-navy mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'View All Leads', icon: '📥', to: '/app/leads' },
              { label: 'Saved Projects', icon: '📁', to: '/app/projects' },
              { label: 'Get Embed Code', icon: '🔗', to: '/app/embed' },
              { label: 'Account Settings', icon: '⚙️', to: '/app/settings' }
            ].map((action, i) => (
              <Link key={i} to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-electric hover:bg-blue-electric/5 transition-all group">
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-bold text-navy group-hover:text-blue-electric">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Embed code CTA */}
        <div className="bg-navy p-6 rounded-xl text-white space-y-3">
          <h3 className="font-bold">🔗 Add the Widget to Your Website</h3>
          <p className="text-gray-300 text-sm">Copy your embed code and paste it on any page of your contractor website to start capturing AI remodel leads.</p>
          <Link to="/app/embed" className="inline-flex items-center gap-2 bg-blue-electric text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">
            Get My Embed Code →
          </Link>
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
        { to: '/app', icon: ShieldCheck, label: 'Super Admin' },
        { to: '/app/agents', icon: Bot, label: 'AI Agents' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
      ]
    : [
        { to: '/app', icon: LayoutDashboard, label: 'Overview' },
        { to: '/app/leads', icon: Users, label: 'Leads' },
        { to: '/app/projects', icon: BriefcaseIcon, label: 'Saved Projects' },
        { to: '/app/embed', icon: Globe, label: 'Embed Code' },
        { to: '/app/settings', icon: Settings, label: 'Account' },
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
            <Route path="/projects" element={<ProjectsPanel />} />
            <Route path="/embed" element={<EmbedCodePanel />} />
            <Route path="/agents" element={<AgentsPanel />} />
            <Route path="/settings" element={
              isSuperAdmin && !isImpersonating ? <AdminPanel initialTab="settings" /> : <AccountSettings />
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}
