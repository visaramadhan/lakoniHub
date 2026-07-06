import { Schema, model, models } from 'mongoose';

const PartyTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, required: true },
    rank: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'D'],
      default: 'C'
    }
  }],
}, { timestamps: true });

const PartyTemplate = models.PartyTemplate || model('PartyTemplate', PartyTemplateSchema);
export default PartyTemplate;

