import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Wand2, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw, 
  Settings, 
  ChevronRight, 
  Plus, 
  LayoutGrid, 
  Share2, 
  Maximize2, 
  History, 
  CheckCircle2, 
  X, 
  MoreHorizontal, 
  Star, 
  Copy, 
  Mail, 
  MessageSquare, 
  ArrowLeft,
  Briefcase,
  Users,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROOM_TYPES = [
  'Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Dining Room', 'Home Office', 'Exterior', 'Basement', 'Garage', 'Deck/Patio'
];

const STYLES = [
  'Modern', 'Contemporary', 'Farmhouse', 'Luxury', 'Industrial', 'Scandinavian', 'Minimalist', 'Traditional', 'Mid-Century Modern', 'Bohemian'
];

const MATERIALS = [
  'Quartz', 'Granite', 'Marble', 'Hardwood', 'Tile', 'Laminate', 'Brick', 'Stone Veneer', 'Stainless Steel', 'Brass'
];

const COLORS = [
  'Neutral', 'Warm White', 'Cool Gray', 'Navy Blue', 'Sage Green', 'Charcoal', 'Earth Tones', 'Bold Accents'
];

interface VisualProject {
  id: string;
  name: string;
  leadId?: string;
  dealId?: string;
  serviceType: string;
  status: string;
  createdAt: any;
}

interface VisualRoom {
  id: string;
  projectId: string;
  name: string;
  type: string;
  referenceImageUrl?: string;
  createdAt: any;
}

interface VisualDesign {
  id: string;
  projectId: string;
  roomId: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  prompt: string;
  style: string;
  notes?: string;
  clientNotes?: string;
  isFavorite?: boolean;
  version: number;
  tags?: string[];
  createdAt: any;
}

