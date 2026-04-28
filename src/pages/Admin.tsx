import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  CreditCard, 
  Globe, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Activity,
  Search,
  Database,
  Flag,
  MessageSquare,
  Plus,
  Loader2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import toast from 'react-hot-toast';

import AdminClients from '../components/AdminClients';
import LeadsManager from '../components/LeadsManager';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSubscriptions: 0,
    mrr: '$0',
    totalLeads: 0
  });

  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleCreateTestTenant = async () => {
    if (!confirm('Create a new test tenant?')) return;
    setIsProvisioning(true);
    try {
      // Import ProvisioningService dynamically to avoid circular dependencies if any
      const { ProvisioningService } = await import('../lib/ProvisioningService');
      await ProvisioningService.provisionNewTenant({
        userId: 'test-' + Date.now(),
        email: 'test-' + Date.now() + '@example.com',
        businessName: 'Test Remodel ' + Math.floor(Math.random() * 1000),
        plan: 'growth'
      });
      toast.success('Test tenant created successfully');
    } catch (error) {
      console.error('Provisioning error:', error);
      toast.error('Failed to create test tenant');
    } finally {
      setIsProvisioning(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, these would be aggregated or fetched from a stats doc
        const tenantsSnap = await getDocs(query(collection(db, 'tenants'), limit(100)));
        setStats({
          totalClients: tenantsSnap.size,
          activeSubscriptions: tenantsSnap.size, // Placeholder
          mrr: `$${tenantsSnap.size * 997}`, // Placeholder
          totalLeads: 1240 // Placeholder
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'tenants_stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Shield className="text-red-500" /> Super Admin Dashboard
        </h1>
        <button 
          onClick={handleCreateTestTenant}
          disabled={isProvisioning}
          className="btn-primary flex items-center gap-2"
        >
          {isProvisioning ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          Create Test Tenant
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Clients', value: stats.totalClients, color: 'text-blue-600' },
          { label: 'Active Subs', value: stats.activeSubscriptions, color: 'text-green-600' },
          { label: 'Estimated MRR', value: stats.mrr, color: 'text-purple-600' },
          { label: 'Platform Leads', value: stats.totalLeads, color: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-navy">Recent Clients</h3>
          <Link to="/admin/clients" className="text-sm text-blue-electric font-bold hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-bold">Business</th>
                <th className="px-6 py-3 font-bold">Plan</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold">Created</th>
                <th className="px-6 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-navy text-sm">Remodel Pro {i + 1}</p>
                    <p className="text-xs text-gray-500">owner@example.com</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-600 rounded-full uppercase">Growth</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-600 rounded-full uppercase">Active</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">Apr 02, 2026</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-electric font-bold text-sm hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function Admin() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: Activity, label: 'Overview' },
    { to: '/admin/leads', icon: MessageSquare, label: 'Leads' },
    { to: '/admin/clients', icon: Users, label: 'Clients' },
    { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
    { to: '/admin/templates', icon: Globe, label: 'Templates' },
    { to: '/admin/flags', icon: Flag, label: 'Feature Flags' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="bg-navy text-white w-64 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="text-red-500" />
            <span>Admin<span className="text-blue-electric">Panel</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => (
            <Link 
              key={item.to} 
              to={item.to} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.to || (item.to === '/admin' && location.pathname === '/admin/')
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
              <Database size={14} />
              <span>System Status: Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/leads" element={<LeadsManager />} />
            <Route path="/clients" element={<AdminClients />} />
            <Route path="/billing" element={<div className="p-6">Global Billing (Coming Soon)</div>} />
            <Route path="/templates" element={<div className="p-6">Template Management (Coming Soon)</div>} />
            <Route path="/flags" element={<div className="p-6">Feature Flags (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="p-6">System Settings (Coming Soon)</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
