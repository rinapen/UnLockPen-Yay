import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { botStatusResponse } from "./types";
import { playTrack, sendMessage, sendEmoji } from "../utils/agoraActions";
import { NotificationManager } from "../utils/notificationManager";
import { MicPermissionChecker } from "../utils/micPermissionChecker";
import { handleJakiMode } from "./mode/jaki";

import { handleBankaiMode, handleManabunMode } from "./mode/kamex";
import handleMakinoMode from "./mode/makino";
import { handleGojoMode, handleMusicMode, handleEdenMode } from "./mode/rinapen";
import { handleWiruMode } from "./mode/wiru";
import { handleKimetsuMode } from "./mode/kimetsu";
import handleShingekiMode from "./mode/beruma";
import { showBotSelector } from "../ui/botSelector";
import { participantManager } from "../ui/participantDisplay";

let bot_id = "";

export function setupFuckBotUI(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel) {
  const container = document.getElementById("fuck-bot-ui");
  const buttonsDiv = document.getElementById("emoji-buttons");

  if (!container || !buttonsDiv) return;

  // 他のUIを非表示にする
  const kimetsuBotUI = document.getElementById("kimetsu-bot-ui");
  if (kimetsuBotUI) {
    kimetsuBotUI.style.display = "none";
  }

  // UIを表示
  container.style.display = "block";

  const emojis = [
    "🖕", "🧊", "💩", "😂", "🔥", "🤬", "😡", "👿", "🤡",
    "👺", "😈", "🥶", "😤", "😵", "😹", "🥵", "🫠", "🙃",
    "🤢", "🤮", "💀", "☠️", "👻", "🙀", "🗿", "📢", "📣",
    "🧨", "💥", "🪓", "🔪", "🛠️", "🚨", "🚬", "🍺", "🍷",
    "🥴", "🪦", "🛸", "🧠", "🫥", "🔊", "🎺", "📛", "🧷",
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
    "る", "れ", "ろ", "わ", "を", "ん"
  ];

  buttonsDiv.innerHTML = "";

  const requestBtn = document.createElement("button");
  requestBtn.className = "btn btn-warning btn-lg mb-3 me-2";
  requestBtn.textContent = "🎙️ ミュート解除";
  requestBtn.addEventListener("click", () => rtmChannel.sendMessage({ text: `requestLiftAudioMute`}));
  buttonsDiv.appendChild(requestBtn);

  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group mb-3";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control";
  input.placeholder = "文字列を入力してください";
  input.id = "emoji-input";

  const sendBtn = document.createElement("button");
  sendBtn.className = "btn btn-success";
  sendBtn.textContent = "送信";
  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    for (const char of text) {
      await sendEmoji(char, rtmChannel);
      await new Promise(res => setTimeout(res, 150)); // 少し間隔をあける
    }
    input.value = "";
  });

  inputGroup.appendChild(input);
  inputGroup.appendChild(sendBtn);
  buttonsDiv.appendChild(inputGroup);

  emojis.forEach(emoji => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-light btn-lg mb-2 me-2";
    btn.textContent = emoji;
    btn.addEventListener("click", () => sendEmoji(emoji, rtmChannel));
    buttonsDiv.appendChild(btn);
  });

  container.style.display = "block";
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;

    // if (typeof msgText === "string") {
    //   const sounds = [
    //     "/assets/audio/fuck/ganbare.mp3",
    //     "/assets/audio/wiru/nigeruna.mp3",
    //   ];
    //   const sound = sounds[Math.floor(Math.random() * sounds.length)];

    //   if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
    //     await playTrack(sound, false, 1000, rtcClient);
    //   }
    // }
  });
}

