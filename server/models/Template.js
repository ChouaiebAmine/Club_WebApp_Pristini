import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    enum: ['Treasurer', 'HR', 'Event Manager', 'President'],
  },
  templateType: {
    type: String,
    required: true,
    enum: ['Budget Template', 'Sponsorship Request', 'Financial Policy', 'Role Description', 'Recruitment Plan', 'Attendance Sheet', 'Event Planning Checklist', 'Event Ideas Tracker', 'Logistics Checklist'],
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Template', templateSchema);