export default function AIVisualizer() {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation State
  const [currentProject, setCurrentProject] = useState<VisualProject | null>(null);
  const [currentRoom, setCurrentRoom] = useState<VisualRoom | null>(null);
  const [view, setView] = useState<'projects' | 'rooms' | 'designs' | 'generator'>('projects');
  
  // Data State
  const [projects, setProjects] = useState<VisualProject[]>([]);
  const [rooms, setRooms] = useState<VisualRoom[]>([]);
  const [designs, setDesigns] = useState<VisualDesign[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generator State
  const [image, setImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState(ROOM_TYPES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<string | null>(null);
  
  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<VisualDesign | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // New Project Form
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    leadId: '',
    dealId: '',
    serviceType: 'Kitchen Remodel'
  });

  // --- Data Fetching ---

  useEffect(() => {
    if (!userData?.tenantId) return;

    // Fetch Projects
    const projectsQuery = query(
      collection(db, `tenants/${userData.tenantId}/visual_projects`),
      orderBy('createdAt', 'desc')
    );
    const unsubProjects = onSnapshot(projectsQuery, (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as VisualProject)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tenants/${userData.tenantId}/visual_projects`);
    });

    // Fetch Leads & Deals for linking
    const leadsQuery = query(collection(db, `tenants/${userData.tenantId}/leads`), limit(50));
    const unsubLeads = onSnapshot(leadsQuery, (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tenants/${userData.tenantId}/leads`);
    });

    const dealsQuery = query(collection(db, `tenants/${userData.tenantId}/deals`), limit(50));
    const unsubDeals = onSnapshot(dealsQuery, (snap) => {
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tenants/${userData.tenantId}/deals`);
    });

    return () => {
      unsubProjects();
      unsubLeads();
      unsubDeals();
    };
  }, [userData?.tenantId]);

  useEffect(() => {
    if (!userData?.tenantId || !currentProject) return;

    // Fetch Rooms for current project
    const roomsQuery = query(
      collection(db, `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms`),
      orderBy('createdAt', 'desc')
    );
    const unsubRooms = onSnapshot(roomsQuery, (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as VisualRoom)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms`);
    });

    return () => unsubRooms();
  }, [userData?.tenantId, currentProject]);

  useEffect(() => {
    if (!userData?.tenantId || !currentProject || !currentRoom) return;

    // Fetch Designs for current room
    const designsQuery = query(
      collection(db, `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms/${currentRoom.id}/designs`),
      orderBy('createdAt', 'desc')
    );
    const unsubDesigns = onSnapshot(designsQuery, (snap) => {
      setDesigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as VisualDesign)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms/${currentRoom.id}/designs`);
    });

    return () => unsubDesigns();
  }, [userData?.tenantId, currentProject, currentRoom]);

  // Handle URL params for pre-filling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const leadId = params.get('leadId');
    const dealId = params.get('dealId');

    if (leadId) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setNewProjectData(prev => ({
          ...prev,
          leadId,
          name: `${lead.name} Remodel`,
          serviceType: lead.serviceType || 'Kitchen Remodel'
        }));
        setIsNewProjectModalOpen(true);
      }
    } else if (dealId) {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        setNewProjectData(prev => ({
          ...prev,
          dealId,
          name: deal.name,
          serviceType: deal.serviceType || 'Kitchen Remodel'
        }));
        setIsNewProjectModalOpen(true);
      }
    }
  }, [location.search, leads, deals]);

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.tenantId) return;

    try {
      const projectPath = `tenants/${userData.tenantId}/visual_projects`;
      const projectRef = await addDoc(collection(db, projectPath), {
        ...newProjectData,
        tenantId: userData.tenantId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const newProj = { id: projectRef.id, ...newProjectData, status: 'active', createdAt: new Date(), tenantId: userData.tenantId } as VisualProject;
      setCurrentProject(newProj);
      setIsNewProjectModalOpen(false);
      setView('rooms');
      toast.success('Project created successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tenants/${userData?.tenantId}/visual_projects`);
      toast.error('Failed to create project');
    }
  };

  const createRoom = async (name: string, type: string) => {
    if (!userData?.tenantId || !currentProject) return;

    try {
      const roomPath = `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms`;
      const roomRef = await addDoc(collection(db, roomPath), {
        projectId: currentProject.id,
        tenantId: userData.tenantId,
        name,
        type,
        createdAt: serverTimestamp()
      });
      
      const newRoom = { id: roomRef.id, projectId: currentProject.id, name, type, createdAt: new Date(), tenantId: userData.tenantId } as VisualRoom;
      setCurrentRoom(newRoom);
      setView('generator');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tenants/${userData?.tenantId}/visual_projects/${currentProject.id}/rooms`);
      toast.error('Failed to create room');
    }
  };

  const generateRemodel = async () => {
    if (!image || !currentProject || !currentRoom || !userData?.tenantId) return;
    setGenerating(true);
    setGenResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const base64Data = image.split(',')[1];
      
      const prompt = `Remodel this ${roomType} in a ${style} style. 
        Use ${material} materials and a ${color} color palette. 
        ${customInstructions}
        Keep the structural layout similar but update the cabinets, flooring, lighting, and overall aesthetic to be high-end and modern.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      });

      let generatedImageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedImageUrl) {
        setGenResult(generatedImageUrl);
        
        // Save to Firestore
        const designPath = `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms/${currentRoom.id}/designs`;
        const designData = {
          tenantId: userData.tenantId,
          projectId: currentProject.id,
          roomId: currentRoom.id,
          originalImageUrl: image,
          generatedImageUrl: generatedImageUrl,
          prompt,
          style,
          version: (designs.length || 0) + 1,
          createdAt: serverTimestamp(),
          tags: [style, roomType, material]
        };

        await addDoc(collection(db, designPath), designData).catch(e => handleFirestoreError(e, OperationType.CREATE, designPath));
        
        // Update room with reference image if it doesn't have one
        if (!currentRoom.referenceImageUrl) {
          const roomPath = `tenants/${userData.tenantId}/visual_projects/${currentProject.id}/rooms/${currentRoom.id}`;
          await updateDoc(doc(db, roomPath), {
            referenceImageUrl: image
          }).catch(e => handleFirestoreError(e, OperationType.UPDATE, roomPath));
        }
        
        toast.success('Design generated and saved!');
      } else {
        throw new Error('No image was generated');
      }
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createShareLink = async () => {
    if (!userData?.tenantId || !currentProject || !currentRoom) return;
    
    try {
      const sharePath = 'public_shares';
      const shareRef = await addDoc(collection(db, sharePath), {
        tenantId: userData.tenantId,
        projectId: currentProject.id,
        roomId: currentRoom.id,
        designIds: designs.map(d => d.id),
        createdAt: serverTimestamp()
      });
      
      const url = `${window.location.origin}/share/${shareRef.id}`;
      setShareLink(url);
      setIsShareModalOpen(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'public_shares');
      toast.error('Failed to create share link');
    }
  };

  const duplicateAndEdit = (design: VisualDesign) => {
    setImage(design.originalImageUrl);
    setRoomType(design.tags?.[1] || ROOM_TYPES[0]);
    setStyle(design.style);
    setCustomInstructions(design.notes || '');
    setView('generator');
  };

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-2)
    );
  };

  // --- UI Components ---

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
      <button onClick={() => setView('projects')} className="hover:text-electric transition-colors">Projects</button>
      {currentProject && (
        <>
          <ChevronRight size={14} />
          <button onClick={() => setView('rooms')} className="hover:text-electric transition-colors">{currentProject.name}</button>
        </>
      )}
      {currentRoom && (
        <>
          <ChevronRight size={14} />
          <button onClick={() => setView('designs')} className="hover:text-electric transition-colors">{currentRoom.name}</button>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">AI Visualizer</h1>
          <p className="text-gray-500 font-medium">Transform spaces and close deals with AI-powered concepts.</p>
        </div>
        <div className="flex items-center gap-3">
          {view !== 'projects' && (
            <button 
              onClick={() => setView(view === 'generator' ? 'designs' : view === 'designs' ? 'rooms' : 'projects')}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-navy hover:shadow-lg transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-electric text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-electric/90 transition-all"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </div>

      <Breadcrumbs />

      {/* Main View Switcher */}
      <AnimatePresence mode="wait">
        {view === 'projects' && (
          <motion.div 
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon size={32} className="text-blue-electric" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">No projects yet</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-6">Create your first visual project to start generating remodel concepts for your leads.</p>
                <button 
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-8 py-3 bg-blue-electric text-white rounded-xl font-bold"
                >
                  Create Project
                </button>
              </div>
            )}
            {projects.map(project => (
              <button 
                key={project.id}
                onClick={() => {
                  setCurrentProject(project);
                  setView('rooms');
                }}
                className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-electric/20 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-electric/10 transition-colors" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-electric uppercase tracking-widest mb-3">
                    <Briefcase size={12} />
                    {project.serviceType}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-1">{project.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mb-6">Created {format(new Date(project.createdAt?.toDate?.() || project.createdAt), 'MMM d, yyyy')}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          <ImageIcon size={12} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-navy">
                      View Project
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {view === 'rooms' && (
          <motion.div 
            key="rooms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy">Rooms in {currentProject?.name}</h2>
              <button 
                onClick={() => {
                  const name = prompt('Room Name (e.g. Master Kitchen)');
                  const type = prompt('Room Type (Kitchen, Bathroom, etc.)');
                  if (name && type) createRoom(name, type);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold"
              >
                <Plus size={18} />
                Add Room
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map(room => (
                <button 
                  key={room.id}
                  onClick={() => {
                    setCurrentRoom(room);
                    setView('designs');
                  }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-blue-50 group-hover:text-blue-electric transition-colors">
                    <LayoutGrid size={24} />
                  </div>
                  <h3 className="font-bold text-navy">{room.name}</h3>
                  <p className="text-xs text-gray-500">{room.type}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'designs' && (
          <motion.div 
            key="designs"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy">{currentRoom?.name} Designs</h2>
                <p className="text-sm text-gray-500">{designs.length} versions created</p>
              </div>
              <div className="flex items-center gap-3">
                {comparisonIds.length === 2 && (
                  <button 
                    onClick={() => setIsComparing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-bold shadow-lg hover:bg-navy/90 transition-all"
                  >
                    <LayoutGrid size={18} />
                    Compare Selected ({comparisonIds.length})
                  </button>
                )}
                <button 
                  onClick={createShareLink}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-navy font-bold hover:shadow-lg transition-all"
                >
                  <Share2 size={18} />
                  Share with Client
                </button>
                <button 
                  onClick={() => setView('generator')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-electric text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-electric/90 transition-all"
                >
                  <Wand2 size={18} />
                  Generate New Version
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designs.map((design, idx) => (
                <div key={design.id} className={`bg-white rounded-3xl overflow-hidden shadow-sm border-2 group hover:shadow-2xl transition-all ${comparisonIds.includes(design.id) ? 'border-blue-electric ring-4 ring-blue-electric/10' : 'border-gray-100'}`}>
                  <div className="aspect-video relative overflow-hidden">
                    <img src={design.generatedImageUrl} alt="Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleComparison(design.id)}
                        className={`p-2 rounded-xl shadow-lg transition-colors ${comparisonIds.includes(design.id) ? 'bg-blue-electric text-white' : 'bg-white/90 backdrop-blur-md text-navy hover:bg-white'}`}
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedDesign(design);
                          setIsPresenting(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-navy hover:bg-white transition-colors"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-navy/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full tracking-widest">Version {design.version}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-navy">{design.style} Concept</h3>
                      <div className="flex items-center gap-2">
                        {design.isFavorite && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
                        <button className="text-gray-400 hover:text-navy">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {design.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-md">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedDesign(design);
                          setIsPresenting(true);
                        }}
                        className="flex-1 py-3 bg-gray-50 text-navy rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-electric transition-colors"
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => duplicateAndEdit(design)}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"
                        title="Duplicate & Edit"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => downloadImage(design.generatedImageUrl, `design-v${design.version}.png`)}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'generator' && (
          <motion.div 
            key="generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Generator Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Upload size={16} className="text-electric" />
                  1. Upload Photo
                </h3>
                
                {currentRoom?.referenceImageUrl && !image && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white">
                        <img src={currentRoom.referenceImageUrl} alt="Reference" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-electric uppercase tracking-widest">Reference Image</p>
                        <p className="text-xs font-bold text-navy">Using room's original photo</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setImage(currentRoom.referenceImageUrl!)}
                      className="px-3 py-1 bg-white text-blue-electric text-[10px] font-black uppercase rounded-lg shadow-sm"
                    >
                      Use
                    </button>
                  </div>
                )}

                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    image ? 'border-blue-electric bg-blue-50' : 'border-gray-200 hover:border-blue-electric/50'
                  }`}
                >
                  {image ? (
                    <div className="relative group">
                      <img src={image} alt="Original" className="w-full aspect-video object-cover rounded-xl shadow-lg" />
                      <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <label className="cursor-pointer bg-white text-navy px-6 py-2 rounded-xl text-sm font-bold shadow-xl">
                          Change Photo
                          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="text-gray-300" size={32} />
                      </div>
                      <p className="text-sm text-gray-500 font-bold">Click to upload room photo</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">JPG, PNG up to 10MB</p>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
                <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Settings size={16} className="text-electric" />
                  2. Design Options
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Room Type</label>
                    <select 
                      value={roomType} 
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    >
                      {ROOM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Style</label>
                    <select 
                      value={style} 
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    >
                      {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Materials</label>
                    <select 
                      value={material} 
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    >
                      {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color Palette</label>
                    <select 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    >
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Instructions</label>
                  <textarea 
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Add a waterfall island, use gold hardware..."
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-electric min-h-[100px]"
                  />
                </div>
              </div>

              <button
                onClick={generateRemodel}
                disabled={!image || generating}
                className="w-full py-5 bg-blue-electric text-white rounded-3xl font-black text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-electric/90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Generating Magic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={24} />
                    <span>Generate Concept</span>
                  </>
                )}
              </button>
            </div>

            {/* Generation Result Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 min-h-[600px] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-electric">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">Design Preview</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time AI Generation</p>
                    </div>
                  </div>
                  {genResult && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => downloadImage(genResult, `design-${currentRoom?.name || 'remodel'}.png`)}
                        className="p-3 bg-gray-50 text-navy rounded-xl hover:bg-gray-100 transition-colors" 
                        title="Download"
                      >
                        <Download size={20} />
                      </button>
                      <button onClick={generateRemodel} className="p-3 bg-blue-50 text-blue-electric rounded-xl hover:bg-blue-100 transition-colors" title="Regenerate">
                        <RefreshCw size={20} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 bg-gray-50/50 flex items-center justify-center p-12 relative">
                  <AnimatePresence mode="wait">
                    {generating ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <div className="relative w-32 h-32 mx-auto mb-8">
                          <div className="absolute inset-0 border-4 border-blue-electric border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-4 border-4 border-navy border-b-transparent rounded-full animate-spin-slow"></div>
                          <Wand2 className="absolute inset-0 m-auto text-blue-electric animate-pulse" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-navy mb-2">AI is remodeling...</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">We're applying your style preferences to the space. This takes about 15 seconds.</p>
                      </motion.div>
                    ) : genResult ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex flex-col items-center"
                      >
                        <div className="relative w-full h-full max-h-[600px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                          <img src={genResult} alt="Generated Remodel" className="w-full h-full object-contain" />
                        </div>
                        <div className="mt-8 flex gap-4">
                          <button 
                            onClick={() => setView('designs')}
                            className="px-8 py-3 bg-navy text-white rounded-2xl font-bold shadow-xl shadow-navy/20"
                          >
                            Save to Project
                          </button>
                          <button 
                            onClick={createShareLink}
                            className="px-8 py-3 bg-white border border-gray-200 text-navy rounded-2xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <Share2 size={18} />
                            Share with Client
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center max-w-sm">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 rotate-3">
                          <ImageIcon className="text-gray-200" size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-navy mb-2">Ready to visualize?</h3>
                        <p className="text-gray-500 font-medium">Upload a photo of your client's room and select a style to see the transformation.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Project Modal */}
      <AnimatePresence>
        {isNewProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-navy tracking-tight">New Visual Project</h3>
                  <p className="text-sm text-gray-500 font-medium">Link this project to a lead or deal.</p>
                </div>
                <button onClick={() => setIsNewProjectModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <form onSubmit={createProject} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Name *</label>
                  <input 
                    required
                    type="text"
                    value={newProjectData.name}
                    onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    placeholder="e.g. Smith Kitchen Overhaul"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link to Lead</label>
                    <select 
                      value={newProjectData.leadId}
                      onChange={(e) => setNewProjectData({...newProjectData, leadId: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    >
                      <option value="">Select Lead (Optional)</option>
                      {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link to Deal</label>
                    <select 
                      value={newProjectData.dealId}
                      onChange={(e) => setNewProjectData({...newProjectData, dealId: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                    >
                      <option value="">Select Deal (Optional)</option>
                      {deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type</label>
                  <select 
                    value={newProjectData.serviceType}
                    onChange={(e) => setNewProjectData({...newProjectData, serviceType: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-electric"
                  >
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-electric text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-electric/90 transition-all"
                >
                  Create Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-electric">
                  <Share2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-navy mb-2">Share with Homeowner</h3>
                <p className="text-gray-500 font-medium mb-8">Send this link to your client so they can view the design concepts on any device.</p>
                
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                  <input 
                    readOnly
                    type="text"
                    value={shareLink}
                    className="flex-1 bg-transparent border-none text-xs font-bold text-gray-500 px-3"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success('Link copied to clipboard');
                    }}
                    className="p-3 bg-white text-navy rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-4 bg-navy text-white rounded-2xl font-bold">
                    <Mail size={18} />
                    Email Link
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-bold">
                    <MessageSquare size={18} />
                    SMS Link
                  </button>
                </div>

                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="mt-6 text-sm font-bold text-gray-400 hover:text-navy transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {isPresenting && selectedDesign && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy flex flex-col"
          >
            <div className="p-6 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPresenting(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
                <div>
                  <h3 className="font-bold">{currentProject?.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedDesign.style} Concept</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-6 py-2 bg-white/10 rounded-full text-xs font-bold hover:bg-white/20 transition-all">BEFORE</button>
                <button className="px-6 py-2 bg-blue-electric rounded-full text-xs font-bold shadow-lg shadow-blue-500/20">AFTER</button>
              </div>
            </div>
            <div className="flex-1 p-12 flex items-center justify-center">
              <img src={selectedDesign.generatedImageUrl} alt="Presentation" className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl" />
            </div>
            <div className="p-8 bg-black/20 backdrop-blur-xl border-t border-white/10">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex gap-4">
                  {designs.map(d => (
                    <button 
                      key={d.id}
                      onClick={() => setSelectedDesign(d)}
                      className={`w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all ${selectedDesign.id === d.id ? 'border-blue-electric' : 'border-transparent opacity-50'}`}
                    >
                      <img src={d.generatedImageUrl} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-white font-bold mb-1">Design Notes</p>
                  <p className="text-gray-400 text-sm max-w-md">{selectedDesign.notes || 'No internal notes for this design.'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Compare Modal */}
      <AnimatePresence>
        {isComparing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-navy tracking-tight">Compare Concepts</h3>
                  <p className="text-sm text-gray-500 font-medium">Side-by-side comparison of your design versions.</p>
                </div>
                <button onClick={() => setIsComparing(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8 grid grid-cols-2 gap-8">
                {comparisonIds.map(id => {
                  const design = designs.find(d => d.id === id);
                  if (!design) return null;
                  return (
                    <div key={id} className="space-y-4">
                      <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                        <img src={design.generatedImageUrl} alt="Design" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-navy">{design.style} Style</h4>
                          <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Version {design.version}</p>
                        </div>
                        <button 
                          onClick={() => downloadImage(design.generatedImageUrl, `design-v${design.version}.png`)}
                          className="p-3 bg-gray-50 text-navy rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Presentation Modal */}
      <AnimatePresence>
        {isPresenting && selectedDesign && (
          <div className="fixed inset-0 z-[70] bg-navy flex flex-col">
            <div className="p-6 flex items-center justify-between bg-navy/50 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPresenting(false)} className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentProject?.name} - {currentRoom?.name}</h3>
                  <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">{selectedDesign.style} Concept</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => downloadImage(selectedDesign.generatedImageUrl, `design-v${selectedDesign.version}.png`)}
                  className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"
                >
                  <Download size={24} />
                </button>
                <button 
                  onClick={createShareLink}
                  className="px-6 py-3 bg-blue-electric text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-electric/90 transition-all"
                >
                  Share Presentation
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 relative group">
              <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
                <img 
                  src={showBefore ? selectedDesign.originalImageUrl : selectedDesign.generatedImageUrl} 
                  alt="Design" 
                  className="w-full h-full object-contain" 
                />
                
                {/* Before/After Toggle in Presentation Mode */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex bg-navy/80 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-white/10">
                  <button 
                    onClick={() => setShowBefore(true)}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${showBefore ? 'bg-white/10 text-white' : 'text-blue-300 hover:text-white'}`}
                  >
                    BEFORE
                  </button>
                  <button 
                    onClick={() => setShowBefore(false)}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${!showBefore ? 'bg-blue-electric text-white shadow-lg' : 'text-blue-300 hover:text-white'}`}
                  >
                    AFTER
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button 
                  onClick={() => {
                    const idx = designs.findIndex(d => d.id === selectedDesign.id);
                    if (idx > 0) setSelectedDesign(designs[idx - 1]);
                  }}
                  className="p-6 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all pointer-events-auto"
                >
                  <ArrowLeft size={32} />
                </button>
                <button 
                  onClick={() => {
                    const idx = designs.findIndex(d => d.id === selectedDesign.id);
                    if (idx < designs.length - 1) setSelectedDesign(designs[idx + 1]);
                  }}
                  className="p-6 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all pointer-events-auto"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            </div>

            {/* Thumbnails Strip */}
            <div className="p-6 bg-navy/80 backdrop-blur-md border-t border-white/10 overflow-x-auto">
              <div className="flex justify-center gap-4 min-w-max">
                {designs.map(design => (
                  <button 
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={`w-32 aspect-video rounded-xl overflow-hidden border-2 transition-all ${selectedDesign.id === design.id ? 'border-blue-electric ring-4 ring-blue-electric/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={design.generatedImageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
