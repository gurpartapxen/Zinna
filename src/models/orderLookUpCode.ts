import {
  InferSchemaType,
  model,
  models,
  Schema,
} from "mongoose";

const orderLookupCodeSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    orderNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

orderLookupCodeSchema.index(
  {
    email: 1,
    orderNumber: 1,
  },
  {
    unique: true,
  },
);

orderLookupCodeSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export type OrderLookupCode = InferSchemaType<
  typeof orderLookupCodeSchema
>;

export const OrderLookupCodeModel =
  models.OrderLookupCode ||
  model("OrderLookupCode", orderLookupCodeSchema);