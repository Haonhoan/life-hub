import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, getDoc 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken 
} from 'firebase/auth';
import { 
  LayoutDashboard, Lightbulb, Wallet, CalendarDays, Heart, Plus, Trash2, 
  CheckCircle2, Circle, TrendingUp, TrendingDown, PieChart, Users, User, 
  Church, Globe, ArrowUpRight, ArrowDownRight, Gift, ShoppingBag, 
  StickyNote, PartyPopper, Layers, Sparkles, CreditCard, LogIn, ShieldCheck, Copy,
  Wifi, WifiOff, RefreshCw, BrainCircuit, MessageSquareQuote, ExternalLink,
  Maximize2, Power, Loader2, Rocket, Github, Globe2, Terminal, Code2
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const apiKey = ""; 

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [faithFilter, setFaithFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  // --- Data State ---
  const [finances, setFinances] = useState([]);
  const [faithEntries, setFaithEntries] = useState([]);
  const [plans, setPlans] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgetLimits, setBudgetLimits] = useState({
    Housing: 1600, Food: 500, Bills: 300, Subscriptions: 100, Other: 200
  });

  // --- Connection Logic ---
  const handlePopOut = () => {
    const url = window.location.href;
    window.open(url, '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');
  };

  const initAuth = async () => {
    setIsLoading(true);
    try {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
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

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;
    const dataPath = (name) => collection(db, 'artifacts', appId, 'users', user.uid, name);
    
    const unsubFinances = onSnapshot(dataPath('finances'), (s) => setFinances(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubFaith = onSnapshot(dataPath('faith'), (s) => setFaithEntries(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubPlans = onSnapshot(dataPath('plans'), (s) => setPlans(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubIdeas = onSnapshot(dataPath('ideas'), (s) => setIdeas(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubNotes = onSnapshot(dataPath('notes'), (s) => setNotes(s.docs.map(d => ({id: d.id, ...d.data()}))));

    return () => {
      unsubFinances(); unsubFaith(); unsubPlans(); unsubIdeas(); unsubNotes();
    };
  }, [user]);

  // --- Gemini API ---
  const callGemini = async (prompt, systemPrompt) => {
    setAiLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } finally {
      setAiLoading(false);
    }
  };

  // --- Actions ---
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

  // --- Calculations ---
  const totalIncome = useMemo(() => finances.filter(f => f.amount > 0).reduce((acc, curr) => acc + curr.amount, 0), [finances]);
  const totalExpenses = useMemo(() => Math.abs(finances.filter(f => f.amount < 0).reduce((acc, curr) => acc + curr.amount, 0)), [finances]);
  const cashFlow = totalIncome - totalExpenses;

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="animate-pulse font-bold tracking-widest text-xs uppercase">Powering Up Life Hub</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      
      {/* Floating Action Header (Mobile/Popout Support) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={handlePopOut}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-indigo-600 hover:scale-110 transition-transform flex items-center gap-2 font-bold text-xs"
        >
          <ExternalLink size={18} />
          <span className="hidden sm:inline">POP OUT HUB</span>
        </button>
      </div>

      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex md:flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-8 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">LH</div>
          <h1 className="text-xl font-black italic text-indigo-600">LIFE HUB</h1>
        </div>

        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'finances', label: 'Finances', icon: Wallet },
          { id: 'plans', label: 'Plans', icon: CalendarDays },
          { id: 'faith', label: 'Faith', icon: Heart },
          { id: 'ideas', label: 'Ideas', icon: Lightbulb },
          { id: 'deploy', label: 'Deploy', icon: Rocket },
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
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
              <span className="text-[10px] font-black uppercase text-slate-400">Connection</span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
           </div>
           <button onClick={initAuth} className="w-full text-[10px] font-bold py-2 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 transition-colors">
              <RefreshCw size={12} /> RECONNECT
           </button>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {aiLoading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50">
             <BrainCircuit size={20} className="animate-spin" />
             <span className="text-sm font-bold tracking-wide">Gemini is processing...</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black tracking-tight">Your Snapshot</h2>
              <p className="text-slate-500 font-medium mt-1">Everything is synced and secured.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Net Cashflow</p>
                <h3 className={`text-4xl font-black ${cashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${cashFlow.toLocaleString()}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Pending Tasks</p>
                <h3 className="text-4xl font-black">{plans.filter(p => !p.completed).length}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Faith Growth</p>
                <h3 className="text-4xl font-black text-rose-500">{faithEntries.length} entries</h3>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                 <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Intelligent Assistant</h3>
                 <p className="text-sm text-indigo-600/80 dark:text-indigo-400 font-medium">Use the AI buttons in each tab to process your life data.</p>
               </div>
               <div className="flex gap-4">
                 <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm"><BrainCircuit className="text-indigo-600" /></div>
                 <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm"><Sparkles className="text-amber-500" /></div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black">Finances</h2>
               <button onClick={() => {
                 const desc = prompt("Transaction name?");
                 const amount = parseFloat(prompt("Amount (use - for expenses)?") || "0");
                 if (desc && !isNaN(amount)) saveItem('finances', { desc, amount, category: 'General' });
               }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={20}/> ADD ENTRY</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
               {finances.map(f => (
                 <div key={f.id} className="p-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="font-bold">{f.desc}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-mono font-bold ${f.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>${f.amount}</span>
                      <button onClick={() => deleteItem('finances', f.id)} className="text-slate-200 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                 </div>
               ))}
               {finances.length === 0 && <div className="p-20 text-center text-slate-400 italic">No financial data yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black mb-6">Daily Plans</h2>
            <button onClick={() => {
              const task = prompt("New task?");
              if (task) saveItem('plans', { task, completed: false });
            }} className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">+ Add New Goal</button>
            {plans.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 flex items-center gap-4 group">
                <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'plans', p.id), { completed: !p.completed })}>
                  {p.completed ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-200" />}
                </button>
                <span className={`flex-1 font-bold ${p.completed ? 'line-through text-slate-300' : ''}`}>{p.task}</span>
                <button onClick={() => deleteItem('plans', p.id)} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'faith' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black">Faith Journal</h2>
               <button onClick={() => {
                 const title = prompt("Title?");
                 const content = prompt("Journal content?");
                 if (title && content) saveItem('faith', { title, content });
               }} className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={20}/> NEW JOURNAL</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faithEntries.map(e => (
                <div key={e.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group">
                  <h4 className="font-bold text-lg mb-2">{e.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-3">{e.content}</p>
                  <button onClick={() => deleteItem('faith', e.id)} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-black">Idea Vault</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => {
                const text = prompt("Idea detail?");
                if (text) saveItem('ideas', { text });
              }} className="h-40 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200 rounded-[2rem] flex flex-col items-center justify-center text-indigo-600 font-bold hover:bg-indigo-100 transition-all">
                <Plus size={30} />
                <span>LOG IDEA</span>
              </button>
              {ideas.map(i => (
                <div key={i.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group">
                  <p className="font-bold text-slate-700 dark:text-slate-300">{i.text}</p>
                  <button onClick={() => deleteItem('ideas', i.id)} className="self-end opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl">
                <Rocket className="text-indigo-600" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black">Deploy to Vercel</h2>
                <p className="text-slate-500 font-medium">Get your Life Hub live in under 5 minutes.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vercel Specific Steps */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold">V</div>
                  <h3 className="font-bold text-xl">Vercel Setup</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center text-xs font-black">1</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Push this code to a <strong>GitHub Repository</strong>.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center text-xs font-black">2</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Login to <a href="https://vercel.com" target="_blank" className="text-indigo-600 font-bold underline">Vercel.com</a> and click <strong>"Add New"</strong> {'>'} <strong>"Project"</strong>.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center text-xs font-black">3</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Import your <code>life-hub</code> repo. Vercel automatically detects React/Vite.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center text-xs font-black">4</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Click <strong>Deploy</strong>. Your hub will be live at a custom <code>.vercel.app</code> URL.</p>
                  </div>
                </div>
              </div>

              {/* Environment Config */}
              <div className="bg-slate-900 text-slate-300 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center gap-3 text-white">
                  <Code2 size={24} />
                  <h3 className="font-bold text-xl">Configuration Notice</h3>
                </div>
                <p className="text-sm leading-relaxed opacity-80">
                  When running outside of this environment, you'll need to define your <strong>Firebase Config</strong> directly in the code or as Environment Variables.
                </p>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Required Dependencies</p>
                  <code className="text-xs text-indigo-400 block break-all">
                    npm install lucide-react firebase
                  </code>
                </div>
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                  <p className="text-xs text-indigo-300 font-bold">Pro-Tip:</p>
                  <p className="text-xs opacity-70">Vercel is free for hobbyists and scales beautifully with your usage.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-200 dark:shadow-none">
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Ready to go?</h3>
                <p className="opacity-80 font-medium">Copy your project and launch it today.</p>
              </div>
              <button 
                onClick={() => {
                  const el = document.createElement('textarea');
                  el.value = document.querySelector('pre')?.innerText || "";
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand('copy');
                  document.body.removeChild(el);
                }}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-transform"
              >
                <Copy size={20} />
                COPY SOURCE CODE
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;