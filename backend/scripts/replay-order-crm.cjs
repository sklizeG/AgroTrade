/**
 * Повторная синхронизация заказа в EspoCRM + Camunda.
 *   node scripts/replay-order-crm.mjs <orderId>
 */
const { PrismaClient } = require('@prisma/client');

const orderId = process.argv[2];
if (!orderId) {
  console.error('Usage: node scripts/replay-order-crm.mjs <orderId>');
  process.exit(1);
}

const crmBase = (process.env.CRM_BASE_URL || 'http://127.0.0.1:8085').replace(
  /\/$/,
  '',
);
const crmUser = process.env.CRM_USERNAME || 'admin';
const crmPass = process.env.CRM_PASSWORD || 'admin123';
const bpmsBase = (process.env.BPMS_BASE_URL || 'http://127.0.0.1:8080').replace(
  /\/$/,
  '',
);
const bpmsUser = process.env.BPMS_USERNAME || 'demo';
const bpmsPass = process.env.BPMS_PASSWORD || 'demo';
const processKey = process.env.BPMS_PROCESS_KEY || 'OrderProcessing';

const crmAuth = `Basic ${Buffer.from(`${crmUser}:${crmPass}`).toString('base64')}`;
const bpmsAuth = `Basic ${Buffer.from(`${bpmsUser}:${bpmsPass}`).toString('base64')}`;

function formatPhone(raw) {
  if (!raw?.trim()) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith('7')) return `+7${digits.slice(1)}`;
  if (digits.length === 10) return `+7${digits}`;
  return undefined;
}

function resolvePhone(raw, label) {
  if (!raw?.trim()) return undefined;
  const formatted = formatPhone(raw);
  if (!formatted) {
    console.warn(`CRM: телефон "${raw}" не прошёл проверку (${label}), phoneNumber не отправляется.`);
  }
  return formatted;
}

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { include: { buyerProfile: true } },
      campaign: true,
    },
  });

  if (!row) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const email = row.buyer.email;
  const rawPhone = row.buyer.phone || '';
  const displayName = row.buyer.buyerProfile?.displayName?.trim() || email;
  const companyName = row.buyer.buyerProfile?.companyName?.trim() || null;
  const espPhone = resolvePhone(rawPhone, `order ${row.id}`);

  const lead = {
    firstName: displayName.split(' ')[0] || email.split('@')[0],
    lastName: displayName.split(' ').slice(1).join(' ') || companyName || 'Клиент',
    emailAddress: email,
    opportunityAmount: row.totalAmount,
    opportunityAmountCurrency: 'RUB',
    description: `AgroTrade · ID заказа: ${row.id}\nСтатус: ${row.status}\nОбъём: ${row.volume}`,
    agroOrderId: row.id,
    agroOrderStatus: row.status,
    agroOrderTotalAmount: row.totalAmount,
    agroOrderVolume: row.volume,
    agroBuyerEmail: email,
    agroBuyerPhone: rawPhone || null,
    agroCampaignTitle: row.campaign.title,
  };
  if (espPhone) lead.phoneNumber = espPhone;

  let leadRes = await fetch(`${crmBase}/api/v1/Lead`, {
    method: 'POST',
    headers: { Authorization: crmAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });

  let leadText = await leadRes.text();
  let leadId = null;
  if (leadRes.ok) {
    leadId = JSON.parse(leadText).id;
  } else {
    try {
      const parsed = JSON.parse(leadText);
      leadId = Array.isArray(parsed) ? parsed[0]?.id : parsed?.id;
    } catch {
      /* ignore */
    }
  }

  if (!leadId) {
    throw new Error(`CRM Lead failed HTTP ${leadRes.status}: ${leadText.slice(0, 300)}`);
  }

  console.log(`CRM Lead: ${leadId}`);

  const existing = await fetch(
    `${bpmsBase}/engine-rest/process-instance?businessKey=${encodeURIComponent(`order-${row.id}`)}&active=true`,
    { headers: { Authorization: bpmsAuth } },
  );
  const instances = await existing.json();
  if (instances.length) {
    console.log(`BPMS already active: ${instances[0].id}`);
    return;
  }

  const startRes = await fetch(
    `${bpmsBase}/engine-rest/process-definition/key/${encodeURIComponent(processKey)}/start`,
    {
      method: 'POST',
      headers: { Authorization: bpmsAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessKey: `order-${row.id}`,
        variables: {
          leadId: { value: leadId, type: 'String' },
          orderId: { value: row.id, type: 'String' },
          status: { value: row.status, type: 'String' },
          totalAmount: { value: row.totalAmount, type: 'Double' },
          volume: { value: row.volume, type: 'Double' },
          buyerEmail: { value: email, type: 'String' },
          buyerPhone: { value: rawPhone || '', type: 'String' },
          buyerDisplayName: { value: displayName, type: 'String' },
          buyerCompanyName: { value: companyName || '', type: 'String' },
          campaignTitle: { value: row.campaign.title, type: 'String' },
        },
      }),
    },
  );

  const startText = await startRes.text();
  if (!startRes.ok) {
    throw new Error(`BPMS start failed HTTP ${startRes.status}: ${startText.slice(0, 300)}`);
  }

  const instance = JSON.parse(startText);
  console.log(`BPMS instance: ${instance.id}`);
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
