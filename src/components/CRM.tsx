import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  User,
  Star,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Lead, PipelineStage } from '../types';

interface ColumnProps {
  stage: PipelineStage;
  leads: Lead[];
}

const Column: React.FC<ColumnProps> = ({ stage, leads }) => {
  return (
    <div className="flex flex-col w-80 bg-gray-50/50 rounded-2xl border border-gray-100 h-full min-h-[500px]">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <h3 className="font-bold text-navy text-sm uppercase tracking-wider">{stage.name}</h3>
          <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {leads.length}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar flex-1">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
};

const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => {
  return (
    <motion.div
      layoutId={lead.id}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${lead.score > 80 ? 'bg-green-500' : lead.score > 50 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Score: {lead.score}</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-50 rounded text-gray-400 transition-all">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <h4 className="font-bold text-navy text-sm mb-1">{lead.firstName} {lead.lastName}</h4>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{lead.serviceType}</p>
      
      <div className="flex items-center gap-3 text-gray-400">
        <div className="flex items-center gap-1">
          <Phone size={12} />
          <span className="text-[10px] font-medium">Call</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail size={12} />
          <span className="text-[10px] font-medium">Email</span>
        </div>
        {lead.budget && (
          <div className="ml-auto flex items-center gap-1 text-electric font-bold">
            <DollarSign size={12} />
            <span className="text-[10px]">${lead.budget.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex -space-x-2">
          <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
            <User size={10} className="text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock size={10} />
          <span>2h ago</span>
        </div>
      </div>
    </motion.div>
  );
};

const CRM: React.FC = () => {
  const [stages] = useState<PipelineStage[]>([
    { id: 'new', name: 'New Leads', order: 0, color: '#3B82F6' },
    { id: 'contacted', name: 'Contacted', order: 1, color: '#8B5CF6' },
    { id: 'qualified', name: 'Qualified', order: 2, color: '#10B981' },
    { id: 'proposal', name: 'Proposal Sent', order: 3, color: '#F59E0B' },
    { id: 'negotiation', name: 'Negotiation', order: 4, color: '#EC4899' },
    { id: 'won', name: 'Closed Won', order: 5, color: '#059669' },
  ]);

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      tenantId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0101',
      serviceType: 'Kitchen Remodel',
      status: 'new',
      score: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pipelineId: 'default',
      stageId: 'new',
      source: 'facebook',
      notes: 'Interested in full kitchen renovation.',
      metadata: {}
    },
    {
      id: '2',
      tenantId: '1',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah@example.com',
      phone: '555-0102',
      serviceType: 'Bathroom Remodel',
      status: 'contacted',
      score: 65,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pipelineId: 'default',
      stageId: 'contacted',
      source: 'google',
      notes: 'Needs master bath update.',
      metadata: {}
    },
    {
      id: '3',
      tenantId: '1',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      phone: '555-0103',
      serviceType: 'Roofing',
      status: 'qualified',
      score: 92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pipelineId: 'default',
      stageId: 'qualified',
      source: 'manual',
      budget: 15000,
      notes: 'Storm damage repair.',
      metadata: {}
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Logic to move between columns
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overStageId = over.id as string;

    setLeads(prev => prev.map(lead => 
      lead.id === activeId ? { ...lead, stageId: overStageId } : lead
    ));
    
    setActiveId(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-navy mb-1">Pipeline Management</h1>
          <p className="text-sm text-gray-500">Track and manage your leads through the sales cycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-navy hover:bg-gray-50 transition-all">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-electric text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-electric/20 transition-all">
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 no-scrollbar">
        <div className="flex gap-6 h-full min-w-max">
          {stages.map((stage) => (
            <Column 
              key={stage.id} 
              stage={stage} 
              leads={leads.filter(l => l.stageId === stage.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CRM;
