"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Gift, LogOut } from "lucide-react";
import { auth } from "@eazo/sdk";
import { useEazo } from "@eazo/sdk/react";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { toast } from "sonner";

export function TopBar() {
  const user = useEazo((s) => s.auth.user);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast.success("退出登录成功");
      window.location.href = "/login";
    } catch {
      toast.error("退出登录失败，请重试");
    }
  };

  const notifications = [
    { id: 1, title: "AI 向导小旅已就绪", content: "您的专属智能伴游小旅已准备就绪，点击开始实机对谈！", time: "10分钟前", unread: true },
    { id: 2, title: "限时充值优惠特权", content: "VIP 畅游卡特惠充值立享 85 折优惠，赶紧抢购吧！", time: "2小时前", unread: false },
  ];

  return (
    <>
      <AnimatePresence>
        {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </>
  );
}
