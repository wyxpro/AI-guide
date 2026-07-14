"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Plus, Trash2, Upload, Volume2, UserCheck, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api/request";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

const VOICES = [
  { id: "warm", label: "温暖知心", desc: "柔和亲切，如好友相伴" },
  { id: "professional", label: "专业解说", desc: "沉稳有力，知识权威" },
  { id: "lively", label: "活力少女", desc: "明快灵动，充满活力" },
];

interface AvatarConfig {
  id: number;
  name: string;
  avatarStyle: string;
  voiceStyle: string;
  speechRate: number;
  pitch: number;
  greeting: string;
  isDefault: boolean;
  imageUrl?: string;
  isActive?: boolean;
  settings?: any;
}

export function AdminAvatarScreen() {
  const [configs, setConfigs] = useState<AvatarConfig[]>([]);
  const [selected, setSelected] = useState<AvatarConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settingsTab, setSettingsTab] = useState<"general" | "basic" | "asr" | "tts" | "agent">("general");

  const ensureSettings = (c: AvatarConfig): AvatarConfig => {
    const defaults = {
      basic: { sound: true, showThink: true, lipFactor: 1.0 },
      asr: { enable: true, engine: "browser", apiKey: "" },
      tts: { enable: true, engine: "browser", apiKey: "" },
      agent: { enable: true, provider: "deepseek", apiKey: "", baseUrl: "", model: "deepseek-v4-pro", prompt: "" }
    };
    return {
      ...c,
      settings: {
        basic: { ...defaults.basic, ...c.settings?.basic },
        asr: { ...defaults.asr, ...c.settings?.asr },
        tts: { ...defaults.tts, ...c.settings?.tts },
        agent: { ...defaults.agent, ...c.settings?.agent },
      }
    };
  };

  const loadConfigs = () => {
    setLoading(true);
    request("/api/admin/avatar")
      .then((r) => {
        if (!r.ok) throw new Error(`请求失败 (HTTP ${r.status})`);
        return r.json();
      })
      .then((d) => {
        const list = Array.isArray(d) ? d.map(ensureSettings) : [];
        setConfigs(list);
        if (list.length > 0) {
          setSelected(list.find((c) => c.isDefault) ?? list[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "获取数字人配置失败");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("正在上传媒体文件...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setSelected({
          ...selected,
          avatarStyle: data.url,
          imageUrl: data.url,
        });
        toast.success("上传成功！");
      } else {
        toast.error(data.error || "上传失败");
      }
    } catch {
      toast.error("网络错误，上传失败");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (selected.id === 0) {
        // Create new
        const res = await request("/api/admin/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selected.name,
            avatarStyle: selected.avatarStyle,
            voiceStyle: selected.voiceStyle,
            speechRate: selected.speechRate,
            pitch: selected.pitch,
            greeting: selected.greeting,
            imageUrl: selected.imageUrl || selected.avatarStyle,
            isDefault: selected.isDefault,
            isActive: true,
            settings: selected.settings,
          }),
        });
        const newDoc = await res.json();
        if (newDoc && newDoc.id) {
          toast.success("配置已创建并保存");
          loadConfigs();
        } else {
          toast.error(newDoc.error || "保存失败");
        }
      } else {
        // Update existing
        await request("/api/admin/avatar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selected),
        });
        toast.success("配置已更新");
        loadConfigs();
      }
    } catch {
      toast.error("保存失败，请检查网络");
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async (id: number) => {
    if (!confirm("确认删除该数字人预设形象？")) return;
    try {
      const res = await request(`/api/admin/avatar?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("已删除数字人预设");
        loadConfigs();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败，网络错误");
    }
  };

  const addNewPreset = () => {
    const newPreset: AvatarConfig = {
      id: 0,
      name: "新数字人形象",
      avatarStyle: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
      voiceStyle: "warm",
      speechRate: 100,
      pitch: 100,
      greeting: "您好！我是新注册 of 数字人导览官，很高兴为您服务。",
      isDefault: false,
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
      isActive: true,
      settings: {
        basic: { sound: true, showThink: true, lipFactor: 1.0 },
        asr: { enable: true, engine: "browser", apiKey: "" },
        tts: { enable: true, engine: "browser", apiKey: "" },
        agent: { enable: true, provider: "deepseek", apiKey: "", baseUrl: "", model: "deepseek-v4-pro", prompt: "" }
      }
    };
    setSelected(newPreset);
  };

  if (loading && configs.length === 0) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4F6F52]" />
      </div>
    );
  }

  const isVideo = selected?.avatarStyle?.endsWith(".mp4") || selected?.avatarStyle?.endsWith(".webm") || selected?.avatarStyle?.includes("video");

  return (
    <div className="min-h-svh bg-[#FAF8F5] pb-10">
      <style>{`
        @media (min-width: 1024px) {
          .admin-preset-column {
            width: 280px !important;
            min-width: 280px !important;
            flex-shrink: 0 !important;
          }
          .admin-editor-column {
            flex: 1 1 0% !important;
          }
          .admin-preview-column {
            width: 360px !important;
            min-width: 360px !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#E6E2D8] bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
            <Sparkles className="w-5 h-5 text-[#D2A053]" /> 数字人配置管理
          </h1>
          <p className="text-xs mt-1 text-[#8F9F8F]">创建、修改和删除您的AI数字人导览形象</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={addNewPreset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)" }}
        >
          <Plus className="w-4 h-4" /> 新建数字人
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left column: Avatar Preset List */}
        <div className="w-full admin-preset-column space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E6E2D8] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1E2522] mb-3" style={{ fontFamily: "var(--font-noto-serif)" }}>
              数字人形象列表 ({configs.length})
            </h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {configs.map((c) => {
                const isActive = selected && selected.id === c.id;
                const cIsVideo = c.avatarStyle?.endsWith(".mp4") || c.avatarStyle?.endsWith(".webm") || c.avatarStyle?.includes("video");
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelected(ensureSettings(c));
                      setSettingsTab("general");
                    }}
                    className={`p-3 rounded-xl cursor-pointer border flex items-center gap-3 transition-all relative ${
                      isActive ? "border-[#4F6F52] bg-[#4F6F52]/5" : "border-[#E6E2D8] bg-white hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 flex-shrink-0 relative">
                      {cIsVideo ? (
                        <div className="w-full h-full bg-[#1A2520] flex items-center justify-center">
                          <Play className="w-4 h-4 text-white opacity-60" />
                        </div>
                      ) : (
                        <img
                          src={c.imageUrl || c.avatarStyle || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {c.isDefault && (
                        <div className="absolute top-0 right-0 bg-[#D2A053] p-0.5 rounded-bl text-[8px] text-white">
                          <UserCheck className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1E2522] truncate">{c.name}</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5 truncate">{VOICES.find((v) => v.id === c.voiceStyle)?.label || "预设"}音色</p>
                    </div>
                    {configs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConfig(c.id);
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Edit Panel */}
        {selected ? (
          <>
            {/* Editor controls */}
            <div className="w-full admin-editor-column bg-white p-5 rounded-2xl border border-[#E6E2D8] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0EDE5] pb-2">
                <h3 className="text-sm font-semibold text-[#1E2522]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  属性设置
                </h3>
              </div>

              {/* Tabs for Live2D configurations */}
              {selected.avatarStyle.startsWith("live2d_") && (
                <div className="flex border-b border-[#F0EDE5] overflow-x-auto no-scrollbar gap-1 pb-1">
                  {[
                    { id: "general", label: "常规属性" },
                    { id: "basic", label: "基础设置" },
                    { id: "asr", label: "语音识别" },
                    { id: "tts", label: "语音合成" },
                    { id: "agent", label: "AI智能体" }
                  ].map((tab) => {
                    const active = settingsTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSettingsTab(tab.id as any)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                          active
                            ? "bg-[#4F6F52] text-white shadow-sm"
                            : "text-[#8F9F8F] hover:bg-[#FAF8F5] hover:text-[#3A4D39]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* General Tab */}
              {(settingsTab === "general" || !selected.avatarStyle.startsWith("live2d_")) && (
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">形象名称</label>
                    <input
                      type="text"
                      value={selected.name}
                      onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                      placeholder="给您的数字人起个名字，如：导览小玉"
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    />
                  </div>

                  {/* Avatar Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">形象类型</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected({
                            ...selected,
                            avatarStyle: "female_hanfu",
                            imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80"
                          });
                        }}
                        className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all ${
                          !selected.avatarStyle.startsWith("live2d_")
                            ? "border-[#4F6F52] bg-[#4F6F52]/5 text-[#4F6F52]"
                            : "border-[#E6E2D8] bg-white text-[#8F9F8F]"
                        }`}
                      >
                        自定义上传 / 传统形象
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected({
                            ...selected,
                            avatarStyle: "live2d_HaruGreeter",
                            imageUrl: "/sentio/characters/free/HaruGreeter/HaruGreeter.png"
                          });
                        }}
                        className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all ${
                          selected.avatarStyle.startsWith("live2d_")
                            ? "border-[#4F6F52] bg-[#4F6F52]/5 text-[#4F6F52]"
                            : "border-[#E6E2D8] bg-white text-[#8F9F8F]"
                        }`}
                      >
                        内置 Live2D 形象
                      </button>
                    </div>
                  </div>

                  {/* Live2D Character Dropdown */}
                  {selected.avatarStyle.startsWith("live2d_") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3A4D39]">内置 Live2D 模型</label>
                      <select
                        value={selected.avatarStyle.replace("live2d_", "")}
                        onChange={(e) => {
                          const name = e.target.value;
                          setSelected({
                            ...selected,
                            avatarStyle: `live2d_${name}`,
                            imageUrl: `/sentio/characters/free/${name}/${name}.png`
                          });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                      >
                        {["HaruGreeter", "Haru", "Kei", "Chitose", "Epsilon", "Hibiki", "Hiyori", "Izumi", "Mao", "Rice", "Shizuku", "Tsumiki"].map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Voice Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">音色风格</label>
                    <div className="space-y-2">
                      {VOICES.map((v) => {
                        const active = selected.voiceStyle === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelected({ ...selected, voiceStyle: v.id })}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                              active ? "border-[#D2A053] bg-[#D2A053]/5" : "border-[#E6E2D8] bg-white hover:bg-[#FAF8F5]"
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ border: active ? "2px solid #D2A053" : "2px solid #E6E2D8" }}
                            >
                              {active && <div className="w-2 h-2 rounded-full bg-[#D2A053]" />}
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-[#1E2522]">{v.label}</p>
                              <p className="text-[9px] text-[#8F9F8F] mt-0.5">{v.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speed & Pitch */}
                  <div className="space-y-3 pt-2">
                    {[{ key: "speechRate" as const, label: "语速", min: 50, max: 200 }, { key: "pitch" as const, label: "音调", min: 50, max: 200 }].map((p) => (
                      <div key={p.key} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-[#3A4D39]">{p.label}</span>
                          <span className="text-xs font-mono font-bold text-[#D2A053]">{selected[p.key]}%</span>
                        </div>
                        <div className="relative">
                          <div className="w-full h-2 rounded-full bg-[#F0EDE5]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${((selected[p.key] - p.min) / (p.max - p.min)) * 100}%`,
                                background: "linear-gradient(90deg,#D2A053,#B8843A)",
                              }}
                            />
                          </div>
                          <input
                            type="range"
                            min={p.min}
                            max={p.max}
                            step={5}
                            value={selected[p.key]}
                            onChange={(e) => setSelected({ ...selected, [p.key]: Number(e.target.value) })}
                            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Greeting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">默认问候语</label>
                    <textarea
                      value={selected.greeting ?? ""}
                      onChange={(e) => setSelected({ ...selected, greeting: e.target.value })}
                      rows={3}
                      placeholder="进入对话时，数字人说的第一句话..."
                      className="w-full px-3 py-2.5 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522] resize-none"
                    />
                  </div>

                  {/* Default Avatar Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                    <div>
                      <p className="text-xs font-semibold text-[#1E2522]">设为默认形象</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5">当游客打开导游对话时默认展示此形象</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.isDefault}
                      onChange={(e) => setSelected({ ...selected, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded border-[#E6E2D8] text-[#4F6F52] focus:ring-[#4F6F52] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Basic Tab */}
              {selected.avatarStyle.startsWith("live2d_") && settingsTab === "basic" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#1E2522]">Live2D 基础交互设定</h4>
                    <p className="text-[10px] text-[#8F9F8F]">控制数字人在页面上的基本表现与行为模式</p>
                  </div>
                  
                  {/* Sound Output Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                    <div>
                      <p className="text-xs font-semibold text-[#1E2522]">声音播放</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5">是否播放 TTS 语音合成的声音，关闭后仅有开口动作</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.settings?.basic?.sound ?? true}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.basic = { ...s.basic, sound: e.target.checked };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-4 h-4 rounded border-[#E6E2D8] text-[#4F6F52] focus:ring-[#4F6F52] cursor-pointer"
                    />
                  </div>

                  {/* Think Bubble Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                    <div>
                      <p className="text-xs font-semibold text-[#1E2522]">显示思考状态</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5">在后台处理 AI 回复时，数字人上方是否显示气泡</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.settings?.basic?.showThink ?? true}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.basic = { ...s.basic, showThink: e.target.checked };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-4 h-4 rounded border-[#E6E2D8] text-[#4F6F52] focus:ring-[#4F6F52] cursor-pointer"
                    />
                  </div>

                  {/* Lip Sync Factor */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#3A4D39]">口型张合振幅倍数</span>
                      <span className="text-xs font-mono font-bold text-[#D2A053]">
                        {(selected.settings?.basic?.lipFactor ?? 1.0).toFixed(1)}x
                      </span>
                    </div>
                    <p className="text-[9px] text-[#8F9F8F] mb-1">调整说话时嘴巴的张开幅度（数值越大张口幅度越大）</p>
                    <div className="relative">
                      <div className="w-full h-2 rounded-full bg-[#F0EDE5]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(((selected.settings?.basic?.lipFactor ?? 1.0) - 0.1) / (5.0 - 0.1)) * 100}%`,
                            background: "linear-gradient(90deg,#D2A053,#B8843A)",
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={5.0}
                        step={0.1}
                        value={selected.settings?.basic?.lipFactor ?? 1.0}
                        onChange={(e) => {
                          const s = { ...selected.settings };
                          s.basic = { ...s.basic, lipFactor: Number(e.target.value) };
                          setSelected({ ...selected, settings: s });
                        }}
                        className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ASR Tab */}
              {selected.avatarStyle.startsWith("live2d_") && settingsTab === "asr" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#1E2522]">语音识别 (ASR) 配置</h4>
                    <p className="text-[10px] text-[#8F9F8F]">配置数字人如何将用户的语音输入识别为文字</p>
                  </div>

                  {/* Enable ASR Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                    <div>
                      <p className="text-xs font-semibold text-[#1E2522]">启用语音识别输入</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5">是否在对话框右侧显示麦克风图标并支持录音识别</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.settings?.asr?.enable ?? true}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.asr = { ...s.asr, enable: e.target.checked };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-4 h-4 rounded border-[#E6E2D8] text-[#4F6F52] focus:ring-[#4F6F52] cursor-pointer"
                    />
                  </div>

                  {/* ASR Engine Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">识别引擎</label>
                    <select
                      value={selected.settings?.asr?.engine ?? "browser"}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.asr = { ...s.asr, engine: e.target.value };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    >
                      <option value="browser">浏览器原生识别 (Web Speech API)</option>
                      <option value="whisper">OpenAI Whisper API (高精度)</option>
                    </select>
                  </div>

                  {/* ASR API Key (if Whisper selected) */}
                  {(selected.settings?.asr?.engine === "whisper") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3A4D39]">Whisper API Key</label>
                      <input
                        type="password"
                        value={selected.settings?.asr?.apiKey ?? ""}
                        onChange={(e) => {
                          const s = { ...selected.settings };
                          s.asr = { ...s.asr, apiKey: e.target.value };
                          setSelected({ ...selected, settings: s });
                        }}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TTS Tab */}
              {selected.avatarStyle.startsWith("live2d_") && settingsTab === "tts" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#1E2522]">语音合成 (TTS) 配置</h4>
                    <p className="text-[10px] text-[#8F9F8F]">配置数字人说话发音的语音合成服务商</p>
                  </div>

                  {/* Enable TTS Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                    <div>
                      <p className="text-xs font-semibold text-[#1E2522]">启用语音合成输出</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5">AI 回复时是否自动将文字合成为语音播放</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.settings?.tts?.enable ?? true}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.tts = { ...s.tts, enable: e.target.checked };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-4 h-4 rounded border-[#E6E2D8] text-[#4F6F52] focus:ring-[#4F6F52] cursor-pointer"
                    />
                  </div>

                  {/* TTS Engine Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">合成服务商</label>
                    <select
                      value={selected.settings?.tts?.engine ?? "browser"}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.tts = { ...s.tts, engine: e.target.value };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    >
                      <option value="browser">浏览器原生合成 (SpeechSynthesis)</option>
                      <option value="edge">Edge TTS 流式合成 (默认优质推荐)</option>
                      <option value="xfyun">科大讯飞语音合成 (企业级)</option>
                    </select>
                  </div>

                  {/* TTS API Key (if xfyun selected) */}
                  {(selected.settings?.tts?.engine === "xfyun") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3A4D39]">科大讯飞 API Key / AppID</label>
                      <input
                        type="password"
                        value={selected.settings?.tts?.apiKey ?? ""}
                        onChange={(e) => {
                          const s = { ...selected.settings };
                          s.tts = { ...s.tts, apiKey: e.target.value };
                          setSelected({ ...selected, settings: s });
                        }}
                        placeholder="请输入讯飞 APPID|APIKey|APISecret 组合..."
                        className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Agent Tab */}
              {selected.avatarStyle.startsWith("live2d_") && settingsTab === "agent" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#1E2522]">AI 智能体大模型配置</h4>
                    <p className="text-[10px] text-[#8F9F8F]">配置数字人背后进行文本理解和回复生成的大语言模型</p>
                  </div>

                  {/* Enable Agent Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                    <div>
                      <p className="text-xs font-semibold text-[#1E2522]">启用AI智能体逻辑</p>
                      <p className="text-[10px] text-[#8F9F8F] mt-0.5">关闭后仅能使用内置固定应答或景区常见问答库</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.settings?.agent?.enable ?? true}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.agent = { ...s.agent, enable: e.target.checked };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-4 h-4 rounded border-[#E6E2D8] text-[#4F6F52] focus:ring-[#4F6F52] cursor-pointer"
                    />
                  </div>

                  {/* Model Provider */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">模型提供商</label>
                    <select
                      value={selected.settings?.agent?.provider ?? "deepseek"}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        const val = e.target.value;
                        let defaultModel = "deepseek-v4-pro";
                        let defaultUrl = "";
                        if (val === "openai") {
                          defaultModel = "gpt-4o-mini";
                          defaultUrl = "https://api.openai.com/v1";
                        } else if (val === "qwen") {
                          defaultModel = "qwen-max";
                          defaultUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1";
                        } else if (val === "kimi") {
                          defaultModel = "moonshot-v1-8k";
                          defaultUrl = "https://api.moonshot.cn/v1";
                        } else if (val === "deepseek") {
                          defaultModel = "deepseek-v4-pro";
                          defaultUrl = "https://api.deepseek.com/v1";
                        }
                        s.agent = { ...s.agent, provider: val, model: defaultModel, baseUrl: defaultUrl };
                        setSelected({ ...selected, settings: s });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    >
                      <option value="deepseek">DeepSeek (性价比首选)</option>
                      <option value="openai">OpenAI (ChatGPT 官方)</option>
                      <option value="qwen">阿里通义千问 (Qwen)</option>
                      <option value="kimi">月之暗面 (Kimi)</option>
                      <option value="custom">自定义 API 端点 (兼容 OpenAI)</option>
                    </select>
                  </div>

                  {/* API Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">API Key (密钥)</label>
                    <input
                      type="password"
                      value={selected.settings?.agent?.apiKey ?? ""}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.agent = { ...s.agent, apiKey: e.target.value };
                        setSelected({ ...selected, settings: s });
                      }}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    />
                  </div>

                  {/* Base URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">API Base URL</label>
                    <input
                      type="text"
                      value={selected.settings?.agent?.baseUrl ?? ""}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.agent = { ...s.agent, baseUrl: e.target.value };
                        setSelected({ ...selected, settings: s });
                      }}
                      placeholder="https://api.deepseek.com/v1"
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    />
                  </div>

                  {/* Model Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">模型名称 (Model)</label>
                    <input
                      type="text"
                      value={selected.settings?.agent?.model ?? ""}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.agent = { ...s.agent, model: e.target.value };
                        setSelected({ ...selected, settings: s });
                      }}
                      placeholder="deepseek-chat"
                      className="w-full px-3 py-2 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522]"
                    />
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3A4D39]">系统人设提示词 (System Prompt)</label>
                    <textarea
                      value={selected.settings?.agent?.prompt ?? ""}
                      onChange={(e) => {
                        const s = { ...selected.settings };
                        s.agent = { ...s.agent, prompt: e.target.value };
                        setSelected({ ...selected, settings: s });
                      }}
                      rows={3}
                      placeholder="例如：你是一个古风知性的导览小姐姐，说话会带上一些古诗词..."
                      className="w-full px-3 py-2.5 text-xs rounded-xl outline-none border border-[#E6E2D8] focus:border-[#4F6F52] bg-[#FAF8F5] text-[#1E2522] resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3 border-t border-[#F0EDE5]">
                {selected.id !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteConfig(selected.id)}
                    className="flex-1 py-3 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> 删除形象
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={save}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md"
                  style={{
                    background: saving ? "#8F9F8F" : "linear-gradient(135deg,#4F6F52,#3A5240)",
                    fontFamily: "var(--font-noto-serif)",
                  }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? "保存中..." : "保存形象设置"}
                </motion.button>
              </div>
            </div>

            {/* Preview and Upload */}
            <div className="w-full admin-preview-column bg-white p-5 rounded-2xl border border-[#E6E2D8] shadow-sm flex flex-col items-center space-y-4">
              <h3 className="text-sm font-semibold text-[#1E2522] border-b border-[#F0EDE5] pb-2 w-full text-center" style={{ fontFamily: "var(--font-noto-serif)" }}>
                媒体与预览
              </h3>

              {/* Avatar frame */}
              <div
                className="relative flex items-center justify-center overflow-hidden w-full aspect-[4/5] max-w-[240px] rounded-[24px] border-4 border-[#D2A053] bg-[#1A2520] shadow-xl"
              >
                {selected.avatarStyle ? (
                  isVideo ? (
                    <video
                      src={selected.avatarStyle}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={selected.imageUrl || selected.avatarStyle}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-4">
                    <UserCheck className="w-10 h-10 mx-auto text-[#D2A053] opacity-40 mb-2" />
                    <p className="text-[11px] text-[#8F9F8F]">暂无形象照片/视频</p>
                  </div>
                )}

                {/* Info tag */}
                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full text-white bg-black/60 backdrop-blur-sm shadow-md whitespace-nowrap"
                >
                  {selected.avatarStyle.startsWith("live2d_") ? "Live2D 数字人" : isVideo ? "视频数字人" : "图片数字人"}
                </div>
              </div>

              {/* Upload trigger */}
              {!selected.avatarStyle.startsWith("live2d_") ? (
                <div className="w-full space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 border border-[#E6E2D8] hover:bg-[#FAF8F5] text-[#3A4D39] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-[#4F6F52]" /> 上传新形象 (图片/视频)
                  </button>
                  <p className="text-[9px] text-[#8F9F8F] text-center">
                    支持 JPG, PNG 格式图片，或 MP4 格式视频数字人
                  </p>
                </div>
              ) : (
                <div className="w-full text-center py-2.5 text-[10px] text-[#8F9F8F] bg-[#FAF8F5] rounded-xl border border-[#E6E2D8]">
                  ✨ 已选用内置 Live2D 数字人模型形象
                </div>
              )}

              {/* Voice waves */}
              <div className="w-full bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E6E2D8] flex items-center gap-3">
                <div className="flex gap-0.5 items-end">
                  {[3, 6, 4, 8, 5, 7, 3].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [h, h * 1.5, h] }}
                      transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                      className="w-1 rounded-full bg-[#4F6F52]"
                      style={{ height: h * (selected.speechRate / 100) }}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#3A4D39]">合成音色展示</p>
                  <p className="text-[9px] text-[#8F9F8F] truncate">
                    {VOICES.find((v) => v.id === selected.voiceStyle)?.label || "预设"}音色 · {selected.speechRate}% 语速
                  </p>
                </div>
                <Volume2 className="w-4 h-4 text-[#D2A053]" />
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-9 flex flex-col items-center justify-center py-20 text-[#8F9F8F] bg-white border border-[#E6E2D8] rounded-2xl shadow-sm">
            <UserCheck className="w-16 h-16 opacity-30 mb-3" />
            <p className="text-sm">请从左侧选择一个数字人预设进行配置</p>
            <p className="text-xs text-zinc-400 mt-1">或点击右上角的“新建数字人”按钮</p>
          </div>
        )}
      </div>
    </div>
  );
}
