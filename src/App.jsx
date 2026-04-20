import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, getDoc 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken,
  GoogleAuthProvider, signInWithPopup, signOut
} from 'firebase/auth';
// Removed Github to prevent [MISSING_EXPORT] errors on Vercel
import { 
  LayoutDashboard, Lightbulb, Wallet, CalendarDays, Heart, Plus, Trash2, 
  CheckCircle2, Circle, TrendingUp, TrendingDown, PieChart, Users, User, 
  Church, Globe, ArrowUpRight, ArrowDownRight, Gift, ShoppingBag, 
  StickyNote, PartyPopper, Layers, Sparkles, CreditCard, LogIn, LogOut, ShieldCheck, Copy,
  Wifi, WifiOff, RefreshCw, BrainCircuit, MessageSquareQuote, ExternalLink,
  Maximize2, Power, Loader2, Rocket, Globe2, Terminal, Code2, AlertCircle
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD6xHrI8Q2sl-w4z4v7SgqF7hnSmPqE7dY",
  authDomain: "life-hub-55fdc.firebaseapp.com",
  projectId: "life-hub-55fdc",
  storageBucket: "life-hub-55fdc.firebasestorage.app",
  messagingSenderId: "526356150365",
  appId: "1:526356150365:web:093d7e70a6ba31cfe7b5b4",
  measurementId: "G-ZSBJW4ELDN"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = 'life-hub-v1'; 

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  const [finances, setFinances] = useState([]);
  const [faithEntries, setFaithEntries] = useState([]);
  const [plans, setPlans] = useState([]);
  const [ideas, setIdeas] = useState([]);

  // Login handler
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout handler
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching based on User UID
  useEffect(() => {
    if (!user) {
      setFinances([]); setFaithEntries([]); setPlans([]); setIdeas([]);
      return;
    }
    
    const dataPath = (name) => collection(db, 'artifacts', appId, 'users', user.uid, name);
    
    const unsubFinances = onSnapshot(dataPath('finances'), (s) => setFinances(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.error(err));
    const unsubFaith = onSnapshot(dataPath('faith'), (s) => setFaithEntries(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.error(err));
    const unsubPlans = onSnapshot(dataPath('plans'), (s) => setPlans(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.error(err));
    const unsubIdeas = onSnapshot(dataPath('ideas'), (s) => setIdeas(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.error(err));

    return () => {
      unsubFinances(); unsubFaith(); unsubPlans(); unsubIdeas();
    };
  }, [user]);

  const saveItem = async (colName, data) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, colName), {
      ...data,
      createdAt: new Date().toISOString()
    });
  };

  const deleteItem = async (colName, id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, colName, id));
  };

  const totalIncome = useMemo(() => finances.filter(f => f.amount > 0).reduce((acc, curr) => acc + curr.amount, 0), [finances]);
  const totalExpenses = useMemo(() => Math.abs(finances.filter(f => f.amount < 0).reduce((acc, curr) => acc + curr.amount, 0)), [finances]);
  const cashFlow = totalIncome - totalExpenses;

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="animate-pulse font-bold tracking-widest text-xs uppercase">Connecting to Cloud...</p>
    </div>
  );

  // Sign-in Screen
  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-8 shadow-xl shadow-indigo-200 dark:shadow-none">LH</div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome to Life Hub</h1>
        <p className="text-slate-500 mb-10 text-sm">Sign in with Google to sync your finances, faith, and plans across all devices.</p>
        <button 
          onClick={login}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-100"
        >
          <Globe size={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex md:flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-8 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg text-xl">LH</div>
          <h1 className="text-xl font-black italic text-indigo-600">LIFE HUB</h1>
        </div>

        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'finances', label: 'Finances', icon: Wallet },
          { id: 'plans', label: 'Plans', icon: CalendarDays },
          { id: 'faith', label: 'Faith', icon: Heart },
          { id: 'ideas', label: 'Ideas', icon: Lightbulb },
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all w-full text-left ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="User" /> : <User size={16} />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
           </div>
           <button 
             onClick={logout} 
             className="w-full text-[11px] font-bold py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
           >
              <LogOut size={14} /> SIGN OUT
           </button>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Hello, {user.displayName?.split(' ')[0] || 'there'}</h2>
              <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Your Private Command Center</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Cashflow</p>
                <h3 className={`text-4xl font-black ${cashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${cashFlow.toLocaleString()}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Pending Plans</p>
                <h3 className="text-4xl font-black text-indigo-600">{plans.filter(p => !p.completed).length}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Faith Growth</p>
                <h3 className="text-4xl font-black text-rose-500">{faithEntries.length} items</h3>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'dashboard' && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Layers size={48} className="mb-4 text-indigo-600" />
            <h3 className="text-xl font-bold">Module Active</h3>
            <p className="text-sm">Content for {activeTab} is linked to your account.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
