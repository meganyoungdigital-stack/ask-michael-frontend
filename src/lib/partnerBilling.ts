export type PartnerBillingCalculation = {
  messagesUsed: number;
  includedMessages: number;
  billedExtraMessages: number;
  extraMessages: number;
  pricePerMessage: number;
  monthlyFee: number;
  extraUsageCharge: number;
  totalBill: number;
};

export function calculatePartnerBilling(data: {
  messages?: number | null;
  includedMessages?: number | null;
  billedExtraMessages?: number | null;
  pricePerMessage?: number | null;
  monthlyFee?: number | null;
}): PartnerBillingCalculation {
  const messagesUsed = Math.max(
    0,
    Number(data.messages ?? 0)
  );

  const includedMessages = Math.max(
    0,
    Number(data.includedMessages ?? 0)
  );

  const billedExtraMessages = Math.max(
    0,
    Number(data.billedExtraMessages ?? 0)
  );

  const pricePerMessage = Math.max(
    0,
    Number(data.pricePerMessage ?? 0)
  );

  const monthlyFee = Math.max(
    0,
    Number(data.monthlyFee ?? 0)
  );

  const totalExtraMessages = Math.max(
    0,
    messagesUsed - includedMessages
  );

  const extraMessages = Math.max(
    0,
    totalExtraMessages - billedExtraMessages
  );

  const extraUsageCharge =
    extraMessages * pricePerMessage;

  const totalBill =
    monthlyFee + extraUsageCharge;

  return {
    messagesUsed,
    includedMessages,
    billedExtraMessages,
    extraMessages,
    pricePerMessage,
    monthlyFee,
    extraUsageCharge,
    totalBill,
  };
}