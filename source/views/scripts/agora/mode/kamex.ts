import { RtmChannel } from "agora-rtm-sdk";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { AgoraActionManager } from "../../utils/agoraActionManager";

export async function handleManabunMode(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string) {
  const agoraManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
  
  const sounds = ["/assets/audio/kamex/fly/kick.wav"];
  agoraManager.handleKickAndMuteSound(sounds);
  
  const firstTrack = await agoraManager.playTrack("/assets/audio/kamex/fly/ikinasai.wav");
  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      let volume = 0;
      let direction = 1;

      let emojiToggle = true;
      let messageToggle = true;

      const flyTrack = await agoraManager.playTrack("/assets/audio/kamex/fly/fly.wav", true);

      setInterval(() => {
        volume += direction * 50;
        if (volume >= 1000) {
          volume = 1000;
          direction = -1;
        } else if (volume <= 0) {
          volume = 0;
          direction = 1;
        }
        flyTrack.setVolume(volume);
      }, 100); 

      setInterval(() => {
        agoraManager.sendEmoji(emojiToggle ? "💩" : "🪰");
        emojiToggle = !emojiToggle;
      }, 100);

      setInterval(() => {
        agoraManager.sendMessage("🪰");
        messageToggle = !messageToggle;
      }, 500);
    }
  });
};

export async function handleBankaiMode(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string){
  const agoraManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
  
  const sounds = [
    "/assets/audio/kamex/bankai/kick/niisama.wav",
  ];
  agoraManager.handleKickAndMuteSound(sounds);
  
  setTimeout(() => {
      agoraManager.sendEmoji("🗡️");
  }, 1000);

  const firstEmotes = ["卍", "解"];
  const secondEmotes = ["千", "本", "桜", "景", "義"];

  sendSequentialEmojis(agoraManager, firstEmotes, 300, 4000);
  
  setTimeout(() => {
    const swordInterval = setInterval(() => {
      agoraManager.sendEmoji("⚔️");
    }, 100);
    
    setTimeout(() => {
      clearInterval(swordInterval);
    }, 4000);
  }, 4700); 
  
  sendSequentialEmojis(agoraManager, secondEmotes, 300, 10400);
  
  setTimeout(() => {
    sendAcceleratingNumbers(agoraManager, 898, 300);
  }, 8500 + 4500);
  
  const firstTrack = await agoraManager.playTrack("/assets/audio/kamex/bankai/first.wav");
  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      let charIndex = 0;
      let emoteIndex = 0;
      const message = "卍解";
      const emotes = ["🌸", "🗡️", "💎", "🥷", "❄"];
      
      await agoraManager.playTrack("/assets/audio/kamex/bankai/second.wav", true);
      setInterval(() => agoraManager.sendMessage(message[charIndex++ % message.length]), 100);
      setInterval(() => agoraManager.sendEmoji(emotes[emoteIndex++ % emotes.length]), 50);
    }
  });
};

function sendSequentialEmojis(agoraManager: AgoraActionManager, emotes: string[], delay: number, initialDelay = 0) {
  setTimeout(() => {
    emotes.forEach((emote, index) => {
      setTimeout(() => {
        agoraManager.sendEmoji(emote);
      }, delay * index);
    });
  }, initialDelay);
};

async function sendNext(agoraManager: AgoraActionManager, start: number, delay: number, minDelay: number) {
  try {
    const digits = String(start);
    
    for (const char of digits) {
      await agoraManager.sendEmoji(char);
    }
    
    await agoraManager.sendEmoji("🌸");

    delay *= 0.75;
    if (delay < minDelay) delay = minDelay;

    setTimeout(() => sendNext(agoraManager, start, delay, minDelay), delay);
  } catch (err) {
    console.error("送信エラー:", err);
  }
};

function sendAcceleratingNumbers(agoraManager: AgoraActionManager, start = 1, initialDelay = 2000) {
  const minDelay = 10;
  sendNext(agoraManager, start, initialDelay, minDelay);
};