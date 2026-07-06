import { Schema, model, models } from 'mongoose';

const ProjectApplicationSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  applicationType: {
    type: String,
    enum: ['DIRECT', 'PARTY'],
    default: 'DIRECT'
  },
  party: { type: Schema.Types.ObjectId, ref: 'FreelancerParty' },
  partyName: { type: String },
  note: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

const ProjectApplication = models.ProjectApplication || model('ProjectApplication', ProjectApplicationSchema);

export default ProjectApplication;
