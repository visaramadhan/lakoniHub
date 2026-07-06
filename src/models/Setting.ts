import mongoose, { Schema, model, models } from 'mongoose';

const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
}, { timestamps: true });

const Setting = models.Setting || model('Setting', SettingSchema);
export default Setting;
