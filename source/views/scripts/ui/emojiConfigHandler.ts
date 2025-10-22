// 絵文字設定管理クラス
export class EmojiConfigManager {
  private static instance: EmojiConfigManager;
  private emojis: string[] = [];
  private readonly maxEmojis = 50;
  private readonly storageKey = 'beruma_emoji_config';
  private readonly presetStorageKey = 'beruma_emoji_presets';
  private readonly maxPresets = 5;

  // プリセット絵文字
  private readonly presets = {
    default: ["心","臓","を","捧","げ","よ","‼️","🫀","🟨","🐧","お","前","ら","弱","す","ぎ","🫵","😹","🖕"],
    weapons: ["🔪","⚔️","🗡️","🏹","🛡️","💣","🧨","💥","🪓","🔫","⚡","🔥","💀","☠️","👹","👺","😈","👿","🤡","👻"],
    animals: ["🐧","🦆","🐥","🐣","🐤","🦅","🦉","🐺","🦊","🐻","🐨","🐼","🦁","🐯","🐮","🐷","🐸","🐵","🐒","🦍"]
  };

  private constructor() {
    this.loadEmojis();
  }

  public static getInstance(): EmojiConfigManager {
    if (!EmojiConfigManager.instance) {
      EmojiConfigManager.instance = new EmojiConfigManager();
    }
    return EmojiConfigManager.instance;
  }

  // 絵文字を追加（単一文字）
  public addEmoji(emoji: string): boolean {
    if (this.emojis.length >= this.maxEmojis) {
      return false;
    }
    if (emoji && !this.emojis.includes(emoji)) {
      this.emojis.push(emoji);
      this.saveEmojis();
      return true;
    }
    return false;
  }

  // 複数文字を一文字ずつ追加
  public addMultipleEmojis(text: string): { added: string[], skipped: string[], error?: string } {
    const result: { added: string[], skipped: string[], error?: string } = { added: [], skipped: [] };
    
    if (!text || text.trim() === '') {
      result.error = '文字を入力してください';
      return result;
    }

    // 文字列を一文字ずつ分割（空白文字は除外）
    const characters = Array.from(text.trim()).filter(char => char.trim() !== '');
    
    if (characters.length === 0) {
      result.error = '有効な文字を入力してください';
      return result;
    }
    
    for (const char of characters) {
      if (this.emojis.length >= this.maxEmojis) {
        result.error = `最大${this.maxEmojis}個までしか登録できません`;
        break;
      }
      
      if (this.emojis.includes(char)) {
        result.skipped.push(char);
      } else {
        this.emojis.push(char);
        result.added.push(char);
      }
    }
    
    if (result.added.length > 0) {
      this.saveEmojis();
    }
    
    return result;
  }

  // 絵文字を削除
  public removeEmoji(emoji: string): void {
    const index = this.emojis.indexOf(emoji);
    if (index > -1) {
      this.emojis.splice(index, 1);
      this.saveEmojis();
    }
  }

  // 絵文字一覧を取得
  public getEmojis(): string[] {
    return [...this.emojis];
  }

  // プリセットを設定
  public setPreset(presetName: keyof typeof this.presets | 'clear'): void {
    if (presetName === 'clear') {
      this.emojis = [];
    } else if (this.presets[presetName as keyof typeof this.presets]) {
      this.emojis = [...this.presets[presetName as keyof typeof this.presets]];
    }
    this.saveEmojis();
  }

