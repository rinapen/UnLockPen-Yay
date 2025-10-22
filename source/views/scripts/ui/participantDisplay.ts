// 参加者表示管理クラス
export interface ParticipantInfo {
  bot_user_id: string;
  agoraInfo?: any;
  joined_at: string;
  status: 'connected' | 'disconnected' | 'error' | 'joining';
  mode: 'music' | 'fuck' | 'kuso';
  isExternal?: boolean; // 外部ユーザー（通話検索で見つかったユーザー）
}

class ParticipantManager {
  private participants: Map<string, ParticipantInfo> = new Map();
  private container: HTMLElement | null = null;
  private externalUsers: Set<string> = new Set(); // 外部ユーザーID

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    // 既存のコンテナを削除
    const existing = document.getElementById('participant-display');
    if (existing) {
      existing.remove();
    }

    // 新しいコンテナを作成
    this.container = document.createElement('div');
    this.container.id = 'participant-display';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 70vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 2px solid #ffd700;
      z-index: 1000;
      overflow-y: auto;
      backdrop-filter: blur(10px);
    `;

    // タイトル
    const title = document.createElement('h3');
    title.textContent = '参加ボット一覧';
    title.style.cssText = `
      color: #ffd700;
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      text-align: center;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;

    // 参加者リスト
    const participantList = document.createElement('div');
    participantList.id = 'participant-list';
    participantList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    // 統計情報
    const stats = document.createElement('div');
    stats.id = 'participant-stats';
    stats.style.cssText = `
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #4a5568;
      color: #ffd700;
      font-size: 14px;
      text-align: center;
    `;

    this.container.appendChild(title);
    this.container.appendChild(participantList);
    this.container.appendChild(stats);

