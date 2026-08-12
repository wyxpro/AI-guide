"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, Pencil, Trash2, FileText, Check, X, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const CATEGORIES = ["全部", "general", "faq", "spot", "history", "transport"];
const CATEGORY_LABELS: Record<string, string> = { general: "概况", faq: "常见问题", spot: "景点", history: "历史", transport: "交通" };

const getDefaultCover = (title: string, category?: string) => {
  const t = (title || "").toLowerCase();
  if (t.includes("故宫") || t.includes("北京")) return "/images/spots/10001.webp";
  if (t.includes("洪崖洞") || t.includes("重庆")) return "/images/spots/10011.webp";
  if (t.includes("西湖") || t.includes("杭州")) return "/images/spots/10005.webp";
  if (t.includes("兵马俑") || t.includes("秦始皇") || t.includes("西安")) return "/images/spots/10004.webp";
  if (t.includes("外滩") || t.includes("东方明珠") || t.includes("上海")) return "/images/spots/10009.webp";
  if (t.includes("成都") || t.includes("锦里") || t.includes("大熊猫")) return "/images/spots/10007.webp";
  if (t.includes("黄鹤楼") || t.includes("武汉")) return "/images/spots/10027.webp";
  if (t.includes("广州") || t.includes("小蛮腰") || t.includes("塔")) return "/images/spots/10031.webp";
  if (t.includes("南京") || t.includes("夫子庙") || t.includes("秦淮河")) return "/images/spots/10029.webp";
  if (t.includes("苏州") || t.includes("拙政园")) return "/images/spots/10013.webp";
  if (t.includes("三峡") || t.includes("江")) return "/images/spots/route-3.webp";
  if (t.includes("交通") || category === "transport") return "/images/spots/10067.webp";
  if (t.includes("历史") || category === "history") return "/images/spots/10002.webp";
  if (t.includes("常见") || category === "faq") return "/images/spots/10051.webp";

  // Distinct fallback based on title string hash
  const scenicPool = [
    "/images/spots/10001.webp",
    "/images/spots/10011.webp",
    "/images/spots/10005.webp",
    "/images/spots/10004.webp",
    "/images/spots/10009.webp",
    "/images/spots/10007.webp",
    "/images/spots/10027.webp",
    "/images/spots/10031.webp",
    "/images/spots/10029.webp",
    "/images/spots/10013.webp",
    "/images/spots/10066.webp",
    "/images/spots/10052.webp",
  ];
  let sum = 0;
  for (let i = 0; i < t.length; i++) {
    sum += t.charCodeAt(i);
  }
  return scenicPool[sum % scenicPool.length];
};

interface Doc { id: number; title: string; category: string; content: string; status: string; vectorized: boolean; tags: string[]; fileType: string; coverUrl?: string; updatedAt: string }

export function AdminKnowledgeScreen() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [editDoc, setEditDoc] = useState<Partial<Doc> | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editDoc) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("正在上传封面图...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditDoc({
          ...editDoc,
          coverUrl: data.url,
        });
        toast.success("封面上传成功！");
      } else {
        toast.error(data.error || "上传失败");
      }
    } catch {
      toast.error("网络错误，上传失败");
    } finally {
      toast.dismiss(toastId);
    }
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const loadingToast = toast.loading("正在解析文档内容，请稍候...");

    try {
      let content = "";
      if (extension === "txt") {
        content = await file.text();
      } else if (extension === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        content = fullText;
      } else if (extension === "doc" || extension === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else {
        toast.dismiss(loadingToast);
        toast.error("暂不支持此文件格式");
        return;
      }

      setEditDoc({
        title: file.name.replace(/\.[^.]+$/, ""),
        category: "general",
        content: content.trim(),
        fileType: extension,
        tags: [],
        vectorized: false
      });
      toast.dismiss(loadingToast);
      toast.success(`文档「${file.name}」解析成功！请确认后保存。`);
    } catch (err: any) {
      console.error("File parse error", err);
      toast.dismiss(loadingToast);
      toast.error(`文档解析失败: ${err.message || err}`);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((doc, i) => {
              const coverImg = doc.coverUrl || getDefaultCover(doc.title, doc.category);
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: i * 0.02 }}
                  className="card-ink overflow-hidden flex flex-col justify-between"
                  style={{ background: "white", border: "1px solid #E6E2D8", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  
                  {/* Card Cover Image */}
                  <div className="relative w-full h-36 bg-gray-100 overflow-hidden flex items-center justify-center border-b" style={{ borderColor: "#F2EFE9" }}>
                    {coverImg ? (
                      <img src={coverImg} alt={doc.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <FileText className="w-8 h-8 text-[#3A4D39]" />
                        <span className="text-[10px] text-gray-500">无封面图</span>
                      </div>
                    )}
                    
                    {/* Category Tag on Cover */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium shadow-sm text-white"
                        style={{ background: "#4F6F52" }}>
                        {CATEGORY_LABELS[doc.category] ?? doc.category}
                      </span>
                      {doc.vectorized && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium shadow-sm bg-green-600 text-white">
                          已向量化
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-[14px] line-clamp-1 mb-1.5" style={{ color: "#1E2522" }}>{doc.title}</h4>
                      <p className="text-[11px] line-clamp-3 leading-relaxed mb-4" style={{ color: "#8F9F8F" }}>{doc.content}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#F2EFE9" }}>
                      <span className="text-[9px] text-gray-400">
                        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ""}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => setEditDoc(doc)}
                          className="p-1.5 rounded-lg flex items-center justify-center" style={{ background: "#F5F0E8", color: "#4F6F52" }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => deleteDoc(doc.id)}
                          className="p-1.5 rounded-lg flex items-center justify-center" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

              {/* Cover Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-500">封面图片</label>
                <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative group flex-shrink-0">
                    {editDoc.coverUrl ? (
                      <>
                        <img src={editDoc.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setEditDoc({ ...editDoc, coverUrl: "" })}
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                          删除
                        </button>
                      </>
                    ) : (
                      <Upload className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <button type="button" onClick={() => coverFileRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F0E8] text-[#3A4D39] border border-[#E6E2D8] hover:bg-[#eae4d9] transition-colors">
                    选择图片
                  </button>
                </div>
              </div>
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
