import mongoose, { Schema, model, models } from 'mongoose';

const SubmissionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [{
    questionIndex: Number,
    answerIndex: Number,
    isCorrect: Boolean
  }],
  score: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'PASSED', 'FAILED'], 
    default: 'PENDING' 
  },
  feedback: String,
  fileUrl: String, // For mini projects or CV
}, { timestamps: true });

const Submission = models.Submission || model('Submission', SubmissionSchema);
export default Submission;
