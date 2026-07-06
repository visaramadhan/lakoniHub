import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'CLIENT', 'FREELANCER'], 
    default: 'FREELANCER' 
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  isApproved: { type: Boolean, default: false },
  rank: { 
    type: String, 
    enum: ['S', 'A', 'B', 'C', 'D'], 
    default: 'C' 
  },
  position: { type: String },
  positions: [{
    name: { type: String, required: true },
    rank: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'D'],
      default: 'C'
    },
    isPrimary: { type: Boolean, default: false }
  }],
  cvUrl: { type: String },
  cvName: { type: String },
  skills: [String],
  stats: {
    initialScore: { type: Number, default: 0 },
    clientSatisfaction: { type: Number, default: 0 },
    projectSuccess: { type: Number, default: 0 },
    deadlineAccuracy: { type: Number, default: 0 },
    activity: { type: Number, default: 0 },
    peerReview: { type: Number, default: 0 },
    adminReview: { type: Number, default: 0 },
    complaintRate: { type: Number, default: 0 },
    collaboration: { type: Number, default: 0 },
  },
  currentWorkload: { type: Number, default: 0 }, // 0-100
  availability: { type: Number, default: 100 }, // 0-100
  reputation: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;
