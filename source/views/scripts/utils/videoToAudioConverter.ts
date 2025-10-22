// HTMLVideoElementのcaptureStreamメソッドの型定義を拡張
declare global {
  interface HTMLVideoElement {
    captureStream(): MediaStream;
  }
}

export class VideoToAudioConverter {
  /**
   * 動画ファイルを音声ファイルに変換する
   * @param file 動画ファイル
   * @returns 変換された音声ファイルのPromise
   */
  public static async convertVideoToAudio(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      // 動画要素を作成
      const video = document.createElement('video');
      video.muted = true;
      video.crossOrigin = 'anonymous';
      
      // 音声抽出用のAudioContextを作成
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      
      // 動画の読み込み
      video.onloadedmetadata = () => {
        try {
          // 動画の音声トラックを取得
          const videoStream = video.captureStream();
          const audioTracks = videoStream.getAudioTracks();
          
          if (audioTracks.length === 0) {
            reject(new Error('動画に音声トラックが含まれていません。'));
            return;
          }
          
          // 音声トラックをMediaStreamDestinationに接続
          const audioSource = audioContext.createMediaStreamSource(videoStream);
          audioSource.connect(destination);
          
                     // 録音開始（wav形式で出力）
           const mediaRecorder = new MediaRecorder(destination.stream, {
             mimeType: 'audio/wav'
           });
          
          const chunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
                     mediaRecorder.onstop = () => {
             const audioBlob = new Blob(chunks, { type: 'audio/wav' });
             const audioFile = new File([audioBlob], `${file.name.replace(/\.[^/.]+$/, '')}.wav`, {
               type: 'audio/wav'
             });
             resolve(audioFile);
           };
          
          // 動画再生開始
          video.play();
          mediaRecorder.start();
          
          // 動画終了時に録音停止
          video.onended = () => {
            mediaRecorder.stop();
            audioContext.close();
          };
          
          // エラーハンドリング
          video.onerror = () => {
            reject(new Error('動画の読み込みに失敗しました。'));
          };
          
        } catch (error) {
          reject(error);
        }
      };
      
      // ファイルをURLに変換して動画要素に設定
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      
      // クリーンアップ
      video.onended = () => {
        URL.revokeObjectURL(videoUrl);
      };
    });
  }
  
  /**
   * ファイルが動画ファイルかどうかを判定する
   * @param file ファイル
   * @returns 動画ファイルの場合true
   */
  public static isVideoFile(file: File): boolean {
    const videoTypes = ['video/mp4', 'video/mov', 'video/quicktime'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm'];
    const fileName = file.name.toLowerCase();
    
    return videoTypes.includes(file.type) || 
           videoExtensions.some(ext => fileName.endsWith(ext));
  }
  
  /**
   * ファイルを適切な形式に変換する（動画の場合は音声に変換）
   * @param file 元のファイル
   * @returns 変換されたファイル
   */
  public static async convertFile(file: File): Promise<File> {
    if (this.isVideoFile(file)) {
      return await this.convertVideoToAudio(file);
    }
    return file;
  }
}
