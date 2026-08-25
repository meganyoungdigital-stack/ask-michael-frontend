export type PartnerPlan =
  | "starter"
  | "business"
  | "enterprise";

export type PartnerCurrency =
  | "USD"
  | "ZAR"
  | "EUR"
  | "GBP";

export type PartnerPlanConfig = {
  id: PartnerPlan;
  name: string;
  monthlyFee: number | null;
  includedMessages: number | null;
  pricePerMessage: number | null;
  maxUsers: number | null;
  maxMessages: number | null;
  currency: PartnerCurrency;
  customPricing: boolean;
  paystackPlanCode: string | null;
};

export const PARTNER_PLANS: Record<
  PartnerPlan,
  PartnerPlanConfig
> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyFee: 199,
    includedMessages: 2000,
    pricePerMessage: 0.05,
    maxUsers: 5,
    maxMessages: 5000,
    currency: "USD",
    customPricing: false,
    paystackPlanCode: "PLN_ktzatbfy1qx5qzw",
  },

  business: {
    id: "business",
    name: "Business",
    monthlyFee: 599,
    includedMessages: 10000,
    pricePerMessage: 0.035,
    maxUsers: 25,
    maxMessages: 25000,
    currency: "USD",
    customPricing: false,
    paystackPlanCode: "PLN_vgi8zoav8kvqjp2",
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyFee: null,
    includedMessages: null,
    pricePerMessage: null,
    maxUsers: null,
    maxMessages: null,
    currency: "USD",
    customPricing: true,
     paystackPlanCode: null,
  },
};