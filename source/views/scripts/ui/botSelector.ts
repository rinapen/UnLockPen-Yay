// ボット選択UI
export interface BotInfo {
  bot_user_id: string;
  agoraInfo: any;
  joined_at: string;
  isParticipating: boolean;
  mode?: string;
  status?: 'connected' | 'joining' | 'error';
}

export interface BotSelectorOptions {
  title: string;
  message: string;
  bots: BotInfo[];
  allowMultiple: boolean;
}

export async function showBotSelector(options: BotSelectorOptions): Promise<BotInfo[]> {
  return new Promise((resolve) => {
    // モーダルオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.className = 'bot-selector-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
    `;

    // モーダルコンテナを作成
    const modal = document.createElement('div');
    modal.className = 'bot-selector-modal';
    modal.style.cssText = `
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border: 2px solid #ffd700;
      border-radius: 20px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      position: relative;
    `;

    // ヘッダーを作成
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 20px;
      text-align: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = options.title;
    title.style.cssText = `
      color: #ffd700;
      margin: 0 0 10px 0;
      font-size: 1.5rem;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;
    
    const message = document.createElement('p');
    message.textContent = options.message;
    message.style.cssText = `
      color: #ccc;
      margin: 0;
      white-space: pre-line;
      line-height: 1.5;
    `;
    
    header.appendChild(title);
    header.appendChild(message);

    // ボットリストを作成
    const botList = document.createElement('div');
    botList.className = 'bot-list';
    botList.style.cssText = `
      margin-bottom: 20px;
    `;

    const selectedBots = new Set<string>();

    options.bots.forEach((bot) => {
      const botItem = document.createElement('div');
      botItem.className = 'bot-item';
      botItem.style.cssText = `
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 15px;
      `;

      // チェックボックスまたはラジオボタン
      const input = document.createElement('input');
      input.type = options.allowMultiple ? 'checkbox' : 'radio';
      input.name = options.allowMultiple ? 'bot' : 'bot-selection';
      input.value = bot.bot_user_id;
      input.style.cssText = `
        width: 20px;
        height: 20px;
        accent-color: #ffd700;
      `;

      // ボット情報
      const botInfo = document.createElement('div');
      botInfo.style.cssText = `
        flex: 1;
      `;
      
      const botId = document.createElement('div');
      botId.textContent = `Bot ID: ${bot.bot_user_id}`;
      botId.style.cssText = `
        color: #ffd700;
        font-weight: bold;
        margin-bottom: 5px;
      `;
      
      const botStatus = document.createElement('div');
      botStatus.textContent = bot.isParticipating ? '参加中' : '待機中';
      botStatus.style.cssText = `
        color: ${bot.isParticipating ? '#4CAF50' : '#FFC107'};
        font-size: 0.9rem;
      `;
      
      botInfo.appendChild(botId);
      botInfo.appendChild(botStatus);

      botItem.appendChild(input);
      botItem.appendChild(botInfo);

      // クリックイベント
      botItem.addEventListener('click', () => {
        if (options.allowMultiple) {
          input.checked = !input.checked;
        } else {
          // ラジオボタンの場合、他の選択を解除
          botList.querySelectorAll('input[type="radio"]').forEach((radio: HTMLInputElement) => {
            radio.checked = false;
          });
          input.checked = true;
        }
        
        if (input.checked) {
          selectedBots.add(bot.bot_user_id);
          botItem.style.background = 'rgba(255, 215, 0, 0.2)';
          botItem.style.borderColor = 'rgba(255, 215, 0, 0.6)';
        } else {
          selectedBots.delete(bot.bot_user_id);
          botItem.style.background = 'rgba(255, 215, 0, 0.1)';
          botItem.style.borderColor = 'rgba(255, 215, 0, 0.3)';
        }
      });

      botList.appendChild(botItem);
    });

    // ボタンコンテナを作成
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
    `;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = '参加';
    confirmButton.style.cssText = `
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 12px 30px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.cssText = `
      background: transparent;
      color: #ff6b6b;
      border: 2px solid #ff6b6b;
      border-radius: 10px;
      padding: 12px 30px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    `;

    // ホバーエフェクト
    confirmButton.addEventListener('mouseenter', () => {
      confirmButton.style.transform = 'translateY(-2px)';
      confirmButton.style.boxShadow = '0 5px 15px rgba(255, 215, 0, 0.4)';
    });
    
    confirmButton.addEventListener('mouseleave', () => {
      confirmButton.style.transform = 'translateY(0)';
      confirmButton.style.boxShadow = 'none';
    });

    cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.background = 'rgba(255, 107, 107, 0.1)';
      cancelButton.style.transform = 'translateY(-2px)';
    });
    
    cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.background = 'transparent';
      cancelButton.style.transform = 'translateY(0)';
    });

    // イベントリスナー
    confirmButton.addEventListener('click', () => {
      const selectedBotInfos = options.bots.filter(bot => selectedBots.has(bot.bot_user_id));
      document.body.removeChild(overlay);
      resolve(selectedBotInfos);
    });

    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve([]);
    });

    // オーバーレイクリックでキャンセル
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        resolve([]);
      }
    });

    // ESCキーでキャンセル
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleKeyDown);
        resolve([]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);

    modal.appendChild(header);
    modal.appendChild(botList);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  });
}
