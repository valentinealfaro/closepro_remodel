import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Activity,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { MetricsService, ComprehensiveMetrics } from '../services/MetricsService';
import toast from 'react-hot-toast';

interface KPICard {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number; // percentage
  target?: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  icon: React.ReactNode;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<ComprehensiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await MetricsService.getComprehensiveMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to load metrics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const trialConversionPercentage = Math.round(metrics.trial.conversionRate);
  const trialConversionTarget = 40;
  const trialConversionTrend = trialConversionPercentage >= trialConversionTarget ? 0 : (trialConversionPercentage - trialConversionTarget);

  const mrrPercentageOfTarget = Math.round((metrics.revenue.mrr / 9900) * 100);
  const mrrTrend = mrrPercentageOfTarget >= 100 ? 0 : mrrPercentageOfTarget - 80; // Assuming 80% as baseline

  const activationPercentage = metrics.engagement.usersWithProjects > 0
    ? Math.round((metrics.engagement.usersWithProjects / metrics.trial.totalSignups) * 100)
    : 0;

  const signupToActivationTrend = activationPercentage >= 30 ? 0 : activationPercentage - 30; // Target 30%

  const acquiredPercentageOfTarget = Math.round((metrics.revenue.totalCustomers / 100) * 100);
  const acquiredTrend = acquiredPercentageOfTarget >= 100 ? 0 : acquiredPercentageOfTarget - 50; // Assuming 50% as midpoint

  const kpiCards: KPICard[] = [
    {
      label: 'Trial Signups',
      value: metrics.trial.totalSignups,
      target: 200,
      color: 'blue',
      icon: <Users size={20} />,
    },
    {
      label: 'Trial Conversion Rate',
      value: `${trialConversionPercentage}%`,
      target: trialConversionTarget,
      trend: trialConversionTrend,
      color: trialConversionPercentage >= trialConversionTarget ? 'green' : 'orange',
      icon: <Target size={20} />,
    },
    {
      label: 'Paid Customers',
      value: metrics.revenue.totalCustomers,
      target: 100,
      trend: acquiredTrend,
      color: metrics.revenue.totalCustomers >= 100 ? 'green' : 'purple',
      icon: <TrendingUp size={20} />,
    },
    {
      label: 'Monthly Recurring Revenue',
      value: `$${metrics.revenue.mrr.toLocaleString()}`,
      target: 9900,
      trend: mrrTrend,
      color: metrics.revenue.mrr >= 9900 ? 'green' : 'purple',
      icon: <DollarSign size={20} />,
    },
    {
      label: 'User Activation Rate',
      value: `${activationPercentage}%`,
      target: 30,
      trend: signupToActivationTrend,
      color: activationPercentage >= 30 ? 'green' : 'orange',
      icon: <Activity size={20} />,
    },
    {
      label: 'Avg Trial Duration',
      value: metrics.trial.avgTrialDuration,
      unit: 'days',
      color: 'blue',
      icon: <Calendar size={20} />,
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  const colorBg = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy mb-2">90-Day Growth Dashboard</h1>
          <p className="text-sm text-gray-600">
            Goal: 100 paying customers | $9,900 MRR
            {lastUpdated && (
              <span className="text-gray-500 ml-2">
                (Updated {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-electric text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-2xl border p-6 ${colorMap[card.color]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorBg[card.color]}`}>
                {card.icon}
              </div>
              {card.trend !== undefined && (
                <div className={`text-xs font-bold ${card.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend >= 0 ? '+' : ''}{card.trend}%
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">{card.label}</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black">{card.value}</span>
              {card.unit && <span className="text-sm text-gray-500">{card.unit}</span>}
            </div>
            {card.target && (
              <div className="bg-white/50 rounded-lg p-2 text-xs font-bold">
                Target: {card.target}
                {typeof card.value === 'string' && card.value.includes('%') ? '%' : ''}
                {typeof card.value === 'number' && !card.unit && (
                  <div className="w-full bg-white rounded mt-1 h-1">
                    <div
                      className="h-full bg-current rounded"
                      style={{
                        width: `${Math.min(100, (Number(card.value.toString().replace(/[^0-9]/g, '')) / card.target) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-navy mb-4">Revenue by Plan</h3>
          <div className="space-y-3">
            {Object.entries(metrics.revenue.customersByPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy capitalize">{plan}</p>
                  <p className="text-xs text-gray-500">{count} customers</p>
                </div>
                <p className="text-sm font-bold text-electric">
                  ${metrics.revenue.revenueByPlan[plan] || 0}/mo
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-navy mb-4">User Engagement</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Users with projects</p>
              <p className="font-bold text-navy">{metrics.engagement.usersWithProjects}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Users with estimates</p>
              <p className="font-bold text-navy">{metrics.engagement.usersWithEstimates}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Users with leads</p>
              <p className="font-bold text-navy">{metrics.engagement.usersWithLeads}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">AI generations this month</p>
              <p className="font-bold text-electric">{metrics.engagement.aiGenerationsThisMonth}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Widget leads generated</p>
              <p className="font-bold text-electric">{metrics.engagement.widgetLeadsGenerated}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      <div className="mt-8 space-y-3">
        {trialConversionPercentage < trialConversionTarget && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900">Trial Conversion Below Target</p>
              <p className="text-sm text-orange-800">
                Current: {trialConversionPercentage}% | Target: {trialConversionTarget}%
              </p>
              <p className="text-xs text-orange-700 mt-1">
                💡 Action: Focus on onboarding experience and first-aha-moment features
              </p>
            </div>
          </motion.div>
        )}

        {activationPercentage < 30 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900">Low User Activation Rate</p>
              <p className="text-sm text-orange-800">
                Only {activationPercentage}% of users created projects | Target: 30%
              </p>
              <p className="text-xs text-orange-700 mt-1">
                💡 Action: Simplify first project creation, add guided tour, offer 1:1 setup calls
              </p>
            </div>
          </motion.div>
        )}

        {metrics.revenue.totalCustomers < 50 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">Acquisition Pace</p>
              <p className="text-sm text-blue-800">
                {metrics.revenue.totalCustomers} customers acquired | Need ~50 more in next 30 days
              </p>
              <p className="text-xs text-blue-700 mt-1">
                💡 Action: Increase marketing spend, launch referral program, more outbound sales
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
