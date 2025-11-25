import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  skill: {
    type: [String],
    default: [],
  },
  resume: {
    type: String,
    default: '',
  },
  generatedQuestions: {
    type: Map,
    of: [String],
    default: {},
  },
  skillScores: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
