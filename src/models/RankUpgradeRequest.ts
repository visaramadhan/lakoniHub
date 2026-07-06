import mongoose, { Schema, model, models } from 'mongoose';

const RankUpgradeRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fromRank: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], required: true },
  toRank: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  snapshot: {
    rankScore: { type: Number, default: 0 },
    stats: { type: Schema.Types.Mixed },
    projectsDone: { type: Number, default: 0 },
  },
  reviewedAt: { type: Date },
}, { timestamps: true });

const RankUpgradeRequest = models.RankUpgradeRequest || model('RankUpgradeRequest', RankUpgradeRequestSchema);
export default RankUpgradeRequest;

