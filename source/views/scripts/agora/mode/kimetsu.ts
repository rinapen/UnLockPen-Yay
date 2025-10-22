import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { sendMessage, sendEmoji, playTrack } from "../../utils/agoraActions";
import { RtmChannel } from "agora-rtm-sdk";

// 鬼滅の刃 呼吸法の技名データ
const breathingTechniques = {
  water: {
    name: "水の呼吸",
    emoji: "💧",
    techniques: [
      "壱ノ型 水面斬り",
      "弐ノ型 水車",
      "参ノ型 流流舞い",
      "肆ノ型 打ち潮",
      "伍ノ型 干天の慈雨",
      "陸ノ型 ねじれ渦",
      "漆ノ型 雫波紋突き",
      "捌ノ型 滝壺",
      "玖ノ型 水流飛沫",
      "拾ノ型 生生流転"
    ]
  },
  fire: {
    name: "炎の呼吸",
    emoji: "🔥",
    techniques: [
      "壱ノ型 不知火",
      "弐ノ型 昇り炎天",
      "参ノ型 気炎万象",
      "肆ノ型 盛炎のうねり",
      "伍ノ型 炎虎",
      "陸ノ型 熱界地獄",
      "漆ノ型 煉獄",
      "捌ノ型 煉獄",
      "玖ノ型 煉獄"
    ]
  },
  wind: {
    name: "風の呼吸",
    emoji: "🌪️",
    techniques: [
      "壱ノ型 塵旋風・削ぎ",
      "弐ノ型 爪々・科戸風",
      "参ノ型 晴嵐風樹",
      "肆ノ型 昇上砂塵嵐",
      "伍ノ型 木枯らし颪",
      "陸ノ型 黒風煙嵐",
      "漆ノ型 勁風・天狗風",
      "捌ノ型 初烈風斬り",
      "玖ノ型 韋駄天颪"
    ]
  },
  stone: {
    name: "岩の呼吸",
    emoji: "🗿",
    techniques: [
      "壱ノ型 蛇紋岩・双極",
      "弐ノ型 天面砕き",
      "参ノ型 岩軀の膚",
      "肆ノ型 流紋岩・速",
      "伍ノ型 瓦輪刑部"
    ]
  },
  thunder: {
    name: "雷の呼吸",
    emoji: "⚡",
    techniques: [
      "壱ノ型 霹靂一閃",
      "弐ノ型 稲魂",
      "参ノ型 聚蚊成雷",
      "肆ノ型 遠雷",
      "伍ノ型 熱界雷",
      "陸ノ型 電轟雷轟",
      "漆ノ型 火雷神"
    ]
  },
  mist: {
    name: "霞の呼吸",
    emoji: "🌫️",
    techniques: [
      "壱ノ型 垂天遠霞",
      "弐ノ型 八重霞",
      "参ノ型 霞散の飛沫",
      "肆ノ型 移流斬り",
      "伍ノ型 霞雲の海",
      "陸ノ型 月の霞消",
      "漆ノ型 朧"
    ]
  },
  flower: {
    name: "花の呼吸",
    emoji: "🌸",
    techniques: [
      "壱ノ型 霧氷・睡蓮",
      "弐ノ型 御影梅",
      "参ノ型 御影桜",
      "肆ノ型 紅花衣",
      "伍ノ型 徒の芍薬",
      "陸ノ型 渦桃",
      "漆ノ型 陰日向の香",
      "玖ノ型 彩雲燕"
    ]
  },
  snake: {
    name: "蛇の呼吸",
    emoji: "🐍",
    techniques: [
      "壱ノ型 委蛇斬り",
      "弐ノ型 狭頭の毒牙",
      "参ノ型 塒締め",
      "肆ノ型 蜿蜿長蛇",
      "伍ノ型 蜿蜿長蛇"
    ]
  },
  love: {
    name: "恋の呼吸",
    emoji: "💕",
    techniques: [
      "壱ノ型 初恋のわななき",
      "弐ノ型 懊悩巡る恋",
      "参ノ型 恋猫しぐれ",
      "肆ノ型 徒の芍薬",
      "伍ノ型 揺らめく恋情・乱れ爪",
      "陸ノ型 猫足恋風",
      "漆ノ型 斑紋猫足",
      "捌ノ型 恋猫しぐれ"
    ]
  },
  beast: {
    name: "獣の呼吸",
    emoji: "🐺",
    techniques: [
      "壱ノ牙 穿ち抜き",
      "弐ノ牙 切り裂き",
      "参ノ牙 喰い裂き",
      "肆ノ牙 切れ味",
      "伍ノ牙 狂い咲き",
      "陸ノ牙 乱杭",
      "漆ノ牙 空間識覚",
      "捌ノ牙 爆裂猛進",
      "玖ノ牙 伸・うねり裂き",
      "拾ノ牙 転々転々"
    ]
  },
  sound: {
    name: "音の呼吸",
    emoji: "🎵",
    techniques: [
      "壱ノ型 轟",
      "弐ノ型 響斬無間",
      "参ノ型 斬・狂鳴",
      "肆ノ型 響斬無間",
      "伍ノ型 鳴弦奏々"
    ]
  },
  moon: {
    name: "月の呼吸",
    emoji: "🌙",
    techniques: [
      "壱ノ型 闇月・宵の宮",
      "弐ノ型 珠華ノ弄月",
      "参ノ型 厭忌月・銷り",
      "肆ノ型 月魄・渦潮",
      "伍ノ型 月魄・災禍",
      "陸ノ型 常夜孤月・無間",
      "漆ノ型 厄鏡・月映え",
      "捌ノ型 月龍輪尾",
      "玖ノ型 降り月・連面",
      "拾ノ型 穿面斬・蘿月",
      "拾壱ノ型 月蝕・連面",
      "拾弐ノ型 炎扉",
      "拾参ノ型 烈斬",
      "拾肆ノ型 兇変・天満繊月",
      "拾伍ノ型 月魄・災禍",
      "拾陸ノ型 月虹・片割れ月"
    ]
  },
  sun: {
    name: "日の呼吸",
    emoji: "☀️",
    techniques: [
      "円舞",
      "炎舞",
      "碧羅の天",
      "幻日虹",
      "火車",
      "灼骨炎陽",
      "陽華突",
      "斜陽転身",
      "輝輝恩光",
      "日暈の龍・頭舞い",
      "日暈の龍・尾舞い",
      "炎舞",
      "幻日虹"
    ]
  }
};

