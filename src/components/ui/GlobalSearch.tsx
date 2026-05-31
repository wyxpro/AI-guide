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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "rgba(18,24,21,0.97)", backdropFilter: "blur(16px)" }}
    >
      {/* Search bar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 8px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch(query)}
          placeholder="搜索景点、路线、关键词…"
          className="flex-1 bg-transparent outline-none text-[15px]"
          style={{ color: "white", fontSize: 16 }}
        />
        <div className="flex items-center gap-2">
          {query && (
            <motion.button whileTap={{ scale: 0.88 }} initial={{ scale: 0 }} animate={{ scale: 1 }}
              onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}>
              <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.45)" }} />
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.88 }} onClick={toggleVoice}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: recording ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.08)",
              color: recording ? "#DC2626" : "rgba(255,255,255,0.5)" }}>
            {recording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            className="text-[12px] font-medium" style={{ color: "#D2A053" }}>
            取消
          </motion.button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#D2A053" }} />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>搜索中…</span>
          </div>
        )}

        {!loading && !query && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            {history.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" style={{ color: "#8F9F8F" }} />
                    <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#8F9F8F" }}>搜索历史</span>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => { clearHistory(); setHistory([]); }}
                    className="text-[10px]" style={{ color: "#8F9F8F" }}>清空</motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map(h => (
                    <motion.button key={h} whileTap={{ scale: 0.93 }} onClick={() => handleHistoryClick(h)}
                      className="px-3 py-1.5 rounded-full text-[12px]"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}>
                      {h}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {/* Hot keywords */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase mb-2" style={{ color: "#8F9F8F" }}>热门搜索</p>
              <div className="flex flex-wrap gap-2">
                {["揽月亭", "翠玉湖", "亲子路线", "历史文化", "半日游", "景区门票"].map((k, i) => (
                  <motion.button key={k} whileTap={{ scale: 0.92 }} onClick={() => handleHistoryClick(k)}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING, delay: i * 0.04 }}
                    className="px-3 py-1.5 rounded-full text-[12px]"
                    style={{ background: "rgba(210,160,83,0.12)", border: "1px solid rgba(210,160,83,0.25)", color: "#D2A053" }}>
                    {k}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {!loading && results && results.total === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>没有找到「{query}」相关内容</p>
            <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>试试换个关键词</p>
          </div>
        )}

        {!loading && results && results.total > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            className="space-y-4">
            {results.spots.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold tracking-wide uppercase mb-2" style={{ color: "#8F9F8F" }}>
                  景点 ({results.spots.length})
                </p>
                <div className="space-y-2">
                  {results.spots.map((spot, i) => (
                    <Link key={spot.id} href={`/spots/${spot.id}`} onClick={onClose}>
                      <motion.div whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING, delay: i * 0.05 }}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-700">
                          {spot.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate"
                            style={{ fontFamily: "var(--font-noto-serif)" }}>{spot.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(79,111,82,0.2)", color: "#8FBF8A" }}>
                              {CAT_LABEL[spot.category] ?? spot.category}
                            </span>
                            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                              {spot.description?.slice(0, 30)}
                            </p>
                          </div>
                        </div>
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.routes.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold tracking-wide uppercase mb-2" style={{ color: "#8F9F8F" }}>
                  路线 ({results.routes.length})
                </p>
                <div className="space-y-2">
                  {results.routes.map((route, i) => (
                    <Link key={route.id} href={`/routes/${route.id}`} onClick={onClose}>
                      <motion.div whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING, delay: (results.spots.length + i) * 0.05 }}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(210,160,83,0.15)" }}>
                          <Navigation className="w-4 h-4" style={{ color: "#D2A053" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate"
                            style={{ fontFamily: "var(--font-noto-serif)" }}>{route.name}</p>
                          <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {route.description?.slice(0, 30)} · {route.totalDuration}分钟
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
  );
}
