"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, Pencil, Trash2, FileText, Check, X, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const CATEGORIES = ["全部", "general", "faq", "spot", "history", "transport"];
const CATEGORY_LABELS: Record<string, string> = { general: "概况", faq: "常见问题", spot: "景点", history: "历史", transport: "交通" };

interface Doc { id: number; title: string; category: string; content: string; status: string; vectorized: boolean; tags: string[]; fileType: string; updatedAt: string }

export function AdminKnowledgeScreen() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [editDoc, setEditDoc] = useState<Partial<Doc> | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    request("/api/admin/knowledge").then((r) => r.json()).then((d) => { setDocs(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { setTimeout(load, 0); }, []);

  const filtered = docs.filter((d) => {
    const matchCat = catFilter === "全部" || d.category === catFilter;
    const matchSearch = !search || d.title.includes(search) || d.content.includes(search);
    return matchCat && matchSearch;
  });

  const deleteDoc = async (id: number) => {
    if (!confirm("确认删除这条知识库记录？")) return;
    await request(`/api/admin/knowledge?id=${id}`, { method: "DELETE" });
    toast.success("已删除");
    load();
  };

  const saveDoc = async () => {
    if (!editDoc?.title?.trim()) { toast.error("标题不能为空"); return; }
    setSaving(true);
    const method = editDoc.id ? "PUT" : "POST";
    await request("/api/admin/knowledge", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editDoc) });
    toast.success(editDoc.id ? "已更新" : "已添加");
    setSaving(false);
    setEditDoc(null);
    load();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditDoc({ title: file.name.replace(/\.[^.]+$/, ""), category: "general", content: ev.target?.result as string ?? "", fileType: file.name.split(".").pop() ?? "text", tags: [] });
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-svh" style={{ background: "#FAF8F5" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E6E2D8" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>知识库管理</h1>
          <p className="text-xs mt-1" style={{ color: "#8F9F8F" }}>共 {docs.length} 条记录</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ background: "white", border: "1px solid #E6E2D8", color: "#3A4D39" }}>
            <Upload className="w-4 h-4" /> 上传文件
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditDoc({ category: "general", content: "", tags: [] })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)" }}>
            <Plus className="w-4 h-4" /> 新增
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-4 w-full">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "white", border: "1px solid #E6E2D8" }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8F9F8F" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标题或内容..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#1E2522" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <motion.button key={cat} whileTap={{ scale: 0.93 }} onClick={() => setCatFilter(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: catFilter === cat ? "#4F6F52" : "white", color: catFilter === cat ? "white" : "#3A4D39", border: catFilter === cat ? "1px solid #4F6F52" : "1px solid #E6E2D8" }}>
                {cat === "全部" ? "全部" : (CATEGORY_LABELS[cat] ?? cat)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Doc list */}
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8F9F8F" }}>
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: i * 0.04 }}
                className="card-ink p-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(79,111,82,0.1)" }}>
                  <FileText className="w-4 h-4" style={{ color: "#4F6F52" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-[13px]" style={{ color: "#1E2522" }}>{doc.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </span>
                    {doc.vectorized && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>已向量化</span>}
                  </div>
                  <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "#8F9F8F" }}>{doc.content?.slice(0, 100)}...</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button whileTap={{ scale: 0.88 }} onClick={() => setEditDoc(doc)}
                    className="p-1.5 rounded-lg" style={{ background: "#F5F0E8", color: "#4F6F52" }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }} onClick={() => deleteDoc(doc.id)}
                    className="p-1.5 rounded-lg" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-end md:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)" }}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} transition={SPRING}
              className="w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 space-y-4"
              style={{ background: "white", maxHeight: "90vh", overflowY: "auto" }}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                  {editDoc.id ? "编辑知识条目" : "新增知识条目"}
                </h3>
                <button onClick={() => setEditDoc(null)}><X className="w-5 h-5" style={{ color: "#8F9F8F" }} /></button>
              </div>
              <input type="text" value={editDoc.title ?? ""} onChange={(e) => setEditDoc({ ...editDoc, title: e.target.value })}
                placeholder="条目标题" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522" }} />
              <select value={editDoc.category ?? "general"} onChange={(e) => setEditDoc({ ...editDoc, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522" }}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <textarea value={editDoc.content ?? ""} onChange={(e) => setEditDoc({ ...editDoc, content: e.target.value })}
                rows={6} placeholder="知识内容..." className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ background: "#F5F0E8", border: "1px solid #E6E2D8", color: "#1E2522" }} />
              <div className="flex gap-3">
                <button onClick={() => setEditDoc(null)} className="flex-1 py-2.5 rounded-lg text-sm"
                  style={{ background: "#F0EDE5", color: "#3A4D39" }}>取消</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveDoc} disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)" }}>
                  {saving ? "保存中..." : <><Check className="w-4 h-4" />保存</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
