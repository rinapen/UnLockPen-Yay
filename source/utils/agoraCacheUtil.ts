import { AgoraCacheModel, BotInfo } from '../models/AgoraCache';

export class AgoraCacheUtil {
  /**
   * 通話IDに基づいてキャッシュされたボット情報を取得
   */
  static async getCachedBots(conferenceCallId: string): Promise<BotInfo[]> {
    try {
      const cache = await AgoraCacheModel.findOne({ conference_call_id: conferenceCallId });
      return cache ? cache.bots : [];
    } catch (error) {
      console.error('AgoraCache取得エラー:', error);
      return [];
    }
  }

  /**
   * ボット情報をキャッシュに保存
   */
  static async saveBotInfo(
    conferenceCallId: string, 
    botUserId: string, 
    agoraInfo: any
  ): Promise<void> {
    try {
      const botInfo: BotInfo = {
        bot_user_id: botUserId,
        agoraInfo: {
          token: agoraInfo.token,
          channel: agoraInfo.channel,
          uid: agoraInfo.uid,
          appId: agoraInfo.appId,
          ...agoraInfo
        },
        joined_at: new Date()
      };

      await AgoraCacheModel.findOneAndUpdate(
        { conference_call_id: conferenceCallId },
        {
          $addToSet: { bots: botInfo },
          $setOnInsert: { created_at: new Date() },
          $set: { updated_at: new Date() }
        },
        { upsert: true, new: true }
      );

      console.log(`ボット ${botUserId} の情報をキャッシュに保存しました`);
    } catch (error) {
      console.error('AgoraCache保存エラー:', error);
    }
  }

  /**
   * 指定されたボットIDの情報を取得
   */
  static async getBotInfo(conferenceCallId: string, botUserId: string): Promise<BotInfo | null> {
    try {
      const cache = await AgoraCacheModel.findOne({ 
        conference_call_id: conferenceCallId,
        'bots.bot_user_id': botUserId
      });

      if (cache) {
        const botInfo = cache.bots.find(bot => bot.bot_user_id === botUserId);
        return botInfo || null;
      }
      return null;
    } catch (error) {
      console.error('ボット情報取得エラー:', error);
      return null;
    }
  }

  /**
   * 利用可能なボットIDの一覧を取得
   */
  static async getAvailableBotIds(conferenceCallId: string): Promise<string[]> {
    try {
      const cache = await AgoraCacheModel.findOne({ conference_call_id: conferenceCallId });
      return cache ? cache.bots.map(bot => bot.bot_user_id) : [];
    } catch (error) {
      console.error('利用可能ボットID取得エラー:', error);
      return [];
    }
  }

  /**
   * ボット情報を削除
   */
  static async removeBotInfo(conferenceCallId: string, botUserId: string): Promise<void> {
    try {
      await AgoraCacheModel.findOneAndUpdate(
        { conference_call_id: conferenceCallId },
        { $pull: { bots: { bot_user_id: botUserId } } }
      );
      console.log(`ボット ${botUserId} の情報をキャッシュから削除しました`);
    } catch (error) {
      console.error('ボット情報削除エラー:', error);
    }
  }

  /**
   * 古いキャッシュをクリーンアップ（30日以上古いもの）
   */
  static async cleanupOldCache(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await AgoraCacheModel.deleteMany({
        updated_at: { $lt: thirtyDaysAgo }
      });

      console.log(`${result.deletedCount}件の古いキャッシュを削除しました`);
    } catch (error) {
      console.error('キャッシュクリーンアップエラー:', error);
    }
  }

  /**
   * 通話IDのキャッシュが存在するかチェック
   */
  static async hasCache(conferenceCallId: string): Promise<boolean> {
    try {
      const cache = await AgoraCacheModel.findOne({ conference_call_id: conferenceCallId });
      return !!cache;
    } catch (error) {
      console.error('キャッシュ存在チェックエラー:', error);
      return false;
    }
  }
}