export function setupKimetsuBotUI(rtcClient: any, rtmChannel: any, bot_id: string = "") {
  console.log("setupKimetsuBotUIが呼び出されました");
  const container = document.getElementById("kimetsu-bot-ui");
  if (!container) {
    console.error("kimetsu-bot-ui要素が見つかりません");
    return;
  }

  // 他のUIを非表示にする
  const fuckBotUI = document.getElementById("fuck-bot-ui");
  if (fuckBotUI) {
    console.log("fuck-bot-uiを非表示にします");
    fuckBotUI.style.display = "none";
  }

  // UIを表示
  console.log("kimetsu-bot-uiを表示します");
  container.style.display = "block";

  // 呼吸法選択ボタンのイベントリスナー
  const breathingButtons = container.querySelectorAll('.breathing-btn');
  const techniqueSelection = document.getElementById('technique-selection');
  const breathingSelection = container.querySelector('.breathing-selection');
  const selectedBreathingTitle = document.getElementById('selected-breathing-title');
  const techniqueButtons = document.getElementById('technique-buttons');
  const backButton = document.getElementById('back-to-breathing');

  breathingButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const breathingType = target.getAttribute('data-breathing');
      
      if (breathingType && breathingTechniques[breathingType]) {
        showTechniques(breathingType);
      }
    });
  });

  // 戻るボタンのイベントリスナー
  if (backButton) {
    backButton.addEventListener('click', () => {
      showBreathingSelection();
    });
  }

  function showTechniques(breathingType: string) {
    const breathing = breathingTechniques[breathingType];
    
    // タイトルを更新
    if (selectedBreathingTitle) {
      selectedBreathingTitle.textContent = `${breathing.emoji} ${breathing.name} - 技を選択してください`;
    }

    // 技ボタンを生成
    if (techniqueButtons) {
      techniqueButtons.innerHTML = '';
      
      breathing.techniques.forEach((technique, index) => {
        const button = document.createElement('button');
        button.className = `technique-btn ${breathingType}`;
        button.textContent = technique;
        button.addEventListener('click', () => {
          playTechnique(breathingType, technique, index);
        });
        techniqueButtons.appendChild(button);
      });
    }

    // UIを切り替え
    if (breathingSelection) {
      (breathingSelection as HTMLElement).style.display = 'none';
    }
    if (techniqueSelection) {
      (techniqueSelection as HTMLElement).style.display = 'block';
    }
  }

  function showBreathingSelection() {
    if (breathingSelection) {
      (breathingSelection as HTMLElement).style.display = 'block';
    }
    if (techniqueSelection) {
      (techniqueSelection as HTMLElement).style.display = 'none';
    }
  }

  async function playTechnique(breathingType: string, technique: string, index: number) {
    // ボタンにアニメーション効果を追加
    const button = event?.target as HTMLButtonElement;
    if (button) {
      button.classList.add('playing');
      setTimeout(() => {
        button.classList.remove('playing');
      }, 500);
    }

    // 呼吸法に応じた音声ファイルを選択
    let audioPath = '';
    if (breathingType === 'water') {
      audioPath = '/assets/audio/kimetsu/water/type1.mp3';
    } else if (breathingType === 'stone') {
      audioPath = '/assets/audio/kimetsu/stone/type3.wav';
    } else {
      // 他の呼吸法は既存の音声ファイルを使用
      const soundFiles = [
        'first.wav',
        'second.wav',
        'ganbare.mp3',
        'nigeruna.mp3',
        'scream.wav'
      ];
      const soundFile = soundFiles[index % soundFiles.length];
      audioPath = `/assets/audio/rinapen/${soundFile}`;
    }
    
    // Agoraの音声トラックを使用して音声を再生
    try {
      const track = await playTrack(audioPath, false, 1000, rtcClient);
      
      // 音声の長さを取得（デフォルト3秒）
      let duration = 3000;
      if (track.duration) {
        duration = track.duration * 1000; // 秒をミリ秒に変換
      }

    // 呼吸法に応じた絵文字アニメーションを開始
    startBreathingAnimation(breathingType, duration);

    // 音声が流れている間、絵文字をループで送信
    startEmojiLoop(breathingType, duration, rtmChannel);

    // 音声終了時にトラックを停止
    setTimeout(() => {
      track.stop();
      rtcClient.unpublish(track);
    }, duration);
      
    } catch (error) {
      console.error('音声再生エラー:', error);
      // フォールバック: 通常のAudio要素を使用
      const audio = new Audio(audioPath);
      audio.volume = 0.7;
      audio.play().catch(console.error);
      startBreathingAnimation(breathingType, 3000);
      startEmojiLoop(breathingType, 3000, rtmChannel);
    }

    // RTMチャンネルにメッセージを送信
    const breathing = breathingTechniques[breathingType];
    const message = `⚔️ ${breathing.emoji} ${breathing.name} - ${technique} ⚔️`;
    sendMessage(bot_id, message, rtmChannel);

    // 呼吸法の絵文字を送信（最初の1回）
    sendEmoji(breathing.emoji, rtmChannel);

    // コンソールにログ出力
    console.log(`鬼滅の刃: ${breathing.name} - ${technique} を実行しました`);
  }

  // 音声が流れている間、絵文字をループで送信
  function startEmojiLoop(breathingType: string, duration: number, rtmChannel: RtmChannel) {
    let emojiList: string[] = [];
    
    // 呼吸法に応じて絵文字リストを設定
    switch (breathingType) {
      case 'water':
        emojiList = ['💧', '🌊', '💦', '💧', '🌊', '💦', '💧', '🌊', '💦'];
        break;
      case 'stone':
        emojiList = ['🗿', '🪨', '⛰️', '🗿', '🪨', '⛰️', '🗿', '🪨', '⛰️'];
        break;
      case 'fire':
        emojiList = ['🔥', '💥', '✨', '🔥', '💥', '✨', '🔥', '💥', '✨'];
        break;
      case 'wind':
        emojiList = ['🌪️', '💨', '🍃', '🌪️', '💨', '🍃', '🌪️', '💨', '🍃'];
        break;
      case 'thunder':
        emojiList = ['⚡', '💥', '✨', '⚡', '💥', '✨', '⚡', '💥', '✨'];
        break;
      case 'mist':
        emojiList = ['🌫️', '💨', '☁️', '🌫️', '💨', '☁️', '🌫️', '💨', '☁️'];
        break;
      case 'flower':
        emojiList = ['🌸', '🌺', '🌼', '🌸', '🌺', '🌼', '🌸', '🌺', '🌼'];
        break;
      case 'snake':
        emojiList = ['🐍', '🐉', '🐲', '🐍', '🐉', '🐲', '🐍', '🐉', '🐲'];
        break;
      case 'love':
        emojiList = ['💕', '💖', '💗', '💕', '💖', '💗', '💕', '💖', '💗'];
        break;
      case 'beast':
        emojiList = ['🐺', '🐕', '🦁', '🐺', '🐕', '🦁', '🐺', '🐕', '🦁'];
        break;
      case 'sound':
        emojiList = ['🎵', '🎶', '🔊', '🎵', '🎶', '🔊', '🎵', '🎶', '🔊'];
        break;
      case 'moon':
        emojiList = ['🌙', '🌕', '🌖', '🌙', '🌕', '🌖', '🌙', '🌕', '🌖'];
        break;
      case 'sun':
        emojiList = ['☀️', '🌞', '✨', '☀️', '🌞', '✨', '☀️', '🌞', '✨'];
        break;
      default:
        emojiList = ['⚔️', '✨', '💫', '⚔️', '✨', '💫', '⚔️', '✨', '💫'];
    }

    // 絵文字送信の間隔（200ms間隔）
    const interval = 200;
    let currentIndex = 0;
    
    const emojiInterval = setInterval(() => {
      if (currentIndex < emojiList.length) {
        sendEmoji(emojiList[currentIndex], rtmChannel);
        currentIndex++;
      } else {
        // リストが終わったら最初から繰り返し
        currentIndex = 0;
        sendEmoji(emojiList[currentIndex], rtmChannel);
        currentIndex++;
      }
    }, interval);

    // 音声終了時にインターバルをクリア
    setTimeout(() => {
      clearInterval(emojiInterval);
    }, duration);
  }

  // 呼吸法に応じた絵文字アニメーション
  function startBreathingAnimation(breathingType: string, duration: number) {
    const container = document.getElementById("kimetsu-bot-ui");
    if (!container) return;

    // アニメーション用の要素を作成
    const animationContainer = document.createElement('div');
    animationContainer.className = 'breathing-animation';
    animationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    `;

    let emojis: string[] = [];
    let animationClass = '';

    // 呼吸法に応じて絵文字とアニメーションを設定
    switch (breathingType) {
      case 'water':
        emojis = ['💧', '🌊', '💦', '💧', '🌊', '💦'];
        animationClass = 'water-animation';
        break;
      case 'stone':
        emojis = ['🗿', '🪨', '⛰️', '🗿', '🪨', '⛰️'];
        animationClass = 'stone-animation';
        break;
      case 'fire':
        emojis = ['🔥', '💥', '✨', '🔥', '💥', '✨'];
        animationClass = 'fire-animation';
        break;
      case 'wind':
        emojis = ['🌪️', '💨', '🍃', '🌪️', '💨', '🍃'];
        animationClass = 'wind-animation';
        break;
      case 'thunder':
        emojis = ['⚡', '💥', '✨', '⚡', '💥', '✨'];
        animationClass = 'thunder-animation';
        break;
      default:
        emojis = ['⚔️', '✨', '💫', '⚔️', '✨', '💫'];
        animationClass = 'default-animation';
    }

    // 絵文字要素を作成してアニメーション
    for (let i = 0; i < 20; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.cssText = `
        position: absolute;
        font-size: ${20 + Math.random() * 30}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: ${animationClass} ${duration}ms ease-out forwards;
        opacity: 0;
      `;
      animationContainer.appendChild(emoji);
    }

    // アニメーション用のCSSを追加
    if (!document.getElementById('breathing-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'breathing-animation-styles';
      style.textContent = `
        @keyframes water-animation {
          0% { 
            opacity: 0; 
            transform: translateY(100vh) scale(0.5) rotate(0deg);
          }
          20% { 
            opacity: 1; 
            transform: translateY(80vh) scale(1) rotate(180deg);
          }
          80% { 
            opacity: 1; 
            transform: translateY(20vh) scale(1.2) rotate(360deg);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-20vh) scale(0.8) rotate(540deg);
          }
        }
        
        @keyframes stone-animation {
          0% { 
            opacity: 0; 
            transform: translateY(-100vh) scale(0.3) rotate(0deg);
          }
          20% { 
            opacity: 1; 
            transform: translateY(-80vh) scale(0.8) rotate(90deg);
          }
          80% { 
            opacity: 1; 
            transform: translateY(20vh) scale(1.5) rotate(180deg);
          }
          100% { 
            opacity: 0; 
            transform: translateY(100vh) scale(1) rotate(270deg);
          }
        }
        
        @keyframes fire-animation {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotate(0deg);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.5) rotate(180deg);
          }
          100% { 
            opacity: 0; 
            transform: scale(0.8) rotate(360deg);
          }
        }
        
        @keyframes wind-animation {
          0% { 
            opacity: 0; 
            transform: translateX(-100vw) scale(0.5) rotate(0deg);
          }
          50% { 
            opacity: 1; 
            transform: translateX(0) scale(1.2) rotate(180deg);
          }
          100% { 
            opacity: 0; 
            transform: translateX(100vw) scale(0.8) rotate(360deg);
          }
        }
        
        @keyframes thunder-animation {
          0% { 
            opacity: 0; 
            transform: scale(0.3) rotate(0deg);
          }
          30% { 
            opacity: 1; 
            transform: scale(2) rotate(90deg);
          }
          70% { 
            opacity: 1; 
            transform: scale(1.5) rotate(180deg);
          }
          100% { 
            opacity: 0; 
            transform: scale(0.5) rotate(270deg);
          }
        }
        
        @keyframes default-animation {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotate(0deg);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2) rotate(180deg);
          }
          100% { 
            opacity: 0; 
            transform: scale(0.8) rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // アニメーション要素を追加
    document.body.appendChild(animationContainer);

    // アニメーション終了後に要素を削除
    setTimeout(() => {
      if (animationContainer.parentNode) {
        animationContainer.parentNode.removeChild(animationContainer);
      }
    }, duration);
  }
}

export function handleKimetsuMode( bot_id: string = "", rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel) {
  console.log("handleKimetsuModeが呼び出されました。bot_id:", bot_id);
  setupKimetsuBotUI(rtcClient, rtmChannel, bot_id);
}
