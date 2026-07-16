"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, Sparkles, Eye, EyeOff } from "lucide-react";
import { auth } from "@eazo/sdk";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
    <div className="min-h-svh w-full flex bg-white overflow-hidden font-sans">

      {/* Left Panel - Dark thematic area (hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0B1311] relative flex-col justify-between px-12 py-20 text-white overflow-hidden select-none">

        {/* Constellation animated/mesh background */}
        <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="leftGlow" cx="20%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#10a37f" stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#leftGlow)" />
          <circle cx="120" cy="180" r="2.5" fill="#10a37f" />
          <circle cx="280" cy="210" r="3" fill="#10a37f" opacity="0.8" />
          <circle cx="360" cy="320" r="2" fill="#10a37f" />
          <circle cx="200" cy="400" r="3" fill="#10a37f" opacity="0.7" />
          <circle cx="310" cy="480" r="2.5" fill="#10a37f" />
          <circle cx="140" cy="550" r="3.5" fill="#10a37f" opacity="0.6" />
          <line x1="120" y1="180" x2="280" y2="210" stroke="rgba(16, 163, 127, 0.2)" strokeWidth="1" />
          <line x1="280" y1="210" x2="360" y2="320" stroke="rgba(16, 163, 127, 0.2)" strokeWidth="1" />
          <line x1="360" y1="320" x2="200" y2="400" stroke="rgba(16, 163, 127, 0.2)" strokeWidth="1" />
          <line x1="200" y1="400" x2="310" y2="480" stroke="rgba(16, 163, 127, 0.2)" strokeWidth="1" />
          <line x1="310" y1="480" x2="140" y2="550" stroke="rgba(16, 163, 127, 0.2)" strokeWidth="1" />
          <line x1="140" y1="550" x2="120" y2="180" stroke="rgba(16, 163, 127, 0.2)" strokeWidth="1" />
        </svg>

        {/* Content Wrapper - Centered & bounded */}
        <div className="w-full max-w-md mx-auto flex flex-col justify-between h-full z-10">

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md shadow-[#10a37f]/10 relative border border-neutral-800">
              <Image
                src="/image/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-white">旅行家Pro</h2>
              <p className="text-xs text-neutral-400 font-semibold mt-0.5">个性化多智能体伴游系统</p>
            </div>
          </div>

          {/* Slogans and details */}
          <div className="space-y-10 my-auto py-8">
            <div className="space-y-5">
              <h1 className="text-5xl font-black leading-tight text-white tracking-tight">
                让旅行更<span className="text-[#10a37f] px-1">聪明</span>，<br />
                让感悟更<span className="text-[#10a37f] px-1">精准</span>
              </h1>
              <p className="text-base text-neutral-400 leading-relaxed">
                基于多智能体协作，提供AI数字人伴游、景区文化历史深度讲解与个性化游览路线定制。
              </p>
            </div>

            {/* Features Checkmarks */}
            <div className="space-y-5">
              {[
                "伴游数字人多模态交互",
                "景区文化历史深度讲解",
                "沉浸式章节音视剧情",
                "拍照识景即时互动体验"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#10a37f]/10 border border-[#10a37f]/30 flex items-center justify-center text-[#10a37f] flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-base text-neutral-300 font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats badge */}
          <div className="flex items-center gap-3.5 bg-[#14221F] border border-[#1E3A33]/60 rounded-2xl px-5 py-3 text-sm text-neutral-300 w-fit">
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-[#10a37f] text-white rounded text-[10px] font-bold">陈</span>
              <span className="px-2 py-0.5 bg-[#D2A053] text-white rounded text-[10px] font-bold">李</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">王</span>
              <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">赵</span>
            </div>
            <span className="font-semibold text-neutral-200">50,000+ 位旅客正在使用</span>
          </div>

        </div>

      </div>

      {/* Right Panel - Form panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-16 bg-[#FAF8F5] relative overflow-hidden">

        {/* Travel Background Image for Mobile Only */}
        <div
          className="absolute inset-0 lg:hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image/login_bg.png')" }}
        />

        {/* Soft overlay + blur to make background illustration subtle and elegant */}
        <div className="absolute inset-0 lg:hidden bg-white/20 backdrop-blur-[5px]" />

        {/* Back Link at the top-right */}
        <button
          onClick={() => router.push("/welcome")}
          className="absolute top-8 right-8 flex items-center gap-1.5 text-xs font-semibold text-neutral-600 lg:text-neutral-400 hover:text-neutral-900 lg:hover:text-neutral-700 transition-colors cursor-pointer z-20"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 返回官网
        </button>

        {/* Central Card Form */}
        <div className="w-full max-w-sm lg:max-w-md flex flex-col justify-center relative z-10 bg-white/85 lg:bg-transparent p-6 md:p-8 rounded-3xl shadow-xl lg:shadow-none border border-white/50 lg:border-transparent backdrop-blur-md lg:backdrop-blur-none">

          {/* Welcome Titles */}
          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">欢迎回来 👋</h2>
            <p className="text-sm text-neutral-600 lg:text-neutral-500 mt-1 font-medium">登录开启您的探索之旅</p>
          </div>

          {/* Form Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl mt-8">
            <button
              type="button"
              onClick={() => setTab("password")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${tab === "password"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
                }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setTab("code")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${tab === "code"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
                }`}
            >
              注册
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f3f4f6] focus:bg-white border border-transparent focus:border-[#10a37f] text-sm text-neutral-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all placeholder:text-neutral-400"
                  required
                />
              </div>
            </div>

            {/* Password / Verification Code */}
            {tab === "password" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f3f4f6] focus:bg-white border border-transparent focus:border-[#10a37f] text-sm text-neutral-900 pl-10 pr-10 py-3 rounded-xl focus:outline-none transition-all placeholder:text-neutral-400"
                    required={tab === "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">验证码</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="6位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-[#f3f4f6] focus:bg-white border border-transparent focus:border-[#10a37f] text-sm text-neutral-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all placeholder:text-neutral-400"
                      maxLength={6}
                      required={tab === "code"}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || countdown > 0}
                    onClick={handleSendCode}
                    className="px-4 text-xs font-semibold rounded-xl border border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {countdown > 0 ? `${countdown}秒后获取` : "获取验证码"}
                  </button>
                </div>
              </div>
            )}

            {/* Login Submission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white bg-[#10a37f] hover:bg-[#0da179] active:bg-[#0b8a67] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#10a37f]/15"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>登录账号</>
              )}
            </button>
          </form>

          {/* Tab Redirect Text */}
          <div className="text-center mt-4">
            <span className="text-xs text-neutral-400">没有账号？</span>
            <button
              onClick={() => setTab("code")}
              className="text-xs text-[#10a37f] hover:underline font-semibold ml-1 cursor-pointer"
            >
              立即注册
            </button>
          </div>

          {/* Quick Login Section */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => handleQuickLogin("user1@example.com", "123456")}
              disabled={loading}
              className="w-full py-3.5 rounded-xl border border-dashed border-[#10a37f] bg-[#e6f7f4] text-[#10a37f] hover:bg-[#d0f2eb] active:scale-98 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              游客一键登录 · 无需注册，立即体验
            </button>

            <button
              onClick={() => handleQuickLogin("wyxcode@qq.com", "123456")}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 active:scale-98 transition-all text-xs font-semibold text-neutral-600 flex items-center justify-center gap-1 cursor-pointer"
            >
              管理后台一键登录(测试用)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
