export type PartnerBillingCalculation = {
  messagesUsed: number;
  includedMessages: number;
  extraMessages: number;
  pricePerMessage: number;
  monthlyFee: number;
  extraUsageCharge: number;
  totalBill: number;
};

export function calculatePartnerBilling(data: {
  messages?: number | null;
  includedMessages?: number | null;
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

  const pricePerMessage = Math.max(
    0,
    Number(data.pricePerMessage ?? 0)
  );

  const monthlyFee = Math.max(
    0,
    Number(data.monthlyFee ?? 0)
  );

  const extraMessages = Math.max(
    0,
    messagesUsed - includedMessages
  );

  const extraUsageCharge =
    extraMessages * pricePerMessage;

  const totalBill =
    monthlyFee + extraUsageCharge;

  return {
    messagesUsed,
    includedMessages,
    extraMessages,
    pricePerMessage,
    monthlyFee,
    extraUsageCharge,
    totalBill,
  };
}