import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { AgoraActionManager } from "../../utils/agoraActionManager";

export async function handleGojoMode(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string){
  const agoraActionManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
  const sounds = [
    "/assets/audio/rinapen/kick/atattenai.mp3",
  ];
  agoraActionManager.handleKickAndMuteSound(sounds);

  const firstTrack = await agoraActionManager.playTrack("/assets/audio/rinapen/first.wav");

  const firstEmotes = ["領", "域", "展", "開"];
  const secondEmotes = ["無", "量", "空", "処"];

  sendSequentialEmojis(agoraActionManager, firstEmotes, 300, 1000);

  sendSequentialEmojis(agoraActionManager, secondEmotes, 300, 3200);

  setTimeout(() => {
    sendAcceleratingNumbers(agoraActionManager, 1, 300);
  }, 5500);

  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      let charIndex = 0;
      let emoteIndex = 0;
      const message = "見える…聞こえる…感じる…止まらない…全ての情報が…永遠に流れ込む…君はもう動けない…";
      const emotes = ["🌀", "♾️", "👁️", "💫", "🧠", "🕳️", "🕰️", "📡", "🔁", "🧿", "🖤", "🪐"];

      setInterval(() => agoraActionManager.sendMessage(message[charIndex++ % message.length]), 100);
      setInterval(() => agoraActionManager.sendEmoji(emotes[emoteIndex++ % emotes.length]), 50);
      setInterval(() => agoraActionManager.requestLiftAudioMute(), 50);
      await agoraActionManager.playTrack("/assets/audio/rinapen/second.wav", true);
    }
  });
};

