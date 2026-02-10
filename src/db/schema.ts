import { Schema, model, models } from "mongoose";
import { z } from "zod";

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  password: { type: String },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const accountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: { type: String },
  access_token: { type: String },
  expires_at: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  id_token: { type: String },
  session_state: { type: String },
});

const sessionSchema = new Schema({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expires: { type: Date, required: true },
});

const verificationTokenSchema = new Schema({
  identifier: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
});

const projectSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  json: { type: String, required: true },
  height: { type: Number, required: true },
  width: { type: Number, required: true },
  thumbnailUrl: { type: String },
  isTemplate: { type: Boolean },
  isPro: { type: Boolean },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: String, required: true },
  customerId: { type: String, required: true },
  priceId: { type: String, required: true },
  status: { type: String, required: true },
  currentPeriodEnd: { type: Date },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const User = models.User || model("User", userSchema);
export const Account = models.Account || model("Account", accountSchema);
export const Session = models.Session || model("Session", sessionSchema);
export const VerificationToken = models.VerificationToken || model("VerificationToken", verificationTokenSchema);
export const Project = models.Project || model("Project", projectSchema);
export const Subscription = models.Subscription || model("Subscription", subscriptionSchema);

export const projectsInsertSchema = z.object({
  name: z.string(),
  json: z.string(),
  width: z.number(),
  height: z.number(),
  isTemplate: z.boolean().optional(),
  isPro: z.boolean().optional(),
  thumbnailUrl: z.string().optional().nullable(),
});
