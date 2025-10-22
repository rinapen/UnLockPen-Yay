import { setupMusicUploadHandler } from '../ui/musicUploadHandler';
import { handleSearch } from '../handlers/handleSearch';
import { setupEmojiConfigUI } from '../ui/emojiConfigHandler';

// search.ejsページ専用の初期化
document.addEventListener('DOMContentLoaded', () => {
  // 音楽アップロードハンドラーを初期化
  setupMusicUploadHandler();

  // 絵文字設定UIを初期化
  setupEmojiConfigUI();

  // 検索ボタンのイベントリスナーを設定
  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      handleSearch();
    });
  }

  // 選択肢のクリックイベントを設定
  const idTypeChoice = document.getElementById('id-type-choice');
  const botTypeChoice = document.getElementById('bot-type-choice');
  const idTypeHidden = document.getElementById('idTypeHidden') as HTMLInputElement;
  const botTypeHidden = document.getElementById('botTypeHidden') as HTMLInputElement;
  const idInput = document.getElementById('idInput') as HTMLInputElement;

  // IDタイプ選択
  idTypeChoice?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('choice-option')) {
      // 既存のアクティブクラスを削除
      idTypeChoice.querySelectorAll('.choice-option').forEach(option => {
        option.classList.remove('active');
      });
      
      // クリックされた要素にアクティブクラスを追加
      target.classList.add('active');
      
      // 隠しフィールドに値を設定
      const value = target.getAttribute('data-value');
      if (value) {
        idTypeHidden.value = value;
        idInput.disabled = false;
      }
    }
  });

  // BOTタイプ選択
  botTypeChoice?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('choice-option')) {
      // 既存のアクティブクラスを削除
      botTypeChoice.querySelectorAll('.choice-option').forEach(option => {
        option.classList.remove('active');
      });
      
      // クリックされた要素にアクティブクラスを追加
      target.classList.add('active');
      
      // 隠しフィールドに値を設定
      const value = target.getAttribute('data-value');
      if (value) {
        botTypeHidden.value = value;
      }
    }
  });

  // 初期状態でUserIDを選択
  const userIdOption = idTypeChoice?.querySelector('[data-value="user_id"]') as HTMLElement;
  if (userIdOption) {
    userIdOption.classList.add('active');
    idTypeHidden.value = 'user_id';
    idInput.disabled = false;
  }
});
