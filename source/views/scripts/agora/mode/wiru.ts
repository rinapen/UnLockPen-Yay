import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";

export async function handleWiruMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient){
  const firstTrack = await playTrack("/assets/audio/wiru/first.mp3", false, 1000, rtcClient);

  const emotes = ["領", "域", "展", "開"];
  const extraEmotes = ["伏","魔","御","厨", "子"];

  function sendSequentialEmojis(emotes, delay, channel, initialDelay = 0) {
    setTimeout(() => {
      emotes.forEach((emote, index) => {
        setTimeout(() => {
          sendEmoji(emote, channel);
        }, delay * index);
      });
    }, initialDelay);
  }

  sendSequentialEmojis(emotes, 300, rtmChannel, 500);

  sendSequentialEmojis(extraEmotes, 300, rtmChannel, 3900);

  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      console.log('=== 音声選択処理開始 ===');
      
      // 選択された音声ファイルがある場合はそれを使用、なければデフォルトのsecond.m4aを使用
      try {
        const audioManager = (window as any).audioManager;
        console.log('AudioManager available:', !!audioManager);
        console.log('AudioManager object:', audioManager);
        
        if (audioManager && typeof audioManager.getSelectedAudioFile === 'function') {
          const selectedAudio = audioManager.getSelectedAudioFile();
          console.log('Selected audio file:', selectedAudio);
          
          if (selectedAudio && selectedAudio.path) {
            console.log('Using selected audio file:', selectedAudio.name, 'Path:', selectedAudio.path);
            console.log('Playing custom audio track...');
            await playTrack(selectedAudio.path, true, 1000, rtcClient);
            console.log('Custom audio track played successfully');
          } else {
            console.log('No selected audio file or invalid path, using default second.m4a');
            console.log('Playing default audio track...');
            await playTrack("/assets/audio/users/wiru/second.m4a", true, 1000, rtcClient);
            console.log('Default audio track played successfully');
          }
        } else {
          console.log('AudioManager not available or getSelectedAudioFile method not found');
          console.log('AudioManager methods:', audioManager ? Object.getOwnPropertyNames(audioManager) : 'null');
          console.log('Playing default audio track...');
          await playTrack("/assets/audio/users/wiru/second.m4a", true, 1000, rtcClient);
          console.log('Default audio track played successfully');
        }
      } catch (error) {
        console.error('Failed to play audio, using default:', error);
        console.log('Playing fallback default audio track...');
        // エラーが発生した場合はデフォルトのsecond.m4aを使用
        await playTrack("/assets/audio/wiru/second.m4a", true, 1000, rtcClient);
        console.log('Fallback audio track played successfully');
      }
      
      console.log('=== 音声選択処理完了 ===');
      
      const text = "灰色の鎖が千切れ、黒き刃が降り注ぐ…無限の叫びが刃に刻まれ、伏魔の胎が歓喜に震える…切り刻まれるは魂か、世界か…";
      const emotes = [
        "🔪",  
        "🩸",  
        "📜", 
        "⚔️",  
        "⛓️",  
        "🌑",  
        "✂️",  
        "🪓",  
        "💥",  
        "🔨",  
        "🗡️",  
        "🩹",  
        "❌",  
        "🪚",  
        "🧨",
      ];
      
      let charIndex = 0;
      let emoteIndex = 0;
      setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
      setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel), 50);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
    }
  });
  rtmChannel.on("ChannelMessage",
    async (message, memberId, messageProps) => {
      const msgText = message.text;
      if (typeof msgText === "string") {
        // kickの音声は元のまま（ganbare.mp3, nigeruna.mp3）
        if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
          const sounds = [
            "/assets/audio/wiru/kick/ganbare.mp3",
            "/assets/audio/wiru/kick/nigeruna.mp3",
          ];
          const sound = sounds[Math.floor(Math.random() * sounds.length)];
          await playTrack(sound, false, 1000, rtcClient);
        }
      }
    }
  );
}
