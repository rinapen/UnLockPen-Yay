import express from 'express';
import { AgoraCacheUtil } from '../../utils/agoraCacheUtil';

const router = express.Router();

// 通話IDのキャッシュ情報を取得
router.get('/cache/:conferenceCallId', async (req: any, res: any) => {
  try {
    const { conferenceCallId } = req.params;
    const cachedBots = await AgoraCacheUtil.getCachedBots(conferenceCallId);
    
    res.json({
      conference_call_id: conferenceCallId,
      bots: cachedBots,
      count: cachedBots.length
    });
  } catch (error) {
    console.error('キャッシュ情報取得エラー:', error);
    res.status(500).json({ error: 'キャッシュ情報の取得に失敗しました' });
  }
});

// 利用可能なボットID一覧を取得
router.get('/cache/:conferenceCallId/bots', async (req: any, res: any) => {
  try {
    const { conferenceCallId } = req.params;
    const availableBotIds = await AgoraCacheUtil.getAvailableBotIds(conferenceCallId);
    
    res.json({
      conference_call_id: conferenceCallId,
      available_bot_ids: availableBotIds,
      count: availableBotIds.length
    });
  } catch (error) {
    console.error('利用可能ボットID取得エラー:', error);
    res.status(500).json({ error: '利用可能ボットIDの取得に失敗しました' });
  }
});

// 特定のボット情報を取得
router.get('/cache/:conferenceCallId/bot/:botId', async (req: any, res: any) => {
  try {
    const { conferenceCallId, botId } = req.params;
    const botInfo = await AgoraCacheUtil.getBotInfo(conferenceCallId, botId);
    
    if (!botInfo) {
      return res.status(404).json({ error: 'ボット情報が見つかりません' });
    }
    
    res.json({
      conference_call_id: conferenceCallId,
      bot_user_id: botId,
      bot_info: botInfo
    });
  } catch (error) {
    console.error('ボット情報取得エラー:', error);
    res.status(500).json({ error: 'ボット情報の取得に失敗しました' });
  }
});

// ボット情報をキャッシュに保存
router.post('/cache/:conferenceCallId/bot/:botId', async (req: any, res: any) => {
  try {
    const { conferenceCallId, botId } = req.params;
    const { agoraInfo } = req.body;
    
    if (!agoraInfo) {
      return res.status(400).json({ error: 'Agora情報が必要です' });
    }
    
    await AgoraCacheUtil.saveBotInfo(conferenceCallId, botId, agoraInfo);
    
    res.json({
      success: true,
      message: `ボット ${botId} の情報をキャッシュに保存しました`
    });
  } catch (error) {
    console.error('ボット情報保存エラー:', error);
    res.status(500).json({ error: 'ボット情報の保存に失敗しました' });
  }
});

// ボット情報をキャッシュから削除
router.delete('/cache/:conferenceCallId/bot/:botId', async (req: any, res: any) => {
  try {
    const { conferenceCallId, botId } = req.params;
    
    await AgoraCacheUtil.removeBotInfo(conferenceCallId, botId);
    
    res.json({
      success: true,
      message: `ボット ${botId} の情報をキャッシュから削除しました`
    });
  } catch (error) {
    console.error('ボット情報削除エラー:', error);
    res.status(500).json({ error: 'ボット情報の削除に失敗しました' });
  }
});

// キャッシュが存在するかチェック
router.get('/cache/:conferenceCallId/exists', async (req: any, res: any) => {
  try {
    const { conferenceCallId } = req.params;
    const hasCache = await AgoraCacheUtil.hasCache(conferenceCallId);
    
    res.json({
      conference_call_id: conferenceCallId,
      has_cache: hasCache
    });
  } catch (error) {
    console.error('キャッシュ存在チェックエラー:', error);
    res.status(500).json({ error: 'キャッシュ存在チェックに失敗しました' });
  }
});

// 参加中のボット一覧を取得
router.get('/cache/:conferenceCallId/participating', async (req: any, res: any) => {
  try {
    const { conferenceCallId } = req.params;
    
    // 現在の通話に参加中のボットを取得
    // 実際の実装では、Agoraのチャンネル情報やRTMの参加者情報から取得
    // ここでは簡易的にキャッシュされたボットを返す
    const cachedBots = await AgoraCacheUtil.getCachedBots(conferenceCallId);
    const participatingBots = cachedBots.map(bot => bot.bot_user_id);
    
    res.json({
      conference_call_id: conferenceCallId,
      participating_bots: participatingBots,
      count: participatingBots.length
    });
  } catch (error) {
    console.error('参加中ボット取得エラー:', error);
    res.status(500).json({ error: '参加中ボットの取得に失敗しました' });
  }
});

// 古いキャッシュをクリーンアップ
router.post('/cache/cleanup', async (req: any, res: any) => {
  try {
    await AgoraCacheUtil.cleanupOldCache();
    
    res.json({
      success: true,
      message: '古いキャッシュのクリーンアップが完了しました'
    });
  } catch (error) {
    console.error('キャッシュクリーンアップエラー:', error);
    res.status(500).json({ error: 'キャッシュクリーンアップに失敗しました' });
  }
});

export default router;
