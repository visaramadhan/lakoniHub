import { Schema, model, models } from 'mongoose';

const FreelancerPartySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sourceProject: { type: Schema.Types.ObjectId, ref: 'Project' },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, required: true },
    rank: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'D'],
      default: 'C'
    },
    role: {
      type: String,
      enum: ['OWNER', 'MEMBER'],
      default: 'MEMBER'
    }
  }]
}, { timestamps: true });

const FreelancerParty = models.FreelancerParty || model('FreelancerParty', FreelancerPartySchema);

export default FreelancerParty;