  // 絵文字を保存
  private saveEmojis(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.emojis));
    } catch (error) {
      console.error('絵文字の保存に失敗しました:', error);
    }
  }

  // 絵文字を読み込み
  private loadEmojis(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.emojis = JSON.parse(saved);
      } else {
        // デフォルト絵文字を設定
        this.emojis = [...this.presets.default];
        this.saveEmojis();
      }
    } catch (error) {
      console.error('絵文字の読み込みに失敗しました:', error);
      this.emojis = [...this.presets.default];
    }
  }

  // 絵文字数を取得
  public getEmojiCount(): number {
    return this.emojis.length;
  }

  // カスタムプリセットを保存
  public saveCustomPreset(name: string): boolean {
    try {
      const savedPresets = this.getCustomPresets();
      if (savedPresets.length >= this.maxPresets && !savedPresets.find(p => p.name === name)) {
        return false; // 最大数に達している
      }
      
      const preset = {
        name: name,
        emojis: [...this.emojis],
        createdAt: new Date().toISOString()
      };
      
      const existingIndex = savedPresets.findIndex(p => p.name === name);
      if (existingIndex >= 0) {
        savedPresets[existingIndex] = preset;
      } else {
        savedPresets.push(preset);
      }
      
      localStorage.setItem(this.presetStorageKey, JSON.stringify(savedPresets));
      return true;
    } catch (error) {
      console.error('プリセットの保存に失敗しました:', error);
      return false;
    }
  }

  // カスタムプリセットを読み込み
  public loadCustomPreset(name: string): boolean {
    try {
      const savedPresets = this.getCustomPresets();
      const preset = savedPresets.find(p => p.name === name);
      if (preset) {
        this.emojis = [...preset.emojis];
        this.saveEmojis();
        return true;
      }
      return false;
    } catch (error) {
      console.error('プリセットの読み込みに失敗しました:', error);
      return false;
    }
  }

  // カスタムプリセットを削除
  public deleteCustomPreset(name: string): boolean {
    try {
      const savedPresets = this.getCustomPresets();
      const filteredPresets = savedPresets.filter(p => p.name !== name);
      localStorage.setItem(this.presetStorageKey, JSON.stringify(filteredPresets));
      return true;
    } catch (error) {
      console.error('プリセットの削除に失敗しました:', error);
      return false;
    }
  }

  // カスタムプリセット一覧を取得
  public getCustomPresets(): Array<{name: string, emojis: string[], createdAt: string}> {
    try {
      const saved = localStorage.getItem(this.presetStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('プリセットの読み込みに失敗しました:', error);
      return [];
    }
  }

  // プリセット名の重複チェック
  public isPresetNameAvailable(name: string): boolean {
    const savedPresets = this.getCustomPresets();
    return !savedPresets.find(p => p.name === name);
  }
}

