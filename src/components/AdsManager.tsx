import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  DollarSign, 
  Zap, 
  Layout, 
  Globe, 
  Facebook, 
  Instagram, 
  Linkedin, 
  ArrowUpRight, 
  Loader2,
  ChevronRight,
  Pause,
  Play,
  Trash2,
  BarChart3,
  Target
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { AdCampaign, CampaignStatus } from '../types/ads';
import { AdService } from '../services/AdService';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import AdCampaignBuilder from './AdCampaignBuilder';

export default function AdsManager() {
  const { userData } = useAuth();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);

  useEffect(() => {
    if (!userData?.tenantId) return;
    loadCampaigns();
  }, [userData?.tenantId]);

  const loadCampaigns = async () => {
    try {
      const data = await AdService.getCampaigns(userData!.tenantId);
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (campaign: AdCampaign) => {
    const newStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await AdService.updateCampaign(userData!.tenantId, campaign.id!, { status: newStatus });
      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadCampaigns();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalSpend: campaigns.reduce((acc, c) => acc + (c.budget.daily * 30), 0), // Simulated monthly
    totalLeads: 142, // Placeholder
    avgCpl: 24.50, // Placeholder
    conversionRate: 12.4 // Placeholder
  };

  if (showBuilder) {
    return (
      <AdCampaignBuilder 
        onClose={() => {
          setShowBuilder(false);
          loadCampaigns();
        }} 
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Megaphone className="text-electric" /> Marketing Engine
          </h1>
          <p className="text-gray-500">Create high-converting ads and track lead generation.</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3 bg-electric hover:bg-blue-700 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Monthly Budget', value: `$${stats.totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg. CPL', value: `$${stats.avgCpl.toFixed(2)}`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-navy">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Campaign</th>
                <th className="px-6 py-4 font-bold">Goal / Service</th>
                <th className="px-6 py-4 font-bold">Budget</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Performance</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                    <p className="text-gray-500 font-medium">Loading campaigns...</p>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Megaphone className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500 font-medium">No campaigns found.</p>
                    <button 
                      onClick={() => setShowBuilder(true)}
                      className="mt-4 text-blue-electric font-bold hover:underline"
                    >
                      Create your first campaign
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          campaign.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <BarChart3 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-navy text-sm">{campaign.name}</p>
                          <p className="text-xs text-gray-500">Created {new Date(campaign.createdAt?.toDate?.() || campaign.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 capitalize">{campaign.goal.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{campaign.service}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-navy">${campaign.budget.daily}/day</p>
                        <p className="text-xs text-gray-500">Est. ${campaign.budget.daily * 30}/mo</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-600' : 
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs font-bold text-navy">{Math.floor(Math.random() * 50) + 10}</p>
                          <p className="text-[10px] text-gray-400 uppercase">Leads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-navy">{Math.floor(Math.random() * 1000) + 200}</p>
                          <p className="text-[10px] text-gray-400 uppercase">Clicks</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(campaign)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={campaign.status === 'active' ? 'Pause' : 'Start'}
                        >
                          {campaign.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
