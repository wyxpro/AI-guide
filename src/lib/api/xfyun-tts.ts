import crypto from "crypto";

interface TTSConfig {
  text: string;
  vcn?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  appId?: string;
  apiKey?: string;
  apiSecret?: string;
}

// Generates the signed WebSocket URL for iFlytek TTS
function getAuthUrl(customCreds?: { appId?: string; apiKey?: string; apiSecret?: string }): string {
  const appId = customCreds?.appId || process.env.XFYUN_APP_ID || "";
  const apiKey = customCreds?.apiKey || process.env.XFYUN_API_KEY || "";
  const apiSecret = customCreds?.apiSecret || process.env.XFYUN_API_SECRET || "";

  if (!appId || !apiKey || !apiSecret) {
    throw new Error("XFYUN credentials missing in environment variables.");
  }

  const host = "tts-api.xfyun.cn";
  const path = "/v2/tts";
  const date = new Date().toUTCString();

  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signatureOrigin)
    .digest("base64");

  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString("base64");

  return `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
}

export function synthesizeSpeech(config: TTSConfig): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const url = getAuthUrl({ appId: config.appId, apiKey: config.apiKey, apiSecret: config.apiSecret });
      const ws = new WebSocket(url);
      const appId = config.appId || process.env.XFYUN_APP_ID || "";
      const audioBuffers: Buffer[] = [];

      // Set timeout in case WebSocket hangs
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("iFlytek TTS WebSocket timeout (15s)"));
      }, 15000);

      ws.onopen = () => {
        // Map speed (0-100 UI range to 0-2207 / 50 default is 50 in訊飞)
        // iFlytek speed range is 0 to 100, default is 50.
        const speed = config.speed ?? 50;
        const pitch = config.pitch ?? 50;
        const volume = config.volume ?? 50;

        const params = {
          common: { app_id: appId },
          business: {
            aue: "lame", // mp3 format
            sfl: 1,      // stream down
            vcn: config.vcn || "aisjiuxu", // default voice
            speed: speed,
            pitch: pitch,
            volume: volume,
            tte: "UTF8",
          },
          data: {
            status: 2,
            text: Buffer.from(config.text).toString("base64"),
          },
        };
        ws.send(JSON.stringify(params));
      };

      ws.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data as string);
          if (res.code !== 0) {
            clearTimeout(timeout);
            reject(new Error(`iFlytek TTS error code ${res.code}: ${res.message}`));
            ws.close();
            return;
          }

          if (res.data && res.data.audio) {
            audioBuffers.push(Buffer.from(res.data.audio, "base64"));
          }

          if (res.data && res.data.status === 2) {
            clearTimeout(timeout);
            resolve(Buffer.concat(audioBuffers));
            ws.close();
          }
        } catch (e) {
          clearTimeout(timeout);
          reject(e);
          ws.close();
        }
      };

      ws.onerror = (err) => {
        clearTimeout(timeout);
        reject(err);
      };

      ws.onclose = () => {
        clearTimeout(timeout);
      };
    } catch (err) {
      reject(err);
    }
  });
}
