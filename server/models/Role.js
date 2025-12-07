import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
    enum: ['President', 'Treasurer', 'HR', 'Event Manager', 'Member'],
  },
  permissions: {
    create_event: {
      type: Boolean,
      default: false,
    },
    edit_event: {
      type: Boolean,
      default: false,
    },
    delete_event: {
      type: Boolean,
      default: false,
    },
    manage_budget: {
      type: Boolean,
      default: false,
    },
    manage_members: {
      type: Boolean,
      default: false,
    },
    send_announcements: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Role', roleSchema);
