export async function POST(req: Request) {
  const { plan } = await req.json();

  const amountMap: Record<string, number> = {
    free: 0,
    pro: 89900,      // R899 in cents
    pro_plus: 199900 // R1999 in cents
  };

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "customer@email.com", // replace later with logged-in user
      amount: amountMap[plan],
      callback_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    }),
  });

  const data = await response.json();

  return Response.json({
    url: data.data.authorization_url,
  });
}