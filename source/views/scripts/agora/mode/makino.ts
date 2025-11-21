import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { AgoraActionManager } from "../../utils/agoraActionManager";

export default async function handleMakinoMode(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string) {
    const agoraActionManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
    const sounds = [
        "/assets/audio/makino/kick.m4a",
    ];
    agoraActionManager.handleKickAndMuteSound(sounds);
    
    const text = "まきの様最強"

    let emoteIndex = 0;
    const emotes = ["ま", "き", "の", "様", "最", "強"];
    
    setInterval(() => agoraActionManager.sendMessage(text), 100);
    setInterval(() => agoraActionManager.sendEmoji(emotes[emoteIndex++ % emotes.length]), 100);
    setInterval(() => agoraActionManager.requestLiftAudioMute(), 50);
    await agoraActionManager.playTrack("/assets/audio/makino/first.m4a", true);
}