export const handleAmazingCircusMode = async (rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string) => {
  const agoraActionManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
  const send = (t: string) => agoraActionManager.sendMessage(t);
  const emoji = (e: string) => agoraActionManager.sendEmoji(e);

  const firstTrack = await agoraActionManager.playTrack("/assets/audio/rinapen/circus/amazing.m4a");
  firstTrack.on("source-state-change", async () => {
    await agoraActionManager.playTrack("/assets/audio/rinapen/circus/everyday.m4a", true);
  });

  setTimeout(async () => {
    for (let i = 0; i < 40; i++) await emoji("🥁");
    setTimeout(async () => {
      await send("アメイジング・デジタルサーカスへ");
      setTimeout(async () => {
        await send("ようこそ！");
        for (let i = 0; i < 10; i++) {
          await emoji("🤗");
          await emoji("👋");
        }
        setTimeout(async () => {
          await send("私はケイン！");
          for (const ch of ["C", "A", "I", "N", "E"]) await emoji(ch);
          await emoji("👀");
          await emoji("👄");
          setTimeout(async () => {
            await send("ここの舞台監督だ！");
            for (let i = 0; i < 10; i++) await emoji("😎");
            setTimeout(async () => {
              await send("見たことないような");
              setTimeout(async () => {
                await send("顎が外れて");
                await emoji("🤔");
                setTimeout(async () => {
                  await send("心臓が止まるほど");
                  await emoji("🩺");
                  await emoji("🫀");
                  setTimeout(async () => {
                    await send("びっくりする代物を");
                    await emoji("💎");
                    setTimeout(async () => {
                      await send("お見せしよう！！");
                      await emoji("🎉");
                      setTimeout(async () => {
                        await send("そうだろ？バブル");
                        await emoji("❓");
                        setTimeout(async () => {
                          await send("もちろんだよ！ケイン");
                          setTimeout(async () => {
                            await send("今日はどんなものを作ったのか楽しみだよ！");
                            setTimeout(async () => {
                              await send("ああ！時間がもったいないなあ！");
                              for (let i = 0; i < 20; i++) await emoji("⌚");
                              setTimeout(async () => {
                                await send("さあ！ショーの始まりだ！");
                                for (let i = 0; i < 50; i++) await emoji("🎪");
                                setTimeout(async () => {
                                  await send("ガングル");
                                  await emoji("🎭");
                                  for (const ch of ["G", "A", "N", "G", "L", "E"]) await emoji(ch);
                                  setTimeout(async () => {
                                    await send("ズーブル");
                                    await emoji("🚂");
                                    for (const ch of ["Z", "O", "O", "B", "L", "E"]) await emoji(ch);
                                    setTimeout(async () => {
                                      await send("あとキンガーも〜");
                                      await emoji("♟️");
                                      for (const ch of ["K", "I", "N", "G", "E", "R"]) await emoji(ch);
                                      setTimeout(async () => {
                                        await send("ラガタ");
                                        await emoji("🪆");
                                        for (const ch of ["R", "A", "G", "A", "T", "H", "A"]) await emoji(ch);
                                        setTimeout(async () => {
                                          await send("ジャックス");
                                          for (const ch of ["J", "A", "X"]) {
                                            await emoji(ch);
                                            await emoji("🐰");
                                          }
                                          setTimeout(async () => {
                                            await send("それにカフモ〜");
                                            await emoji("🤡");
                                            for (const ch of ["K", "A", "U", "F", "M", "O"]) await emoji(ch);
                                            setTimeout(async () => {
                                              setInterval(async () => {
                                                await send("毎日");
                                                await emoji("📅");
                                                await emoji("毎");
                                                await emoji("日");
                                              }, 100);
                                            }, 1500);
                                          }, 1000);
                                        }, 800);
                                      }, 1400);
                                    }, 1000);
                                  }, 1000);
                                }, 400);
                              }, 1000);
                            }, 2000);
                          }, 1000);
                          for (let i = 0; i < 70; i++) await emoji("🫧");
                        }, 1000);
                      }, 1600);
                    }, 1000);
                  }, 900);
                }, 700);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 800);
      }, 2500);
    }, 290);
  }, 11000);
};

export const handleEdenPachinkoMode = async (rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, botId: string) => {
  const agoraManager = new AgoraActionManager(rtcClient, rtmChannel, botId);
 
  const send = (t: string) => agoraManager.sendMessage(t);
  const emoji = (e: string) => agoraManager.sendEmoji(e);

  await agoraManager.playTrack("/assets/audio/rinapen/eden/first.wav", false);

  setTimeout(async () => {
  for (let i = 0; i < 30; i++) {
      await emoji("🟦");
      await emoji("🔵");
  }
    setTimeout(async () => {
      await send("えでん「あなる見せてくれたら画録は消すよ?」");
      for (let i = 0; i < 40; i++) {
          await emoji("🤓");
      }
      setTimeout(async () => {
        for (let i = 0; i < 20; i++) {
          await emoji("⬜");
          await emoji("⚪");
        }
        setTimeout(async () => {
          await send("女の子「それはちょっと…」");
          const text = "それはちょっと";
          for (const char of text) {
              await emoji(char);
              await new Promise(res => setTimeout(res, 100)); // 0.3秒間隔
          }
          setTimeout(async () => {
              for (let i = 0; i < 10; i++) {
                  await emoji("⬛");
                  await emoji("⚫");
              }
            setTimeout(async () => {
              await emoji("💔");
              setTimeout(async () => {
                  await send("チャンス！！！！！！");
                  for (let i = 0; i < 5; i++) {
                      await emoji("🎰");
                      await emoji("🎯");
                      await emoji("�");
                      await emoji("🚨");
                      await emoji("🏮");
                      await emoji("🀄");
                      await emoji("🎆");
                      await emoji("💫");
                      await emoji("🏹");
                      await emoji("�");
                      await emoji("�");
                      await emoji("🎇");
                  }
                  setTimeout(async () => {
                      await send("土下座をすれば大当たり！？");
                      setTimeout(async () => {
                          const text = "完全降伏します";
                          for (const char of text) {
                              await emoji(char);
                              await new Promise(res => setTimeout(res, 100)); // 0.3秒間隔
                          }
                          setTimeout(async () => {
                              for (let i = 0; i < 30; i++) {
                                  await emoji("🟥");
                                  await emoji("🔴");
                              }
                              setTimeout(async () => {
                                  await send("喧嘩をこの度売ってしまってすみませんでした");
                                  setTimeout(async () => {
                                      const text = "僕は、えでんです";
                                      for (const char of text) {
                                          await emoji(char);
                                          await new Promise(res => setTimeout(res, 120)); // 0.3秒間隔
                                      }
                                      setTimeout(async () => {
                                          await send("🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇");
                                          await emoji("🙇");
                                          setTimeout(async () => {
                                              for (let i = 0; i < 60; i++) {
                                                  await emoji("🌈");
                                                  await emoji("🤓");
                                                  await emoji("🌈");
                                              }
                                              setTimeout(async () => {
                                                  for (let i = 0; i < 50; i++) {
                                                      await emoji("🙇")
                                                      await emoji("🤓");
                                                      await emoji("🟥");
                                                      await emoji("🔴");
                                                      await emoji("❤");
                                                      await emoji("🟧");
                                                      await emoji("🟠");
                                                      await emoji("🧡");
                                                      await emoji("🟨");
                                                      await emoji("🟡");
                                                      await emoji("💛");
                                                      await emoji("🟩");
                                                      await emoji("🟢");
                                                      await emoji("💚");
                                                      await emoji("🟦");
                                                      await emoji("🔵");
                                                      await emoji("💙");
                                                      await emoji("🟪");
                                                      await emoji("🟣");
                                                      await emoji("💜");
                                                      await emoji("⬜");
                                                      await emoji("⚪");
                                                      await emoji("🤍");
                                                      await emoji("🙇")
                                                  }
                                              }, 500);
                                          }, 1000);
                                      }, 1500);
                                  // for (let i = 0; i < 70; i++) await emoji("🫧");
                                  }, 2400);
                              }, 800);
                          }, 500);
                      }, 1200);
                  }, 750);
              }, 1000);
            }, 650);
          }, 800);
        }, 1600);
      }, 850);
    }, 1100);
  }, 900);
};

function sendSequentialEmojis(agoraActionManager: AgoraActionManager, emotes: string[], delay: number, initialDelay = 0) {
  setTimeout(() => {
    emotes.forEach((emote, index) => {
      setTimeout(() => {
        agoraActionManager.sendEmoji(emote);
      }, delay * index);
    });
  }, initialDelay);
}

function sendAcceleratingNumbers(agoraManager: AgoraActionManager, start = 1, initialDelay = 2000) {
  let count = start;
  let delay = initialDelay;
  const minDelay = 50;

  sendNext(agoraManager, count, delay, minDelay);
}

async function sendNext(agoraManager: AgoraActionManager, count: number, delay: number, minDelay: number) {
  try {
    const digits = String(count++);
    
    for (const char of digits) {
      await agoraManager.sendEmoji(char);
    }

    delay *= 0.85;
    if (delay < minDelay) delay = minDelay;

    setTimeout(sendNext, delay);
  } catch (err) {
    console.error("送信エラー:", err);
  }
}