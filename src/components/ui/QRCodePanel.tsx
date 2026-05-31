"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Download, X } from "lucide-react";
import { toast } from "sonner";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 35 };

interface Spot { id: number; name: string; category: string }

export function QRCodePanel() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrMap, setQrMap] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/spots").then((r) => r.json())
      .then((d) => { setSpots(Array.isArray(d) ? d.slice(0, 6) : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const generateQR = async (spotId: number) => {
    setGenerating((prev) => ({ ...prev, [spotId]: true }));
    try {
      const res = await fetch(`/api/admin/spots/${spotId}/qrcode`);
      const data = await res.json();
      setQrMap((prev) => ({ ...prev, [spotId]: data.qrcode ?? data.qrCode }));
      toast.success("二维码生成成功");
    } catch {
      toast.error("生成失败");
    } finally {
      setGenerating((prev) => ({ ...prev, [spotId]: false }));
    }
  };

  const downloadQR = (spotName: string, qrData: string) => {
    const link = document.createElement("a");
    link.href = qrData;
    link.download = `${spotName}-二维码.png`;
    link.click();
    toast.success("二维码已下载");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <QrCode className="w-5 h-5" style={{ color: "#4F6F52" }} />
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
          景点导览二维码
        </h3>
      </div>
      {loading ? (
        <div className="skeleton h-32 rounded-xl" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {spots.map((spot, i) => (
            <motion.div key={spot.id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: i * 0.05 }}
              className="card-ink p-3 space-y-2">
              <p className="text-[12px] font-medium truncate" style={{ color: "#1E2522" }}>{spot.name}</p>
              {qrMap[spot.id] ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrMap[spot.id]} alt={spot.name} className="w-full rounded-lg" />
                  <motion.button whileTap={{ scale: 0.94 }} onClick={() => downloadQR(spot.name, qrMap[spot.id])}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    style={{ background: "rgba(79,111,82,0.1)", color: "#4F6F52" }}>
                    <Download className="w-3 h-3" /> 下载
                  </motion.button>
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => generateQR(spot.id)}
                  disabled={generating[spot.id]}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "linear-gradient(135deg,#4F6F52,#3A5240)", color: "white" }}>
                  {generating[spot.id] ? "生成中..." : "生成二维码"}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <p className="text-[10px] px-1" style={{ color: "#8F9F8F" }}>
        游客扫码可直达景点详情并自动开启语音讲解
      </p>
    </div>
  );
}
