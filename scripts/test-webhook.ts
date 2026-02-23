

// Configurações
const API_URL = 'http://localhost:3000/api/webhooks/stripe';
const BUDGET_ID = process.argv[2]; // Pegar ID do budget passado no comando

if (!BUDGET_ID) {
    console.error("Uso: npx ts-node scripts/test-webhook.ts <BUDGET_ID>");
    process.exit(1);
}

async function simulateWebhook() {
    console.log(`Simulando webhook para o budget: ${BUDGET_ID}`);

    const mockPayload = {
        id: "evt_test_" + Date.now(),
        type: "checkout.session.completed",
        data: {
            object: {
                id: "cs_test_" + Date.now(),
                payment_status: "paid",
                metadata: {
                    budgetId: BUDGET_ID,
                    type: "down_payment"
                },
                payment_intent: "pi_test_" + Date.now()
            }
        }
    };

    try {
        // Nota: O webhook real valida a assinatura. Para fins de teste, você pode:
        // 1. Temporariamente comentar a validação da assinatura em src/app/api/webhooks/stripe/route.ts
        // 2. Ou usar o segredo de teste se você o tiver.

        console.log("Enviando POST para", API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': 'test_signature_bypass' // Se você comentar a validação, qualquer coisa serve
            },
            body: JSON.stringify(mockPayload)
        });

        const data = await response.json();
        console.log("Resposta do servidor:", response.status, data);
    } catch (error: any) {
        console.error("Erro ao simular webhook:", error.message);
    }
}

simulateWebhook();
