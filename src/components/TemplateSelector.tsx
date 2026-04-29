import React from 'react';
import {
  X,
  UserPlus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Zap,
  Clock,
  ArrowRight,
  MessageSquare,
  Mail,
  Star,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';

interface TemplateSelectorProps {
  onClose: () => void;
  onSelect: (template: any) => void;
}

const TEMPLATES = [
  {
    id: 'new_lead_followup',
    name: 'New Lead Follow-up',
    description: 'Instant response to new leads with multi-day follow-up.',
    icon: UserPlus,
    color: 'bg-blue-500',
    trigger: { type: 'lead_created' },
    steps: [
      { id: '1', type: 'action', actionType: 'send_sms', config: { message: 'Hey [Name], this is ClosePro. Got your request for [Service]. When’s a good time to talk?' } },
      { id: '2', type: 'action', actionType: 'send_email', config: { message: 'Hi [Name], thank you for reaching out about [Service]. We would love to help...' } },
      { id: '3', type: 'delay', delayConfig: { value: 1, unit: 'days' } },
      { id: '4', type: 'action', actionType: 'send_sms', config: { message: 'Hi [Name], just following up on your request. Are you still interested in [Service]?' } },
      { id: '5', type: 'delay', delayConfig: { value: 2, unit: 'days' } },
      { id: '6', type: 'action', actionType: 'send_email', config: { message: 'Hi [Name], I wanted to check in one last time...' } },
    ]
  },
  {
    id: 'estimate_followup',
    name: 'Estimate Follow-up',
    description: 'Close more deals by following up on sent estimates.',
    icon: FileText,
    color: 'bg-yellow-500',
    trigger: { type: 'estimate_sent' },
    steps: [
      { id: '1', type: 'delay', delayConfig: { value: 1, unit: 'days' } },
      { id: '2', type: 'action', actionType: 'send_sms', config: { message: 'Hi [Name], did you have a chance to review the estimate for [Service]?' } },
      { id: '3', type: 'delay', delayConfig: { value: 2, unit: 'days' } },
      { id: '4', type: 'action', actionType: 'send_email', config: { message: 'Hi [Name], following up on the proposal we sent...' } },
    ]
  },
  {
    id: 'estimate_approved',
    name: 'Estimate Approved',
    description: 'Automate next steps when a client signs.',
    icon: CheckCircle2,
    color: 'bg-green-500',
    trigger: { type: 'estimate_approved' },
    steps: [
      { id: '1', type: 'action', actionType: 'send_invoice', config: {} },
      { id: '2', type: 'action', actionType: 'send_email', config: { message: 'Thank you for choosing us! We’ve generated your invoice and our team is ready to start.' } },
      { id: '3', type: 'action', actionType: 'move_deal_stage', config: { stage: 'won' } },
    ]
  },
  {
    id: 'invoice_reminder',
    name: 'Invoice Reminder',
    description: 'Get paid faster with automatic overdue reminders.',
    icon: AlertCircle,
    color: 'bg-red-500',
    trigger: { type: 'invoice_overdue' },
    steps: [
      { id: '1', type: 'action', actionType: 'send_email', config: { message: 'Your invoice for [Service] is now overdue. Please pay at [Invoice Link].' } },
      { id: '2', type: 'delay', delayConfig: { value: 3, unit: 'days' } },
      { id: '3', type: 'action', actionType: 'send_sms', config: { message: 'Hi [Name], your invoice is still unpaid. Please settle it today to avoid late fees.' } },
    ]
  },
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    description: 'Send reminders before scheduled appointments.',
    icon: Calendar,
    color: 'bg-purple-500',
    trigger: { type: 'booking_scheduled' },
    steps: [
      { id: '1', type: 'action', actionType: 'send_email', config: { message: 'Your appointment for [Service] is confirmed for tomorrow.' } },
      { id: '2', type: 'delay', delayConfig: { value: 1, unit: 'hours' } },
      { id: '3', type: 'action', actionType: 'send_sms', config: { message: 'See you in 1 hour for our [Service] consultation!' } },
    ]
  },
  {
    id: 'nurture_14day',
    name: '14-Day Lead Nurture',
    description: '7-touch sequence proven to convert cold leads into signed contracts.',
    icon: TrendingUp,
    color: 'bg-indigo-500',
    trigger: { type: 'lead_created' },
    steps: [
      { id: '1', type: 'action', actionType: 'send_sms', config: { message: 'Hi [Name]! Thanks for your interest in [Service]. I\'m [Rep] at [Company]. What\'s the best time to chat about your project?' } },
      { id: '2', type: 'action', actionType: 'send_email', config: { subject: 'Your [Service] Project — Let\'s Talk', message: 'Hi [Name],\n\nThank you for reaching out! We specialize in [Service] in [City] and would love to help you bring your vision to life.\n\nWe\'ve helped homeowners like you get stunning results — I\'d love to show you some before/after photos from recent jobs in your neighborhood.\n\nAre you available for a quick 15-minute call this week?\n\n[Rep Name]\n[Company]' } },
      { id: '3', type: 'delay', delayConfig: { value: 1, unit: 'days' } },
      { id: '4', type: 'action', actionType: 'send_sms', config: { message: 'Hey [Name], just checking in! Did you have a chance to see my message? Happy to answer any questions about your [Service] project.' } },
      { id: '5', type: 'delay', delayConfig: { value: 2, unit: 'days' } },
      { id: '6', type: 'action', actionType: 'send_email', config: { subject: 'See what we did for a home just like yours', message: 'Hi [Name],\n\nI wanted to share a recent project we completed nearby — a full kitchen remodel that came in at $28,000 and took just 3 weeks.\n\nThe homeowner said: "We closed the deal on the spot after seeing the AI visualization. It made the decision so easy."\n\nI\'d love to do the same for you. Want me to generate a free AI visualization of your [Room] so you can see the potential?\n\n[Rep Name]' } },
      { id: '7', type: 'delay', delayConfig: { value: 2, unit: 'days' } },
      { id: '8', type: 'action', actionType: 'send_sms', config: { message: 'Hi [Name], I can generate a FREE AI visualization of your remodel — no commitment. Want me to send it over? Takes 60 seconds.' } },
      { id: '9', type: 'delay', delayConfig: { value: 2, unit: 'days' } },
      { id: '10', type: 'action', actionType: 'send_email', config: { subject: 'Limited spots available this month', message: 'Hi [Name],\n\nI wanted to reach out because we only take on a limited number of new projects each month, and we\'re filling up fast for [Month].\n\nIf you\'re still thinking about your [Service] project, now is the perfect time to lock in your spot and pricing before our schedule fills.\n\nBook a free 15-min call: [Calendar Link]\n\n[Rep Name]' } },
      { id: '11', type: 'delay', delayConfig: { value: 3, unit: 'days' } },
      { id: '12', type: 'action', actionType: 'send_sms', config: { message: 'Hey [Name], last check-in from me — are you still looking to do your [Service]? No worries if timing changed, just want to make sure I\'m not missing you.' } },
      { id: '13', type: 'delay', delayConfig: { value: 4, unit: 'days' } },
      { id: '14', type: 'action', actionType: 'send_email', config: { subject: 'Closing your file — let me know if timing changes', message: 'Hi [Name],\n\nI\'ve reached out a few times and haven\'t heard back, so I\'ll assume the timing isn\'t right and won\'t bother you further.\n\nIf anything changes and you\'re ready to move forward with your [Service] project, I\'m always here.\n\nWishing you the best,\n[Rep Name]\n[Company]\n[Phone]' } },
    ]
  },
  {
    id: 'google_review',
    name: 'Google Review Request',
    description: 'Automatically ask satisfied clients for 5-star reviews after project completion.',
    icon: Star,
    color: 'bg-yellow-400',
    trigger: { type: 'job_completed' },
    steps: [
      { id: '1', type: 'delay', delayConfig: { value: 1, unit: 'days' } },
      { id: '2', type: 'action', actionType: 'send_sms', config: { message: 'Hi [Name]! So glad your [Service] turned out great. Would you mind leaving us a quick Google review? It means the world to our small business: [Google Review Link]' } },
      { id: '3', type: 'delay', delayConfig: { value: 3, unit: 'days' } },
      { id: '4', type: 'action', actionType: 'send_email', config: { subject: 'How did we do, [Name]?', message: 'Hi [Name],\n\nThank you for choosing us for your [Service] project! We hope you\'re loving the results.\n\nIf you have a moment, an honest Google review helps us help more homeowners like you: [Google Review Link]\n\nThank you so much!\n[Rep Name]' } },
    ]
  }
];

export default function TemplateSelector({ onClose, onSelect }: TemplateSelectorProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-navy/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-navy">Choose a Template</h2>
            <p className="text-sm text-gray-500">Start with a pre-built workflow designed to close more jobs.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="group flex flex-col text-left bg-white border border-gray-100 rounded-3xl p-6 hover:border-electric hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${template.color} text-white shadow-lg shadow-current/20`}>
                    <template.icon size={24} />
                  </div>
                  <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-50 group-hover:text-electric transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-navy mb-1 group-hover:text-electric transition-colors">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">{template.description}</p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trigger</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{template.steps.length} Steps</span>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => onSelect({ name: '', trigger: { type: 'lead_created' }, steps: [], isActive: true })}
              className="group flex flex-col items-center justify-center text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6 hover:border-electric hover:bg-blue-50/30 transition-all"
            >
              <div className="p-4 bg-white rounded-2xl text-gray-400 mb-4 shadow-sm group-hover:text-electric transition-all">
                <Zap size={32} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">Start from Scratch</h3>
              <p className="text-sm text-gray-500">Build a custom workflow for your unique business needs.</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
