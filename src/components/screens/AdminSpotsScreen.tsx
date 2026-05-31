"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, MapPin, Star, Eye, EyeOff, X, Save, QrCode } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot {
  id: number; name: string; category: string; description: string;
  imageUrl: string; duration: number; distance: string; rating: number;
  visitCount: number; isActive: boolean; tags: string[];
}

const CAT_LABELS: Record<string, string> = {
  cultural: "人文", nature: "自然", history: "历史", family: "亲子",
};
const CAT_COLORS: Record<string, string> = {
  cultural: "#4F6F52", nature: "#3A8A5A", history: "#8F7A5A", family: "#D2A053",
};

function SpotFormModal({
  spot, onClose, onSave,
}: {
  spot: Partial<Spot> | null;
  onClose: () => void;
  onSave: (data: Partial<Spot>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Spot>>(spot ?? { category: "cultural", isActive: true, duration: 30, tags: [] });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Spot, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }} transition={SPRING}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "white", maxHeight: "88vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #E6E2D8" }}>
          <h3 className="font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
            {spot?.id ? "编辑景点" : "新增景点"}
          </h3>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#8F9F8F" }} />
          </motion.button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: "#8F9F8F" }}>景点名称 *</label>
            <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522", fontSize: 16 }}
              value={form.name ?? ""} onChange={(e) => set("name", e.target.value)}
              placeholder="如：揽月亭" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: "#8F9F8F" }}>分类</label>
              <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522" }}
                value={form.category ?? "cultural"} onChange={(e) => set("category", e.target.value)}>
                {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: "#8F9F8F" }}>建议游览（分钟）</label>
              <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522", fontSize: 16 }}
                value={form.duration ?? 30} onChange={(e) => set("duration", Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: "#8F9F8F" }}>距入口距离</label>
            <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522", fontSize: 16 }}
              value={form.distance ?? ""} onChange={(e) => set("distance", e.target.value)}
              placeholder="如：500m from entrance" />
          </div>

          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: "#8F9F8F" }}>景点介绍 *</label>
            <textarea rows={4} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522", fontSize: 16 }}
              value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
              placeholder="介绍景点历史、特色与游览要点…" />
          </div>

          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: "#8F9F8F" }}>封面图URL</label>
            <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522", fontSize: 16 }}
              value={form.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://..." />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[11px] font-medium" style={{ color: "#8F9F8F" }}>上架状态</label>
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => set("isActive", !form.isActive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
              style={{
                background: form.isActive ? "rgba(79,111,82,0.1)" : "rgba(143,159,143,0.1)",
                color: form.isActive ? "#4F6F52" : "#8F9F8F",
                border: `1px solid ${form.isActive ? "rgba(79,111,82,0.3)" : "#E6E2D8"}`,
              }}>
              {form.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {form.isActive ? "已上架" : "已下架"}
            </motion.button>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#F5F0E8", color: "#3A4D39", border: "1px solid #E6E2D8" }}>
            取消
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }}
            disabled={saving || !form.name}
            onClick={async () => { setSaving(true); await onSave(form); setSaving(false); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", opacity: saving ? 0.7 : 1 }}>
            <Save className="w-4 h-4" />
            {saving ? "保存中…" : "保存景点"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminSpotsScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editSpot, setEditSpot] = useState<Partial<Spot> | null | undefined>(undefined);
  const [catFilter, setCatFilter] = useState("all");

  const fetchSpots = () => {
    setLoading(true);
    request("/api/spots").then((r) => r.json())
      .then((d) => { setSpots(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { setTimeout(fetchSpots, 0); }, []);

  const filtered = spots.filter((s) => {
    const q = search.toLowerCase();
    return (catFilter === "all" || s.category === catFilter)
      && (s.name.includes(q) || s.description?.toLowerCase().includes(q));
  });

  const handleSave = async (data: Partial<Spot>) => {
    if (data.id) {
      await request(`/api/admin/spots/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      toast.success("景点已更新");
    } else {
      await request("/api/admin/spots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      toast.success("景点已新增");
    }
    fetchSpots();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除该景点？")) return;
    await request(`/api/admin/spots/${id}`, { method: "DELETE" });
    toast.success("已删除");
    fetchSpots();
  };

  const handleToggle = async (spot: Spot) => {
    await request(`/api/admin/spots/${spot.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !spot.isActive }),
    });
    fetchSpots();
  };

  const downloadQR = async (id: number, name: string) => {
    const res = await request(`/api/admin/spots/${id}/qrcode`);
    const { qrcode } = await res.json();
    const a = document.createElement("a"); a.href = qrcode; a.download = `${name}_导览二维码.png`; a.click();
    toast.success(`${name} 二维码已下载`);
  };

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
              景点管理
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: "#8F9F8F" }}>
              共 {spots.length} 个景点 · {spots.filter((s) => s.isActive).length} 个上架中
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setEditSpot(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", boxShadow: "0 3px 12px rgba(79,111,82,0.3)" }}>
            <Plus className="w-4 h-4" />新增景点
          </motion.button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[180px]"
            style={{ background: "white", border: "1px solid #E6E2D8" }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#8F9F8F" }} />
            <input className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "#1E2522", fontSize: 16 }}
              placeholder="搜索景点名称或描述…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {[{ id: "all", label: "全部" }, ...Object.entries(CAT_LABELS).map(([k, v]) => ({ id: k, label: v }))].map((c) => (
              <motion.button key={c.id} whileTap={{ scale: 0.93 }} onClick={() => setCatFilter(c.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: catFilter === c.id ? "rgba(79,111,82,0.1)" : "white",
                  color: catFilter === c.id ? "#4F6F52" : "#8F9F8F",
                  border: `1px solid ${catFilter === c.id ? "rgba(79,111,82,0.3)" : "#E6E2D8"}`,
                }}>
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E6E2D8", background: "white" }}>
          <div className="grid gap-0 divide-y" style={{ borderColor: "#E6E2D8" }}>
            {/* Head */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3"
              style={{ background: "#F5F0E8" }}>
              {["景点名称 / 介绍", "分类 / 评分", "游览时长 / 状态", "操作"].map((h) => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8F9F8F" }}>{h}</span>
              ))}
            </div>

            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4">
                  <div className="skeleton h-4 w-1/3 rounded mb-2" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🗺️</p>
                <p className="text-sm" style={{ color: "#8F9F8F" }}>暂无景点数据</p>
              </div>
            ) : filtered.map((spot) => (
              <motion.div key={spot.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid md:grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center"
                style={{ opacity: spot.isActive ? 1 : 0.55 }}>
                {/* Name + desc */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: "#F5F0E8" }}>
                    {spot.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏞️</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px]" style={{ color: "#1E2522" }}>{spot.name}</p>
                    <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: "#8F9F8F" }}>{spot.description?.slice(0, 50)}</p>
                  </div>
                </div>
                {/* Category + rating */}
                <div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${CAT_COLORS[spot.category] ?? "#4F6F52"}15`, color: CAT_COLORS[spot.category] ?? "#4F6F52" }}>
                    {CAT_LABELS[spot.category] ?? spot.category}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3" fill="#D2A053" style={{ color: "#D2A053" }} />
                    <span className="text-[11px]" style={{ color: "#3A4D39" }}>{(spot.rating / 10).toFixed(1)}</span>
                    <span className="text-[10px]" style={{ color: "#B8B4AC" }}>· {spot.visitCount} 次</span>
                  </div>
                </div>
                {/* Duration + status */}
                <div>
                  <p className="text-[12px]" style={{ color: "#3A4D39" }}>{spot.duration} 分钟</p>
                  <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleToggle(spot)}
                    className="mt-1 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: spot.isActive ? "rgba(79,111,82,0.1)" : "rgba(143,143,143,0.1)",
                      color: spot.isActive ? "#4F6F52" : "#8F9F8F",
                    }}>
                    {spot.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {spot.isActive ? "上架" : "下架"}
                  </motion.button>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => downloadQR(spot.id, spot.name)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(210,160,83,0.1)", color: "#D2A053", border: "1px solid rgba(210,160,83,0.2)" }}
                    title="下载二维码">
                    <QrCode className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setEditSpot(spot)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(79,111,82,0.08)", color: "#4F6F52", border: "1px solid rgba(79,111,82,0.2)" }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => handleDelete(spot.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(220,38,38,0.07)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.15)" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {editSpot !== undefined && (
          <SpotFormModal
            spot={editSpot}
            onClose={() => setEditSpot(undefined)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