    document.body.appendChild(this.container);
    this.updateStats();
  }

  // 外部ユーザー情報を設定（通話検索結果から）
  setExternalUsers(userIds: string[]): void {
    this.externalUsers = new Set(userIds);
    this.updateParticipantStatuses();
  }

  // 参加者を追加
  addParticipant(participant: ParticipantInfo): void {
    this.participants.set(participant.bot_user_id, participant);
    this.renderParticipant(participant);
    this.updateStats();
  }

  // 参加者を削除
  removeParticipant(botUserId: string): void {
    this.participants.delete(botUserId);
    const element = document.getElementById(`participant-${botUserId}`);
    if (element) {
      element.remove();
    }
    this.updateStats();
  }

  // 参加者の状態を更新
  updateParticipantStatus(botUserId: string, status: ParticipantInfo['status'], agoraInfo?: any): void {
    const participant = this.participants.get(botUserId);
    if (participant) {
      participant.status = status;
      if (agoraInfo) {
        participant.agoraInfo = agoraInfo;
      }
      this.renderParticipant(participant);
    }
  }

  // 参加者状態を外部ユーザー情報に基づいて更新
  private updateParticipantStatuses(): void {
    this.participants.forEach((participant, botUserId) => {
      const isExternal = this.externalUsers.has(botUserId);
      participant.isExternal = isExternal;
      
      // 外部ユーザーに存在する場合のみ参加中として扱う
      if (isExternal) {
        // 外部ユーザーに存在する場合は参加中
        if (participant.status !== 'connected') {
          participant.status = 'connected';
        }
      } else {
        // 外部ユーザーに存在しない場合は参加していない
        if (participant.status === 'connected') {
          participant.status = 'disconnected';
        }
      }
      
      this.renderParticipant(participant);
    });
  }

  // 参加者をレンダリング
  private renderParticipant(participant: ParticipantInfo): void {
    const existingElement = document.getElementById(`participant-${participant.bot_user_id}`);
    if (existingElement) {
      existingElement.remove();
    }

    const participantElement = document.createElement('div');
    participantElement.id = `participant-${participant.bot_user_id}`;
    participantElement.className = 'participant-item';
    
    const statusConfig = this.getStatusConfig(participant.status);
    
    participantElement.style.cssText = `
      background: linear-gradient(135deg, ${statusConfig.bgColor} 0%, ${statusConfig.bgColor2} 100%);
      border: 2px solid ${statusConfig.borderColor};
      border-radius: 10px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      ${statusConfig.glow ? `box-shadow: 0 0 15px ${statusConfig.glow};` : ''}
    `;

    // ステータスアイコン
    const statusIcon = document.createElement('div');
    statusIcon.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${statusConfig.iconColor};
      ${statusConfig.pulse ? 'animation: pulse 2s infinite;' : ''}
    `;

    // ボットID
    const botId = document.createElement('span');
    botId.textContent = participant.bot_user_id;
    botId.style.cssText = `
      color: white;
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    `;

    // モード表示
    const mode = document.createElement('span');
    mode.textContent = this.getModeText(participant.mode);
    mode.style.cssText = `
      color: #ffd700;
      font-size: 12px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 215, 0, 0.2);
    `;

    // 外部ユーザー表示
    const externalBadge = document.createElement('span');
    if (participant.isExternal) {
      externalBadge.textContent = '外部';
      externalBadge.style.cssText = `
        color: #10b981;
        font-size: 10px;
        font-weight: 500;
        padding: 2px 4px;
        border-radius: 3px;
        background: rgba(16, 185, 129, 0.2);
      `;
    }

    // 参加時間
    const joinedTime = document.createElement('span');
    const time = new Date(participant.joined_at).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    joinedTime.textContent = time;
    joinedTime.style.cssText = `
      color: #9ca3af;
      font-size: 10px;
    `;

    participantElement.appendChild(statusIcon);
    participantElement.appendChild(botId);
    participantElement.appendChild(mode);
    if (participant.isExternal) {
      participantElement.appendChild(externalBadge);
    }
    participantElement.appendChild(joinedTime);

    // ホバーエフェクト
    participantElement.addEventListener('mouseenter', () => {
      participantElement.style.transform = 'translateX(-5px)';
    });
    participantElement.addEventListener('mouseleave', () => {
      participantElement.style.transform = 'translateX(0)';
    });

    const participantList = document.getElementById('participant-list');
    if (participantList) {
      participantList.appendChild(participantElement);
    }
  }

  // ステータス設定を取得
  private getStatusConfig(status: ParticipantInfo['status']) {
    switch (status) {
      case 'connected':
        return {
          bgColor: '#1f2937',
          bgColor2: '#374151',
          borderColor: '#10b981',
          iconColor: '#10b981',
          glow: 'rgba(16, 185, 129, 0.3)',
          pulse: false
        };
      case 'joining':
        return {
          bgColor: '#1f2937',
          bgColor2: '#374151',
          borderColor: '#f59e0b',
          iconColor: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.3)',
          pulse: true
        };
      case 'disconnected':
        return {
          bgColor: '#1f2937',
          bgColor2: '#374151',
          borderColor: '#6b7280',
          iconColor: '#6b7280',
          glow: null,
          pulse: false
        };
      case 'error':
        return {
          bgColor: '#1f2937',
          bgColor2: '#374151',
          borderColor: '#ef4444',
          iconColor: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.3)',
          pulse: false
        };
      default:
        return {
          bgColor: '#1f2937',
          bgColor2: '#374151',
          borderColor: '#6b7280',
          iconColor: '#6b7280',
          glow: null,
          pulse: false
        };
    }
  }

  // モードテキストを取得
  private getModeText(mode: ParticipantInfo['mode']): string {
    switch (mode) {
      case 'music': return '🎪';
      case 'fuck': return '👂';
      case 'kuso': return '巨';
      default: return '❓';
    }
  }

  // 統計情報を更新
  private updateStats(): void {
    const stats = document.getElementById('participant-stats');
    if (!stats) return;

    const total = this.participants.size;
    const connected = Array.from(this.participants.values()).filter(p => p.status === 'connected').length;
    const external = Array.from(this.participants.values()).filter(p => p.isExternal).length;

    stats.innerHTML = `
      <div>総数: ${total} | 接続中: ${connected} | 外部: ${external}</div>
    `;
  }

  // 参加者一覧を表示/非表示
  show(): void {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  // 参加者一覧を設定
  showParticipants(participants: ParticipantInfo[]): void {
    this.participants.clear();
    participants.forEach(participant => {
      this.participants.set(participant.bot_user_id, participant);
      this.renderParticipant(participant);
    });
    this.updateStats();
  }

  // 参加者一覧をクリア
  clear(): void {
    this.participants.clear();
    const participantList = document.getElementById('participant-list');
    if (participantList) {
      participantList.innerHTML = '';
    }
    this.updateStats();
  }

  // 参加者一覧を取得
  getParticipants(): ParticipantInfo[] {
    return Array.from(this.participants.values());
  }
}

// シングルトンインスタンス
export const participantManager = new ParticipantManager();

// CSS アニメーションを追加
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);
