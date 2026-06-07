"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { auth } from "@eazo/sdk";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Floating ambient mouse tracker
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  // Countdown timer for code verification
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Send email verification code
  const handleSendCode = async () => {
    if (!email) {
      toast.error("请输入您的邮箱地址");
      return;
    }
    try {
      setLoading(true);
      await auth.sendEmailCode(email);
      setCountdown(60);
      toast.success("验证码已发送至您的邮箱，请注意查收");
    } catch (err: any) {
      toast.error(err?.message || "验证码发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // Main login triggers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("请输入邮箱");
      return;
    }

    setLoading(true);
    try {
      if (tab === "password") {
        if (!password) {
          toast.error("请输入密码");
          setLoading(false);
          return;
        }

        // Intercept local test credentials
        if (
          (email === "wyxcode@qq.com" && password === "123456") ||
          (email === "user1@example.com" && password === "123456")
        ) {
          localStorage.setItem("eazo.session", JSON.stringify({
            isMock: true,
            userId: email === "wyxcode@qq.com" ? "admin" : "user1",
            email: email,
          }));
          toast.success("登录成功，正在跳转...");
          window.location.href = email === "wyxcode@qq.com" ? "/admin" : "/home";
          return;
        }

        await auth.loginWithEmailPassword(email, password);
      } else {
        if (!code) {
          toast.error("请输入验证码");
          setLoading(false);
          return;
        }
        await auth.loginWithEmailCode(email, code);
      }
      toast.success("登录成功，正在为您导览...");
      router.push("/home");
      router.refresh();
    } catch (err: any) {
      console.warn("SDK Auth failed, invoking user credentials:", err);
      toast.error(err?.message || "登录验证失败，请核对后重试");
    } finally {
      setLoading(false);
    }
  };

  // Quick Account Login helper
  const handleQuickLogin = async (targetEmail: string, targetPass: string) => {
    setLoading(true);
    setEmail(targetEmail);
    setPassword(targetPass);
    setTab("password");

    // Intercept local test credentials
    if (
      (targetEmail === "wyxcode@qq.com" && targetPass === "123456") ||
      (targetEmail === "user1@example.com" && targetPass === "123456")
    ) {
      localStorage.setItem("eazo.session", JSON.stringify({
        isMock: true,
        userId: targetEmail === "wyxcode@qq.com" ? "admin" : "user1",
        email: targetEmail,
      }));
      toast.success("快捷登录成功！正在跳转...");
      window.location.href = targetEmail === "wyxcode@qq.com" ? "/admin" : "/home";
      return;
    }

    try {
      await auth.loginWithEmailPassword(targetEmail, targetPass);
      toast.success("快捷登录成功！正在跳转...");
      router.push("/home");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "快捷登录验证失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-svh w-full flex items-center justify-center relative overflow-hidden px-4 md:px-6 py-12"
      style={{
        background: "radial-gradient(circle at 50% 50%, #1a2520 0%, #0e1710 100%)",
      }}
    >
      {/* Back button */}
      <button 
        onClick={() => router.push("/welcome")}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all bg-white/5 backdrop-blur-md cursor-pointer z-50"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> 返回官网页
      </button>

      {/* Dynamic Cursor Light Orb */}
      <motion.div 
        className="absolute pointer-events-none w-[350px] h-[350px] rounded-full filter blur-[120px] opacity-25 z-0"
        style={{
          x: useSpring(useTransform(mouseX, (val) => val - 175), { damping: 45, stiffness: 200 }),
          y: useSpring(useTransform(mouseY, (val) => val - 175), { damping: 45, stiffness: 200 }),
          background: "radial-gradient(circle, #D2A053 0%, transparent 70%)"
        }}
      />

      {/* Constant ambient light */}
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full filter blur-[100px] bg-[#4F6F52] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full filter blur-[120px] bg-[#D2A053] opacity-15 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#4f6f52]/20"
            style={{ 
              background: "linear-gradient(135deg,#4F6F52,#3A5240)", 
              fontFamily: "var(--font-noto-serif)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
            旅
          </div>
          <h2 className="text-2xl font-black text-white tracking-wider" style={{ fontFamily: "var(--font-noto-serif)" }}>
            旅行吧 · 智能向导
          </h2>
          <p className="text-xs text-[#8F9F8F]">
            开启您的多模态虚拟数字伴游新时代
          </p>
        </div>

        {/* Flat Form Card */}
        <div className="w-full bg-[#1b2520]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle inside glow */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/[0.04]" />

          {/* Form Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/30 rounded-2xl mb-8 relative z-10">
            <button
              onClick={() => setTab("password")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                tab === "password" 
                  ? "bg-[#4F6F52] text-white shadow-md" 
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              密码登录
            </button>
            <button
              onClick={() => setTab("code")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                tab === "code" 
                  ? "bg-[#4F6F52] text-white shadow-md" 
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              验证码登录
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-[#8F9F8F] uppercase block">
                电子邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/25 border border-white/5 focus:border-[#4F6F52] text-sm text-white pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#4F6F52]/50 transition-all placeholder:text-white/20"
                  required
                />
              </div>
            </div>

            {/* Password Tab Form Fields */}
            {tab === "password" ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[#8F9F8F] uppercase block">
                  账户密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/25 border border-white/5 focus:border-[#4F6F52] text-sm text-white pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#4F6F52]/50 transition-all placeholder:text-white/20"
                    required={tab === "password"}
                  />
                </div>
              </div>
            ) : (
              // Verification Code Tab Form Fields
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[#8F9F8F] uppercase block">
                  验证码
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="6位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-black/25 border border-white/5 focus:border-[#4F6F52] text-sm text-white pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#4F6F52]/50 transition-all placeholder:text-white/20"
                      maxLength={6}
                      required={tab === "code"}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || countdown > 0}
                    onClick={handleSendCode}
                    className="px-4 text-xs font-bold rounded-2xl border border-[#4F6F52] text-[#8FBF8A] hover:bg-[#4F6F52]/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {countdown > 0 ? `${countdown}秒后重新获取` : "获取验证码"}
                  </button>
                </div>
              </div>
            )}

            {/* Login CTA Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl shadow-[#4f6f52]/10 flex items-center justify-center gap-2 hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #4F6F52 0%, #3A5240 100%)",
              }}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  立即开启探索 <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Test Account Login divider */}
          <div className="relative my-6 z-10 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <span className="relative px-3 bg-[#1c2621] text-[10px] text-white/30 font-bold uppercase tracking-wider">
              测试账号快捷登录
            </span>
          </div>

          {/* Test Account buttons */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <button
              onClick={() => handleQuickLogin("wyxcode@qq.com", "123456")}
              disabled={loading}
              className="flex flex-col items-center justify-center py-2.5 rounded-2xl border border-[#D2A053]/20 bg-[#D2A053]/5 hover:bg-[#D2A053]/10 hover:border-[#D2A053]/40 active:scale-95 transition-all text-xs font-bold text-[#D2A053] cursor-pointer"
            >
              <span>管理员登录</span>
              <span className="text-[9px] text-white/40 font-normal mt-0.5">wyxcode@qq.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin("user1@example.com", "123456")}
              disabled={loading}
              className="flex flex-col items-center justify-center py-2.5 rounded-2xl border border-white/5 bg-black/25 text-white/70 hover:text-white hover:bg-black/40 hover:border-white/10 active:scale-95 transition-all text-xs font-bold cursor-pointer"
            >
              <span>游客登录</span>
              <span className="text-[9px] text-white/40 font-normal mt-0.5">user1@example.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