export async function joinCall(conference_call_id: string, mode: string): Promise<void> {
  const notificationManager = NotificationManager.getInstance();
  
  try {
    console.log(`通話 ${conference_call_id} への参加処理を開始します`);

    let botId: string = '';
    let agoraInfo: any;
    let useCache = false;

    // まず通常の参加を試行
    try {
      botId = await getAvailableBotId();
      agoraInfo = await getAgoraInfo(botId, conference_call_id);
      console.log('通常の通話参加を試行中...');
    } catch (error) {
      console.log('通常の通話参加に失敗、キャッシュを確認中...', error);
      
      // 参加できない通話の場合、キャッシュを確認
      if (error.message === "unjoinable_call") {
        console.log('BOTが参加できない通話のため、キャッシュされたデータを使用します。');
      }
      
      const cachedBots = await getCachedBots(conference_call_id);
      if (cachedBots.length > 0) {
        console.log(`✅ キャッシュから ${cachedBots.length} 個のボット情報を発見`);
        
        // 利用可能なボットIDを表示
        const availableBotIds = cachedBots.map(bot => bot.bot_user_id);
        console.log(`🎯 利用可能なボットID:`, availableBotIds);
        
        const selectedBotIds = await selectBotFromCache(availableBotIds, conference_call_id);
        console.log(`🎯 選択されたボットID:`, selectedBotIds);
        
        if (selectedBotIds.length > 0) {
          // 複数ボットで参加
          console.log(`🚀 選択されたボットで参加処理を開始します`);
          await joinCallWithSelectedBots(conference_call_id, selectedBotIds, mode);
          return; // 複数ボット参加の場合はここで終了
        } else {
          // ボットが選択されなかった場合（キャンセル）
          console.log('⚠️ ボットが選択されませんでした。参加をキャンセルします。');
          return;
        }
      } else {
        console.log(`❌ キャッシュにボット情報が見つかりませんでした`);
      }
      
      if (!useCache) {
        if (error.message === "unjoinable_call") {
          throw new Error('BOTが参加できない通話で、利用可能なキャッシュもありません');
        } else {
          throw new Error('通常参加に失敗し、利用可能なキャッシュもありません');
        }
      }
    }

    const { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid } = agoraInfo;

    if (!APP_ID || !agora_rtm_token || !agora_channel_token || !agora_channel || !conference_call_user_uuid) {
      throw new Error("Agora情報が不完全");
    }

    const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const rtmClient: RtmClient = AgoraRTM.createInstance(APP_ID);

    try {
      await rtmClient.login({ token: agora_rtm_token, uid: conference_call_user_uuid });
    } catch (error) {
      throw new Error("RTMログインに失敗しました。トークンの有効期限を確認してください。");
    }

    const rtmChannel: RtmChannel = rtmClient.createChannel(agora_channel);
    
    try {
      await rtmChannel.join();
    } catch (error) {
      throw new Error("RTMチャンネルへの参加に失敗しました。");
    }

    try {
      await rtcClient.join(APP_ID, agora_channel, agora_channel_token, conference_call_user_uuid);
    } catch (error) {
      throw new Error("RTCチャンネルへの参加に失敗しました。通話が終了している可能性があります。");
    }
    rtcClient.enableAudioVolumeIndicator();

    // 通常参加が成功した場合、バックエンドで既にキャッシュに保存済み
    if (!useCache) {
      console.log(`ボット ${botId} の情報はバックエンドでキャッシュに保存されました`);
    }

    // 参加したボット情報を表示
    participantManager.addParticipant({
      bot_user_id: botId,
      agoraInfo: agoraInfo,
      joined_at: new Date().toISOString(),
      status: 'connected',
      mode: mode
    });

    if (mode === "shingeki") {
      await handleShingekiMode(botId, rtmChannel, rtcClient);
    } else if (mode === "jaki") {
      await handleJakiMode(botId, rtmChannel, rtcClient);
    } else if (mode === "bankai") {
      await handleBankaiMode(botId, rtmChannel, rtcClient);
    } else if (mode === "manabun") {
      await handleManabunMode(botId, rtmChannel, rtcClient);
    } else if (mode === "makino") {
      await handleMakinoMode(botId, rtmChannel, rtcClient);
    } else if (mode === "gojo") {
      await handleGojoMode(botId, rtmChannel, rtcClient);
    } else if (mode === "music") {
      await handleMusicMode(botId, rtmChannel, rtcClient);
    } else if (mode === "wiru") {
      await handleWiruMode(botId, rtmChannel, rtcClient);
    } else if (mode === "eden") {
      await handleEdenMode(botId, rtmChannel, rtcClient);
    } else if (mode === "kimetsu") {
      console.log("鬼滅モードが実行されています。mode値:", mode);
      handleKimetsuMode(botId, rtcClient, rtmChannel);
    } else if (mode === "fuck") {
      console.log("fuckモードが実行されています");
      setupFuckBotUI(rtcClient, rtmChannel);
      
      // マイクの状態を事前チェック
      const micStatus = await MicPermissionChecker.checkMicStatus();
      if (!micStatus.available) {
        console.warn("マイクが利用できません:", micStatus.reason);
        notificationManager.showWarning(`マイクが利用できません: ${micStatus.reason}。絵文字送信モードのみで動作します。`);
      } else {
        try {
          const localTrack: IMicrophoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          await rtcClient.publish([localTrack]);
        } catch (micError) {
          console.warn("マイクトラックの作成に失敗しました。絵文字送信モードのみで動作します。", micError);
          notificationManager.showWarning("マイクトラックの作成に失敗しました。絵文字送信モードのみで動作します。");
        }
      }
    }

    rtcClient.on("user-published", async (user, mediaType) => {
      await rtcClient.subscribe(user, mediaType);
      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) remoteAudioTrack.play();
      }
    });

    rtcClient.on("user-unpublished", (user) => {
      const remoteAudioTrack = user.audioTrack;
      if (remoteAudioTrack) remoteAudioTrack.stop();
    });

    rtcClient.on("volume-indicator", (volumes) => {
      volumes.forEach(vol => {
        const el = document.querySelector(`#user-${vol.uid} .mic-icon`);
        if (el) el.classList.toggle("muted", vol.level < 5);
      });
    });

  } catch (err) {
    console.error("❌ joinCall中にエラー:", err);
    const notificationManager = NotificationManager.getInstance();
    notificationManager.showConnectionError(`接続エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
    throw err; // エラーを再スローしてhandleJoinClickに伝播させる
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateUserUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUserUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUserUUID());
}

// 利用可能なボットIDを取得
async function getAvailableBotId(): Promise<string> {
  while (true) {
    const botIdRes = await fetch("/api/bot-api/random_bot_id");
    if (!botIdRes.ok) throw new Error("BOT IDの取得に失敗");

    const { bot } = await botIdRes.json();
    const botStatusRes = await fetch(`/api/bot-api/${bot.id}/status`);
    if (!botStatusRes.ok) throw new Error("BOTの状態取得に失敗");

    const botStatusData: botStatusResponse = await botStatusRes.json();
    if (!botStatusData.bot.isActive) {
      return bot.id;
    }

    await new Promise(res => setTimeout(res, 10));
  }
}

// Agora情報を取得
async function getAgoraInfo(botId: string, conferenceCallId: string): Promise<any> {
  const agoraInfoRes = await fetch(`/api/agora-api/agora_info?bot_id=${botId}&conference_call_id=${conferenceCallId}`);
  
  if (agoraInfoRes.status === 403) {
    // 参加できない通話の場合
    throw new Error("unjoinable_call");
  }
  
  if (!agoraInfoRes.ok) {
    throw new Error("Agora情報の取得に失敗");
  }
  
  return await agoraInfoRes.json();
}

// キャッシュされたボット一覧を取得
async function getCachedBots(conferenceCallId: string): Promise<any[]> {
  console.log(`🔍 キャッシュ情報を取得中: ${conferenceCallId}`);
  try {
    const response = await fetch(`/api/agora-cache-api/cache/${conferenceCallId}`);
    console.log(`📡 APIレスポンス: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ キャッシュ取得失敗: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`📦 キャッシュデータ:`, data);
    console.log(`📊 ボット数: ${data.bots ? data.bots.length : 0}`);
    
    if (data.bots && data.bots.length > 0) {
      console.log(`✅ 利用可能なボット:`, data.bots.map(bot => bot.bot_user_id));
    } else {
      console.log(`⚠️ 利用可能なボットがありません`);
    }
    
    return data.bots || [];
  } catch (error) {
    console.error(`💥 キャッシュ取得エラー:`, error);
    return [];
  }
}

