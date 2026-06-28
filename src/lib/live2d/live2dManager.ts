import { LAppDelegate } from '@/lib/live2d/src/lappdelegate';
import { ResourceModel } from '@/lib/protocol';

export class Live2dManager {
    // 单例
    public static getInstance(): Live2dManager {
        if (! this._instance) {
            this._instance = new Live2dManager();
        }

        return this._instance;
    }

    public setReady(ready: boolean) {
      this._ready = ready;
    }

    public isReady(): boolean {
      return this._ready;
    }

    public changeCharacter(character: ResourceModel | null) {
      // _subdelegates中只有一个画布, 所以设置第一个即可
      this._ready = false;
      LAppDelegate.getInstance().changeCharacter(character)
    }

    public setLipFactor(weight: number): void {
      this._lipFactor = weight;
    }

    public getLipFactor(): number {
      return this._lipFactor;
    }

    public setSoundEnabled(enabled: boolean): void {
      this._soundEnabled = enabled;
    }

    public isSoundEnabled(): boolean {
      return this._soundEnabled;
    }

    public pushAudioQueue(audioData: ArrayBuffer): void {
      this._ttsQueue.push(audioData);
    }

    public popAudioQueue(): ArrayBuffer | null {
      if (this._ttsQueue.length > 0) {
        const audioData = this._ttsQueue.shift();
        return audioData;
      } else {
        return null;
      }
    }

    public clearAudioQueue(): void {
      this._ttsQueue = [];
    }

    public playAudio(): ArrayBuffer | null {
      if (this._audioIsPlaying) return null; // 如果正在播放则返回
      const audioData = this.popAudioQueue();
      if (audioData == null) return null; // 没有音频数据则返回
      this._audioIsPlaying = true;
      
      // 激活 suspended 状态的 AudioContext (常见于现代浏览器安全策略限制)
      if (this._audioContext && this._audioContext.state === 'suspended') {
        this._audioContext.resume();
      }

      // 播放音频
      const playAudioBuffer = (buffer: AudioBuffer) => {
        var source = this._audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 路由音频通道：Source -> Analyser -> Output Destination
        source.connect(this._analyser);
        if (this._soundEnabled) {
          this._analyser.connect(this._audioContext.destination);
        }

        // 监听音频播放完毕事件
        source.onended = () => {
          this._audioIsPlaying = false;
          if (this.onAudioEnded) {
            this.onAudioEnded();
          }
        };
        source.start();
        this._audioSource = source;
        if (this.onAudioStarted) {
          this.onAudioStarted();
        }
      }
      // 创建一个新的 ArrayBuffer 并复制数据, 防止原始数据被decodeAudioData释放
      const newAudioData = audioData.slice(0);
      this._audioContext.decodeAudioData(newAudioData).then(
        buffer => {
          playAudioBuffer(buffer);
        }
      );
      return audioData;
    }

    public stopAudio(): void {
      this.clearAudioQueue();
      if (this._audioSource) {
        try {
          this._audioSource.stop();
        } catch (e) {
          // ignore
        }
        this._audioSource = null;
      }
      this._audioIsPlaying = false;
      if (this.onAudioEnded) {
        this.onAudioEnded();
      }
    }

    public isAudioPlaying(): boolean {
      return this._audioIsPlaying;
    }

    public getRms(): number {
      if (!this._audioIsPlaying || !this._analyser) return 0.0;
      
      const bufferLength = this._analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this._analyser.getByteTimeDomainData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        // 将 Uint8 的 [0, 255] 线性映射回 Float32 的 [-1.0, 1.0] PCM 数值空间
        const pcm = (dataArray[i] - 128) / 128;
        sum += pcm * pcm;
      }
      return Math.sqrt(sum / bufferLength);
    }

    public onAudioStarted: (() => void) | null = null;
    public onAudioEnded: (() => void) | null = null;

    constructor() {
      this._audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this._analyser = this._audioContext.createAnalyser();
      this._analyser.fftSize = 256; // 较小的分析窗口有利于提高口型跟踪灵敏度
      this._audioIsPlaying = false;
      this._audioSource = null;
      this._lipFactor = 1.0;
      this._soundEnabled = true;
      this._ready = false;
    }

    private static _instance: Live2dManager;
    private _ttsQueue: ArrayBuffer[] = [];
    private _audioContext: AudioContext;
    private _analyser: AnalyserNode;
    private _audioIsPlaying: boolean;
    private _audioSource: AudioBufferSourceNode | null;
    private _lipFactor: number;
    private _soundEnabled: boolean;
    private _ready: boolean;
  }