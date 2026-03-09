export type TransactionalTier = "tier_1" | "tier_2";
export type MessagePurpose = "marketing" | "non_marketing";
export type MessageChannel = "email" | "notification" | "sms";

export const TRANSACTIONAL_TIER_LABELS: Record<TransactionalTier, string> = {
  tier_1: "Tier 1 - Critical",
  tier_2: "Tier 2 - Non-Critical",
};

export const CHANNEL_LABELS: Record<MessageChannel, string> = {
  email: "Email",
  notification: "Push Notification",
  sms: "SMS",
};

// Phase 1: Marketing vs Non-Marketing
export const PHASE1_QUESTIONS = {
  q1: "Is the purpose of this message to make a sale or promote products/services?",
  q2: "Does this message include ads, offers, or invitations to buy or join something?",
  q3: "Does this message only provide information about an existing booking or benefits the customer already has?",
  q4: "Is this message critical to the trip, such that its non-delivery would disrupt the journey or prevent Booking.com from providing the agreed service?",
};

// Phase 2: Transactional gate (shown only when Phase 1 -> non_marketing)
export const PHASE2_QUESTIONS = {
  q5: "Is this message triggered by a specific customer action OR by a system/regulatory event that the customer must be informed about (e.g., booking, payment, account change, property cancellation, security alert, legal notification)?",
  q6: "Would a reasonable customer expect to receive this message regardless of their marketing preferences?",
  q7: "Is the primary purpose of this message to provide operational or informational content (not to cross-sell, upsell, or re-engage)?",
  q8: "Does this message contain ANY promotional, cross-sell, or upsell content alongside its primary informational purpose?",
};

// Phase 3: Tier determination (shown only when Phase 2 -> transactional)
export const PHASE3_QUESTIONS = {
  q9: "Would non-delivery of this message prevent the customer from completing a required action (e.g., verifying identity via OTP, confirming a booking, receiving a payment receipt)?",
  q10: "Is delivery of this message required by law or regulation in any market (e.g., invoices, tax receipts, GDPR breach notifications, mandatory cancellation notices)?",
};

export const QUESTION_KEYS = {
  ...PHASE1_QUESTIONS,
  ...PHASE2_QUESTIONS,
  ...PHASE3_QUESTIONS,
};

export type TopicCategory = "state_change" | "behavioral";

export interface InputTopicConfig {
  label: string;
  category: TopicCategory;
  description: string;
  transactionalExamples?: string[];
}

export const INPUT_TOPICS: Record<string, InputTopicConfig> = {
  booking_events: {
    label: "Booking Events",
    category: "state_change",
    description: "Booking created, modified, cancelled",
    transactionalExamples: [
      "Booking confirmation",
      "Modification confirmation",
      "Cancellation confirmation",
    ],
  },
  payment_events: {
    label: "Payment Events",
    category: "state_change",
    description: "Payment succeeded, failed, refunded",
    transactionalExamples: [
      "Payment receipt",
      "Payment failure notification",
      "Refund confirmation",
    ],
  },
  identity_events: {
    label: "Identity & Security Events",
    category: "state_change",
    description: "OTP requested, password reset, account locked, suspicious login",
    transactionalExamples: [
      "OTP / verification code",
      "Password reset link",
      "Security alert",
      "Account lock notification",
    ],
  },
  invoice_events: {
    label: "Invoice & Legal Events",
    category: "state_change",
    description: "Invoice generated, GDPR breach detected, tax receipt issued",
    transactionalExamples: [
      "Invoice / tax receipt",
      "GDPR breach notification",
    ],
  },
  account_events: {
    label: "Account Events",
    category: "state_change",
    description: "Account created, email/phone change requested, account verified",
    transactionalExamples: [
      "Account creation verification",
      "Email/phone change verification",
    ],
  },
  browsing_events: {
    label: "Browsing Events",
    category: "behavioral",
    description: "Page views, search results, property views",
  },
  trip_reminder_events: {
    label: "Trip Reminder Events",
    category: "behavioral",
    description: "Check-in reminders, trip countdown, pre-arrival tips",
  },
  engagement_events: {
    label: "Engagement Events",
    category: "behavioral",
    description: "Cart abandonment, wishlist updates, price alerts",
  },
  loyalty_events: {
    label: "Loyalty & Rewards Events",
    category: "behavioral",
    description: "Status changes, points earned, reward expiry",
  },
  review_events: {
    label: "Review Events",
    category: "behavioral",
    description: "Post-stay review requests, review reminders",
  },
};
