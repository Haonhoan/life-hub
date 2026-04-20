import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, getDoc 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken 
} from 'firebase/auth';
// Updated imports to ensure compatibility
import { 
  LayoutDashboard, Lightbulb, Wallet, CalendarDays, Heart, Plus, Trash2, 
  CheckCircle2, Circle, TrendingUp, TrendingDown, PieChart, Users, User, 
  Church, Globe, ArrowUpRight, ArrowDownRight, Gift, ShoppingBag, 
  StickyNote, PartyPopper, Layers, Sparkles, CreditCard, LogIn, ShieldCheck, Copy,
  Wifi, WifiOff, RefreshCw, BrainCircuit, MessageSquareQuote, ExternalLink,
  Maximize2, Power, Loader2, Rocket, Github as GithubIcon, Globe2, Terminal, Code2, AlertCircle
} from 'lucide-react';

// --- Firebase Configuration ---
// REPLACE THE OBJECT BELOW WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'life-hub-v1'; 
const apiKey = ""; // Gemini API Key (Optional)

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  
  const [finances, setFinances] = useState([]);
  const [faithEntries, setFaithEntries] = useState([]);
  const [plans, setPlans] = useState([]);
  const [ideas, setIdeas] = useState([]);

  const initAuth = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      setIsOnline(true);
    } catch (error) {
      console.error("Auth error:", error);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
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
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="animate-pulse font-bold tracking-widest text-xs uppercase">Powering Up Life Hub</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex md:flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-8 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 text-xl">LH</div>
          <h1 className="text-xl font-black italic text-indigo-600">LIFE HUB</h1>
        </div>

        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'finances', label: 'Finances', icon: Wallet },
          { id: 'plans', label: 'Plans', icon: CalendarDays },
          { id: 'faith', label: 'Faith', icon: Heart },
          { id: 'ideas', label: 'Ideas', icon: Lightbulb },
          { id: 'deploy', label: 'Deployment', icon: Rocket },
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

        <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Database</span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
           </div>
           <button onClick={initAuth} className="w-full text-[10px] font-bold py-2 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 transition-colors">
              <RefreshCw size={12} /> SYNC DATA
           </button>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Your Snapshot</h2>
              <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Global Status: Connected</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Cashflow</p>
                <h3 className={`text-4xl font-black ${cashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${cashFlow.toLocaleString()}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">To-Do</p>
                <h3 className="text-4xl font-black text-indigo-600">{plans.filter(p => !p.completed).length} items</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Faith</p>
                <h3 className="text-4xl font-black text-rose-500">{faithEntries.length} entries</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <header className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl">
                <Rocket className="text-indigo-600" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black">GitHub & Vercel Sync</h2>
                <p className="text-slate-500 font-medium">Fixed the Lucide Icon Export error.</p>
              </div>
            </header>

            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 p-6 rounded-3xl flex gap-4">
              <AlertCircle className="text-rose-500 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-100">Icon Export Error Fixed</h4>
                <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">Some versions of Lucide use <code>Github</code> instead of <code>Github</code>. I have aliased the import to <code>GithubIcon</code> to avoid build conflicts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2"><GithubIcon size={20}/> 1. Fix Locally</h3>
                <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside">
                  <li>Copy the new code from the editor on the right.</li>
                  <li>Paste it into your <code>src/App.jsx</code> file.</li>
                  <li>Save and push to GitHub.</li>
                </ol>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2"><Terminal size={16}/> Terminal Commands</h3>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <p className="text-indigo-400">git add .</p>
                  <p className="text-indigo-400">git commit -m "Fix icon export error"</p>
                  <p className="text-indigo-400">git push origin main</p>
                </div>
                <button 
                  onClick={() => {
                    const text = "git add .\ngit commit -m \"Fix icon export error\"\ngit push origin main";
                    navigator.clipboard.writeText(text);
                  }}
                  className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy size={12}/> COPY COMMANDS
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
