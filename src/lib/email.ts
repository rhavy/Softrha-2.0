import { Resend } from 'resend';

// Inicializar Resend
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Envia um email usando Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'SoftRha <noreply@softrha.com>',
}: SendEmailOptions) {
  if (!resend) {
    console.warn('Resend não configurado. Email não enviado.');
    console.log('Email seria enviado para:', to);
    console.log('Assunto:', subject);
    console.log('Conteúdo:', html);
    return { success: false, error: 'Resend não configurado' };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    console.log('Email enviado com sucesso:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error };
  }
}

/**
 * Template de email para novo orçamento
 */
export function createNewBudgetEmailTemplate(data: {
  clientName: string;
  clientEmail: string;
  company?: string | null;
  projectType: string;
  estimatedMin: number;
  estimatedMax: number;
  details?: string | null;
}) {
  const { clientName, clientEmail, company, projectType, estimatedMin, estimatedMax, details } = data;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 18px; font-weight: 600; color: #333; margin-top: 5px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎉 Novo Orçamento Recebido!</h1>
          </div>
          <div class="content">
            <p>Olá equipe SoftRha,</p>
            <p>Um novo orçamento foi solicitado através do site. Confira os detalhes abaixo:</p>
            
            <div class="info-box">
              <div style="margin-bottom: 15px;">
                <div class="label">Cliente</div>
                <div class="value">${clientName}</div>
              </div>
              <div style="margin-bottom: 15px;">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${clientEmail}">${clientEmail}</a></div>
              </div>
              ${company ? `
              <div style="margin-bottom: 15px;">
                <div class="label">Empresa</div>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              <div style="margin-bottom: 15px;">
                <div class="label">Tipo de Projeto</div>
                <div class="value">${projectType}</div>
              </div>
              <div style="margin-bottom: 15px;">
                <div class="label">Valor Estimado</div>
                <div class="value">R$ ${estimatedMin.toLocaleString('pt-BR')} - R$ ${estimatedMax.toLocaleString('pt-BR')}</div>
              </div>
              ${details ? `
              <div style="margin-bottom: 15px;">
                <div class="label">Detalhes</div>
                <div class="value" style="font-size: 14px; font-weight: normal;">${details}</div>
              </div>
              ` : ''}
            </div>

            <p style="text-align: center;">
              <a href="http://localhost:3000/dashboard/orcamentos" class="cta-button">
                Ver Orçamento no Dashboard
              </a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              💡 Dica: Entre em contato com o cliente o mais breve possível para aumentar as chances de conversão.
            </p>
          </div>
          <div class="footer">
            <p>SoftRha - Transformando ideias em soluções digitais</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Novo Orçamento Recebido!
    
    Cliente: ${clientName}
    Email: ${clientEmail}
    ${company ? `Empresa: ${company}` : ''}
    Tipo de Projeto: ${projectType}
    Valor Estimado: R$ ${estimatedMin.toLocaleString('pt-BR')} - R$ ${estimatedMax.toLocaleString('pt-BR')}
    ${details ? `Detalhes: ${details}` : ''}
    
    Acesse o dashboard para ver mais detalhes: http://localhost:3000/dashboard/orcamentos
  `;

  return { html, text };
}

/**
 * Template de email de confirmação para cliente
 */
export function createBudgetConfirmationEmailTemplate(data: {
  clientName: string;
  projectType: string;
  estimatedMin: number;
  estimatedMax: number;
}) {
  const { clientName, projectType, estimatedMin, estimatedMax } = data;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 16px; font-weight: 600; color: #333; margin-top: 5px; }
          .timeline { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Orçamento Recebido! 🎉</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Obrigado por entrar em contato conosco</p>
          </div>
          <div class="content">
            <p>Olá ${clientName},</p>
            
            <p>Recebemos sua solicitação de orçamento para <strong>${projectType}</strong>. Obrigado pelo interesse em nossos serviços!</p>
            
            <div class="info-box">
              <div style="margin-bottom: 15px;">
                <div class="label">Tipo de Projeto</div>
                <div class="value">${projectType}</div>
              </div>
              <div style="margin-bottom: 15px;">
                <div class="label">Investimento Estimado</div>
                <div class="value">R$ ${estimatedMin.toLocaleString('pt-BR')} - R$ ${estimatedMax.toLocaleString('pt-BR')}</div>
              </div>
            </div>

            <div class="timeline">
              <h3 style="margin: 0 0 15px 0; color: #667eea;">📅 Próximos Passos</h3>
              <ol style="margin: 0; padding-left: 20px; line-height: 2;">
                <li>Nossa equipe analisará sua solicitação</li>
                <li>Entraremos em contato em até <strong>24 horas úteis</strong></li>
                <li>Agendaremos uma reunião para entender melhor suas necessidades</li>
                <li>Enviaremos proposta comercial detalhada</li>
              </ol>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              💡 <strong>Dica:</strong> Enquanto isso, que tal conhecer nossos casos de sucesso? 
              Visite nosso site para ver projetos que já entregamos.
            </p>

            <p style="margin-top: 25px;">
              Atenciosamente,<br>
              <strong>Equipe SoftRha</strong>
            </p>
          </div>
          <div class="footer">
            <p>SoftRha - Transformando ideias em soluções digitais</p>
            <p>Este é um email automático de confirmação.</p>
            <p style="margin-top: 10px;">
              <a href="http://localhost:3000" style="color: #667eea; text-decoration: none;">Visite nosso site</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Orçamento Recebido!
    
    Olá ${clientName},
    
    Recebemos sua solicitação de orçamento para ${projectType}.
    
    Investimento Estimado: R$ ${estimatedMin.toLocaleString('pt-BR')} - R$ ${estimatedMax.toLocaleString('pt-BR')}
    
    Próximos Passos:
    1. Nossa equipe analisará sua solicitação
    2. Entraremos em contato em até 24 horas úteis
    3. Agendaremos uma reunião para entender melhor suas necessidades
    4. Enviaremos proposta comercial detalhada
    
    Atenciosamente,
    Equipe SoftRha
    
    Visite nosso site: http://localhost:3000
  `;

  return { html, text };
}
