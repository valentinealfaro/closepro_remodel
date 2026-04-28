import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Save, 
  Eye, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Search,
  Loader2,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
  Briefcase,
  Star,
  Settings,
  MousePointer2,
  Share2,
  History,
  Smartphone,
  Monitor,
  Tablet,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Copy,
  Archive,
  FileText,
  MessageSquare,
  Calendar,
  BarChart3,
  Zap,
  ShieldCheck,
  MoreVertical,
  AlertCircle,
  Users,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDocs, 
  limit, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  orderBy,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Website, 
  WebsitePage, 
  WebsiteSection, 
  GlobalSettings, 
  ConversionSettings, 
  SEOData 
} from '../types/website';
import { AdService } from '../services/AdService';
import { AIService } from '../services/AIService';

type EditorTab = 'pages' | 'sections' | 'global' | 'seo' | 'conversion' | 'integrations' | 'analytics';

// Custom hook for debouncing effects
function useDebounceEffect(effect: () => void, deps: any[], delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => {
      effect();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [...deps, delay]);
}

export default function WebsiteEditor() {
  const { userData, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<EditorTab>('pages');
  const [website, setWebsite] = useState<Website | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [activePage, setActivePage] = useState<WebsitePage | null>(null);
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showAIImport, setShowAIImport] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);

  const handleGenerateSectionImage = async (sectionId: string, prompt: string, field: string) => {
    setGeneratingImage(sectionId);
    try {
      const base64 = await AdService.generateAdImage(prompt, { aspectRatio: '16:9' });
      const imageUrl = `data:image/png;base64,${base64}`;
      
      // Update Firestore
      if (!website?.id || !activePage?.id) return;
      const sectionRef = doc(db, `tenants/${userData?.tenantId}/websites/${website.id}/pages/${activePage.id}/sections`, sectionId);
      await updateDoc(sectionRef, {
        [`content.${field}`]: imageUrl,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content: { ...s.content, [field]: imageUrl } } : s));
      toast.success('AI Image generated and applied!');
    } catch (error) {
      console.error('AI Image Generation Error:', error);
      toast.error('Failed to generate AI image');
    } finally {
      setGeneratingImage(null);
    }
  };
  const [aiDesigns, setAiDesigns] = useState<any[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Fetch Media Assets
  useEffect(() => {
    if (!userData?.tenantId || !showMediaLibrary) return;

    setLoadingMedia(true);
    const q = query(
      collection(db, `tenants/${userData.tenantId}/media_assets`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMediaAssets(assets);
      setLoadingMedia(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'media_assets');
      setLoadingMedia(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, showMediaLibrary]);

  const handleUploadMedia = async () => {
    if (!userData?.tenantId) return;
    
    // Mock upload - in a real app this would use Firebase Storage
    const mockUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
    setSaving(true);
    try {
      await addDoc(collection(db, `tenants/${userData.tenantId}/media_assets`), {
        tenantId: userData.tenantId,
        url: mockUrl,
        type: 'image',
        name: `Upload ${format(new Date(), 'MMM d, h:mm a')}`,
        source: 'upload',
        createdAt: serverTimestamp()
      });
      toast.success('Media uploaded successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'media_asset');
    } finally {
      setSaving(false);
    }
  };

  const deleteMedia = async (assetId: string) => {
    if (!userData?.tenantId || !confirm('Delete this asset?')) return;
    try {
      await deleteDoc(doc(db, `tenants/${userData.tenantId}/media_assets`, assetId));
      toast.success('Asset deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'media_asset');
    }
  };

  // Fetch AI Designs
  useEffect(() => {
    if (!userData?.tenantId || !showAIImport) return;

    setLoadingAI(true);
    // We'll fetch from ai_generations as it's a flatter structure for quick import
    const q = query(
      collection(db, `tenants/${userData.tenantId}/ai_generations`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const designs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAiDesigns(designs);
      setLoadingAI(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ai_generations');
      setLoadingAI(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, showAIImport]);

  const handleImportDesigns = async () => {
    if (selectedDesigns.length === 0) {
      toast.error('Please select at least one design');
      return;
    }

    if (!userData?.tenantId || !website?.id || !activePage?.id) return;

    const portfolioSection = sections.find(s => s.type === 'portfolio');
    if (!portfolioSection) {
      toast.error('No portfolio section found on this page. Add one first.');
      return;
    }

    setSaving(true);
    try {
      const designsToImport = aiDesigns.filter(d => selectedDesigns.includes(d.id));
      const newItems = designsToImport.map(d => ({
        id: crypto.randomUUID(),
        title: d.roomType || 'AI Design',
        description: d.style || 'Generated Visualization',
        image: d.generatedImageUrl,
        category: d.roomType || 'General'
      }));

      const sectionRef = doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${activePage.id}/sections`, portfolioSection.id);
      const currentItems = portfolioSection.content.items || [];
      
      await updateDoc(sectionRef, {
        'content.items': [...currentItems, ...newItems],
        updatedAt: serverTimestamp()
      });

      toast.success(`Imported ${selectedDesigns.length} designs to portfolio`);
      setShowAIImport(false);
      setSelectedDesigns([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'import_ai_designs');
    } finally {
      setSaving(false);
    }
  };

  // Fetch Website Data
  useEffect(() => {
    if (authLoading) return;

    if (!userData?.tenantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `tenants/${userData.tenantId}/websites`),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setWebsite({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as Website);
      } else {
        setWebsite(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tenants/${userData.tenantId}/websites`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, authLoading]);

  // Fetch Pages for Active Website
  useEffect(() => {
    if (!userData?.tenantId || !website?.id) return;

    const q = query(
      collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WebsitePage[];
      
      setPages(pagesData);
      if (!activePage && pagesData.length > 0) {
        setActivePage(pagesData.find(p => p.isHomepage) || pagesData[0]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pages');
    });

    return () => unsubscribe();
  }, [userData?.tenantId, website?.id]);

  // Fetch Sections for Active Page
  useEffect(() => {
    if (!userData?.tenantId || !website?.id || !activePage?.id) return;

    const q = query(
      collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${activePage.id}/sections`),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sectionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WebsiteSection[];
      setSections(sectionsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sections');
    });

    return () => unsubscribe();
  }, [userData?.tenantId, website?.id, activePage?.id]);

  const handleSaveDraft = async () => {
    if (!website) return;
    setSaving(true);
    try {
      const websiteRef = doc(db, `tenants/${userData.tenantId}/websites`, website.id);
      await updateDoc(websiteRef, {
        globalSettings: website.globalSettings,
        conversionSettings: website.conversionSettings,
        status: 'draft',
        updatedAt: serverTimestamp()
      });
      toast.success('Draft saved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tenants/${userData.tenantId}/websites/${website.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!website) return;
    setPublishing(true);
    try {
      const websiteRef = doc(db, `tenants/${userData.tenantId}/websites`, website.id);
      await updateDoc(websiteRef, {
        status: 'published',
        lastPublishedAt: serverTimestamp()
      });
      toast.success('Website published successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tenants/${userData.tenantId}/websites/${website.id}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteWebsite = async () => {
    if (!website || !userData?.tenantId) return;
    
    if (!confirm('Are you sure you want to delete this entire website? This action cannot be undone and will remove all pages and sections.')) {
      return;
    }

    setDeleting(true);
    try {
      // 1. Delete all pages and their sections
      const pagesRef = collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`);
      const pagesSnap = await getDocs(pagesRef);
      
      for (const pageDoc of pagesSnap.docs) {
        const sectionsRef = collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${pageDoc.id}/sections`);
        const sectionsSnap = await getDocs(sectionsRef);
        
        for (const sectionDoc of sectionsSnap.docs) {
          await deleteDoc(doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${pageDoc.id}/sections`, sectionDoc.id));
        }
        await deleteDoc(doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`, pageDoc.id));
      }

      // 2. Delete the website document itself
      await deleteDoc(doc(db, `tenants/${userData.tenantId}/websites`, website.id));
      
      toast.success('Website deleted successfully');
      setWebsite(null);
      setPages([]);
      setActivePage(null);
      setSections([]);
    } catch (error) {
      console.error('Delete Website Error:', error);
      toast.error('Failed to delete website');
    } finally {
      setDeleting(false);
    }
  };

  const createPage = async () => {
    if (!website) return;
    const title = prompt('Enter page title:');
    if (!title) return;
    
    const slug = title.toLowerCase().replace(/ /g, '-');
    try {
      await addDoc(collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`), {
        title,
        slug,
        status: 'draft',
        isHomepage: false,
        templateType: 'standard',
        order: pages.length,
        seo: { title, description: '' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Page created');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'website_page');
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if (!userData?.tenantId || !website?.id || !activePage?.id) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updatedSections = [...sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[newIndex];
    updatedSections[newIndex] = temp;

    // Update orders in Firestore
    try {
      const batch = updatedSections.map((s, i) => {
        const sectionRef = doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${activePage.id}/sections`, s.id);
        return updateDoc(sectionRef, { order: i });
      });
      await Promise.all(batch);
      toast.success('Section reordered');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'reorder_sections');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!userData?.tenantId || !website?.id || !activePage?.id) return;
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    try {
      const sectionRef = doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${activePage.id}/sections`, sectionId);
      await deleteDoc(sectionRef);
      toast.success('Section deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'website_section');
    }
  };

  const addNewSection = async (type: string) => {
    if (!userData?.tenantId || !website?.id || !activePage?.id) return;
    
    try {
      const sectionsRef = collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${activePage.id}/sections`);
      await addDoc(sectionsRef, {
        type,
        content: getDefaultContent(type),
        order: sections.length,
        isVisible: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success(`${type.replace('-', ' ')} section added`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'website_section');
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return { headline: 'New Hero Section', subheadline: 'Add a compelling subheadline here.', primaryCtaText: 'Get Started', imageUrl: '' };
      case 'services':
        return { title: 'Our Services', items: [{ title: 'Service 1', description: 'Description of service 1', icon: 'wrench' }] };
      case 'portfolio':
        return { title: 'Our Recent Work', items: [] };
      case 'testimonials':
        return { title: 'What Our Clients Say', items: [{ name: 'John Doe', text: 'Great work!', rating: 5 }] };
      case 'cta':
        return { headline: 'Ready to start your project?', subheadline: 'Contact us today for a free estimate.', buttonText: 'Contact Us' };
      case 'faq':
        return { title: 'Frequently Asked Questions', items: [{ question: 'How long does a remodel take?', answer: 'It depends on the scope of the project.' }] };
      case 'contact':
        return { title: 'Contact Us', showMap: true, email: '', phone: '', address: '' };
      default:
        return {};
    }
  };

  const deletePage = async (pageId: string) => {
    if (!userData?.tenantId || !website?.id) return;
    const page = pages.find(p => p.id === pageId);
    if (page?.isHomepage) {
      toast.error('Cannot delete the homepage');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${page?.title}"?`)) return;

    try {
      await deleteDoc(doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`, pageId));
      if (activePage?.id === pageId) {
        setActivePage(pages.find(p => p.isHomepage) || null);
      }
      toast.success('Page deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'website_page');
    }
  };

  const duplicatePage = async (page: WebsitePage) => {
    if (!userData?.tenantId || !website?.id) return;
    
    try {
      const newPageRef = await addDoc(collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`), {
        ...page,
        id: undefined, // Let Firestore generate new ID
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        isHomepage: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Duplicate sections too
      const sectionsSnapshot = await getDocs(collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${page.id}/sections`));
      for (const sectionDoc of sectionsSnapshot.docs) {
        await addDoc(collection(db, `tenants/${userData.tenantId}/websites/${website.id}/pages/${newPageRef.id}/sections`), {
          ...sectionDoc.data(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Page duplicated');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'website_page');
    }
  };

  const setAsHomepage = async (pageId: string) => {
    if (!userData?.tenantId || !website?.id) return;
    
    try {
      // Unset current homepage
      const currentHome = pages.find(p => p.isHomepage);
      if (currentHome) {
        await updateDoc(doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`, currentHome.id), {
          isHomepage: false,
          updatedAt: serverTimestamp()
        });
      }

      // Set new homepage
      await updateDoc(doc(db, `tenants/${userData.tenantId}/websites/${website.id}/pages`, pageId), {
        isHomepage: true,
        updatedAt: serverTimestamp()
      });
      
      toast.success('Homepage updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'website_page');
    }
  };

  const provisionWebsite = async () => {
    if (!userData?.tenantId) return;
    setSaving(true);
    try {
      // 1. Create Website Doc
      const websiteRef = await addDoc(collection(db, `tenants/${userData.tenantId}/websites`), {
        tenantId: userData.tenantId,
        templateId: 'standard_template_v1',
        status: 'draft',
        globalSettings: {
          businessName: userData.displayName || 'My Business',
          brandColors: { primary: '#001F3F', secondary: '#0074D9', accent: '#0074D9' }
        },
        conversionSettings: {
          primaryCta: { text: 'Get a Quote', link: '/contact', action: 'form' },
          stickyCta: true,
          chatWidget: false,
          exitIntentPopup: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Create Homepage
      const pageRef = await addDoc(collection(db, `tenants/${userData.tenantId}/websites/${websiteRef.id}/pages`), {
        title: 'Home',
        slug: 'home',
        status: 'published',
        isHomepage: true,
        templateType: 'standard',
        order: 0,
        seo: { title: 'Home | ' + (userData.displayName || 'My Business'), description: 'Welcome to our website.' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 3. Create Default Sections
      const sectionsRef = collection(db, `tenants/${userData.tenantId}/websites/${websiteRef.id}/pages/${pageRef.id}/sections`);
      const defaultSections = [
        { type: 'hero', content: { headline: 'Expert Remodeling Services', subheadline: 'We transform your home with quality craftsmanship.', primaryCtaText: 'Get Started', imageUrl: 'https://picsum.photos/seed/hero/1920/1080' }, order: 0 },
        { type: 'services', content: { title: 'Our Services', items: [{ title: 'Kitchen Remodeling', description: 'Complete kitchen transformations.', icon: 'wrench' }, { title: 'Bathroom Renovation', description: 'Modern bathroom upgrades.', icon: 'bath' }] }, order: 1 },
        { type: 'cta', content: { headline: 'Ready to start your project?', subheadline: 'Contact us today for a free estimate.', buttonText: 'Contact Us' }, order: 2 }
      ];

      for (const section of defaultSections) {
        await addDoc(sectionsRef, {
          ...section,
          isVisible: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Website provisioned successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'provision_website');
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerateWebsite = async () => {
    if (!userData?.tenantId) return;
    setGeneratingAI(true);
    try {
      const services = ['Kitchen Remodeling', 'Bathroom Renovation', 'Roofing', 'Siding'];
      const aiContent = await AIService.generateWebsiteContent(userData.tenantId, userData.displayName || 'My Business', services);
      console.log('AI Website Content Generated:', aiContent);
      
      if (!aiContent || !aiContent.pages || !Array.isArray(aiContent.pages) || aiContent.pages.length === 0) {
        console.error('Invalid AI response structure:', aiContent);
        throw new Error('Invalid AI response structure: Missing pages');
      }

      // 1. Create Website Doc
      const websiteRef = await addDoc(collection(db, `tenants/${userData.tenantId}/websites`), {
        tenantId: userData.tenantId,
        templateId: 'ai_template_v1',
        status: 'draft',
        globalSettings: aiContent.globalSettings || {
          businessName: userData.displayName || 'My Business',
          brandColors: { primary: '#001F3F', secondary: '#0074D9', accent: '#0074D9' }
        },
        conversionSettings: aiContent.conversionSettings || {
          primaryCta: { text: 'Get a Quote', link: '/contact', action: 'form' },
          stickyCta: true,
          chatWidget: false,
          exitIntentPopup: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Create Pages and Sections
      for (const pageData of aiContent.pages) {
        const pageRef = await addDoc(collection(db, `tenants/${userData.tenantId}/websites/${websiteRef.id}/pages`), {
          title: pageData.title,
          slug: pageData.slug,
          status: 'published',
          isHomepage: pageData.isHomepage,
          templateType: 'standard',
          order: 0,
          seo: pageData.seo,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const sectionsRef = collection(db, `tenants/${userData.tenantId}/websites/${websiteRef.id}/pages/${pageRef.id}/sections`);
        if (pageData.sections && Array.isArray(pageData.sections)) {
          for (let i = 0; i < pageData.sections.length; i++) {
            const section = pageData.sections[i];
            await addDoc(sectionsRef, {
              ...section,
              order: i,
              isVisible: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }
      }

      toast.success('AI Website generated successfully!');
    } catch (error) {
      console.error('AI Generation Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate AI website: ${errorMessage}`);
      if (error instanceof Error && userData?.tenantId) {
        // Log error to Firestore for debugging if possible
        // handleFirestoreError(error, OperationType.CREATE, 'ai_website_generation_failure');
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-electric" size={48} />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="text-electric" size={40} />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">No Website Found</h2>
        <p className="text-gray-500 mb-8">Your account doesn't have a website provisioned yet. Let's get you set up.</p>
        <div className="space-y-3">
          <button 
            onClick={handleAIGenerateWebsite}
            disabled={generatingAI || saving}
            className="w-full py-3 bg-navy text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-navy/20"
          >
            {generatingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-yellow-400" />}
            Generate AI Website
          </button>
          <button 
            onClick={provisionWebsite}
            disabled={saving || generatingAI}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
            Standard Provisioning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Left Sidebar - Page Manager & Navigation */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-electric/10 rounded-xl flex items-center justify-center">
              <Globe className="text-electric" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-navy leading-tight">Site Editor</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ClosePro CMS v2.0</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('pages')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pages' ? 'bg-electric text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Layout size={18} />
              Pages
            </button>
            <button 
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'global' ? 'bg-electric text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Settings size={18} />
              Site Settings
            </button>
            <button 
              onClick={() => setActiveTab('conversion')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'conversion' ? 'bg-electric text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <MousePointer2 size={18} />
              Conversions
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-electric text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <BarChart3 size={18} />
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'integrations' ? 'bg-electric text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Zap size={18} />
              Integrations
            </button>
            <button 
              onClick={() => setShowMediaLibrary(true)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              <ImageIcon size={18} />
              Media Library
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Pages</h3>
                <button 
                  onClick={createPage}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-electric transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-1">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activePage?.id === page.id ? 'bg-blue-50 text-electric' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className={activePage?.id === page.id ? 'text-electric' : 'text-gray-400'} />
                      <span className="truncate">{page.title}</span>
                      {page.isHomepage && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">Home</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative group/menu">
                        <button className="p-1 hover:text-navy"><MoreVertical size={14} /></button>
                        <div className="absolute left-full top-0 ml-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover/menu:block z-50">
                          <button 
                            onClick={() => duplicatePage(page)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-electric"
                          >
                            <Copy size={14} /> Duplicate Page
                          </button>
                          {!page.isHomepage && (
                            <button 
                              onClick={() => setAsHomepage(page.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-electric"
                            >
                              <CheckCircle size={14} /> Set as Homepage
                            </button>
                          )}
                          <button 
                            onClick={() => deletePage(page.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} /> Delete Page
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-electric/5 rounded-2xl p-4 border border-electric/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-electric" size={16} />
              <span className="text-xs font-bold text-navy">Quick Tips</span>
            </div>
            <ul className="space-y-2">
              <li className="text-[10px] text-gray-500 flex gap-2">
                <div className="w-1 h-1 bg-electric rounded-full mt-1 shrink-0" />
                Use high-quality photos for your hero section.
              </li>
              <li className="text-[10px] text-gray-400 flex gap-2">
                <div className="w-1 h-1 bg-electric rounded-full mt-1 shrink-0" />
                Keep your SEO titles under 60 characters.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-50">
          <div className="bg-navy rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${website.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {(website.status || 'draft').toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mb-4">Last published: {website.lastPublishedAt?.toDate ? format(website.lastPublishedAt.toDate(), 'MMM d, h:mm a') : 'Never'}</p>
            <button 
              onClick={handlePublish}
              disabled={publishing || deleting}
              className="w-full py-2.5 bg-electric hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mb-2"
            >
              {publishing ? <Loader2 className="animate-spin" size={16} /> : <Share2 size={16} />}
              Publish Site
            </button>
            <button 
              onClick={handleDeleteWebsite}
              disabled={publishing || deleting}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              Delete Website
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            {activeTab === 'pages' && activePage && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy">{activePage.title}</span>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-gray-400 font-mono">/{activePage.slug}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button 
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white text-electric shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Monitor size={18} />
              </button>
              <button 
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-white text-electric shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Tablet size={18} />
              </button>
              <button 
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white text-electric shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Smartphone size={18} />
              </button>
            </div>

            <div className="h-8 w-px bg-gray-100 mx-2" />

            <button 
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-navy font-bold text-sm transition-colors"
            >
              <Eye size={18} />
              Preview
            </button>
            
            <button 
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-navy rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Draft
            </button>
          </div>
        </header>

        {/* Editor Workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'pages' && (
              activePage ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-navy">Editing: {activePage.title}</h2>
                      <p className="text-gray-500">Manage the sections and content for this page.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveTab('seo')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all"
                      >
                        <Search size={14} />
                        Page SEO
                      </button>
                    </div>
                  </div>

                  {/* Section Builder */}
                  <div className="space-y-4">
                    {sections.length > 0 ? (
                      sections.map((section, index) => (
                        <SectionCard 
                          key={section.id} 
                          section={section} 
                          index={index}
                          totalSections={sections.length}
                          tenantId={userData?.tenantId || ''}
                          websiteId={website?.id || ''}
                          pageId={activePage.id}
                          onDelete={() => deleteSection(section.id)}
                          onMove={(direction) => moveSection(index, direction)}
                          setShowAIImport={setShowAIImport}
                          onGenerateImage={handleGenerateSectionImage}
                          generatingImage={generatingImage}
                        />
                      ))
                    ) : (
                      <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Layout className="text-gray-300" size={32} />
                        </div>
                        <h3 className="font-bold text-navy mb-1">Empty Page</h3>
                        <p className="text-sm text-gray-500 mb-6">This page doesn't have any sections yet. Add your first section to get started.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-100">
                      {['hero', 'services', 'portfolio', 'testimonials', 'cta', 'faq', 'contact'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => addNewSection(type)}
                          className="p-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-electric hover:text-electric transition-all group"
                        >
                          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-electric/10 transition-colors">
                            {getSectionIcon(type)}
                          </div>
                          <span className="font-bold text-[10px] uppercase tracking-wider">{type.replace('-', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-300" size={32} />
                  </div>
                  <h3 className="font-bold text-navy mb-1">No Page Selected</h3>
                  <p className="text-sm text-gray-500 mb-6">Select a page from the sidebar or create a new one to start editing.</p>
                  <button onClick={createPage} className="btn-primary px-6 py-2">Create First Page</button>
                </div>
              )
            )}

            {activeTab === 'global' && website && (
              <GlobalSettingsView 
                website={website} 
                setWebsite={setWebsite} 
                tenantId={userData?.tenantId || ''} 
              />
            )}
            {activeTab === 'conversion' && website && (
              <ConversionSettingsView 
                website={website} 
                setWebsite={setWebsite} 
                tenantId={userData?.tenantId || ''} 
              />
            )}
            {activeTab === 'seo' && activePage && (
              <PageSEOView 
                page={activePage} 
                setPages={setPages} 
                tenantId={userData?.tenantId || ''} 
                websiteId={website?.id || ''} 
              />
            )}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'integrations' && <IntegrationsView />}
          </div>
        </main>
      </div>

      {/* Media Library Modal */}
      <AnimatePresence>
        {showMediaLibrary && (
          <div className="fixed inset-0 bg-navy/60 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-navy">Media Library</h3>
                <button onClick={() => setShowMediaLibrary(false)} className="p-2 hover:bg-gray-50 rounded-xl"><Plus size={24} className="rotate-45 text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {loadingMedia ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-electric mb-4" size={40} />
                    <p className="text-gray-400">Loading your library...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={handleUploadMedia}
                      disabled={saving}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-electric hover:text-electric transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </button>
                    {mediaAssets.map(asset => (
                      <div key={asset.id} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(asset.url);
                              toast.success('URL copied to clipboard');
                            }}
                            className="p-2 bg-white rounded-lg text-navy hover:text-electric"
                            title="Copy URL"
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                            onClick={() => deleteMedia(asset.id)}
                            className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-[10px] text-white truncate font-medium">{asset.name}</p>
                        </div>
                      </div>
                    ))}
                    {mediaAssets.length === 0 && !loadingMedia && (
                      <div className="col-span-full py-20 text-center">
                        <ImageIcon className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-400">Your media library is empty.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Visualizer Import Modal */}
      <AnimatePresence>
        {showAIImport && (
          <div className="fixed inset-0 bg-navy/60 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-electric text-white">
                <div className="flex items-center gap-3">
                  <Zap size={20} />
                  <h3 className="text-xl font-bold">Import AI Designs</h3>
                </div>
                <button onClick={() => setShowAIImport(false)} className="p-2 hover:bg-white/10 rounded-xl"><Plus size={24} className="rotate-45" /></button>
              </div>
              <div className="p-8">
                <p className="text-sm text-gray-500 mb-6">Select designs from your AI Visualizer to showcase in your website portfolio.</p>
                
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-electric mb-4" size={32} />
                    <p className="text-sm text-gray-400">Fetching your designs...</p>
                  </div>
                ) : aiDesigns.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-navy font-bold">No AI designs found</p>
                    <p className="text-xs text-gray-400 mt-1">Generate some designs in the Visualizer first.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
                    {aiDesigns.map(design => (
                      <div 
                        key={design.id} 
                        onClick={() => {
                          if (selectedDesigns.includes(design.id)) {
                            setSelectedDesigns(prev => prev.filter(id => id !== design.id));
                          } else {
                            setSelectedDesigns(prev => [...prev, design.id]);
                          }
                        }}
                        className={`border-2 rounded-2xl overflow-hidden cursor-pointer transition-all relative ${
                          selectedDesigns.includes(design.id) ? 'border-electric ring-2 ring-electric/20' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <img src={design.generatedImageUrl} alt="AI Design" className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                        <div className="p-3 bg-white flex items-center justify-between">
                          <span className="text-xs font-bold text-navy truncate mr-2">{design.roomType} - {design.style}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedDesigns.includes(design.id) ? 'bg-electric border-electric' : 'border-gray-200'
                          }`}>
                            {selectedDesigns.includes(design.id) && <CheckCircle size={12} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAIImport(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleImportDesigns}
                    disabled={selectedDesigns.length === 0 || saving}
                    className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Import {selectedDesigns.length > 0 ? `(${selectedDesigns.length})` : ''} Designs
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/90 z-[100] flex flex-col"
          >
            <div className="h-16 bg-white flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-navy">Live Preview</h3>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-white text-electric shadow-sm' : 'text-gray-400'}`}><Monitor size={18} /></button>
                  <button onClick={() => setPreviewMode('tablet')} className={`p-2 rounded-lg ${previewMode === 'tablet' ? 'bg-white text-electric shadow-sm' : 'text-gray-400'}`}><Tablet size={18} /></button>
                  <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-white text-electric shadow-sm' : 'text-gray-400'}`}><Smartphone size={18} /></button>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-navy transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 p-8 flex justify-center overflow-hidden">
              <div className={`bg-white shadow-2xl transition-all duration-500 overflow-y-auto ${
                previewMode === 'desktop' ? 'w-full max-w-6xl' : 
                previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
              }`}>
                {/* Mock Website Content */}
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="text-electric" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-navy mb-4">Previewing: {activePage?.title}</h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">This is a live preview of your website. All changes are reflected here in real-time before you publish.</p>
                  <div className="space-y-4">
                    {sections.map((s, i) => (
                      <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h4 className="font-bold text-navy uppercase text-xs tracking-widest mb-2">{s.type} Section</h4>
                        <p className="text-sm text-gray-400">Content for {s.type} would render here in the actual template.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for cleaner code
function SectionCard({ section, index, totalSections, tenantId, websiteId, pageId, onDelete, onMove, setShowAIImport, onGenerateImage, generatingImage }: { section: WebsiteSection, index: number, totalSections: number, tenantId: string, websiteId: string, pageId: string, onDelete: () => void, onMove: (direction: 'up' | 'down') => void, setShowAIImport: (show: boolean) => void, onGenerateImage: (id: string, prompt: string, field: string) => void, generatingImage: string | null }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  
  const updateSectionContent = async (field: string, value: any) => {
    try {
      const sectionRef = doc(db, `tenants/${tenantId}/websites/${websiteId}/pages/${pageId}/sections`, section.id);
      await updateDoc(sectionRef, {
        [`content.${field}`]: value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'website_section');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-5 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div className="cursor-grab text-gray-300 hover:text-gray-500 transition-colors">
            <GripVertical size={20} />
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-electric">
            {getSectionIcon(section.type)}
          </div>
          <div>
            <h4 className="font-bold text-navy capitalize">{section.type.replace('-', ' ')}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section {index + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 rounded-lg mr-2">
            <button 
              onClick={() => onMove('up')}
              disabled={index === 0}
              className="p-1.5 text-gray-400 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="rotate-180" size={16} />
            </button>
            <div className="w-[1px] h-4 bg-gray-200" />
            <button 
              onClick={() => onMove('down')}
              disabled={index === totalSections - 1}
              className="p-1.5 text-gray-400 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-navy transition-colors"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-50 p-6 bg-gray-50/30"
          >
            <div className="space-y-6">
              {renderSectionEditor(section, updateSectionContent, setShowAIImport, onGenerateImage, generatingImage)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSectionIcon(type: string) {
  switch (type) {
    case 'hero': return <Layout size={20} />;
    case 'services': return <Briefcase size={20} />;
    case 'portfolio': return <ImageIcon size={20} />;
    case 'testimonials': return <Star size={20} />;
    case 'cta': return <MousePointer2 size={20} />;
    case 'faq': return <MessageSquare size={20} />;
    case 'contact': return <Calendar size={20} />;
    default: return <Layout size={20} />;
  }
}

function renderSectionEditor(section: WebsiteSection, update: (field: string, value: any) => void, setShowAIImport: (show: boolean) => void, onGenerateImage: (id: string, prompt: string, field: string) => void, generatingImage: string | null) {
  if (!section.content) return <div className="p-4 text-gray-400 text-xs italic">No content available for this section.</div>;
  
  switch (section.type) {
    case 'hero':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Headline</label>
              <input 
                type="text" 
                value={section.content.headline || ''} 
                onChange={(e) => update('headline', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Subheadline</label>
              <textarea 
                rows={3}
                value={section.content.subheadline || ''} 
                onChange={(e) => update('subheadline', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Primary CTA Text</label>
              <input 
                type="text" 
                value={section.content.primaryCtaText || ''} 
                onChange={(e) => update('primaryCtaText', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Hero Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={section.content.imageUrl || ''} 
                  onChange={(e) => update('imageUrl', e.target.value)}
                  className="flex-1 bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                />
                <button 
                  onClick={() => onGenerateImage(section.id, `High quality professional photo of ${section.content.headline || 'contractor work'}`, 'imageUrl')}
                  disabled={generatingImage === section.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-electric transition-colors disabled:opacity-50"
                  title="Generate with AI"
                >
                  {generatingImage === section.id ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                </button>
                <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-electric transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    case 'services':
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Section Title</label>
            <input 
              type="text" 
              value={section.content.title || ''} 
              onChange={(e) => update('title', e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase">Service Items</label>
            {(section.content.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy">Service #{idx + 1}</span>
                  <button 
                    onClick={() => {
                      const newItems = [...section.content.items];
                      newItems.splice(idx, 1);
                      update('items', newItems);
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    placeholder="Service Title"
                    value={item.title || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[idx].title = e.target.value;
                      update('items', newItems);
                    }}
                    className="w-full bg-gray-50 border-none rounded-xl p-2 text-sm"
                  />
                  <input 
                    placeholder="Icon Name (lucide)"
                    value={item.icon || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[idx].icon = e.target.value;
                      update('items', newItems);
                    }}
                    className="w-full bg-gray-50 border-none rounded-xl p-2 text-sm"
                  />
                </div>
                <textarea 
                  placeholder="Service Description"
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...section.content.items];
                    newItems[idx].description = e.target.value;
                    update('items', newItems);
                  }}
                  className="w-full bg-gray-50 border-none rounded-xl p-2 text-sm"
                  rows={2}
                />
              </div>
            ))}
            <button 
              onClick={() => update('items', [...(section.content.items || []), { title: '', description: '', icon: 'wrench' }])}
              className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-electric hover:text-electric transition-all"
            >
              + Add Service
            </button>
          </div>
        </div>
      );
    case 'portfolio':
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Section Title</label>
            <input 
              type="text" 
              value={section.content.title || ''} 
              onChange={(e) => update('title', e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="text-gray-400" size={24} />
            </div>
            <p className="text-sm font-bold text-navy mb-1">Portfolio Integration</p>
            <p className="text-xs text-gray-500 mb-4">Connect your AI Visualizer projects or upload manual photos.</p>
            <button 
              onClick={() => setShowAIImport(true)}
              className="btn-primary px-6 py-2 text-xs"
            >
              Import from AI Visualizer
            </button>
          </div>
        </div>
      );
    case 'testimonials':
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Section Title</label>
            <input 
              type="text" 
              value={section.content.title || ''} 
              onChange={(e) => update('title', e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
          <div className="space-y-4">
            {(section.content.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <input 
                    placeholder="Client Name"
                    value={item.name || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[idx].name = e.target.value;
                      update('items', newItems);
                    }}
                    className="font-bold text-navy bg-transparent border-none p-0 text-sm focus:ring-0"
                  />
                  <button 
                    onClick={() => {
                      const newItems = [...section.content.items];
                      newItems.splice(idx, 1);
                      update('items', newItems);
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea 
                  placeholder="Testimonial Text"
                  value={item.text || ''}
                  onChange={(e) => {
                    const newItems = [...section.content.items];
                    newItems[idx].text = e.target.value;
                    update('items', newItems);
                  }}
                  className="w-full bg-gray-50 border-none rounded-xl p-2 text-sm"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Rating</label>
                  <input 
                    type="number" min="1" max="5"
                    value={item.rating || 5}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[idx].rating = parseInt(e.target.value);
                      update('items', newItems);
                    }}
                    className="w-16 bg-gray-50 border-none rounded-lg p-1 text-xs"
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={() => update('items', [...(section.content.items || []), { name: '', text: '', rating: 5 }])}
              className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-electric hover:text-electric transition-all"
            >
              + Add Testimonial
            </button>
          </div>
        </div>
      );
    case 'cta':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Headline</label>
              <input 
                type="text" 
                value={section.content.headline || ''} 
                onChange={(e) => update('headline', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Subheadline</label>
              <textarea 
                rows={2}
                value={section.content.subheadline || ''} 
                onChange={(e) => update('subheadline', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Button Text</label>
              <input 
                type="text" 
                value={section.content.buttonText || ''} 
                onChange={(e) => update('buttonText', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Background Style</label>
              <select 
                value={section.content.style || 'electric'}
                onChange={(e) => update('style', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              >
                <option value="electric">Electric Blue</option>
                <option value="navy">Navy Dark</option>
                <option value="light">Light Gray</option>
              </select>
            </div>
          </div>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Section Title</label>
            <input 
              type="text" 
              value={section.content.title || ''} 
              onChange={(e) => update('title', e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
          <div className="space-y-4">
            {(section.content.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <input 
                    placeholder="Question"
                    value={item.question || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[idx].question = e.target.value;
                      update('items', newItems);
                    }}
                    className="font-bold text-navy bg-transparent border-none p-0 text-sm w-full focus:ring-0"
                  />
                  <button 
                    onClick={() => {
                      const newItems = [...section.content.items];
                      newItems.splice(idx, 1);
                      update('items', newItems);
                    }}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea 
                  placeholder="Answer"
                  value={item.answer || ''}
                  onChange={(e) => {
                    const newItems = [...section.content.items];
                    newItems[idx].answer = e.target.value;
                    update('items', newItems);
                  }}
                  className="w-full bg-gray-50 border-none rounded-xl p-2 text-sm"
                  rows={2}
                />
              </div>
            ))}
            <button 
              onClick={() => update('items', [...(section.content.items || []), { question: '', answer: '' }])}
              className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-electric hover:text-electric transition-all"
            >
              + Add FAQ
            </button>
          </div>
        </div>
      );
    case 'contact':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Section Title</label>
              <input 
                type="text" 
                value={section.content.title || ''} 
                onChange={(e) => update('title', e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-navy">Show Map</p>
                <p className="text-[10px] text-gray-400">Display Google Maps widget</p>
              </div>
              <button 
                onClick={() => update('showMap', !section.content.showMap)}
                className={`w-12 h-6 rounded-full transition-all relative ${section.content.showMap ? 'bg-electric' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${section.content.showMap ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Contact Overrides</p>
            <p className="text-xs text-gray-500 italic">By default, this uses your Global Site Settings. Enter values here to override them for this section.</p>
            <input 
              placeholder="Override Email"
              value={section.content.email || ''}
              onChange={(e) => update('email', e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm"
            />
            <input 
              placeholder="Override Phone"
              value={section.content.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm"
            />
          </div>
        </div>
      );
    // Add more section types here...
    default:
      return <div className="text-gray-400 text-sm italic">Editor for this section type is coming soon.</div>;
  }
}

function AnalyticsView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-navy">Website Analytics</h2>
        <p className="text-gray-500">Track your website performance and visitor behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Visitors', value: '1,284', change: '+12%', icon: Users },
          { label: 'Page Views', value: '4,829', change: '+18%', icon: Eye },
          { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', icon: Target },
          { label: 'Avg. Session', value: '2m 45s', change: '-5%', icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <stat.icon className="text-electric" size={20} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-navy mb-6 flex items-center gap-2">
            <BarChart3 className="text-electric" size={20} /> Traffic Overview
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[40, 65, 45, 90, 55, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-electric/10 rounded-t-lg group-hover:bg-electric transition-all relative"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h * 10}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-navy mb-6 flex items-center gap-2">
            <MousePointer2 className="text-electric" size={20} /> Top Pages
          </h3>
          <div className="space-y-4">
            {[
              { path: '/', views: '2,482', rate: '4.2%' },
              { path: '/services', views: '1,102', rate: '2.8%' },
              { path: '/portfolio', views: '842', rate: '5.1%' },
              { path: '/contact', views: '403', rate: '12.4%' },
            ].map((page, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <span className="text-sm font-bold text-navy">{page.path}</span>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Views</p>
                    <p className="text-xs font-bold text-navy">{page.views}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Conv.</p>
                    <p className="text-xs font-bold text-green-600">{page.rate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalSettingsView({ website, setWebsite, tenantId }: { website: Website, setWebsite: any, tenantId: string }) {
  const globalSettings = (website.globalSettings || {}) as any;
  
  // Debounced persistence
  useDebounceEffect(() => {
    if (!tenantId || !website.id) return;
    const persist = async () => {
      try {
        const websiteRef = doc(db, `tenants/${tenantId}/websites`, website.id);
        await updateDoc(websiteRef, {
          globalSettings: website.globalSettings,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'website_global_settings');
      }
    };
    persist();
  }, [website.globalSettings], 1000);

  const updateGlobal = (field: keyof GlobalSettings, value: any) => {
    setWebsite((prev: any) => ({
      ...prev,
      globalSettings: {
        ...(prev.globalSettings || {}),
        [field]: value
      }
    }));
  };

  const updateColors = (colorField: string, value: string) => {
    setWebsite((prev: any) => ({
      ...prev,
      globalSettings: {
        ...(prev.globalSettings || {}),
        brandColors: {
          ...(prev.globalSettings?.brandColors || {}),
          [colorField]: value
        }
      }
    }));
  };

  const updateSocial = (socialField: string, value: string) => {
    setWebsite((prev: any) => ({
      ...prev,
      globalSettings: {
        ...(prev.globalSettings || {}),
        socialLinks: {
          ...(prev.globalSettings?.socialLinks || {}),
          [socialField]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-navy">Global Site Settings</h2>
        <p className="text-gray-500">These settings apply across your entire website.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-navy flex items-center gap-2">
            <Settings className="text-electric" size={20} /> Business Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Business Name</label>
              <input 
                type="text" 
                value={globalSettings.businessName || ''} 
                onChange={(e) => updateGlobal('businessName', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Phone Number</label>
              <input 
                type="text" 
                value={globalSettings.phone || ''} 
                onChange={(e) => updateGlobal('phone', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={globalSettings.email || ''} 
                onChange={(e) => updateGlobal('email', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Physical Address</label>
              <textarea 
                rows={2}
                value={globalSettings.address || ''} 
                onChange={(e) => updateGlobal('address', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-navy flex items-center gap-2">
            <Layout className="text-electric" size={20} /> Branding & Assets
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Logo URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={globalSettings.logo || ''} 
                  onChange={(e) => updateGlobal('logo', e.target.value)}
                  className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                />
                <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-electric transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Favicon URL</label>
              <input 
                type="text" 
                value={globalSettings.favicon || ''} 
                onChange={(e) => updateGlobal('favicon', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Primary</label>
                <input 
                  type="color" 
                  value={globalSettings.brandColors?.primary || '#3B82F6'}
                  onChange={(e) => updateColors('primary', e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Secondary</label>
                <input 
                  type="color" 
                  value={globalSettings.brandColors?.secondary || '#1E293B'}
                  onChange={(e) => updateColors('secondary', e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Accent</label>
                <input 
                  type="color" 
                  value={globalSettings.brandColors?.accent || '#10B981'}
                  onChange={(e) => updateColors('accent', e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-navy flex items-center gap-2">
            <Share2 className="text-electric" size={20} /> Social Links
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Facebook</label>
              <input 
                type="url" 
                value={globalSettings.socialLinks?.facebook || ''} 
                onChange={(e) => updateSocial('facebook', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Instagram</label>
              <input 
                type="url" 
                value={globalSettings.socialLinks?.instagram || ''} 
                onChange={(e) => updateSocial('instagram', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Twitter / X</label>
              <input 
                type="url" 
                value={globalSettings.socialLinks?.twitter || ''} 
                onChange={(e) => updateSocial('twitter', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionSettingsView({ website, setWebsite, tenantId }: { website: Website, setWebsite: any, tenantId: string }) {
  const conversionSettings = (website.conversionSettings || {}) as any;
  
  // Debounced persistence
  useDebounceEffect(() => {
    if (!tenantId || !website.id) return;
    const persist = async () => {
      try {
        const websiteRef = doc(db, `tenants/${tenantId}/websites`, website.id);
        await updateDoc(websiteRef, {
          conversionSettings: website.conversionSettings,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'website_conversion_settings');
      }
    };
    persist();
  }, [website.conversionSettings], 1000);

  const updateConversion = (field: keyof ConversionSettings, value: any) => {
    setWebsite((prev: any) => ({
      ...prev,
      conversionSettings: {
        ...(prev.conversionSettings || {}),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-navy">Conversion Settings</h2>
        <p className="text-gray-500">Optimize your website for leads and bookings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-navy flex items-center gap-2">
            <MousePointer2 className="text-electric" size={20} /> Primary Call to Action
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">CTA Text</label>
              <input 
                type="text" 
                value={conversionSettings.primaryCta?.text || ''} 
                onChange={(e) => updateConversion('primaryCta', { ...(conversionSettings.primaryCta || {}), text: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Action Type</label>
              <select 
                value={conversionSettings.primaryCta?.action || 'form'}
                onChange={(e) => updateConversion('primaryCta', { ...(conversionSettings.primaryCta || {}), action: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
              >
                <option value="form">Contact Form</option>
                <option value="booking">Booking Widget</option>
                <option value="call">Phone Call</option>
                <option value="link">External Link</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-navy flex items-center gap-2">
            <Zap className="text-electric" size={20} /> Conversion Features
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-navy">Sticky Header CTA</p>
                <p className="text-[10px] text-gray-400">Keep CTA visible while scrolling</p>
              </div>
              <button 
                onClick={() => updateConversion('stickyCta', !conversionSettings.stickyCta)}
                className={`w-12 h-6 rounded-full transition-all relative ${conversionSettings.stickyCta ? 'bg-electric' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${conversionSettings.stickyCta ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-navy">Chat Widget</p>
                <p className="text-[10px] text-gray-400">Enable live chat support</p>
              </div>
              <button 
                onClick={() => updateConversion('chatWidget', !conversionSettings.chatWidget)}
                className={`w-12 h-6 rounded-full transition-all relative ${conversionSettings.chatWidget ? 'bg-electric' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${conversionSettings.chatWidget ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-navy">Exit Intent Popup</p>
                <p className="text-[10px] text-gray-400">Show offer when user leaves</p>
              </div>
              <button 
                onClick={() => updateConversion('exitIntentPopup', !conversionSettings.exitIntentPopup)}
                className={`w-12 h-6 rounded-full transition-all relative ${conversionSettings.exitIntentPopup ? 'bg-electric' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${conversionSettings.exitIntentPopup ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsView() {
  const integrations = [
    { id: 'ga', name: 'Google Analytics', icon: <BarChart3 size={20} />, description: 'Track visitor behavior and traffic sources.', connected: true },
    { id: 'fb', name: 'Facebook Pixel', icon: <Share2 size={20} />, description: 'Optimize your ads and track conversions.', connected: false },
    { id: 'gsc', name: 'Google Search Console', icon: <Search size={20} />, description: 'Monitor your site presence in Google Search.', connected: true },
    { id: 'booking', name: 'Calendly / Booking', icon: <Calendar size={20} />, description: 'Allow clients to book estimates directly.', connected: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-navy">Integrations</h2>
        <p className="text-gray-500">Connect your website to external tools and platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((int) => (
          <div key={int.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${int.connected ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
              {int.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-navy">{int.name}</h4>
                {int.connected ? (
                  <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
                ) : (
                  <button className="text-[10px] font-bold text-electric hover:underline">Connect</button>
                )}
              </div>
              <p className="text-xs text-gray-500">{int.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-electric/5 p-8 rounded-3xl border border-electric/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-electric text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="font-bold text-navy">ClosePro Automations</h3>
            <p className="text-sm text-gray-500">Your website is natively connected to your CRM and Pipeline.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-navy mb-1">Lead Capture</p>
            <p className="text-[10px] text-gray-400">Forms automatically create Leads in your CRM.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-navy mb-1">AI Visualizer</p>
            <p className="text-[10px] text-gray-400">Import designs directly into your portfolio.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-navy mb-1">Instant Alerts</p>
            <p className="text-[10px] text-gray-400">Get notified via SMS when a new lead arrives.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
function PageSEOView({ page, setPages, tenantId, websiteId }: { page: WebsitePage, setPages: any, tenantId: string, websiteId: string }) {
  // Debounced persistence
  useDebounceEffect(() => {
    if (!tenantId || !websiteId) return;
    const persist = async () => {
      try {
        const pageRef = doc(db, `tenants/${tenantId}/websites/${websiteId}/pages`, page.id);
        await updateDoc(pageRef, {
          seo: page.seo,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'page_seo');
      }
    };
    persist();
  }, [page.seo], 1000);

  const updateSEO = (field: keyof SEOData, value: string) => {
    setPages((prev: WebsitePage[]) => prev.map(p => 
      p.id === page.id ? { ...p, seo: { ...p.seo, [field]: value } } : p
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-navy">SEO & Metadata: {page.title}</h2>
        <p className="text-gray-500">Optimize this specific page for search engines.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">SEO Title</label>
              <input 
                type="text" 
                value={page.seo?.title || ''} 
                onChange={(e) => updateSEO('title', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                placeholder="Page Title | Business Name"
              />
              <div className="mt-1 flex justify-between">
                <span className="text-[10px] text-gray-400">{page.seo?.title?.length || 0} / 60 characters</span>
                {page.seo?.title?.length > 60 && <span className="text-[10px] text-red-500">Too long</span>}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Meta Description</label>
              <textarea 
                rows={4}
                value={page.seo?.description || ''} 
                onChange={(e) => updateSEO('description', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                placeholder="Describe what this page is about for search results..."
              />
              <div className="mt-1 flex justify-between">
                <span className="text-[10px] text-gray-400">{page.seo?.description?.length || 0} / 160 characters</span>
                {page.seo?.description?.length > 160 && <span className="text-[10px] text-red-500">Too long</span>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Focus Keywords</label>
              <input 
                type="text" 
                value={page.seo?.keywords || ''} 
                onChange={(e) => updateSEO('keywords', e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                placeholder="kitchen remodeling, bathroom design, etc."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Social Share Image (OG Image)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={page.seo?.ogImage || ''} 
                  onChange={(e) => updateSEO('ogImage', e.target.value)}
                  className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                />
                <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-electric transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Google Preview */}
        <div className="pt-8 border-t border-gray-50">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search Result Preview</h4>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 max-w-xl">
            <div className="text-[12px] text-[#202124] mb-1 truncate">https://{page.slug}.closeproremodel.com</div>
            <div className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer mb-1 truncate">{page.seo?.title || page.title}</div>
            <div className="text-[14px] text-[#4d5156] line-clamp-2">{page.seo?.description || 'Add a meta description to see how your page will appear in search results.'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