// 絵文字設定UIの初期化
export function setupEmojiConfigUI(): void {
  const emojiManager = EmojiConfigManager.getInstance();
  const emojiInput = document.getElementById('emojiInput') as HTMLInputElement;
  const addEmojiBtn = document.getElementById('addEmojiBtn');
  const emojiList = document.getElementById('emojiList');
  const emojiCount = document.getElementById('emojiCount');
  const presetButtons = document.querySelectorAll('[data-preset]');

  // 絵文字一覧を表示
  function updateEmojiList(): void {
    if (!emojiList || !emojiCount) return;

    const emojis = emojiManager.getEmojis();
    emojiCount.textContent = emojis.length.toString();

    emojiList.innerHTML = '';
    emojis.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'emoji-item';
      emojiItem.innerHTML = `
        <span class="emoji-display">${emoji}</span>
        <button type="button" class="btn btn-sm btn-outline-danger emoji-remove-btn" data-emoji="${emoji}">
          <i class="fas fa-times"></i>
        </button>
      `;
      emojiList.appendChild(emojiItem);
    });

    // 削除ボタンのイベントリスナー
    emojiList.querySelectorAll('.emoji-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const emoji = target.closest('.emoji-remove-btn')?.getAttribute('data-emoji');
        if (emoji) {
          emojiManager.removeEmoji(emoji);
          updateEmojiList();
        }
      });
    });
  }

  // カスタムプリセット一覧を表示
  function updateCustomPresetsList(): void {
    const customPresetsContainer = document.getElementById('customPresetsList');
    if (!customPresetsContainer) return;

    const customPresets = emojiManager.getCustomPresets();
    customPresetsContainer.innerHTML = '';

    if (customPresets.length === 0) {
      customPresetsContainer.innerHTML = '<p class="text-muted">保存されたプリセットはありません</p>';
      return;
    }

    customPresets.forEach(preset => {
      const presetItem = document.createElement('div');
      presetItem.className = 'custom-preset-item';
      presetItem.innerHTML = `
        <div class="preset-info">
          <span class="preset-name">${preset.name}</span>
          <span class="preset-count">(${preset.emojis.length}個)</span>
        </div>
        <div class="preset-actions">
          <button type="button" class="btn btn-sm btn-outline-primary load-preset-btn" data-preset-name="${preset.name}">
            <i class="fas fa-download"></i> 読み込み
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger delete-preset-btn" data-preset-name="${preset.name}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      customPresetsContainer.appendChild(presetItem);
    });

    // 読み込みボタンのイベントリスナー
    customPresetsContainer.querySelectorAll('.load-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const presetName = target.closest('.load-preset-btn')?.getAttribute('data-preset-name');
        if (presetName) {
          if (emojiManager.loadCustomPreset(presetName)) {
            updateEmojiList();
            alert(`プリセット「${presetName}」を読み込みました`);
          } else {
            alert('プリセットの読み込みに失敗しました');
          }
        }
      });
    });

    // 削除ボタンのイベントリスナー
    customPresetsContainer.querySelectorAll('.delete-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const presetName = target.closest('.delete-preset-btn')?.getAttribute('data-preset-name');
        if (presetName && confirm(`プリセット「${presetName}」を削除しますか？`)) {
          if (emojiManager.deleteCustomPreset(presetName)) {
            updateCustomPresetsList();
            alert(`プリセット「${presetName}」を削除しました`);
          } else {
            alert('プリセットの削除に失敗しました');
          }
        }
      });
    });
  }

  // 絵文字追加ボタンのイベントリスナー
  addEmojiBtn?.addEventListener('click', () => {
    const inputText = emojiInput.value.trim();
    
    if (!inputText) {
      alert('文字を入力してください');
      return;
    }

    // 複数文字の場合は一文字ずつ追加
    if (inputText.length > 1) {
      const result = emojiManager.addMultipleEmojis(inputText);
      
      if (result.error) {
        alert(result.error);
      } else {
        let message = '';
        if (result.added.length > 0) {
          message += `追加しました: ${result.added.join(', ')}\n`;
        }
        if (result.skipped.length > 0) {
          message += `スキップしました（重複）: ${result.skipped.join(', ')}`;
        }
        
        if (message) {
          alert(message);
          emojiInput.value = '';
          updateEmojiList();
        } else {
          alert('すべての文字が既に登録されています。');
        }
      }
    } else {
      // 単一文字の場合
      if (emojiManager.addEmoji(inputText)) {
        emojiInput.value = '';
        updateEmojiList();
      } else {
        if (emojiManager.getEmojis().includes(inputText)) {
          alert('この文字は既に登録されています。');
        } else {
          alert('絵文字の追加に失敗しました。最大50個まで追加できます。');
        }
      }
    }
  });

  // Enterキーで絵文字追加
  emojiInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addEmojiBtn?.click();
    }
  });

  // プリセットボタンのイベントリスナー
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset') as keyof typeof emojiManager['presets'] | 'clear';
      emojiManager.setPreset(preset);
      updateEmojiList();
    });
  });

  // プリセット保存機能
  const savePresetBtn = document.getElementById('savePresetBtn');
  const presetNameInput = document.getElementById('presetNameInput') as HTMLInputElement;

  savePresetBtn?.addEventListener('click', () => {
    const presetName = presetNameInput?.value.trim();
    if (!presetName) {
      alert('プリセット名を入力してください');
      return;
    }

    if (emojiManager.getEmojis().length === 0) {
      alert('文字を追加してからプリセットを保存してください');
      return;
    }

    if (!emojiManager.isPresetNameAvailable(presetName)) {
      if (confirm(`プリセット「${presetName}」は既に存在します。上書きしますか？`)) {
        if (emojiManager.saveCustomPreset(presetName)) {
          alert(`プリセット「${presetName}」を保存しました`);
          presetNameInput.value = '';
          updateCustomPresetsList();
        } else {
          alert('プリセットの保存に失敗しました');
        }
      }
    } else {
      if (emojiManager.saveCustomPreset(presetName)) {
        alert(`プリセット「${presetName}」を保存しました`);
        presetNameInput.value = '';
        updateCustomPresetsList();
      } else {
        alert('プリセットの保存に失敗しました（最大5個まで保存できます）');
      }
    }
  });

  // Enterキーでプリセット保存
  presetNameInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      savePresetBtn?.click();
    }
  });

  // 初期表示
  updateEmojiList();
  updateCustomPresetsList();
}
