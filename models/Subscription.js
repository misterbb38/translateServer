// models/Subscription.js

const mongoose = require('mongoose');

const MonthlyUsageSchema = new mongoose.Schema({
  month: {
    type: String, // format "YYYY-MM", ex: "2023-07"
    required: true
  },
  words: {
    type: Number,
    default: 0
  },
  requests: {
    type: Number,
    default: 0
  }
});

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free'
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  currentPeriodEnd: {
    type: Date,
    required: true // Assurer que ce champ est toujours défini
  },
  usageThisMonth: {
    characters: { type: Number, default: 0 },
    translations: { type: Number, default: 0 }
  },
  usageHistory: [MonthlyUsageSchema],
  isApproachingLimit: {
    type: Boolean,
    default: false
  },
  daysUntilRenewal: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
