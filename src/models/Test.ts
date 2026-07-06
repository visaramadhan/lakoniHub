import mongoose, { Schema, model, models } from 'mongoose';

const TestSchema = new Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['GENERAL', 'TECHNICAL'], 
    default: 'GENERAL' 
  },
  targetRank: {
    type: String,
    enum: ['ALL', 'S', 'A', 'B', 'C', 'D'],
    default: 'ALL'
  },
  targetPosition: { type: String }, // e.g., 'Frontend', 'Backend' for TECHNICAL tests
  type: { 
    type: String, 
    enum: ['SCREENING', 'TECHNICAL', 'MINI_PROJECT', 'INTERVIEW', 'SOP'], 
    required: true 
  },
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    weight: { type: Number, default: 1 }
  }],
  totalWeight: { type: Number, default: 0 },
  passingScore: { type: Number, default: 70 },
}, { timestamps: true });

const Test = models.Test || model('Test', TestSchema);
export default Test;
