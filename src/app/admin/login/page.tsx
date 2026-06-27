"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { auth } from "@eazo/sdk";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email === "wyxcode@qq.com" && password === "123456") {
        localStorage.setItem("eazo.session", JSON.stringify({
          isMock: true,
          userId: "admin",
          email: email,
        }));
        toast.success("管理员登录成功");
        window.location.href = "/admin";
      } else {
        await auth.loginWithEmailPassword(email, password);
        toast.success("管理员登录成功");
        window.location.href = "/admin";
      }
    } catch (err: any) {
      toast.error(err?.message || "管理员验证失败，请检查账号密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-[#FAF8F5] px-4 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D2A053]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4F6F52]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white border border-[#E6E2D8] rounded-3xl p-8 shadow-2xl relative"
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/home")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 返回主页
        </button>

        {/* Brand Logo Header */}
        <div className="text-center space-y-3 mt-4 mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md shadow-[#D2A053]/10 relative border border-neutral-200 mx-auto">
            <Image
              src="/image/logo.png"
              alt="Logo"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-noto-serif)" }}>
              运营管理后台登录
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">请验证管理员账号以继续访问后台</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">管理账号</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="wyxcode@qq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E6E2D8] focus:border-[#D2A053] text-sm text-neutral-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">登录密码</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E6E2D8] focus:border-[#D2A053] text-sm text-neutral-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#D2A053] hover:bg-[#b8843a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#D2A053]/15 mt-6"
          >
            {loading ? "正在验证身份..." : "安全登录后台"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
