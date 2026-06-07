"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, MapPin, MessageCircle } from "lucide-react";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface AnalyticsDay { date: string; totalVisitors: number; totalQuestions: number; satisfactionScore: number; sentimentPositive: number; sentimentNeutral: number; sentimentNegative: number; topQuestions: string[]; topSpotIds: number[] }

const SPOT_NAMES: Record<number, string> = { 1: "揽月亭", 2: "翠玉湖", 3: "听松轩", 4: "百花谷", 5: "古窑遗址", 6: "溪流栈道" };
const INTEREST_DATA = [
  { label: "历史文化", pct: 35, color: "#3A4D39" },
  { label: "自然生态", pct: 28, color: "#4F6F52" },
  { label: "亲子游览", pct: 22, color: "#D2A053" },
  { label: "人文艺术", pct: 15, color: "#8F9F8F" },
];

export function AdminAnalyticsScreen() {
  const [data, setData] = useState<AnalyticsDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotSpots, setHotSpots] = useState<Array<{ spotId: number; visits: number }>>([]);
  const [wordCloud, setWordCloud] = useState<Array<{ word: string; count: number }>>([]);

  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [selectedSentimentLabel, setSelectedSentimentLabel] = useState("");
  const [drillDownLogs, setDrillDownLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);

  useEffect(() => {
    Promise.all([
      request("/api/admin/analytics?days=7").then((r) => r.json()),
      request("/api/admin/analytics/hot-spots").then((r) => r.json()),
      request("/api/admin/analytics/wordcloud").then((r) => r.json()),
    ]).then(([d, h, w]) => {
      setData(Array.isArray(d) ? d : []);
      setHotSpots(Array.isArray(h) ? h : []);
      setWordCloud(Array.isArray(w) ? w : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openDrillDown = (sentiment: string, label: string) => {
    setSelectedSentiment(sentiment);
    setSelectedSentimentLabel(label);
    setLoadingLogs(true);
    setShowDrillModal(true);
    request(`/api/admin/analytics/qa-logs?sentiment=${sentiment}`)
      .then((r) => r.json())
      .then((d) => {
        setDrillDownLogs(Array.isArray(d) ? d : []);
        setLoadingLogs(false);
      })
      .catch(() => setLoadingLogs(false));
  };

  const maxQ = Math.max(...data.map((d) => d.totalQuestions), 1);
  const maxV = Math.max(...data.map((d) => d.totalVisitors), 1);
  const displaySpots = hotSpots.length > 0 ? hotSpots.slice(0, 5) : [2, 1, 4, 6, 3].map((id) => ({ spotId: id, visits: 0 }));
  const displayWords = wordCloud.length > 0 ? wordCloud.slice(0, 15) : [
    { word: "景点", count: 45 }, { word: "路线", count: 38 }, { word: "门票", count: 32 }, { word: "开放时间", count: 28 },
    { word: "交通", count: 22 }, { word: "特色", count: 19 }, { word: "历史", count: 17 }, { word: "推荐", count: 15 },
    { word: "美食", count: 13 }, { word: "停车", count: 11 },
  ];
  const topQs = data[0]?.topQuestions || ["景区有哪些景点？", "门票多少钱？", "揽月亭的历史？", "怎么去翠玉湖？", "有没有儿童票？"];
  const avgSat = data.length > 0 ? (data.reduce((s, d) => s + d.satisfactionScore, 0) / data.length).toFixed(1) : "--";

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #E6E2D8" }}>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>游客数据分析</h1>
        <p className="text-xs mt-1" style={{ color: "#8F9F8F" }}>近7日游客行为洞察</p>
      </div>

      <div className="p-6 space-y-5 w-full">
        {/* Summary KPIs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "平均日访客", value: data.length > 0 ? Math.round(data.reduce((s, d) => s + d.totalVisitors, 0) / data.length) : "--", unit: "人", icon: Users, color: "#4F6F52" },
            { label: "问答总量", value: loading ? "--" : data.reduce((s, d) => s + d.totalQuestions, 0), unit: "条", icon: MessageCircle, color: "#D2A053" },
            { label: "平均满意度", value: avgSat, unit: "/50", icon: TrendingUp, color: "#16A34A" },
            { label: "最热景点", value: "翠玉湖", unit: "", icon: MapPin, color: "#3A4D39" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: i * 0.05 }}
              className="card-ink p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px]" style={{ color: "#8F9F8F" }}>{kpi.label}</span>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <span className="text-2xl font-black" style={{ fontFamily: "var(--font-noto-serif)", color: kpi.color }}>{kpi.value}</span>
              <span className="text-[11px] ml-1" style={{ color: "#8F9F8F" }}>{kpi.unit}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Visitors trend */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>访客趋势</h3>
            {loading ? <div className="skeleton h-28" /> : (
              <div className="flex items-end gap-2 h-28">
                {[...data].reverse().map((d, i) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] font-mono" style={{ color: "#8F9F8F" }}>{d.totalVisitors}</span>
                    <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...SPRING, delay: i * 0.05 }}
                      className="w-full rounded-t-sm origin-bottom"
                      style={{ height: `${(d.totalVisitors / maxV) * 100}%`, minHeight: 4, background: "linear-gradient(#6B8F6E,#4F6F52)" }} />
                    <span className="text-[8px] font-mono" style={{ color: "#8F9F8F" }}>{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Question trend */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>问答量趋势</h3>
            {loading ? <div className="skeleton h-28" /> : (
              <div className="flex items-end gap-2 h-28">
                {[...data].reverse().map((d, i) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] font-mono" style={{ color: "#8F9F8F" }}>{d.totalQuestions}</span>
                    <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...SPRING, delay: i * 0.05 }}
                      className="w-full rounded-t-sm origin-bottom"
                      style={{ height: `${(d.totalQuestions / maxQ) * 100}%`, minHeight: 4, background: "linear-gradient(#E8C06A,#D2A053)" }} />
                    <span className="text-[8px] font-mono" style={{ color: "#8F9F8F" }}>{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Sentiment distribution drill-down */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.18 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>问答情感分布 (点击柱形下钻)</h3>
            {loading ? <div className="skeleton h-28" /> : (
              <div className="flex items-end justify-around h-28">
                {[
                  { key: "positive", label: "正面/愉快", count: data.reduce((s, d) => s + (d.sentimentPositive || 0), 0), color: "#16A34A" },
                  { key: "neutral", label: "中立/思考", count: data.reduce((s, d) => s + (d.sentimentNeutral || 0), 0), color: "#8F9F8F" },
                  { key: "negative", label: "负面/疑虑", count: data.reduce((s, d) => s + (d.sentimentNegative || 0), 0), color: "#DC2626" },
                ].map((s) => {
                  const total = data.reduce((sum, d) => sum + (d.sentimentPositive || 0) + (d.sentimentNeutral || 0) + (d.sentimentNegative || 0), 0) || 1;
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <motion.button key={s.key} whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
                      onClick={() => openDrillDown(s.key, s.label)}
                      className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer">
                      <span className="text-[9px] font-bold" style={{ color: s.color }}>{s.count}次 ({pct}%)</span>
                      <div className="w-10 rounded-t-md" style={{ height: `${Math.max(8, (s.count / total) * 70)}px`, backgroundColor: s.color }} />
                      <span className="text-[10px]" style={{ color: "#3A4D39" }}>{s.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Interest distribution */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>游客兴趣画像</h3>
            <div className="space-y-3">
              {INTEREST_DATA.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span style={{ color: "#3A4D39" }}>{item.label}</span>
                    <span style={{ color: "#8F9F8F" }}>{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: "#F0EDE5" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ ...SPRING, delay: 0.3 }}
                      className="h-full rounded-full" style={{ background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top spots */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.22 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>热门景点排行</h3>
            <div className="space-y-2">
              {displaySpots.map((s, i) => (
                <div key={s.spotId} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded text-[11px] font-bold text-white flex items-center justify-center flex-shrink-0"
                    style={{ background: i < 3 ? "#D2A053" : "#8F9F8F" }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-medium" style={{ color: "#1E2522" }}>{SPOT_NAMES[s.spotId] ?? `景点${s.spotId}`}</span>
                      <span className="text-[10px] font-mono" style={{ color: "#8F9F8F" }}>{s.visits > 0 ? `${s.visits}次` : "暂无"}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EDE5" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.visits > 0 ? (s.visits / (displaySpots[0]?.visits || 1)) * 100 : (5 - i) * 18}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: i < 3 ? "linear-gradient(90deg, #D2A053, #B8843A)" : "#8F9F8F" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top questions word cloud */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.25 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>问题高频词</h3>
            {displayWords.length > 0 && (
              <div className="flex flex-wrap gap-2 leading-loose">
                {displayWords.map((w, i) => {
                  const maxCount = displayWords[0]?.count || 1;
                  const ratio = w.count / maxCount;
                  const fontSize = Math.round(10 + ratio * 10);
                  const opacity = 0.4 + ratio * 0.6;
                  return (
                    <motion.span key={w.word} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ ...SPRING, delay: 0.25 + i * 0.04 }}
                      className="px-2 py-1 rounded-full font-medium cursor-default"
                      style={{
                        fontSize,
                        background: i < 3 ? `rgba(210,160,83,${opacity * 0.25})` : `rgba(79,111,82,${opacity * 0.18})`,
                        color: i < 3 ? `rgba(178,120,42,${opacity})` : `rgba(58,77,57,${opacity})`,
                        border: `1px solid ${i < 3 ? `rgba(210,160,83,${opacity * 0.35})` : `rgba(79,111,82,${opacity * 0.28})`}`,
                      }}>
                      {w.word}<span className="ml-1 text-[9px] opacity-60">{w.count}</span>
                    </motion.span>
                  );
                })}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold" style={{ color: "#3A4D39" }}>热门问题 Top5</p>
              {topQs.slice(0, 5).map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: "#8F9F8F", fontSize: 9 }}>{i + 1}</span>
                  <span className="text-[11px] truncate" style={{ color: "#3A4D39" }}>{q}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Drill Down Sidebar Modal */}
      <AnimatePresence>
        {showDrillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={SPRING}
              className="w-full max-w-lg h-full flex flex-col shadow-2xl"
              style={{ background: "#FAF8F5" }}>
              <div className="p-5 border-b border-[#E6E2D8] flex items-center justify-between" style={{ background: "white" }}>
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                    对话下钻分析：{selectedSentimentLabel}
                  </h3>
                  <p className="text-[10px] text-[#8F9F8F] mt-0.5">查看真实游客历史对话片段</p>
                </div>
                <button onClick={() => setShowDrillModal(false)} className="text-sm px-3 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold" style={{ color: "#4F6F52" }}>
                  关闭
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingLogs ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-xl" />
                  ))
                ) : drillDownLogs.length === 0 ? (
                  <div className="text-center py-12 text-[#8F9F8F] text-xs">
                    暂无该情感倾向的对话记录
                  </div>
                ) : (
                  drillDownLogs.map((log: any) => (
                    <div key={log.id} className="p-4 rounded-xl border border-[#E6E2D8] bg-white space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-[#8F9F8F]">
                        <span>用户ID: {log.userId?.slice(0, 8) || "游客"}</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(210,160,83,0.15)", color: "#D2A053" }}>问</span>
                          <p className="text-xs font-semibold text-[#1E2522]">{log.question}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(79,111,82,0.15)", color: "#4F6F52" }}>答</span>
                          <p className="text-xs text-[#3A4D39] leading-relaxed">{log.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
