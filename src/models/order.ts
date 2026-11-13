import mongoose, {
  Schema,
  model,
  models,
  type InferSchemaType,
} from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

export type OrderItem = InferSchemaType<
  typeof orderItemSchema
>;

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    checkoutRequestId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      index: true,
    },

    customer: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

    shippingAddress: {
      line1: {
        type: String,
        required: true,
      },

      line2: String,

      city: {
        type: String,
        required: true,
      },

      state: String,

      postalCode: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
        uppercase: true,
      },
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totals: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      shipping: {
        type: Number,
        required: true,
        min: 0,
      },

      tax: {
        type: Number,
        required: true,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        required: true,
        uppercase: true,
      },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    fulfillmentStatus: {
      type: String,
      enum: [
        "unfulfilled",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "unfulfilled",
      index: true,
    },

    inventoryStatus: {
      type: String,
      enum: ["reserved", "sold", "released"],
      default: "reserved",
      index: true,
    },

    reservationExpiresAt: {
      type: Date,
      index: true,
    },

    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    refundStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "requiresAction",
        "succeeded",
        "failed",
        "cancelled",
      ],
      default: "none",
      index: true,
    },

    stripeRefundId: {
      type: String,
      unique: true,
      sparse: true,
    },

    refundRequestedAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },

    refundFailureReason: {
      type: String,
      trim: true,
    },

    confirmationEmailSentAt: {
      type: Date,
    },

    trackingNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  orderNumber: 1,
  "customer.email": 1,
});

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel =
  models.Order || model("Order", orderSchema);