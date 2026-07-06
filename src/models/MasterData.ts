import mongoose, { Schema, model, models } from 'mongoose';

const MasterDataSchema = new Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['POSITION', 'PROJECT_TYPE', 'SKILL'] 
  },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const MasterData = models.MasterData || model('MasterData', MasterDataSchema);
export default MasterData;
