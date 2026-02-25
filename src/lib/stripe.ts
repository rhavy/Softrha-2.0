import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
if (!stripeSecretKey) {
  console.warn("[Stripe] WARNING: STRIPE_SECRET_KEY is not defined in environment variables!");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-01-28.clover',
});

/**
 * Gera um link de pagamento no Stripe com suporte a PIX e Cartão Parcelado
 * @param amount Valor em Reais (ex: 2500.00)
 * @param description Descrição do produto
 * @param metadata Metadados para passar para o webhook (budgetId, type, etc)
 */
export const generatePaymentLink = async (
  amount: number,
  description: string,
  metadata: Record<string, string>
) => {
  console.log("[Stripe] Gerando link de pagamento:", { amount, description, metadata });

  try {
    const product = await stripe.products.create({
      name: description,
    });
    console.log("[Stripe] Produto criado:", product.id);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Valor em centavos
      currency: 'brl',
    });
    console.log("[Stripe] Preço criado:", price.id);

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      // Cartão de crédito com parcelamento (1-12x)
      // PIX está disponível mas requer ativação no dashboard do Stripe
      payment_method_types: ['card'],
      // Metadados do Payment Link
      metadata: {
        ...metadata,
        description,
      },
      // Passar metadados para o Payment Intent
      payment_intent_data: {
        metadata: {
          ...metadata,
          description,
        },
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/obrigado/pagamento?session_id={CHECKOUT_SESSION_ID}&payment_link_id=${metadata.budgetId}`,
        },
      },
    });
    console.log("[Stripe] Link de pagamento criado:", paymentLink.url);
    console.log("[Stripe] Payment Link ID:", paymentLink.id);

    return paymentLink;
  } catch (error) {
    console.error("[Stripe] Erro ao gerar link de pagamento:", error);
    throw error;
  }
};
