import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  CreditCard, 
  Brain, 
  Zap, 
  Kanban, 
  Users, 
  FileText, 
  Megaphone, 
  Share2, 
  Bell, 
  ShieldCheck, 
  Database, 
  Flag,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Layout,
  Type,
  Eye,
  Lock,
  Terminal,
  Sparkles,
  ChevronRight,
  Search,
  ExternalLink,
  Info,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

type SettingsSection = 
  | 'general' 
  | 'branding' 
  | 'billing' 
  | 'ai' 
  | 'automation' 
  | 'crm' 
  | 'leads' 
  | 'estimates' 
  | 'marketing' 
  | 'integrations' 
  | 'notifications' 
  | 'security' 
  | 'logs' 
  | 'feature-flags';

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sections = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'branding', label: 'Branding & White Label', icon: Palette },
    { id: 'billing', label: 'Plans & Billing Rules', icon: CreditCard },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'automation', label: 'Automation Defaults', icon: Zap },
    { id: 'crm', label: 'CRM / Pipeline Defaults', icon: Kanban },
    { id: 'leads', label: 'Lead Management', icon: Users },
    { id: 'estimates', label: 'Estimate & Invoice', icon: FileText },
    { id: 'marketing', label: 'Ads & Marketing', icon: Megaphone },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Permissions', icon: ShieldCheck },
    { id: 'logs', label: 'Data & Logs', icon: Database },
    { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
  ];

  const handleSave = () => {
    toast.success('System settings updated successfully');
    setHasUnsavedChanges(false);
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Are you sure you want to restore all settings to their default values? This cannot be undone.')) {
      toast.success('Settings restored to defaults');
      setHasUnsavedChanges(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general': return <GeneralSettings />;
      case 'branding': return <BrandingSettings />;
      case 'billing': return <BillingSettings />;
      case 'ai': return <AISettings />;
      case 'automation': return <AutomationSettings />;
      case 'crm': return <CRMSettings />;
      case 'leads': return <LeadSettings />;
      case 'estimates': return <EstimateSettings />;
      case 'marketing': return <MarketingSettings />;
      case 'integrations': return <IntegrationSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'security': return <SecuritySettings />;
      case 'logs': return <LogSettings />;
      case 'feature-flags': return <FeatureFlagSettings />;
      default: return null;
    }
  };

  return (
    <div className="flex gap-8 min-h-[800px]">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-black text-navy uppercase tracking-widest">System Control</h3>
          </div>
          <nav className="p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as SettingsSection)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeSection === section.id
                    ? 'bg-electric text-white shadow-lg shadow-electric/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-navy'
                }`}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric/10 text-electric rounded-xl flex items-center justify-center">
              {sections.find(s => s.id === activeSection)?.icon && React.createElement(sections.find(s => s.id === activeSection)!.icon, { size: 20 })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">{sections.find(s => s.id === activeSection)?.label}</h2>
              <p className="text-xs text-gray-500">Configure global platform behavior and defaults.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full animate-pulse">
                <AlertCircle size={14} /> Unsaved Changes
              </span>
            )}
            <button 
              onClick={handleRestoreDefaults}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-navy transition-colors"
            >
              <RotateCcw size={18} /> Restore Defaults
            </button>
            <button 
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>

        {/* Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderSection()}
        </motion.div>

        {/* AI Helper Buttons (Platform Wide) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <AIHelperButton 
            label="Optimize for Contractors" 
            description="Adjust settings based on industry best practices."
            icon={Sparkles}
          />
          <AIHelperButton 
            label="Recommend Pricing" 
            description="Analyze market data to suggest optimal tiers."
            icon={DollarSign}
          />
          <AIHelperButton 
            label="Suggest Automations" 
            description="Generate default follow-up sequences."
            icon={Zap}
          />
          <AIHelperButton 
            label="Analyze Performance" 
            description="Identify bottlenecks in system behavior."
            icon={BarChart3}
          />
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for Sections ---

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Platform Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Platform Name" defaultValue="ClosePro Remodel" />
          <InputField label="Support Email" defaultValue="support@closepro.com" />
          <InputField label="Support Phone" defaultValue="+1 (555) 000-0000" />
          <SelectField label="Default Timezone" options={['UTC', 'EST', 'CST', 'PST']} />
        </div>
      </SettingsCard>

      <SettingsCard title="Localization & Units">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField label="Default Currency" options={['USD ($)', 'EUR (€)', 'GBP (£)']} />
          <SelectField label="Date Format" options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} />
          <SelectField label="Measurement Units" options={['Imperial (sq ft)', 'Metric (sq m)']} />
        </div>
      </SettingsCard>
    </div>
  );
}

function BrandingSettings() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsCard title="Assets & Logos">
          <div className="space-y-6">
            <FileUploadField label="Platform Logo" description="Recommended: 512x128px PNG" />
            <FileUploadField label="Favicon" description="Recommended: 32x32px ICO/PNG" />
            <FileUploadField label="Email Header Logo" description="Recommended: 400x80px PNG" />
          </div>
        </SettingsCard>

        <SettingsCard title="Color Palette">
          <div className="space-y-4">
            <ColorPickerField label="Primary Color" defaultValue="#0066FF" />
            <ColorPickerField label="Secondary Color" defaultValue="#0A192F" />
            <ColorPickerField label="Button Color" defaultValue="#0066FF" />
            <SelectField label="System Font" options={['Inter', 'Roboto', 'Open Sans', 'Outfit']} />
          </div>
        </SettingsCard>
      </div>

      <SettingsCard title="White Label Controls">
        <div className="space-y-4">
          <ToggleField 
            label="Allow tenants to customize branding" 
            description="If enabled, tenants can upload their own logos and change colors."
            defaultChecked={true}
          />
          <ToggleField 
            label="Apply branding to login screen" 
            description="Show platform logo and colors on the main login page."
            defaultChecked={true}
          />
        </div>
      </SettingsCard>

      <div className="bg-navy p-8 rounded-2xl text-white">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-50">Live Preview</h3>
        <div className="bg-white rounded-xl p-6 text-navy">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-electric rounded-lg" />
            <span className="font-bold">ClosePro Remodel</span>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <button className="bg-electric text-white px-4 py-2 rounded-lg text-sm font-bold mt-2">Sample Button</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Plan Configuration">
        <div className="space-y-6">
          {['Starter', 'Growth', 'Pro'].map((plan) => (
            <div key={plan} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-navy">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-navy">{plan} Plan</h4>
                  <p className="text-xs text-gray-500">Configure limits and pricing for this tier.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-xs font-bold text-electric hover:underline">Edit Plan</button>
                <ToggleField label="" defaultChecked={true} />
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-sm hover:border-electric hover:text-electric transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> Create New Plan
          </button>
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard title="Stripe Integration">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 size={20} />
                <span className="font-bold">Stripe Connected</span>
              </div>
              <button className="text-xs font-bold text-red-500 hover:underline">Disconnect</button>
            </div>
            <InputField label="Webhook Secret" type="password" defaultValue="whsec_..." />
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Webhook Status</span>
              <span className="text-green-500">Active</span>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Billing Logic">
          <div className="space-y-4">
            <ToggleField 
              label="Auto-upgrade when limits exceeded" 
              description="Automatically move tenant to next tier if usage limits are hit."
            />
            <ToggleField 
              label="Pause account on failed payment" 
              description="Restrict access if subscription payment fails after 3 attempts."
              defaultChecked={true}
            />
            <InputField label="Trial Period (Days)" type="number" defaultValue="14" />
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

function AISettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Model Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Default AI Model" options={['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'GPT-4o', 'Claude 3.5 Sonnet']} />
          <InputField label="Max Tokens per Request" type="number" defaultValue="4096" />
        </div>
      </SettingsCard>

      <SettingsCard title="Tone & Style Defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Default Tone" options={['Professional', 'Friendly', 'Aggressive', 'Educational']} />
          <SelectField label="Writing Style" options={['Contractor-Focused', 'High-Converting', 'Direct & Simple']} />
        </div>
      </SettingsCard>

      <SettingsCard title="Feature Toggles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <ToggleField label="AI Ad Generation" defaultChecked={true} />
          <ToggleField label="AI Pipeline Generation" defaultChecked={true} />
          <ToggleField label="AI Estimate Writing" defaultChecked={true} />
          <ToggleField label="AI Follow-ups" defaultChecked={true} />
          <ToggleField label="Contractor Language Optimization" description="Uses industry-specific terminology." defaultChecked={true} />
          <ToggleField label="Optimize for Conversions" description="Prioritize lead capture over brand voice." />
        </div>
      </SettingsCard>

      <SettingsCard title="Cost & Usage Control">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Max Requests per Tenant / Month" type="number" defaultValue="1000" />
          <ToggleField label="Store AI Logs" description="Keep a record of all requests/responses for debugging." defaultChecked={true} />
        </div>
      </SettingsCard>
    </div>
  );
}

function AutomationSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Timing & Delays">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Default Follow-up Delay (Minutes)" type="number" defaultValue="5" />
          <InputField label="Max Follow-up Attempts" type="number" defaultValue="7" />
          <InputField label="SMS Timing Window (Start)" type="time" defaultValue="08:00" />
          <InputField label="SMS Timing Window (End)" type="time" defaultValue="20:00" />
        </div>
      </SettingsCard>

      <SettingsCard title="Global Rules">
        <div className="space-y-4">
          <ToggleField 
            label="Stop automation when lead replies" 
            description="Immediately halt any active sequences if the lead sends a message."
            defaultChecked={true}
          />
          <ToggleField 
            label="Restart automation after X days" 
            description="Automatically re-engage cold leads after a set period."
          />
          <ToggleField 
            label="AI-Powered Timing" 
            description="Let AI determine the best time to send messages based on lead behavior."
            defaultChecked={true}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Enabled Channels">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ToggleField label="SMS Messaging" defaultChecked={true} />
          <ToggleField label="Email Messaging" defaultChecked={true} />
          <ToggleField label="AI Voice Calls" />
        </div>
      </SettingsCard>
    </div>
  );
}

function CRMSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Pipeline Defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Default Pipeline Template" options={['Standard Sales', 'Roofing Specific', 'Kitchen Remodel']} />
          <InputField label="Default Deal Value Calculation" defaultValue="Average of Niche" />
        </div>
      </SettingsCard>

      <SettingsCard title="Platform Controls">
        <div className="space-y-4">
          <ToggleField 
            label="Auto-assign pipeline on signup" 
            description="New tenants automatically get the default pipeline for their niche."
            defaultChecked={true}
          />
          <ToggleField 
            label="Allow tenant to edit pipeline" 
            description="If disabled, tenants must use the global pipeline structure."
            defaultChecked={true}
          />
          <ToggleField 
            label="Lock pipeline for Starter plan" 
            description="Starter plan users cannot modify stages or probabilities."
          />
        </div>
      </SettingsCard>
    </div>
  );
}

function LeadSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Lead Handling">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Default Lead Status" options={['New', 'Attempted Contact', 'In Progress']} />
          <InputField label="Required Fields" defaultValue="Name, Phone, Email" />
        </div>
      </SettingsCard>

      <SettingsCard title="Automation & Intelligence">
        <div className="space-y-4">
          <ToggleField label="Auto-tag leads by source" defaultChecked={true} />
          <ToggleField label="Deduplicate leads" description="Prevent multiple entries for the same email/phone." defaultChecked={true} />
          <ToggleField label="Auto-assign leads to user" description="Round-robin assignment for team members." />
          <ToggleField label="AI Lead Qualification" description="AI chats with lead to determine if they are 'Hot'." defaultChecked={true} />
        </div>
      </SettingsCard>

      <SettingsCard title="Lead Scoring System">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Hot Threshold" type="number" defaultValue="80" />
          <InputField label="Warm Threshold" type="number" defaultValue="40" />
          <InputField label="Cold Threshold" type="number" defaultValue="0" />
        </div>
      </SettingsCard>
    </div>
  );
}

function EstimateSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Financial Defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Default Deposit %" type="number" defaultValue="50" />
          <InputField label="Default Tax Rate %" type="number" defaultValue="8.5" />
          <SelectField label="Payment Terms" options={['Due on Receipt', 'Net 15', 'Net 30']} />
          <InputField label="Default Invoice Notes" defaultValue="Thank you for your business!" />
        </div>
      </SettingsCard>

      <SettingsCard title="Features & Automation">
        <div className="space-y-4">
          <ToggleField label="Enable Stripe Payments" defaultChecked={true} />
          <ToggleField label="Allow Partial Payments" defaultChecked={true} />
          <ToggleField label="Milestone Payments" description="Break large estimates into multiple payments." />
          <ToggleField label="Auto-reminders for unpaid invoices" defaultChecked={true} />
          <ToggleField label="Convert Estimate → Invoice automatically" />
          <ToggleField label="AI-Generated Scope of Work" description="AI writes detailed project descriptions." defaultChecked={true} />
        </div>
      </SettingsCard>

      <SettingsCard title="Legal">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Company Legal Disclaimer</label>
          <textarea 
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-electric/20 focus:border-electric outline-none transition-all"
            defaultValue="Standard contractor terms and conditions apply..."
          />
        </div>
      </SettingsCard>
    </div>
  );
}

function MarketingSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Platform Defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Default Ad Platforms</label>
            <div className="flex flex-wrap gap-2">
              {['Facebook', 'Instagram', 'Google', 'TikTok'].map(p => (
                <span key={p} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{p}</span>
              ))}
            </div>
          </div>
          <InputField label="Default Budget Recommendation" type="number" defaultValue="500" />
        </div>
      </SettingsCard>

      <SettingsCard title="AI Ad Generation">
        <div className="space-y-4">
          <ToggleField label="Auto-generate creatives" description="AI creates images/videos for ads." />
          <ToggleField label="AI Copywriting" description="AI writes headlines and primary text." defaultChecked={true} />
          <SelectField label="Default CTA Style" options={['Learn More', 'Get Quote', 'Book Now']} />
        </div>
      </SettingsCard>
    </div>
  );
}

function IntegrationSettings() {
  const integrations = [
    { name: 'Stripe', status: 'connected', icon: CreditCard, description: 'Payments and subscriptions' },
    { name: 'Twilio', status: 'connected', icon: Phone, description: 'SMS and Voice calls' },
    { name: 'SendGrid', status: 'error', icon: Mail, description: 'Email delivery service' },
    { name: 'Google Ads', status: 'disconnected', icon: Megaphone, description: 'Marketing and lead gen' },
    { name: 'Facebook Ads', status: 'disconnected', icon: Megaphone, description: 'Social media marketing' },
    { name: 'Zapier', status: 'connected', icon: Share2, description: 'Workflow automation' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {integrations.map((int) => (
        <div key={int.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                int.status === 'connected' ? 'bg-green-50 text-green-600' :
                int.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
              }`}>
                <int.icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-navy">{int.name}</h4>
                <p className="text-xs text-gray-500">{int.description}</p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
              int.status === 'connected' ? 'bg-green-100 text-green-600' :
              int.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {int.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex-1 py-2 bg-gray-50 text-navy text-xs font-bold rounded-lg hover:bg-gray-100 transition-all">
              Test Connection
            </button>
            <button className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              int.status === 'connected' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-electric text-white hover:bg-electric/90'
            }`}>
              {int.status === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Admin Notifications">
        <div className="space-y-4">
          <ToggleField label="New Lead Signup" defaultChecked={true} />
          <ToggleField label="Payment Received" defaultChecked={true} />
          <ToggleField label="Failed Payment Alert" defaultChecked={true} />
          <ToggleField label="System Error Alerts" defaultChecked={true} />
        </div>
      </SettingsCard>

      <SettingsCard title="Tenant Notifications">
        <div className="space-y-4">
          <ToggleField label="New Lead Alert" defaultChecked={true} />
          <ToggleField label="Appointment Booked" defaultChecked={true} />
          <ToggleField label="Daily Performance Report" />
          <ToggleField label="Weekly Summary" defaultChecked={true} />
        </div>
      </SettingsCard>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Authentication">
        <div className="space-y-4">
          <ToggleField label="Enforce 2FA for Admins" defaultChecked={true} />
          <ToggleField label="Enforce 2FA for Tenants" />
          <InputField label="Session Timeout (Minutes)" type="number" defaultValue="60" />
        </div>
      </SettingsCard>

      <SettingsCard title="Access Control">
        <div className="space-y-4">
          <ToggleField label="Enable IP Restrictions" />
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-navy uppercase mb-3">Role Definitions</h4>
            <div className="space-y-2">
              {['Super Admin', 'Admin', 'Tenant Owner', 'Staff'].map(role => (
                <div key={role} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">{role}</span>
                  <button className="text-electric font-bold text-xs">Edit Permissions</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

function LogSettings() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LogStat label="System Logs" count="1.2M" icon={Terminal} color="text-blue-600" />
        <LogStat label="AI Logs" count="450k" icon={Brain} color="text-purple-600" />
        <LogStat label="Automation Logs" count="8.4M" icon={Zap} color="text-orange-600" />
      </div>

      <SettingsCard title="Data Retention">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Keep Logs For" options={['30 Days', '90 Days', '1 Year', 'Forever']} />
          <div className="flex items-end">
            <button className="w-full py-3 bg-navy text-white rounded-xl font-bold text-sm hover:bg-navy/90 transition-all flex items-center justify-center gap-2">
              <Database size={18} /> Export All Data
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Error Tracking">
        <div className="space-y-4">
          <ToggleField label="Enable Sentry Integration" defaultChecked={true} />
          <ToggleField label="Verbose Logging" description="Capture detailed stack traces for all errors." />
        </div>
      </SettingsCard>
    </div>
  );
}

function FeatureFlagSettings() {
  const flags = [
    { id: 'ai-visualizer', name: 'AI Visualizer', description: 'New 3D project visualization tool', status: 'beta' },
    { id: 'ads-module', name: 'Advanced Ads Module', description: 'Direct integration with TikTok Ads', status: 'alpha' },
    { id: 'pipeline-ai', name: 'Pipeline AI v2', description: 'Predictive deal closing engine', status: 'beta' },
    { id: 'new-ui', name: 'Modern UI Refresh', description: 'Updated dashboard layout and components', status: 'stable' },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard title="Global Feature Flags">
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center ${
                  flag.status === 'stable' ? 'text-green-500' :
                  flag.status === 'beta' ? 'text-orange-500' : 'text-red-500'
                }`}>
                  <Flag size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy">{flag.name}</h4>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      flag.status === 'stable' ? 'bg-green-100 text-green-600' :
                      flag.status === 'beta' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                    }`}>{flag.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{flag.description}</p>
                </div>
              </div>
              <ToggleField label="" />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Beta Assignments">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Assign specific beta features to plans or individual tenants.</p>
          <button className="btn-secondary w-full flex items-center justify-center gap-2">
            <Plus size={18} /> Add Assignment Rule
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

// --- Helper Components ---

function SettingsCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
        <h3 className="text-sm font-bold text-navy">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', defaultValue, placeholder }: { label: string, type?: string, defaultValue?: string, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
      <input 
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-electric/20 focus:border-electric outline-none transition-all"
      />
    </div>
  );
}

function SelectField({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-electric/20 focus:border-electric outline-none transition-all appearance-none cursor-pointer">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function ToggleField({ label, description, defaultChecked }: { label: string, description?: string, defaultChecked?: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked || false);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-navy">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button 
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          enabled ? 'bg-electric' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function FileUploadField({ label, description }: { label: string, description: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          <Layout size={20} />
        </div>
        <div className="flex-1">
          <button className="text-xs font-bold text-electric hover:underline">Upload File</button>
          <p className="text-[10px] text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ColorPickerField({ label, defaultValue }: { label: string, defaultValue: string }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 uppercase">{defaultValue}</span>
        <input type="color" defaultValue={defaultValue} className="w-8 h-8 rounded-lg cursor-pointer border-none p-0" />
      </div>
    </div>
  );
}

function AIHelperButton({ label, description, icon: Icon }: { label: string, description: string, icon: any }) {
  return (
    <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left hover:border-electric transition-all group">
      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-all">
        <Icon size={20} />
      </div>
      <h4 className="text-sm font-bold text-navy mb-1">{label}</h4>
      <p className="text-[10px] text-gray-500 leading-tight">{description}</p>
    </button>
  );
}

function LogStat({ label, count, icon: Icon, color }: { label: string, count: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gray-50 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <span className="text-2xl font-bold text-navy">{count}</span>
      </div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}
