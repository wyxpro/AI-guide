"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, BookOpen, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 32 };

interface SpotResult { id: number; name: string; category: string; description: string; imageUrl: string; rating: number; duration: number }
interface KnowResult { id: number; title: string; category: string; preview: string }
interface SearchResults { spots: SpotResult[]; knowledge: KnowResult[] }

const CAT_LABEL: Record<string, string> = { cultural: "人文", nature: "自然", history: "历史", family: "亲子" };
const QUICK_SEARCHES = ["揽月亭", "翠玉湖", "门票价格", "亲子路线", "开放时间", "停车场"];

export function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    setTimeout(() => {
      try {
        const h = JSON.parse(localStorage.getItem("cuiyu_search_history") ?? "[]");
        setHistory(Array.isArray(h) ? h.slice(0, 6) : []);
      } catch { /* ignore */ }
      inputRef.current?.focus();
    }, 150);
  }, []);

  const saveHistory = (q: string) => {
    const updated = [q, ...history.filter(h => h !== q)].slice(0, 6);
    setHistory(updated);
    try { localStorage.setItem("cuiyu_search_history", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      saveHistory(q.trim());
    } catch {
      setResults({ spots: [], knowledge: [] });
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce
  useEffect(() => {
    if (!query.trim()) {
      setTimeout(() => setResults(null), 0);
      return;
    }
    const t = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem("cuiyu_search_history"); } catch { /* ignore */ }
  };

  const total = (results?.spots.length ?? 0) + (results?.knowledge.length ?? 0);

  return (
    <div className="min-h-svh flex flex-col md:max-w-2xl md:mx-auto" style={{ background: "#FAF8F5" }}>
      {/* Search bar */}
      <div className="flex-shrink-0 px-4 pt-[calc(env(safe-area-inset-top,44px)+8px)] pb-3"
        style={{ background: "white", borderBottom: "1px solid #E6E2D8", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: "#F5F0E8" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "#3A4D39" }} />
          </motion.button>

          <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
            style={{ background: "#F5F0E8", border: "1.5px solid #E6E2D8" }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8F9F8F" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索景点、知识、路线…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "#1E2522", fontSize: 16 }}
            />
            <AnimatePresence>
              {query && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}>
                  <X className="w-4 h-4" style={{ color: "#8F9F8F" }} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center pt-16 gap-3">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.55, delay: i * 0.15, repeat: Infinity }}
                  className="w-2 h-2 rounded-full" style={{ background: "#4F6F52" }} />
              ))}
              <p className="text-sm" style={{ color: "#8F9F8F" }}>正在搜索…</p>
            </motion.div>
          )}

          {/* Empty query — history + quick searches */}
          {!loading && !query && (
            <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={SPRING} className="px-4 py-5 space-y-5">
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" style={{ color: "#8F9F8F" }} />
                      <span className="text-[12px] font-semibold" style={{ color: "#8F9F8F" }}>搜索历史</span>
                    </div>
                    <button onClick={clearHistory} className="text-[11px]" style={{ color: "#B8B4AC" }}>清除</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map(h => (
                      <motion.button key={h} whileTap={{ scale: 0.93 }}
                        onClick={() => { setQuery(h); doSearch(h); }}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                        style={{ background: "white", border: "1px solid #E6E2D8", color: "#3A4D39" }}>
                        {h}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Search className="w-3.5 h-3.5" style={{ color: "#8F9F8F" }} />
                  <span className="text-[12px] font-semibold" style={{ color: "#8F9F8F" }}>热门搜索</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map(q => (
                    <motion.button key={q} whileTap={{ scale: 0.93 }}
                      onClick={() => { setQuery(q); doSearch(q); }}
                      className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                      style={{ background: "rgba(79,111,82,0.08)", border: "1px solid rgba(79,111,82,0.18)", color: "#4F6F52" }}>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Has results */}
          {!loading && results && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={SPRING} className="px-4 py-4 space-y-5">

              {total === 0 ? (
                <div className="flex flex-col items-center justify-center pt-16 gap-3">
                  <p className="text-4xl">🔍</p>
                  <p className="text-sm font-medium" style={{ color: "#8F9F8F" }}>
                    未找到与「{query}」相关的内容
                  </p>
                  <Link href={`/qa?q=${encodeURIComponent(query)}`}>
                    <div className="px-4 py-2 rounded-xl text-sm font-semibold mt-2"
                      style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
                      向小玉直接提问 →
                    </div>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-[11px]" style={{ color: "#8F9F8F" }}>
                    找到 {total} 个结果
                  </p>

                  {/* Spots */}
                  {results.spots.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5" style={{ color: "#4F6F52" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#3A4D39" }}>景点</span>
                        <span className="text-[10px]" style={{ color: "#B8B4AC" }}>{results.spots.length} 个</span>
                      </div>
                      <div className="space-y-2">
                        {results.spots.map((spot, i) => (
                          <Link key={spot.id} href={`/spots/${spot.id}`}>
                            <motion.div whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ ...SPRING, delay: i * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-2xl"
                              style={{ background: "white", border: "1px solid #E6E2D8", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={spot.imageUrl || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&q=60"}
                                  alt={spot.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[13px] truncate"
                                  style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                                  {spot.name}
                                </p>
                                <p className="text-[11px] mt-0.5 line-clamp-2 leading-snug"
                                  style={{ color: "#8F9F8F" }}>{spot.description.slice(0, 50)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: "rgba(79,111,82,0.08)", color: "#4F6F52" }}>
                                    {CAT_LABEL[spot.category] ?? spot.category}
                                  </span>
                                  <span className="text-[9px]" style={{ color: "#B8B4AC" }}>{spot.duration}分钟</span>
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Knowledge */}
                  {results.knowledge.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <BookOpen className="w-3.5 h-3.5" style={{ color: "#D2A053" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#3A4D39" }}>知识库</span>
                        <span className="text-[10px]" style={{ color: "#B8B4AC" }}>{results.knowledge.length} 条</span>
                      </div>
                      <div className="space-y-2">
                        {results.knowledge.map((doc, i) => (
                          <motion.div key={doc.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING, delay: i * 0.05 }}
                            className="p-3 rounded-2xl"
                            style={{ background: "white", border: "1px solid #E6E2D8" }}>
                            <p className="font-semibold text-[13px]"
                              style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>{doc.title}</p>
                            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#8F9F8F" }}>
                              {doc.preview}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
