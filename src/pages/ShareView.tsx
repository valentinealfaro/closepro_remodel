import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  LayoutGrid, 
  Info,
  CheckCircle2,
  Share2,
  Download,
  MessageSquare
} from 'lucide-react';

export default function ShareView() {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShareData = async () => {
      if (!shareId) return;
      try {
        // This is a bit tricky because share_links are under tenants/{tenantId}/share_links
        // But we don't have the tenantId in the URL.
        // We might need a top-level share_links collection or a way to find it.
        // For now, I'll assume a top-level collection for simplicity in this demo,
        // or I'll search across all tenants if possible (not ideal for security).
        // Actually, let's use a top-level 'public_shares' collection instead.
        
        const shareRef = doc(db, 'public_shares', shareId);
        const shareSnap = await getDoc(shareRef);
        
        if (!shareSnap.exists()) {
          setError('Share link not found or expired.');
          setLoading(false);
          return;
        }

        const data = shareSnap.data();
        setShareData(data);

        // Fetch project and designs
        const projectRef = doc(db, `tenants/${data.tenantId}/visual_projects`, data.projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          setProject(projectSnap.data());
        }

        const designsData: any[] = [];
        if (data.roomId) {
          const designsRef = collection(db, `tenants/${data.tenantId}/visual_projects/${data.projectId}/rooms/${data.roomId}/designs`);
          const designsSnap = await getDocs(designsRef);
          designsSnap.forEach(doc => {
            if (data.designIds.includes(doc.id)) {
              designsData.push({ id: doc.id, ...doc.data() });
            }
          });
        }
        
        setDesigns(designsData);
        if (designsData.length > 0) setSelectedDesign(designsData[0]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching share data:', err);
        setError('Failed to load designs.');
        setLoading(false);
      }
    };

    fetchShareData();
  }, [shareId]);

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading your designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-navy text-white rounded-xl font-bold"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-electric rounded-lg flex items-center justify-center text-white font-black">CP</div>
            <div>
              <h1 className="text-sm font-bold text-navy leading-none">{project?.name || 'Your Remodel Project'}</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Design Presentation</p>
            </div>
          </div>
          <button 
            onClick={() => selectedDesign && downloadImage(selectedDesign.generatedImageUrl, `design-${project?.name || 'remodel'}.png`)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
          >
            <Download size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative aspect-[4/3] group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={showBefore ? 'before' : 'after'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={showBefore ? selectedDesign?.originalImageUrl : selectedDesign?.generatedImageUrl} 
                  alt="Design"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Before/After Toggle */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-2xl border border-white/20">
                <button 
                  onClick={() => setShowBefore(true)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${showBefore ? 'bg-navy text-white shadow-lg' : 'text-gray-500'}`}
                >
                  BEFORE
                </button>
                <button 
                  onClick={() => setShowBefore(false)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!showBefore ? 'bg-electric text-white shadow-lg' : 'text-gray-500'}`}
                >
                  AFTER
                </button>
              </div>

              {/* Fullscreen Button */}
              <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-navy opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={20} />
              </button>
            </div>

            {/* Design Info */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-2">{selectedDesign?.style} {selectedDesign?.roomType || 'Remodel'}</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-electric text-[10px] font-black uppercase rounded-full tracking-wider">Version {selectedDesign?.version || 1}</span>
                    <span className="text-xs text-gray-400 font-medium">Generated on {new Date(selectedDesign?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedDesign?.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              
              {selectedDesign?.clientNotes && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{selectedDesign.clientNotes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Other Versions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                <LayoutGrid size={16} className="text-electric" />
                Design Options
              </h3>
              <div className="space-y-4">
                {designs.map((design, idx) => (
                  <button 
                    key={design.id}
                    onClick={() => {
                      setSelectedDesign(design);
                      setShowBefore(false);
                    }}
                    className={`w-full group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all ${selectedDesign?.id === design.id ? 'border-electric ring-4 ring-electric/10' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={design.generatedImageUrl} alt={`Version ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-[10px] font-bold">Version {design.version || idx + 1}</p>
                    </div>
                    {selectedDesign?.id === design.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-electric text-white rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-navy p-8 rounded-3xl shadow-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Ready to move forward?</h3>
              <p className="text-blue-200 text-sm mb-6">Select your favorite design and let us know your thoughts.</p>
              <button 
                onClick={() => toast.success('Design approved! We will contact you soon.')}
                className="w-full py-4 bg-electric hover:bg-blue-400 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Approve This Design
              </button>
              <button 
                onClick={() => {
                  const note = prompt('What would you like to change?');
                  if (note) toast.success('Revision request sent!');
                }}
                className="w-full mt-3 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                Request Revisions
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Powered by</p>
          <div className="flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="w-6 h-6 bg-navy rounded flex items-center justify-center text-white font-black text-[10px]">CP</div>
            <span className="text-sm font-black text-navy tracking-tighter">CLOSEPRO REMODEL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
