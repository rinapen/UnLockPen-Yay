import { MusicManager } from '../utils/musicManager';
import { VideoToAudioConverter } from '../utils/videoToAudioConverter';
import { NotificationManager } from '../utils/notificationManager';

export function setupMusicUploadHandler(): void {
  const musicFileInput = document.getElementById('musicFile') as HTMLInputElement;
  const uploadMusicBtn = document.getElementById('uploadMusicBtn') as HTMLButtonElement;
  const resetMusicBtn = document.getElementById('resetMusicBtn') as HTMLButtonElement;
  const currentMusicFileSpan = document.getElementById('currentMusicFile') as HTMLSpanElement;

  const musicManager = MusicManager.getInstance();
  const notificationManager = NotificationManager.getInstance();

  // ファイル選択時の処理（即座に反映）
  musicFileInput?.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // ファイルサイズチェック（50MB制限に緩和）
      if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズは50MB以下にしてください。');
        target.value = '';
        uploadMusicBtn.disabled = true;
        return;
      }

      // ファイル形式チェック（音声・動画ファイルを許可）
      const allowedTypes = [
        'audio/wav', 'audio/m4a', 'audio/mp3', 'audio/mpeg', 
        'video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 
        'video/mkv', 'video/wmv', 'video/flv', 'video/webm'
      ];
      const allowedExtensions = [
        '.wav', '.m4a', '.mp3', '.mp4', '.mov', '.avi', 
        '.mkv', '.wmv', '.flv', '.webm'
      ];
      const fileName = file.name.toLowerCase();
      
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidType) {
        alert('対応していないファイル形式です。音声・動画ファイル（wav、m4a、mp3、mp4、mov、avi、mkv、wmv、flv、webm）のみアップロード可能です。');
        target.value = '';
        uploadMusicBtn.disabled = true;
        return;
      }

      // 即座にファイルを処理して反映
      try {
        uploadMusicBtn.disabled = true;
        uploadMusicBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 処理中...';

        let processedFile = file;
        let originalFileName = file.name;
        
        // 動画ファイルの場合は音声に変換
        if (VideoToAudioConverter.isVideoFile(file)) {
          uploadMusicBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 変換中...';
          processedFile = await VideoToAudioConverter.convertFile(file);
          originalFileName = file.name;
          notificationManager.showNotification('動画ファイルを音声ファイルに変換しました！', 'info');
        }

        // カスタムファイル名を設定するために、一時的にファイル名を変更
        const fileWithOriginalName = new File([processedFile], originalFileName, {
          type: processedFile.type
        });
        
        await musicManager.setCustomMusic(fileWithOriginalName);
        
        // UI更新
        currentMusicFileSpan.textContent = musicManager.getCurrentMusicName();
        
        // 成功メッセージ
        notificationManager.showNotification('音楽ファイルが設定されました！', 'success');
        
        // アップロードボタンをリセット
        uploadMusicBtn.disabled = false;
        uploadMusicBtn.innerHTML = '<i class="fas fa-upload"></i> アップロード';
        
      } catch (error) {
        console.error('音楽ファイルの処理に失敗しました:', error);
        notificationManager.showNotification('音楽ファイルの処理に失敗しました。', 'error');
        uploadMusicBtn.disabled = false;
        uploadMusicBtn.innerHTML = '<i class="fas fa-upload"></i> アップロード';
      }
    } else {
      uploadMusicBtn.disabled = true;
    }
  });

  // アップロードボタンは非表示にする（ファイル選択時に即座に処理されるため）
  if (uploadMusicBtn) {
    uploadMusicBtn.style.display = 'none';
  }

  // リセットボタンの処理
  resetMusicBtn?.addEventListener('click', () => {
    musicManager.resetToDefault();
    currentMusicFileSpan.textContent = musicManager.getCurrentMusicName();
    musicFileInput.value = '';
    uploadMusicBtn.disabled = true;
    notificationManager.showNotification('デフォルトの音楽ファイルに戻しました。', 'info');
  });

  // 音量調整機能の設定
  const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement;
  const volumeValue = document.getElementById('volumeValue') as HTMLSpanElement;

  volumeSlider?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const volume = parseInt(target.value);
    musicManager.setVolume(volume);
    volumeValue.textContent = `${volume}`;
    
    // アクティブなトラック数を表示
    const activeTrackCount = musicManager.getActiveTrackCount();
    if (activeTrackCount > 0) {
      notificationManager.showVolumeAdjustment(activeTrackCount);
    }
  });

  // 初期表示
  currentMusicFileSpan.textContent = musicManager.getCurrentMusicName();
}


