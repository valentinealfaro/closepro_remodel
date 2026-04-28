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
  Mail
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
