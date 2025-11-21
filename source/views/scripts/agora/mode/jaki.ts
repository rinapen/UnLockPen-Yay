import { RtmChannel } from "agora-rtm-sdk";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { AgoraActionManager } from "../../utils/agoraActionManager";

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function handleJakiMode(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string) {
  const emojis = [
    "⚔️","🗡️","🔪","🪓","🤪","😈","🥴","🤯","🤑","😵",
    "🫠","🤡","💀","👹","👺","🤖","👽","👾","🦾","🦿","🪤",
    "🩸"
    // 22個
  ];
  const slashSounds = [
    "/assets/audio/jaki/sword/slash1.mp3",
    "/assets/audio/jaki/sword/slash2.mp3",
    "/assets/audio/jaki/sword/slash3.mp3",
    "/assets/audio/jaki/sword/slash4.mp3",
    "/assets/audio/jaki/sword/slash5.mp3",
    "/assets/audio/jaki/sword/slash6.mp3",
    "/assets/audio/jaki/sword/slash7.mp3",
    "/assets/audio/jaki/sword/slash8.mp3",
    "/assets/audio/jaki/sword/slash9.mp3",
    "/assets/audio/jaki/sword/slash10.mp3",
    "/assets/audio/jaki/sword/slash11.mp3",
    "/assets/audio/jaki/sword/slash12.mp3",
  ];
  const kickSounds = [
    "/assets/audio/jaki/kick/kick1.wav",
    "/assets/audio/jaki/kick/kick2.wav",
    "/assets/audio/jaki/kick/kick3.wav"
  ];

  const agoraManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
  agoraManager.handleKickAndMuteSound(kickSounds);

  setTimeout(async () => {
    const firstTrack = await agoraManager.playTrack("/assets/audio/jaki/first.wav");
    
      firstTrack.on("source-state-change", async (state) => {
        if (state === "stopped") {
          setInterval(async () => {
            const randomSound = slashSounds[Math.floor(Math.random() * slashSounds.length)];
            await agoraManager.playTrack(randomSound);
          }, 300);
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
          setInterval(() => agoraManager.sendEmoji(randomEmoji), 50);
          setInterval(() => agoraManager.sendMessage(randomEmoji), 50);
          setInterval(() => agoraManager.requestLiftAudioMute(), 50);
        }
      });
  }, 1000);
}