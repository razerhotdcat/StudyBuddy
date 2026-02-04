/**
 * 영수증 출력 등 효과음 관리.
 * 기본은 프린터 비프음, 추후 설정에서 .mp3 커스텀 가능.
 */
class SoundManagerClass {
  private printSoundUrl: string | null = null;
  private audioContext: AudioContext | null = null;

  /** 영수증 출력 시 재생 (기본: 짧은 비프) */
  playPrintSound(): void {
    if (this.printSoundUrl) {
      const audio = new Audio(this.printSoundUrl);
      audio.volume = 0.6;
      audio.play().catch(() => {});
      return;
    }
    this.playDefaultBeep();
  }

  /** 인쇄 중 리얼 사운드 (지익- 지익-): steps 애니와 동기화 */
  playPrinting(): void {
    if (this.printSoundUrl) {
      const audio = new Audio(this.printSoundUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      return;
    }
    this.playPrintingBeep();
  }

  private playPrintingBeep(): void {
    try {
      const ctx = this.audioContext ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.audioContext = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 120;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
      for (let i = 1; i <= 4; i++) {
        const t = ctx.currentTime + i * 0.25;
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2);
        g2.connect(ctx.destination);
        o2.type = 'square';
        o2.frequency.value = 100 + i * 20;
        g2.gain.setValueAtTime(0.06, t);
        g2.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        o2.start(t);
        o2.stop(t + 0.06);
      }
    } catch {
      this.playDefaultBeep();
    }
  }

  /** 기본 프린터 비프음 (Web Audio API) */
  private playDefaultBeep(): void {
    try {
      const ctx = this.audioContext ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.audioContext = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // 환경 제한 시 무시
    }
  }

  /** 커스텀 출력 소리 URL 설정 (추후 설정창에서 .mp3 선택) */
  setPrintSoundUrl(url: string | null): void {
    this.printSoundUrl = url;
  }

  getPrintSoundUrl(): string | null {
    return this.printSoundUrl;
  }
}

export const SoundManager = new SoundManagerClass();
