"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Star, TrendingUp, BookOpen, Bot, BarChart2 } from "lucide-react";
import Link from "next/link";
import { QRCodePanel } from "@/components/ui/QRCodePanel";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const BAR_GRADIENTS = [
  "linear-gradient(180deg, #A8C3A0 0%, #7A9F71 100%)", // Day 1: Soft Forest Green
  "linear-gradient(180deg, #96C2D6 0%, #6199B8 100%)", // Day 2: Lakeside Blue
  "linear-gradient(180deg, #F3C287 0%, #D88E3E 100%)", // Day 3: Apricot Orange
  "linear-gradient(180deg, #CBB4D4 0%, #9F7BB0 100%)", // Day 4: Blossom Lavender
  "linear-gradient(180deg, #91D1C2 0%, #52A695 100%)", // Day 5: Mint Teal
  "linear-gradient(180deg, #F4A6A6 0%, #D36B6B 100%)", // Day 6: Coral Pink
  "linear-gradient(180deg, #E8C06A 0%, #D2A053 100%)", // Day 7 (Today): Golden Bronze
];

interface AnalyticsDay {
  date: string; totalVisitors: number; totalSessions: number; totalQuestions: number;
  satisfactionScore: number; sentimentPositive: number; sentimentNeutral: number;
  sentimentNegative: number; topQuestions: string[];
}

