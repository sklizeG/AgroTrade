/**
 * Живые скриншоты Camunda + EspoCRM для отчёта ПР-06.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = path.join(__dirname, '..', 'docs', 'pr06-assets');
const auth = Buffer.from('demo:demo').toString('base64');

async function startSampleProcesses() {
  const samples = [
    {
      businessKey: 'order-demo-001',
      status: 'pending_payment',
      orderId: 'demo-001',
      leadId: 'lead-001',
      totalAmount: 12500,
      volume: 50,
      buyerEmail: 'buyer1@agrotrade.local',
      campaignTitle: 'Картофель 2026',
    },
    {
      businessKey: 'order-demo-002',
      status: 'confirmed',
      orderId: 'demo-002',
      leadId: 'lead-002',
      totalAmount: 8900,
      volume: 30,
      buyerEmail: 'buyer2@agrotrade.local',
      campaignTitle: 'Мёд 2026',
    },
    {
      businessKey: 'order-demo-003',
      status: 'pending_payment',
      orderId: 'demo-003',
      leadId: 'lead-003',
      totalAmount: 4200,
      volume: 15,
      buyerEmail: 'buyer3@agrotrade.local',
      campaignTitle: 'Яблоки 2026',
    },
    {
      businessKey: 'order-demo-004',
      status: 'reserved',
      orderId: 'demo-004',
      leadId: 'lead-004',
      totalAmount: 15600,
      volume: 80,
      buyerEmail: 'restaurant@agrotrade.local',
      campaignTitle: 'Овощи B2B',
    },
  ];

  for (const s of samples) {
    const body = {
      businessKey: s.businessKey,
      variables: {
        orderId: { value: s.orderId, type: 'String' },
        leadId: { value: s.leadId, type: 'String' },
        status: { value: s.status, type: 'String' },
        totalAmount: { value: s.totalAmount, type: 'Double' },
        volume: { value: s.volume, type: 'Double' },
        buyerEmail: { value: s.buyerEmail, type: 'String' },
        buyerPhone: { value: '+79001234567', type: 'String' },
        buyerDisplayName: { value: 'Покупатель AgroTrade', type: 'String' },
        buyerCompanyName: { value: 'Ресторан', type: 'String' },
        campaignTitle: { value: s.campaignTitle, type: 'String' },
      },
    };
    const res = await fetch(
      'http://127.0.0.1:8080/engine-rest/process-definition/key/OrderProcessing/start',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      console.warn('start', s.businessKey, res.status, await res.text());
    } else {
      console.log('started', s.businessKey);
    }
  }
}

async function camundaLogin(page, user, pass) {
  await page.goto('http://127.0.0.1:8080/camunda/app/tasklist/default/#/login', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await page.waitForSelector('input[name="username"], input[type="text"]', {
    timeout: 15000,
  });
  const userSel = 'input[name="username"], input[type="text"]';
  const passSel = 'input[name="password"], input[type="password"]';
  await page.$eval(userSel, (el, v) => {
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, user);
  await page.$eval(passSel, (el, v) => {
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, pass);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"], .btn-primary'),
  ]);
  await new Promise((r) => setTimeout(r, 2000));
}

async function shot(page, file, url, waitMs = 3000) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, waitMs));
  await page.screenshot({ path: file, fullPage: false });
  console.log('shot', path.basename(file));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await startSampleProcesses();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  // Cockpit — definitions
  await camundaLogin(page, 'demo', 'demo');
  await shot(
    page,
    path.join(OUT, 'cockpit-mock.png'),
    'http://127.0.0.1:8080/camunda/app/cockpit/default/#/processes',
    4000,
  );

  // Process diagram
  await shot(
    page,
    path.join(OUT, 'bpmn-diagram.png'),
    'http://127.0.0.1:8080/camunda/app/cockpit/default/#/process-definition/OrderProcessing:1:*/history',
    2000,
  ).catch(async () => {
    await shot(
      page,
      path.join(OUT, 'bpmn-diagram.png'),
      'http://127.0.0.1:8080/camunda/app/cockpit/default/#/processes',
      3000,
    );
  });

  // Runtime instances
  await shot(
    page,
    path.join(OUT, 'cockpit-instances.png'),
    'http://127.0.0.1:8080/camunda/app/cockpit/default/#/processes?searchQuery=%5B%5D',
    4000,
  );

  // Admin groups
  await shot(
    page,
    path.join(OUT, 'admin-mock.png'),
    'http://127.0.0.1:8080/camunda/app/admin/default/#/groups',
    4000,
  );

  // Tasklist as manager
  await camundaLogin(page, 'agromanager', 'manager123');
  await shot(
    page,
    path.join(OUT, 'tasklist-mock.png'),
    'http://127.0.0.1:8080/camunda/app/tasklist/default/#/',
    4000,
  );

  // EspoCRM Lead list
  try {
    await page.goto('http://127.0.0.1:8085/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await new Promise((r) => setTimeout(r, 2000));
    const loginUser = await page.$('input[name="username"], #field-userName');
    if (loginUser) {
      await page.type('input[name="username"], #field-userName', 'admin', {
        delay: 30,
      });
      await page.type('input[name="password"], #field-password', 'admin123', {
        delay: 30,
      });
      await page.click('button.btn-primary, button[type="submit"]');
      await new Promise((r) => setTimeout(r, 3000));
    }
    await page.goto('http://127.0.0.1:8085/#Lead', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await new Promise((r) => setTimeout(r, 4000));
    await page.screenshot({
      path: path.join(OUT, 'espocrm-mock.png'),
      fullPage: false,
    });
    console.log('shot espocrm-mock.png');
  } catch (e) {
    console.warn('EspoCRM shot skipped:', e.message);
  }

  await browser.close();
  console.log('\nLive UI shots done. Run generate-pr06-assets.cjs for code PNGs.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
