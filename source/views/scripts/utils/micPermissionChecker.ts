export class MicPermissionChecker {
  /**
   * マイク権限を確認する
   * @returns マイクが利用可能かどうか
   */
  public static async checkMicPermission(): Promise<boolean> {
    try {
      // マイク権限を要求
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // ストリームを停止
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.warn('マイク権限が拒否されました:', error);
      return false;
    }
  }

  /**
   * マイクデバイスが存在するかチェック
   * @returns マイクデバイスが存在するかどうか
   */
  public static async checkMicDevice(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      return audioInputs.length > 0;
    } catch (error) {
      console.warn('デバイス列挙に失敗しました:', error);
      return false;
    }
  }

  /**
   * マイクの状態を完全にチェック
   * @returns マイクが利用可能かどうかと理由
   */
  public static async checkMicStatus(): Promise<{ available: boolean; reason?: string }> {
    // デバイス存在チェック
    const hasDevice = await this.checkMicDevice();
    if (!hasDevice) {
      return { available: false, reason: 'マイクデバイスが見つかりません' };
    }

    // 権限チェック
    const hasPermission = await this.checkMicPermission();
    if (!hasPermission) {
      return { available: false, reason: 'マイク権限が拒否されています' };
    }

    return { available: true };
  }
}