export function AdminDashboard() {
  const [data, setData] = useState<AnalyticsDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    request("/api/admin/analytics?days=7")
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); setRefreshing(false); setLastRefresh(new Date()); })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    setTimeout(fetchData, 0);
    // Auto-refresh every 2 min
    const timer = setInterval(fetchData, 120_000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = data[0];
  const totalVisitors = data.reduce((s, d) => s + d.totalVisitors, 0);
  const totalQuestions = data.reduce((s, d) => s + d.totalQuestions, 0);
  const avgSatisfaction = data.length > 0 ? (data.reduce((s, d) => s + d.satisfactionScore, 0) / data.length).toFixed(1) : "--";
  const maxVisitors = Math.max(...data.map((d) => d.totalVisitors), 1);

  const kpis = [
    { label: "本周访客", value: loading ? "--" : totalVisitors.toLocaleString("zh-CN"), unit: "人次", icon: Users, color: "#4F6F52" },
    { label: "本周问答", value: loading ? "--" : totalQuestions.toLocaleString("zh-CN"), unit: "条", icon: MessageCircle, color: "#D2A053" },
    { label: "满意度", value: loading ? "--" : `${avgSatisfaction}`, unit: "/50", icon: Star, color: "#16A34A" },
    { label: "今日访客", value: loading ? "--" : (latest?.totalVisitors ?? "--").toString(), unit: "人次", icon: TrendingUp, color: "#3A4D39" },
  ];

  const topQuestions = (latest?.topQuestions && latest.topQuestions.length > 0)
    ? latest.topQuestions
    : ["景区有什么好玩的？", "门票多少钱？", "怎么去揽月亭？", "有没有停车场？", "景区几点关门？"];

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E6E2D8" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>数据大屏</h1>
          <p className="text-xs mt-0.5" style={{ color: "#8F9F8F" }}>
            近7日运营数据 · 上次更新 {lastRefresh.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: "rgba(79,111,82,0.08)", color: "#4F6F52", border: "1px solid rgba(79,111,82,0.2)" }}>
          <motion.span animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.6, ease: "linear", repeat: refreshing ? Infinity : 0 }}
            className="inline-block">↻</motion.span>
          {refreshing ? "刷新中" : "立即刷新"}
        </motion.button>
      </div>

      <div className="p-6 space-y-6 w-full">
        {/* KPI cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            // Compute a simple day-over-day trend from last 2 days
            const prev = data[1];
            let trend: number | null = null;
            if (latest && prev) {
              const cur = kpi.label === "本周访客" ? latest.totalVisitors
                : kpi.label === "本周问答" ? latest.totalQuestions
                : null;
              const pre = kpi.label === "本周访客" ? prev.totalVisitors
                : kpi.label === "本周问答" ? prev.totalQuestions
                : null;
              if (cur !== null && pre !== null && pre > 0) trend = Math.round(((cur - pre) / pre) * 100);
            }
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: i * 0.06 }}
                className="card-ink p-4 space-y-2 overflow-hidden relative">
                {/* Subtle color stripe */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${kpi.color}80, transparent)` }} />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium" style={{ color: "#8F9F8F" }}>{kpi.label}</span>
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black" style={{ fontFamily: "var(--font-noto-serif)", color: kpi.color }}>{kpi.value}</span>
                  <span className="text-[11px]" style={{ color: "#8F9F8F" }}>{kpi.unit}</span>
                </div>
                {trend !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold" style={{ color: trend >= 0 ? "#16A34A" : "#DC2626" }}>
                      {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                    </span>
                    <span className="text-[9px]" style={{ color: "#8F9F8F" }}>较前日</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Visitor trend chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }}
          className="card-ink p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
              <TrendingUp className="w-4 h-4 text-[#4F6F52]" />
              访客趋势（近7日）
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(79, 111, 82, 0.08)", color: "#4F6F52" }}>
              单位: 人次
            </span>
          </div>
          {loading ? (
            <div className="skeleton h-36 rounded-lg" />
          ) : (
            <div className="flex items-end gap-2.5 sm:gap-3 h-36 pt-2">
              {[...data].reverse().map((d, i) => {
                const pct = (d.totalVisitors / maxVisitors) * 100;
                const dateLabel = d.date.slice(5); // MM-DD
                const isToday = i === data.length - 1;
                return (
                  <div key={d.date} className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer">
                    <span className="text-[10px] font-semibold mb-1 transition-all duration-200 group-hover:scale-110" style={{ color: isToday ? "#D2A053" : "#4F6F52" }}>
                      {d.totalVisitors}
                    </span>
                    <div className="w-full h-24 flex items-end justify-center relative px-0.5 sm:px-1">
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ ...SPRING, delay: i * 0.05 }}
                        className="w-full rounded-t-md origin-bottom shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:brightness-105"
                        style={{
                          height: `${Math.max(pct, 5)}%`,
                          background: BAR_GRADIENTS[i % BAR_GRADIENTS.length]
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono mt-1.5 font-medium transition-colors" style={{ color: isToday ? "#D2A053" : "#8F9F8F" }}>
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Sentiment + Top Q side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sentiment */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}
            className="card-ink p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>游客情感分布</h3>
            {latest ? (() => {
              const pos = latest.sentimentPositive;
              const neu = latest.sentimentNeutral;
              const neg = latest.sentimentNegative;
              const total = pos + neu + neg || 1;
              const bars = [
                { label: "积极", value: pos, pct: (pos / total * 100).toFixed(0), color: "#16A34A" },
                { label: "中性", value: neu, pct: (neu / total * 100).toFixed(0), color: "#D2A053" },
                { label: "消极", value: neg, pct: (neg / total * 100).toFixed(0), color: "#DC2626" },
              ];
              return (
                <div className="space-y-3">
                  {bars.map((b) => (
                    <div key={b.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span style={{ color: "#3A4D39" }}>{b.label}</span>
                        <span style={{ color: "#8F9F8F" }}>{b.pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: "#F0EDE5" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ ...SPRING, delay: 0.3 }}
                          className="h-full rounded-full" style={{ background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })() : <div className="skeleton h-24 rounded-lg" />}
          </motion.div>

          {/* Top questions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.25 }}
            className="card-ink p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                  <Star className="w-4 h-4 text-[#D2A053]" />
                  热门问答 Top5
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(210, 160, 83, 0.08)", color: "#D2A053" }}>
                  最受关注
                </span>
              </div>
              <div className="space-y-2.5">
                {topQuestions.slice(0, 5).map((q, i) => {
                  const badgeBg = i === 0 ? "linear-gradient(135deg, #F3C65F, #D2A053)"
                    : i === 1 ? "linear-gradient(135deg, #A8B2C0, #8A95A5)"
                    : i === 2 ? "linear-gradient(135deg, #D79963, #B6743D)"
                    : "linear-gradient(135deg, #B0C4B1, #8F9F8F)";
                  return (
                    <div key={i} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-neutral-50/80 transition-colors group min-w-0" title={q}>
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[11.5px] font-extrabold flex-shrink-0 text-white shadow-xs"
                        style={{ background: badgeBg }}>
                        {i + 1}
                      </span>
                      <span className="text-[12.5px] font-medium truncate flex-1 min-w-0" style={{ color: "#1E2522" }}>
                        {q}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick nav to admin sections */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: "/admin/knowledge", icon: BookOpen, label: "知识库管理", desc: "上传与维护景区文档" },
            { href: "/admin/avatar", icon: Bot, label: "数字人配置", desc: "外观与音色参数" },
            { href: "/admin/analytics", icon: BarChart2, label: "游客分析", desc: "画像与行为洞察" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}
                className="card-ink p-4 cursor-pointer">
                <item.icon className="w-5 h-5 mb-2" style={{ color: "#4F6F52" }} />
                <p className="text-[13px] font-semibold" style={{ color: "#1E2522" }}>{item.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#8F9F8F" }}>{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* QR Code Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.35 }}
          className="card-ink p-5">
          <QRCodePanel />
        </motion.div>
      </div>
    </div>
  );
}
