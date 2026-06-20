"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Navigation, Loader2, Mic, MicOff, History } from "lucide-react";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 32 };

interface SpotResult { id: number; name: string; category: string; description: string; imageUrl: string; }
interface RouteResult { id: number; name: string; description: string; totalDuration: number; }
interface SearchResults { spots: SpotResult[]; routes: RouteResult[]; total: number; }

const CAT_LABEL: Record<string, string> = {
  cultural: "人文", nature: "自然", history: "历史", family: "亲子",
};

const HISTORY_KEY = "cuiyu_search_history";
const MAX_HISTORY = 8;

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function pushHistory(q: string) {
  const h = [q, ...getHistory().filter(x => x !== q)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}
function clearHistory() { localStorage.removeItem(HISTORY_KEY); }

export function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setHistory(getHistory());
      inputRef.current?.focus();
    }, 80);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      pushHistory(q.trim());
      setHistory(getHistory());
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setResults(null); return; }
    timerRef.current = setTimeout(() => doSearch(val), 340);
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
    doSearch(q);
  };

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const rec = new SR();
    rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setQuery(t); doSearch(t);
    };
    rec.onend = () => setRecording(false);
    rec.start(); recRef.current = rec; setRecording(true);
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 55,
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(18, 24, 21, 0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      />

      {/* Centered Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={SPRING}
        className="w-full flex flex-col relative z-10"
        style={{
          maxWidth: "500px",
          maxHeight: "80vh",
          backgroundColor: "#FAF8F5",
          borderRadius: "28px",
          border: "1px solid #E6E2D8",
          boxShadow: "0 20px 48px rgba(18, 24, 21, 0.15)",
          overflow: "hidden",
        }}
      >
        {/* Search bar */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5"
          style={{ 
            background: "#FFFFFF",
            borderBottom: "1px solid #E6E2D8" 
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0 text-[#8F9F8F]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch(query)}
            placeholder="搜索景点、路线、关键词…"
            className="flex-1 bg-transparent outline-none text-sm font-semibold"
            style={{ color: "#1E2522" }}
          />
          <div className="flex items-center gap-2">
            {query && (
              <motion.button 
                whileTap={{ scale: 0.88 }} 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
                className="text-[#8F9F8F]"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button 
              whileTap={{ scale: 0.88 }} 
              onClick={toggleVoice}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ 
                background: recording ? "rgba(220,38,38,0.1)" : "#FAF8F5",
                color: recording ? "#DC2626" : "#8F9F8F" 
              }}
            >
              {recording ? <MicOff className="w-3.5 h-3.5 animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={onClose}
              className="text-xs font-black text-[#4F6F52] hover:text-[#3A5240] px-1"
            >
              取消
            </motion.button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ minHeight: "150px" }}>
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#4F6F52]" />
              <span className="text-xs font-bold text-[#8F9F8F]">智能检索中…</span>
            </div>
          )}

          {!loading && !query && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="space-y-4">
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[#8F9F8F]">
                      <History className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black tracking-wider uppercase">最近搜索</span>
                    </div>
                    <button 
                      onClick={() => { clearHistory(); setHistory([]); }}
                      className="text-[10px] font-bold text-[#8F9F8F] hover:text-[#1E2522]"
                    >
                      清空
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map(h => (
                      <button 
                        key={h} 
                        onClick={() => handleHistoryClick(h)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[#E6E2D8] text-[#4F6F52] hover:border-[#4F6F52] hover:bg-[#EBF3EE] transition-all"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Hot keywords */}
              <div>
                <p className="text-[10px] font-black tracking-wider uppercase text-[#8F9F8F] mb-2">热门搜索</p>
                <div className="flex flex-wrap gap-1.5">
                  {["揽月亭", "翠玉湖", "亲子路线", "历史文化", "半日游", "景区门票"].map((k, i) => (
                    <motion.button 
                      key={k} 
                      whileTap={{ scale: 0.92 }} 
                      onClick={() => handleHistoryClick(k)}
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...SPRING, delay: i * 0.04 }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ 
                        background: "rgba(210,160,83,0.08)", 
                        border: "1px solid rgba(210,160,83,0.2)", 
                        color: "#B8843A" 
                      }}
                    >
                      {k}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {!loading && results && results.total === 0 && (
            <div className="text-center py-10">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-xs font-bold text-[#1E2522]">没有找到「{query}」相关内容</p>
              <p className="text-[10px] text-[#8F9F8F] mt-1">试试换个关键词，如“湖”或“游”</p>
            </div>
          )}

          {!loading && results && results.total > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="space-y-4">
              {results.spots.length > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-wider uppercase text-[#8F9F8F] mb-2">
                    相关景点 ({results.spots.length})
                  </p>
                  <div className="space-y-2">
                    {results.spots.map((spot, i) => (
                      <Link key={spot.id} href={`/spots/${spot.id}`} onClick={onClose} className="block">
                        <motion.div 
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...SPRING, delay: i * 0.05 }}
                          className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#E6E2D8] bg-white hover:border-[#4F6F52] hover:shadow-sm transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 border border-[#E6E2D8]">
                            {spot.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-[#1E2522] truncate" style={{ fontFamily: "var(--font-noto-serif)" }}>
                              {spot.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#4F6F52]/8 text-[#4F6F52]">
                                {CAT_LABEL[spot.category] ?? spot.category}
                              </span>
                              <p className="text-[9px] text-[#8F9F8F] truncate">
                                {spot.description}
                              </p>
                            </div>
                          </div>
                          <MapPin className="w-3.5 h-3.5 text-[#8F9F8F] flex-shrink-0" />
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.routes.length > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-wider uppercase text-[#8F9F8F] mb-2">
                    推荐路线 ({results.routes.length})
                  </p>
                  <div className="space-y-2">
                    {results.routes.map((route, i) => (
                      <Link key={route.id} href={`/routes/${route.id}`} onClick={onClose} className="block">
                        <motion.div 
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...SPRING, delay: (results.spots.length + i) * 0.05 }}
                          className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#E6E2D8] bg-white hover:border-[#4F6F52] hover:shadow-sm transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#D2A053]/8 border border-[#D2A053]/15">
                            <Navigation className="w-4.5 h-4.5 text-[#D2A053]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-[#1E2522] truncate" style={{ fontFamily: "var(--font-noto-serif)" }}>
                              {route.name}
                            </p>
                            <p className="text-[9px] text-[#8F9F8F] mt-0.5 truncate">
                              {route.description} · 建议游玩 {route.totalDuration} 分钟
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
