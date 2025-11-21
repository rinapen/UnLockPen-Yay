import AgoraRTC, { IAgoraRTCClient, IBufferSourceAudioTrack } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { MusicManager } from "./musicManager";

export class AgoraActionManager {
  private rtcClient: IAgoraRTCClient;
  private rtmChannel: RtmChannel;
  private botId: string;

  constructor(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string) {
    this.rtcClient = rtcClient;
    this.rtmChannel = rtmChannel;
    this.botId = botId;
  }

  async playTrack(
    source: string,
    loop = false,
  ): Promise<IBufferSourceAudioTrack> {
    const track = await AgoraRTC.createBufferSourceAudioTrack({ source });

    const musicManager = MusicManager.getInstance();
    const currentVolume = musicManager.getVolume();
    track.setVolume(currentVolume);

    await this.rtcClient.publish(track);
    track.startProcessAudioBuffer({ loop, startPlayTime: 0 });
    track.play();

    const trackId = `${source}_${Date.now()}_${Math.random()}`;
    musicManager.registerTrack(trackId, track);

    track.on("source-state-change", (state) => {
      if (state === "stopped") {
        musicManager.unregisterTrack(trackId);
      }
    });

    return track;
  }

  async sendMessage(text: string): Promise<void> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const id = `${this.botId}_${timestamp}`;
      await this.rtmChannel.sendMessage({
        text: `chat ${JSON.stringify({ text, id, created_at_seconds: timestamp })}`,
      });
    } catch (error) {
      console.error("sendMessage error:", error);
    }
  }

  async sendEmoji(emoji: string): Promise<void> {
    try {
      await this.rtmChannel.sendMessage({ text: `react ${emoji}` });
    } catch (error) {
      console.error("sendEmoji error:", error);
    }
  }

  async requestLiftAudioMute() {
    try {
      await this.rtmChannel.sendMessage({ text: "requestLiftAudioMute"})
    } catch (error) {
      console.error("requestLiftAudioMute error:", error);
    }
  }

  handleKickAndMuteSound(sounds: string[]): void {
    this.rtmChannel.on("ChannelMessage", async (message) => {
      const text = message.text;
      if (typeof text !== "string") return;
      
      const triggerWords = ["kick", "muteAudio"];
      if (triggerWords.some(w => text.startsWith(w))) {
        const sound = sounds[Math.floor(Math.random() * sounds.length)];
        await this.playTrack(sound, false);
      }
    });
  }
}