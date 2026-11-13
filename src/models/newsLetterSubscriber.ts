import { Schema, model, models } from "mongoose";

const newsletterSubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const NewsletterSubscriberModel =
  models.NewsletterSubscriber ||
  model(
    "NewsletterSubscriber",
    newsletterSubscriberSchema,
  );