import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { AgoraActionManager } from "../../utils/agoraActionManager";
import { MusicManager } from "../../utils/musicManager";
// import { EmojiConfigManager } from "../../ui/emojiConfigHandler"; (2025年11月から廃止)

export default async function handleShingekiMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  const agoraManager = new AgoraActionManager(rtcClient, rtmChannel, bot_id);
  
  const sounds = ["/assets/audio/beruma/scream.wav"];
  agoraManager.handleKickAndMuteSound(sounds);
  
  const firstTrack = await agoraManager.playTrack("/assets/audio/beruma/first.wav", false);
  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {

      const musicManager = MusicManager.getInstance();
      const musicUrl = musicManager.getMusicUrl();
      await agoraManager.playTrack(musicUrl, true);

      // 枠チャットにループでメッセージを送信
      let charIndex: number = 0;
      const message = "話をしねえじゃねえか！ふざけんなよ！";
      setInterval(() => agoraManager.sendMessage(message[charIndex++ % message.length]), 100);
      
      // 枠にループで絵文字を送信 (2025年11月から廃止)
      // let emoteIndex: number = 0;
      // const emojiManager: EmojiConfigManager = EmojiConfigManager.getInstance();
      // const emotes: string[] = emojiManager.getEmojis();
      // setInterval(() => agoraManager.sendEmoji(emotes[emoteIndex++ % emotes.length]), 100);
      
      // 枠主にミュート解除申請を送信
      setInterval(() => agoraManager.requestLiftAudioMute(), 50);
    }
  });
}