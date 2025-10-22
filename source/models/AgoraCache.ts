
import mongoose, { Schema, Document } from "mongoose";

interface BotInfo {
  bot_user_id: string;
  agoraInfo: {
    status: string;
    agora_channel: string;
    agora_rtm_token: string;
    conference_call_user_uuid: string;
    agora_channel_token: string;
    APP_ID: string;
    [key: string]: any;
  };
  joined_at: Date;
}

interface IAgoraCache extends Document {
  conference_call_id: string;
  bots: BotInfo[];
  created_at: Date;
  updated_at: Date;
}

const BotInfoSchema: Schema = new Schema({
  bot_user_id: { type: String, required: true },
  agoraInfo: {
    status: { type: String, required: true },
    agora_channel: { type: String, required: true },
    agora_rtm_token: { type: String, required: true },
    conference_call_user_uuid: { type: String, required: true },
    agora_channel_token: { type: String, required: true },
    APP_ID: { type: String, required: true }
  },
  joined_at: { type: Date, default: Date.now }
}, { _id: false });

const AgoraCacheSchema: Schema = new Schema({
  conference_call_id: { type: String, required: true, unique: true },
  bots: [BotInfoSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const AgoraCacheModel = mongoose.model<IAgoraCache>(`${process.env.DB_USER}.AgoraCache`, AgoraCacheSchema);

export { IAgoraCache, AgoraCacheModel, BotInfo };