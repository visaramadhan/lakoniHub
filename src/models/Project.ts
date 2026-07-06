import mongoose, { Schema, model, models } from 'mongoose';

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rank: { 
    type: String, 
    enum: ['SS', 'S', 'A', 'B', 'C'], 
    default: 'B' 
  },
  budget: { type: Number, required: true },
  clientFee: { type: Number, required: true }, // The fee admin sets, freelancer only sees this or part of it
  totalBudget: { type: Number, required: true }, // Admin sets this
  status: { 
    type: String, 
    enum: ['OPEN', 'ON_PROGRESS', 'REVISION', 'DONE', 'CANCELLED'], 
    default: 'OPEN' 
  },
  client: { type: String, required: true }, // Simple string for now as seen in form
  projectType: { type: String },
  feeForFreelancer: { type: Number, default: 0 },
  requiredSkills: [String], // Simplified as seen in form
  requiredPositions: [{
    position: { type: String, required: true },
    count: { type: Number, default: 1 },
    minRank: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'D'],
      default: 'C'
    },
    equivalentCount: { type: Number, default: 1 }
  }],
  team: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'MEMBER' },
    position: String,
    rankAtAssignment: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'D']
    },
    source: {
      type: String,
      enum: ['DIRECT', 'PARTY'],
      default: 'DIRECT'
    },
    partyName: String,
    fee: Number
  }],
  tasks: [{
    title: String,
    status: { type: String, enum: ['PENDING', 'DONE'], default: 'PENDING' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  meetings: [{
    title: String,
    date: Date,
    isDone: { type: Boolean, default: false },
    mom: String, // Minutes of Meeting (filename or content)
  }],
  files: [{
    name: String,
    url: String,
    uploadedBy: String
  }],
  deadline: { type: Date, required: true },
  riskScore: { type: Number, default: 0 },
  synergyScore: { type: Number, default: 0 },
  capabilityPoint: { type: Number, default: 0 },
  startedAt: { type: Date },
}, { timestamps: true });

const Project = models.Project || model('Project', ProjectSchema);
export default Project;
