import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { ProvisioningService } from './ProvisioningService';
import { serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  impersonate: (tenantId: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  impersonate: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatedTenantId, setImpersonatedTenantId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userPath = `users/${currentUser.uid}`;
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, userPath);
            throw e;
          }
          let finalUserData = userDoc.exists() ? userDoc.data() : null;
          
          const normalizedEmail = currentUser.email?.toLowerCase().trim();
          const isAdminEmail = normalizedEmail === 'info@vcvservices.com' || normalizedEmail === 'lawtonroofer@gmail.com';

          if (isAdminEmail) {
            // ALWAYS ensure super_admin for this email in local state
            const adminData = {
              email: currentUser.email,
              role: 'super_admin',
              tenantId: finalUserData?.tenantId || 'admin_tenant',
              createdAt: finalUserData?.createdAt || serverTimestamp()
            };
            
            // Sync to DB if missing or wrong role
            if (!finalUserData || finalUserData.role !== 'super_admin') {
              try {
                await setDoc(doc(db, 'users', currentUser.uid), adminData, { merge: true });
              } catch (e) {
                handleFirestoreError(e, OperationType.WRITE, userPath);
              }
            }
            finalUserData = { ...finalUserData, ...adminData };
          } else if (!finalUserData) {
            // Regular user with no profile - redirect to signup to complete provisioning
            if (!window.location.pathname.includes('/signup')) {
              window.location.href = '/signup';
            }
          }
          setUserData(finalUserData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const impersonate = (tenantId: string | null) => {
    setImpersonatedTenantId(tenantId);
  };

  // Override tenantId if impersonating
  const effectiveUserData = userData && impersonatedTenantId 
    ? { ...userData, tenantId: impersonatedTenantId, isImpersonating: true } 
    : userData;

  return (
    <AuthContext.Provider value={{ user, userData: effectiveUserData, loading, signOut, impersonate }}>
      {children}
    </AuthContext.Provider>
  );
};
