import AgoraRTC, { IAgoraRTCClient, IBufferSourceAudioTrack } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { MusicManager } from "./musicManager";

export async function playTrack(
  source: string,
  loop = false,
  vol = 1000,
  rtcClient: IAgoraRTCClient
): Promise<IBufferSourceAudioTrack> {
  const track = await AgoraRTC.createBufferSourceAudioTrack({ source });
  
  // MusicManagerから音量を取得して適用
  const musicManager = MusicManager.getInstance();
  const currentVolume = musicManager.getVolume();
  
  track.setVolume(currentVolume);
  await rtcClient.publish(track);
  track.startProcessAudioBuffer({ loop, startPlayTime: 0 });
  track.play();
  
  // トラックをMusicManagerに登録（複数BOTの音量調整のため）
  const trackId = `${source}_${Date.now()}_${Math.random()}`;
  musicManager.registerTrack(trackId, track);
  
  // トラック終了時に登録を削除
  track.on('source-state-change', (state) => {
    if (state === 'stopped') {
      musicManager.unregisterTrack(trackId);
    }
  });
  
  return track;
}

export async function sendMessage(
  bot_id: string,
  text: string,
  rtmChannel: RtmChannel
): Promise<void> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const id = `${bot_id}_${timestamp}`;
    await rtmChannel.sendMessage({
      text: `chat ${JSON.stringify({ text, id, created_at_seconds: timestamp })}`,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
  }
}

export async function sendEmoji(
  emoji: string,
  rtmChannel: RtmChannel
): Promise<void> {
  try {
    await rtmChannel.sendMessage({ text: `react ${emoji}` });
  } catch (error) {
    console.error("sendEmoji error:", error);
  }
}