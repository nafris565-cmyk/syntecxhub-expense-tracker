import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];
const MOCK_DATA = [
  { id: "1", description: "Zomato order - Biryani", amount: 420, category: "Food", date: "2024-12-18" },
  { id: "2", description: "Metro & Auto recharge", amount: 850, category: "Transport", date: "2024-12-17" },
  { id: "3", description: "Netflix + Spotify", amount: 649, category: "Entertainment", date: "2024-12-16" },
];

const CAT_COLORS = {
  Food: "bg-emerald-500/15 text-emerald-300",
  Transport: "bg-sky-500/15 text-sky-300",
  Shopping: "bg-fuchsia-500/15 text-fuchsia-300",
  Bills: "bg-amber-500/15 text-amber-300",
  Entertainment: "bg-violet-500/15 text-violet-300",
  Other: "bg-slate-500/15 text-slate-300",
};

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ description: "", amount: "", category: "Bills", date: new Date().toISOString().slice(0,10) });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [income, setIncome] = useState(45000);
  const inputRef = useRef(null);

  // useEffect - Mock API
  useEffect(() => {
    setTimeout(() => { setExpenses(MOCK_DATA); setLoading(false); inputRef.current?.focus(); }, 900);
  }, []);

  // useMemo
  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const catTotals = useMemo(() => {
    const obj = {}; CATEGORIES.forEach(c => obj[c]=0);
    expenses.forEach(e => obj[e.category]+=e.amount); return obj;
  }, [expenses]);
  const filtered = useMemo(() => {
    return expenses.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) && (filter==="All" || e.category===filter)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  }, [expenses, search, filter]);

  const remaining = income - total;
  const percent = income? Math.min(100, Math.round(total/income*100)) : 0;

  // useCallback
  const handleAdd = useCallback((e) => {
    e.preventDefault();
    if (!form.description.trim() ||!form.amount) return;
    const newItem = { id: Date.now().toString(), description: form.description.trim(), amount: Number(form.amount), category: form.category, date: form.date };
    setExpenses(p => [newItem,...p]);
    setForm(p => ({...p, description:"", amount:""}));
    setTimeout(()=>inputRef.current?.focus(),0);
  }, [form]);

  const handleDelete = useCallback((id) => setExpenses(p => p.filter(e => e.id!==id)), []);

  if (loading) return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white">Loading Mock API...</div>;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-4 sm:p-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-[40%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[80%] bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.18),transparent_60%)]"></div>

      <div className="max-w-[1280px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-[34px] font-semibold tracking-tight flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-black">💰</span> Expense Tracker</h1>
          <div className="hidden sm:flex gap-2 text-xs text-slate-400"><span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">useState</span><span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">useEffect</span><span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">useRef</span><span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">useMemo</span></div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Stats */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="rounded-[20px] bg-[#0f1a2e]/80 border border-white/[0.07] backdrop-blur-xl p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] tracking-widest text-slate-400 uppercase mb-1">Monthly Budget</p>
              <div className="flex items-baseline gap-2 mb-4"><span className="text-[17px] text-slate-400">₹</span><input type="number" value={income} onChange={e=>setIncome(Number(e.target.value))} className="bg-transparent text-3xl font-semibold w-full outline-none" /></div>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]"><span className="text-slate-400">Spent</span><span className="font-medium">₹{total} / ₹{income}</span></div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-700" style={{width:`${percent}%`}}></div></div>
                <div className="flex justify-between text-[12px]"><span className={remaining<0?"text-red-300":"text-emerald-300"}>{remaining<0?`Over by ₹${Math.abs(remaining)}`:`₹${remaining} remaining`}</span><span className="text-slate-500">{percent}%</span></div>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#0f1a2e]/60 border border-white/[0.06] backdrop-blur-xl p-5">
              <p className="text-[11px] tracking-widest text-slate-400 uppercase mb-4">Category Breakdown</p>
              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const val = catTotals[cat];
                  const pct = total? Math.round(val/total*100) : 0;
                  return <div key={cat} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${CAT_COLORS[cat].split(' ')[0]}`}></div><span className="text-[13px] text-slate-300">{cat}</span></div><div className="flex items-center gap-3"><div className="w-[70px] h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-white/20" style={{width:`${pct}%`}}></div></div><span className="text-[12px] text-slate-400 w-10 text-right">₹{val}</span></div></div>
                })}
              </div>
            </div>
          </div>

          {/* Right Form + List */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="rounded-[20px] bg-gradient-to-br from-[#111a2e] to-[#0e172a] border border-white/[0.08] p-5">
              <form onSubmit={handleAdd} className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-1 lg:col-span-5"><input ref={inputRef} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description - ex: Zomato" className="w-full h-[44px] rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 text-[14px] outline-none focus:border-teal-400/40" required /></div>
                <div className="col-span-6 sm:col-span-1 lg:col-span-2"><input type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} placeholder="₹ Amount" className="w-full h-[44px] rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 text-[14px] outline-none focus:border-teal-400/40" required /></div>
                <div className="col-span-6 sm:col-span-1 lg:col-span-2"><select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full h-[44px] rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 text-[14px] outline-none"><option className="bg-[#0f1a2e]" value="Food">Food</option><option className="bg-[#0f1a2e]" value="Transport">Transport</option><option className="bg-[#0f1a2e]" value="Shopping">Shopping</option><option className="bg-[#0f1a2e]" value="Bills">Bills</option><option className="bg-[#0f1a2e]" value="Entertainment">Entertainment</option><option className="bg-[#0f1a2e]" value="Other">Other</option></select></div>
                <div className="col-span-8 sm:col-span-1 lg:col-span-2"><input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full h-[44px] rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 text-[13px] outline-none" /></div>
                <div className="col-span-4 sm:col-span-1 lg:col-span-1"><button type="submit" className="w-full h-[44px] rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-semibold text-[14px]">Add</button></div>
              </form>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..." className="w-full h-[40px] rounded-xl bg-[#0f1a2e]/60 border border-white/[0.06] pl-9 pr-4 text-[14px] outline-none" /></div>
              <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-[40px] rounded-xl bg-[#0f1a2e]/60 border border-white/[0.06] px-4 text-[13px]"><option value="All">All Categories</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
            </div>

            <div className="space-y-2">
              {filtered.map(exp => (
                <div key={exp.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all">
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-[14px] font-medium truncate">{exp.description}</p><span className={`text-[10px] px-2 py-0.5 rounded-full border ${CAT_COLORS[exp.category]}`}>{exp.category}</span></div><p className="text-[11px] text-slate-500 mt-1">{exp.date} • ₹{exp.amount}</p></div>
                  <div className="flex items-center gap-3 ml-4"><span className="text-[15px] font-semibold">₹{exp.amount}</span><button onClick={()=>handleDelete(exp.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-300 flex items-center justify-center">🗑️</button></div>
                </div>
              ))}
              {filtered.length===0 && <div className="py-20 text-center text-slate-500 text-[14px]">No expenses found. Add your first one!</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}