export class MusicManager {
  private static instance: MusicManager;
  private customMusicUrl: string | null = null;
  private customFileName: string | null = null;
  private defaultMusicPath = "/assets/audio/beruma/honkowa.m4a";
  private volume: number = 1000;
  private activeTracks: Map<string, any> = new Map(); // アクティブな音声トラックを管理

  private constructor() {}

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public setCustomMusic(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.customMusicUrl = e.target?.result as string;
        this.customFileName = file.name;
        resolve();
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsDataURL(file);
    });
  }

  public resetToDefault(): void {
    this.customMusicUrl = null;
    this.customFileName = null;
  }

  public getMusicUrl(): string {
    return this.customMusicUrl || this.defaultMusicPath;
  }

  public hasCustomMusic(): boolean {
    return this.customMusicUrl !== null;
  }

  public getCurrentMusicName(): string {
    if (this.customMusicUrl && this.customFileName) {
      return this.customFileName;
    }
    return "honkowa.m4a (デフォルト)";
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1000, volume));
    // すべてのアクティブなトラックの音量を更新
    this.updateAllTrackVolumes();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getVolumeAsDecimal(): number {
    return this.volume / 1000;
  }

  // 新しいトラックを登録
  public registerTrack(trackId: string, track: any): void {
    this.activeTracks.set(trackId, track);
    // 登録時に現在の音量を適用
    if (track && track.setVolume) {
      track.setVolume(this.volume);
    }
  }

  // トラックを削除
  public unregisterTrack(trackId: string): void {
    this.activeTracks.delete(trackId);
  }

  // すべてのトラックの音量を更新
  private updateAllTrackVolumes(): void {
    this.activeTracks.forEach((track, trackId) => {
      if (track && track.setVolume) {
        track.setVolume(this.volume);
      }
    });
  }

  // アクティブなトラック数を取得
  public getActiveTrackCount(): number {
    return this.activeTracks.size;
  }
}
