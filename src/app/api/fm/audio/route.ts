import { NextRequest, NextResponse } from "next/server";

// Pentatonic scale frequencies in Hz (Guzheng / Traditional oriental melody)
const PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

// Pre-scripted pleasant pentatonic melodies for each FM track category
const MELODIES: Record<string, number[]> = {
  heritage: [0, 2, 4, 3, 5, 4, 2, 0, 1, 3, 5, 4, 2, 0],
  celebrities: [4, 5, 7, 5, 4, 2, 0, 2, 4, 5, 4, 2],
  history: [0, 3, 4, 7, 6, 4, 3, 0, 3, 4, 5, 7, 4],
  food: [2, 4, 5, 7, 8, 7, 5, 4, 2, 3, 5, 7],
  life: [0, 1, 2, 4, 3, 2, 0, 1, 2, 4, 5, 2],
  landmarks: [3, 4, 6, 7, 9, 7, 6, 4, 3, 4, 6, 4],
  legends: [0, 4, 7, 8, 9, 8, 7, 4, 0, 2, 4, 7]
};

function generateMelodyWav(trackKey: string = "history"): Buffer {
  const sampleRate = 22050;
  const noteDuration = 0.45; // duration of each note in seconds
  const notes = MELODIES[trackKey] || MELODIES.history;
  const numLoop = 3; // Repeat sequence for ~15 seconds total
  const fullSequence: number[] = [];
  for (let r = 0; r < numLoop; r++) {
    fullSequence.push(...notes);
  }

  const numSamples = Math.floor(sampleRate * noteDuration * fullSequence.length);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill PCM samples with musical notes + harmonics + decay envelope
  const noteSamples = Math.floor(sampleRate * noteDuration);
  let sampleIndex = 0;

  for (let n = 0; n < fullSequence.length; n++) {
    const noteIdx = fullSequence[n];
    const freq = PENTATONIC_FREQS[noteIdx % PENTATONIC_FREQS.length];

    for (let i = 0; i < noteSamples; i++) {
      if (sampleIndex >= numSamples) break;
      const t = i / sampleRate;

      // ADSR Decay envelope
      const envelope = Math.exp(-t * 3.5) * Math.min(1.0, i / (sampleRate * 0.02));
      // Fundamental + 2nd Harmonic (Warm tone like Guzheng/Qin)
      const val = Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
      const sampleInt = Math.floor(val * envelope * 12000);

      buffer.writeInt16LE(sampleInt, 44 + sampleIndex * 2);
      sampleIndex++;
    }
  }

  return buffer;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track") || "history";

    const wavBuffer = generateMelodyWav(track);
    return new NextResponse(new Uint8Array(wavBuffer), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[FM Audio Route Error]", error);
    const wavBuffer = generateMelodyWav("history");
    return new NextResponse(new Uint8Array(wavBuffer), { headers: { "Content-Type": "audio/wav" } });
  }
}
