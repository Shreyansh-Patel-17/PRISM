import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  dob: string;
  skill: string[];
  resume: string;
  generatedQuestions: Map<
    string,
    {
      text: string;
      keywords: string[];
    }[]
  >;
  skillScores: Map<string, number>;
}

const UserSchema: Schema = new Schema({
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
  of: [{
    text: { type: String, required: true },
    keywords: [{ type: String }]
  }],
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

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
