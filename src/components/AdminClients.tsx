import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  CreditCard, 
  Globe,
  Loader2,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function AdminClients() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'tenants'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tenantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTenants(tenantsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tenants');
    });

    return () => unsubscribe();
  }, []);

  const filteredTenants = tenants.filter(tenant => 
    (tenant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenant.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Client Management</h1>
          <p className="text-gray-500">Manage all ClosePro Remodel customers and their accounts.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20">
          <Users size={20} />
          <span>Provision New Client</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by business name or subdomain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 w-full"
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
                <th className="px-6 py-4 font-bold">Business</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Website</th>
                <th className="px-6 py-4 font-bold">Created</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-red-500 mb-2" size={32} />
                    <p className="text-gray-500">Loading clients...</p>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500 font-medium">No clients found.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold">
                          {tenant.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-navy text-sm">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.subdomain}.closeproremodel.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        tenant.plan === 'pro' ? 'bg-purple-100 text-purple-600' : 
                        tenant.plan === 'growth' ? 'bg-blue-100 text-blue-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {tenant.status === 'active' ? <CheckCircle className="text-green-500" size={14} /> : <XCircle className="text-red-500" size={14} />}
                        <span className={`text-xs font-bold uppercase ${tenant.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {tenant.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`https://${tenant.subdomain}.closeproremodel.com`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tenant.createdAt?.toDate ? tenant.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <ChevronRight size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
