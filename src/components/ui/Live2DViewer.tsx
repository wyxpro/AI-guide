"use client";

import { useEffect, useState } from "react";
import { LAppDelegate } from "@/lib/live2d/src/lappdelegate";
import { Live2dManager } from "@/lib/live2d/live2dManager";
import { ResourceModel, RESOURCE_TYPE } from "@/lib/protocol";

interface Live2DViewerProps {
  avatarStyle: string; // e.g., "live2d_Haru"
}

export default function Live2DViewer({ avatarStyle }: Live2DViewerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Initialize LAppDelegate
    try {
      if (LAppDelegate.getInstance().initialize() === false) {
        console.error("Failed to initialize LAppDelegate");
        return;
      }
      LAppDelegate.getInstance().run();
    } catch (err) {
      console.error("Error during LAppDelegate initialization:", err);
      return;
    }

    // 2. Poll for Live2DManager readiness
    let active = true;
    const checkReady = () => {
      if (!active) return;
      if (Live2dManager.getInstance().isReady()) {
        setReady(true);
      } else {
        setTimeout(checkReady, 300);
      }
    };
    checkReady();

    // 3. Handle window resize
    const handleResize = () => {
      try {
        LAppDelegate.getInstance().onResize();
      } catch (err) {
        console.warn("Resize error:", err);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      try {
        LAppDelegate.releaseInstance();
      } catch (err) {
        console.warn("Release error:", err);
      }
    };
  }, []);

  // 4. Handle character style changes
  useEffect(() => {
    const characterName = avatarStyle.replace("live2d_", "");
    const character: ResourceModel = {
      resource_id: characterName,
      name: characterName,
      type: RESOURCE_TYPE.CHARACTER,
      link: `/sentio/characters/free/${characterName}/${characterName}.model3.json`
    };

    try {
      Live2dManager.getInstance().changeCharacter(character);
    } catch (err) {
      console.error("Error changing character:", err);
    }
  }, [avatarStyle, ready]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <canvas
        id="live2dCanvas"
        className="w-full h-full max-w-full max-h-full block bg-transparent"
        style={{ outline: "none" }}
      />
    </div>
  );
}