// 特定のボット情報をキャッシュから取得
async function getCachedBotInfo(conferenceCallId: string, botId: string): Promise<any> {
  console.log(`🔍 ボット情報を取得中: ${conferenceCallId}/${botId}`);
  try {
    const response = await fetch(`/api/agora-cache-api/cache/${conferenceCallId}/bot/${botId}`);
    console.log(`📡 ボット情報APIレスポンス: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ ボット情報取得失敗: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`📦 ボット情報データ:`, data);
    return data.bot_info || null;
  } catch (error) {
    console.error(`💥 ボット情報取得エラー:`, error);
    return null;
  }
}

// キャッシュからボットを選択
async function selectBotFromCache(availableBotIds: string[], conferenceCallId: string): Promise<string[]> {
  try {
    // 現在参加中のボットを取得
    const participatingBots = await getParticipatingBots(conferenceCallId);
    
    // ボット情報を準備（参加状態を正確に判定）
    const botInfos = availableBotIds.map(botId => ({
      bot_user_id: botId,
      agoraInfo: null, // 後で取得
      joined_at: new Date().toISOString(),
      isParticipating: false // キャッシュされたボットは参加していない状態
    }));

    // ボット選択UIを表示
    const selectedBots = await showBotSelector({
      title: 'ボット選択',
      message: 'BOTが参加できない通話のため、過去に参加したボットを使用します。\n参加するボットを選択してください：',
      bots: botInfos,
      allowMultiple: true
    });

    return selectedBots.map(bot => bot.bot_user_id);
  } catch (error) {
    console.log('ボット選択がキャンセルされました');
    return [];
  }
}

// 現在参加中のボットを取得
async function getParticipatingBots(conferenceCallId: string): Promise<string[]> {
  try {
    // 現在の通話に参加中のボットを取得するAPIを呼び出し
    const response = await fetch(`/api/agora-cache-api/cache/${conferenceCallId}/participating`);
    if (response.ok) {
      const data = await response.json();
      return data.participating_bots || [];
    }
    return [];
  } catch (error) {
    console.error('参加中ボット取得エラー:', error);
    return [];
  }
}

// 選択されたボットで参加
async function joinCallWithSelectedBots(conferenceCallId: string, selectedBotIds: string[], mode: string): Promise<void> {
  try {
    console.log(`選択されたボットで参加開始: ${selectedBotIds.join(', ')}`);
    
    // 参加者表示を初期化
    participantManager.showParticipants([]);
    
    // 各ボットで参加
    const joinPromises = selectedBotIds.map(async (botId) => {
      try {
        // 参加開始時に「参加中」状態で表示
        participantManager.addParticipant({
          bot_user_id: botId,
          agoraInfo: null,
          joined_at: new Date().toISOString(),
          status: 'joining',
          mode: mode
        });

        const result = await joinCallWithCachedBot(conferenceCallId, botId, mode);
        console.log(`✅ ボット ${botId} で参加しました`);
        
        // 参加成功時に状態を更新
        participantManager.updateParticipantStatus(botId, 'connected', result.agoraInfo);
        
        return { success: true, botId, agoraInfo: result.agoraInfo };
      } catch (error) {
        console.error(`❌ ボット ${botId} の参加に失敗:`, error);
        
        // 参加失敗時に状態を更新
        participantManager.updateParticipantStatus(botId, 'error');
        
        return { success: false, botId, error };
      }
    });

    const results = await Promise.allSettled(joinPromises);
    
    // 結果を集計
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;
    
    console.log(`参加結果: 成功 ${successful}個, 失敗 ${failed}個`);
    
    if (successful === 0) {
      throw new Error('すべてのボットの参加に失敗しました');
    }
  } catch (error) {
    console.error('選択ボット参加エラー:', error);
    throw error;
  }
}

// 複数ボットで参加（従来の機能）
export async function joinCallWithMultipleBots(conferenceCallId: string, mode: string, botCount: number = 1): Promise<void> {
  try {
    const cachedBots = await getCachedBots(conferenceCallId);
    const availableBotIds = cachedBots.map(bot => bot.bot_user_id);
    
    if (availableBotIds.length === 0) {
      throw new Error('利用可能なキャッシュされたボットがありません');
    }

    const botsToUse = availableBotIds.slice(0, Math.min(botCount, availableBotIds.length));
    
    if (botsToUse.length < botCount) {
      alert(`要求された ${botCount} 個のボットのうち、${botsToUse.length} 個のボットのみ利用可能です。\n利用可能なボット: ${botsToUse.join(', ')}`);
    }

    await joinCallWithSelectedBots(conferenceCallId, botsToUse, mode);
  } catch (error) {
    console.error('複数ボット参加エラー:', error);
    throw error;
  }
}

// キャッシュされたボットで参加
async function joinCallWithCachedBot(conferenceCallId: string, botId: string, mode: string): Promise<{ agoraInfo: any }> {
  const cachedBotInfo = await getCachedBotInfo(conferenceCallId, botId);
  if (!cachedBotInfo) {
    throw new Error(`ボット ${botId} のキャッシュ情報が見つかりません`);
  }

  const agoraInfo = cachedBotInfo.agoraInfo;
  const { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid } = agoraInfo;

  const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  const rtmClient: RtmClient = AgoraRTM.createInstance(APP_ID);

  await rtmClient.login({ token: agora_rtm_token, uid: conference_call_user_uuid });
  const rtmChannel: RtmChannel = rtmClient.createChannel(agora_channel);
  await rtmChannel.join();

  await rtcClient.join(APP_ID, agora_channel, agora_channel_token, conference_call_user_uuid);
  rtcClient.enableAudioVolumeIndicator();

  // モードに応じた処理を実行
  if (mode === "shingeki") {
    await handleShingekiMode(botId, rtmChannel, rtcClient);
  } else if (mode === "jaki") {
    await handleJakiMode(botId, rtmChannel, rtcClient);
  } else if (mode === "bankai") {
    await handleBankaiMode(botId, rtmChannel, rtcClient);
  } else if (mode === "manabun") {
    await handleManabunMode(botId, rtmChannel, rtcClient);
  } else if (mode === "makino") {
    await handleMakinoMode(botId, rtmChannel, rtcClient);
  } else if (mode === "gojo") {
    await handleGojoMode(botId, rtmChannel, rtcClient);
  } else if (mode === "music") {
    await handleMusicMode(botId, rtmChannel, rtcClient);
  } else if (mode === "wiru") {
    await handleWiruMode(botId, rtmChannel, rtcClient);
  } else if (mode === "eden") {
    await handleEdenMode(botId, rtmChannel, rtcClient);
  } else if (mode === "kimetsu") {
    handleKimetsuMode(botId, rtcClient, rtmChannel);
  } else if (mode === "fuck") {
    setupFuckBotUI(rtcClient, rtmChannel);
  }

  // イベントリスナーを設定
  rtcClient.on("user-published", async (user, mediaType) => {
    await rtcClient.subscribe(user, mediaType);
    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.play();
    }
  });

  rtcClient.on("user-unpublished", (user) => {
    if (user.audioTrack) user.audioTrack.stop();
  });

  rtcClient.on("volume-indicator", (volumes) => {
    volumes.forEach(vol => {
      const el = document.querySelector(`#user-${vol.uid} .mic-icon`);
      if (el) el.classList.toggle("muted", vol.level < 5);
    });
  });

  return { agoraInfo };
}