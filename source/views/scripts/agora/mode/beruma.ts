import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";
import { MusicManager } from "../../utils/musicManager";
import { EmojiConfigManager } from "../../ui/emojiConfigHandler";

export default async function handleShingekiMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  const firstTrack = await playTrack("/assets/audio/beruma/first.wav", false, 1000, rtcClient);

    firstTrack.on("source-state-change", async (state) => {
        if (state === "stopped") {
        // 🔁 カスタム音楽またはデフォルトのhonkowa.m4aをループで再生
        const musicManager = MusicManager.getInstance();
        const musicUrl = musicManager.getMusicUrl();
        await playTrack(musicUrl, true, 1000, rtcClient);

        // カスタム絵文字を取得
        const emojiManager = EmojiConfigManager.getInstance();
        const emotes = emojiManager.getEmojis();
        const text = "話をしねえじゃねえか！ふざけんなよ！";
        let charIndex = 0;
        let emoteIndex = 0;

        setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
        setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel),100);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
        // 📩 メッセージ送信
        setTimeout(() => {
            sendMessage(bot_id, "موتوا أيها الأوغاد", rtmChannel);
        }, 300);
        }
    });

  // 🔄 RTMイベント（そのまま）
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;
    if (typeof msgText === "string") {
      const sounds = [
        "/assets/audio/beruma/scream.wav",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 1000, rtcClient);
      }
    }
  });
}
