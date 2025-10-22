import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";
import { IAgoraRTCClient, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

export async function handleManabunMode(bot_id: string, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  const initialTrack = await playTrack("/assets/audio/kamex/fly/ikinasai.wav", false, 1000, rtcClient);

  initialTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      const flyTrack = await playTrack("/assets/audio/kamex/fly/fly.wav", true, 500, rtcClient);

      let volume = 0;
      let direction = 1; 
      setInterval(() => {
        volume += direction * 50;
        if (volume >= 1000) {
          volume = 1000;
          direction = -1;
        } else if (volume <= 0) {
          volume = 0;
          direction = 1;
        }
        flyTrack.setVolume(volume); // Agora SDK: 0〜1000
      }, 100); 

      let emojiToggle = true;
      setInterval(() => {
        sendEmoji(emojiToggle ? "💩" : "🪰", rtmChannel);
        emojiToggle = !emojiToggle;
      }, 100);

      let messageToggle = true;
      setInterval(() => {
        sendMessage(bot_id, "🪰", rtmChannel);
        messageToggle = !messageToggle;
      }, 500);
    }
  });

  rtmChannel.on("ChannelMessage", async (message, memberId) => {
    const msgText = message.text;
    if (typeof msgText === "string") {
      const sounds = ["/assets/audio/kamex/fly/kick.wav"];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 500, rtcClient);
      }
    }
  });
}

export async function handleBankaiMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient){
  const firstTrack = await playTrack("/assets/audio/kamex/bankai/first.wav", false, 1000, rtcClient);
  setTimeout(() => {
      sendEmoji("🗡️", rtmChannel);
  }, 1000);
  const emotes = ["卍", "解"];
  const extraEmotes = ["千", "本", "桜", "景", "義"];
  // const extraEmotes = ["鼻", "巨", "大", "🐷", "み", "ゃ", "お","し","ま"];
  function sendSequentialEmojis(emotes, delay, channel, initialDelay = 0) {
    setTimeout(() => {
      emotes.forEach((emote, index) => {
        setTimeout(() => {
          sendEmoji(emote, channel);
        }, delay * index);
      });
    }, initialDelay);
  }

  sendSequentialEmojis(emotes, 300, rtmChannel, 4000);
  
  // 卍解の後に⚔️を3秒間送信
  setTimeout(() => {
    const swordInterval = setInterval(() => {
      sendEmoji("⚔️", rtmChannel);
    }, 100);
    
    // 3秒後に停止
    setTimeout(() => {
      clearInterval(swordInterval);
    }, 4000);
  }, 4700); // 卍解が完了するタイミング（4000 + 300*2 = 4600ms）

  // sendSequentialEmojis(extraEmotes, 300, rtmChannel, 3200);
  sendSequentialEmojis(extraEmotes, 300, rtmChannel, 10400);
  
  // 卍解と千本桜景義が両方とも終わった後に898を送信開始
  // 卍解完了: 4000 + 300*2 = 4600ms
  // 千本桜景義完了: 7000 + 300*5 = 8500ms
  // より遅い方（千本桜景義）が終わった後に898を開始
  setTimeout(() => {
    sendAcceleratingNumbers(rtmChannel, 898, 300);
  }, 8500 + 4500); // 千本桜景義完了後500ms待ってから898開始

  function sendAcceleratingNumbers(channel, start = 1, initialDelay = 2000) {
    let delay = initialDelay;
    const minDelay = 10; // 最小間隔を10msに短縮

    async function sendNext() {
      try {
        const digits = String(start);
        
        // 898の各文字を送信
        for (const char of digits) {
          await sendEmoji(char, channel);
        }
        
        // 🌸も一緒に送信
        await sendEmoji("🌸", channel);

        // 速度をより早く上げる（0.75倍に変更）
        delay *= 0.75;
        if (delay < minDelay) delay = minDelay;

        setTimeout(sendNext, delay);
      } catch (err) {
        console.error("送信エラー:", err);
        // setTimeout(sendNext, 1000); // 必要なら再送ロジック
      }
    }

    sendNext();
  }

  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
        await playTrack("/assets/audio/kamex/bankai/second.wav", true, 1000, rtcClient);
      const text = "卍解";
      const emotes = ["🌸", "🗡️", "💎", "🥷", "❄"];
      // const emotes = ["上", "野", "え", "い", "と", ]
      let charIndex = 0;
      let emoteIndex = 0;
      setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
      setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel), 50);
      // setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
    }
  });
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;

    if (typeof msgText === "string") {
      const sounds = [
        "/assets/audio/kamex/bankai/kick/niisama.wav",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 1000, rtcClient);
      }
    }
  });

};