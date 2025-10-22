export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export class NotificationManager {
  private static instance: NotificationManager;
  private notificationCount = 0;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public showNotification(message: string, type: NotificationType = 'info', duration: number = 5000): void {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.bot-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `bot-notification alert alert-${this.getBootstrapAlertType(type)} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 350px; max-width: 500px;';
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${this.getIcon(type)} me-2"></i>
        <div class="flex-grow-1">
          <strong>${this.getTitle(type)}</strong><br>
          ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    document.body.appendChild(notification);

    // 指定時間後に自動削除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }

  private getBootstrapAlertType(type: NotificationType): string {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-triangle';
      case 'warning': return 'fa-exclamation-circle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    }
  }

  private getTitle(type: NotificationType): string {
    switch (type) {
      case 'success': return '成功';
      case 'error': return 'エラー';
      case 'warning': return '警告';
      case 'info': return '情報';
      default: return '情報';
    }
  }

  // BOT参加エラーの通知
  public showBotJoinError(error: string): void {
    this.showNotification(
      `BOTの参加に失敗しました: ${error}`,
      'error',
      8000
    );
  }

  // BOT参加成功の通知
  public showBotJoinSuccess(botType: string): void {
    this.showNotification(
      `${botType}が正常に参加しました！`,
      'success',
      5000
    );
  }

  // 接続エラーの通知
  public showConnectionError(error: string): void {
    this.showNotification(
      `接続エラー: ${error}`,
      'error',
      8000
    );
  }

  // 音量調整の通知
  public showVolumeAdjustment(trackCount: number): void {
    this.showNotification(
      `${trackCount}個のBOTの音量を調整しました`,
      'info',
      3000
    );
  }

  // 警告通知
  public showWarning(message: string): void {
    this.showNotification(
      message,
      'warning',
      6000
    );
  }
}
