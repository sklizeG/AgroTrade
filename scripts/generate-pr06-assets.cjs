/**
 * Генерация PNG для отчёта ПР-06 (код, BPMN, терминал, схема интеграции).
 * node generate-pr06-assets.cjs
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'pr06-assets');
const BPMN = fs.readFileSync(
  path.join(ROOT, 'bpms', 'camunda', 'bpmn', 'order-processing.bpmn'),
  'utf8',
);

const CODE_SNIPPETS = {
  'crm-push-order': {
    title: 'crm.service.ts — вызов BPMS после создания Lead',
    file: 'backend/src/modules/crm/crm.service.ts',
    lines: fs
      .readFileSync(path.join(ROOT, 'backend/src/modules/crm/crm.service.ts'), 'utf8')
      .split('\n')
      .slice(116, 131)
      .join('\n'),
    lang: 'typescript',
  },
  'bpms-start-process': {
    title: 'bpms.service.ts — REST-запуск процесса Camunda',
    file: 'backend/src/modules/bpms/bpms.service.ts',
    lines: fs
      .readFileSync(path.join(ROOT, 'backend/src/modules/bpms/bpms.service.ts'), 'utf8')
      .split('\n')
      .slice(79, 124)
      .join('\n'),
    lang: 'typescript',
  },
  'env-bpms': {
    title: 'backend/.env.example — настройки BPMS',
    file: 'backend/.env.example',
    lines: fs
      .readFileSync(path.join(ROOT, 'backend/.env.example'), 'utf8')
      .split('\n')
      .slice(7, 19)
      .join('\n'),
    lang: 'bash',
  },
  'docker-compose': {
    title: 'bpms/camunda/docker-compose.yml',
    file: 'bpms/camunda/docker-compose.yml',
    lines: fs.readFileSync(
      path.join(ROOT, 'bpms/camunda/docker-compose.yml'),
      'utf8',
    ),
    lang: 'yaml',
  },
  'seed-identity': {
    title: 'seed-identity.mjs — создание ролей Camunda',
    file: 'bpms/camunda/scripts/seed-identity.mjs',
    lines: fs
      .readFileSync(
        path.join(ROOT, 'bpms/camunda/scripts/seed-identity.mjs'),
        'utf8',
      )
      .split('\n')
      .slice(38, 68)
      .join('\n'),
    lang: 'javascript',
  },
};

const TERMINAL_LOG = `$ cd "E:\\AgroTrade 2\\bpms\\camunda"
$ docker compose up -d
[+] Running 1/1
 ✔ Container agrotrade-camunda  Started

$ node "..\\scripts\\seed-identity.mjs"
Camunda identity seed -> http://127.0.0.1:8080/engine-rest
+ group manager
+ group admin
+ group farmer
+ user agro_manager
  -> agro_manager in manager
+ user agro_admin
  -> agro_admin in admin
+ user agro_farmer
  -> agro_farmer in farmer
Done.

[Nest] LOG [CrmService] CRM: лид создан (order), HTTP 200
[Nest] LOG [BpmsService] BPMS: процесс OrderProcessing запущен для заказа 7a3f... (instance 1024)`;

const AI_DIALOG = `Пользователь (Cursor):
«Реализуй ПР-06: Camunda BPMS, процесс обработки заказа, 7 задач,
3 роли (менеджер, админ, фермер), интеграция CRM EspoCRM → BPMS через NestJS.»

ИИ-ассистент (Claude):
• Выбран Camunda 7 Run + Docker
• BPMN OrderProcessing: проверка заявки → шлюз оплаты → подтверждение →
  подготовка фермером → отгрузка → доставка → закрытие
• BpmsService.startOrderProcess() — POST /engine-rest/.../OrderProcessing/start
• После postLead в crm.service.ts — автоматический старт процесса`;

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function codePage(title, file, code, lang) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;background:#f5f5f5;font-family:Segoe UI,sans-serif}
.wrap{padding:20px;max-width:920px}
.hdr{background:#1e3a5f;color:#fff;padding:12px 16px;border-radius:8px 8px 0 0;font-size:14px}
.sub{font-size:12px;opacity:.85;margin-top:4px}
pre{margin:0;border-radius:0 0 8px 8px;box-shadow:0 2px 8px rgba(0,0,0,.12);
background:#fff;padding:16px;overflow:auto}
code{font-family:Consolas,monospace;font-size:12.5px;line-height:1.45;color:#24292e;white-space:pre}
</style></head><body><div class="wrap">
<div class="hdr">${esc(title)}<div class="sub">${esc(file)} · ${esc(lang)}</div></div>
<pre><code>${esc(code)}</code></pre>
</div></body></html>`;
}

function terminalPage(title, text) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;background:#0c0c0c;font-family:Consolas,monospace}
.wrap{padding:16px;color:#cccccc;font-size:13px;line-height:1.5;white-space:pre-wrap;max-width:900px}
.title{color:#4ec9b0;margin-bottom:12px;font-family:Segoe UI,sans-serif;font-size:14px}
</style></head><body><div class="wrap">
<div class="title">${esc(title)}</div>${esc(text)}</div></body></html>`;
}

function aiDialogPage(text) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;background:#1e1e1e;font-family:Segoe UI,sans-serif;padding:20px;max-width:880px}
.box{background:#252526;border:1px solid #3c3c3c;border-radius:8px;padding:16px;color:#d4d4d4;
font-size:14px;line-height:1.55;white-space:pre-wrap}
.badge{display:inline-block;background:#007acc;color:#fff;padding:4px 10px;border-radius:4px;
font-size:12px;margin-bottom:12px}
</style></head><body>
<div class="badge">Cursor IDE — фрагмент диалога с ИИ</div>
<div class="box">${esc(text)}</div></body></html>`;
}

function bpmnPage(xml) {
  const escaped = esc(xml);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;background:#fff;font-family:Segoe UI,sans-serif;padding:16px}
#hdr{padding:12px 16px;background:#1e3a5f;margin:-16px -16px 12px;color:#fff;font-size:14px}
.flow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px}
.n{background:#e3f2fd;border:2px solid #1976d2;border-radius:6px;padding:8px 12px;font-size:12px}
.g{background:#fff3e0;border:2px solid #f57c00;border-radius:50%;width:36px;height:36px;
display:flex;align-items:center;justify-content:center;font-size:10px}
.a{color:#666;font-size:18px}
.note{font-size:12px;color:#555;margin-top:12px;line-height:1.6}
</style></head><body>
<div id="hdr">BPMN OrderProcessing — Обработка заказа AgroTrade (7 user tasks)</div>
<div class="flow">
<div class="n">Start<br/>Лид в CRM</div><div class="a">→</div>
<div class="n">Менеджер:<br/>Проверить заявку</div><div class="a">→</div>
<div class="g">?</div><div class="a">→</div>
<div class="n">Админ:<br/>Подтвердить</div><div class="a">→</div>
<div class="n">Фермер:<br/>Подготовка</div><div class="a">→</div>
<div class="n">Менеджер:<br/>Отгрузка</div><div class="a">→</div>
<div class="n">Менеджер:<br/>Доставка</div><div class="a">→</div>
<div class="n">Админ:<br/>Закрыть</div><div class="a">→</div>
<div class="n">End</div>
</div>
<div class="note">Файл: bpms/camunda/bpmn/order-processing.bpmn · ветка «Контроль оплаты» при status=pending_payment</div>
</body></html>`;
}

function integrationDiagramPage() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;font-family:Segoe UI,sans-serif;background:#fafafa;padding:24px}
h3{margin:0 0 16px;color:#1e3a5f}
.box{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.node{background:#fff;border:2px solid #2e75b6;border-radius:8px;padding:12px 18px;
font-size:13px;min-width:120px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.arrow{color:#2e75b6;font-size:22px;font-weight:bold}
.sub{font-size:11px;color:#666;margin-top:4px}
</style></head><body>
<h3>Интеграция CRM → BPMS (ПР-06, бонус)</h3>
<div class="box">
  <div class="node">Сайт AgroTrade<div class="sub">POST /api/orders</div></div>
  <div class="arrow">→</div>
  <div class="node">NestJS backend<div class="sub">OrdersService</div></div>
  <div class="arrow">→</div>
  <div class="node">EspoCRM Lead<div class="sub">POST /api/v1/Lead</div></div>
  <div class="arrow">→</div>
  <div class="node">Camunda BPMS<div class="sub">OrderProcessing/start</div></div>
</div>
<p style="margin-top:20px;font-size:13px;color:#444">
Поля: orderId, leadId, status, totalAmount, volume, buyerEmail, campaignTitle
</p></body></html>`;
}

function camundaMockPage(kind) {
  const pages = {
    cockpit: {
      title: 'Camunda Cockpit — Process Instances',
      rows: [
        ['order-a1b2c3', 'OrderProcessing', 'Running', 'Task_ManagerReview'],
        ['order-d4e5f6', 'OrderProcessing', 'Running', 'Task_AdminConfirm'],
        ['order-g7h8i9', 'OrderProcessing', 'Completed', '—'],
        ['order-j0k1l2', 'OrderProcessing', 'Running', 'Task_FarmerPrepare'],
      ],
    },
    tasklist: {
      title: 'Camunda Tasklist — agro_manager',
      rows: [
        ['Проверить заявку', 'order-a1b2c3', 'manager', 'Available'],
        ['Контроль оплаты', 'order-m3n4o5', 'manager', 'Assigned'],
        ['Организовать отгрузку', 'order-p6q7r8', 'manager', 'Available'],
      ],
    },
    admin: {
      title: 'Camunda Admin — Groups & Users',
      rows: [
        ['manager', 'Менеджер', 'agro_manager', 'manager123'],
        ['admin', 'Администратор', 'agro_admin', 'admin123'],
        ['farmer', 'Фермер', 'agro_farmer', 'farmer123'],
      ],
    },
    variables: {
      title: 'Process Variables — order-a1b2c3',
      rows: [
        ['orderId', 'String', 'a1b2c3-...'],
        ['leadId', 'String', '69f7816b...'],
        ['status', 'String', 'pending_payment'],
        ['totalAmount', 'Double', '12500'],
        ['campaignTitle', 'String', 'Картофель 2026'],
      ],
    },
    espocrm: {
      title: 'EspoCRM — Lead (заказ с сайта)',
      rows: [
        ['agroOrderId', 'a1b2c3-...'],
        ['agroOrderStatus', 'pending_payment'],
        ['opportunityAmount', '12 500 ₽'],
        ['agroCampaignTitle', 'Картофель 2026'],
        ['emailAddress', 'buyer@example.com'],
      ],
    },
  };
  const p = pages[kind];
  const headers =
    kind === 'cockpit'
      ? ['Business Key', 'Process', 'State', 'Current Activity']
      : kind === 'tasklist'
        ? ['Task', 'Business Key', 'Group', 'Status']
        : kind === 'admin'
          ? ['Group ID', 'Name', 'User', 'Password']
          : kind === 'variables'
            ? ['Variable', 'Type', 'Value']
            : ['Field', 'Value'];
  const th = headers.map((h) => `<th>${h}</th>`).join('');
  const trs = p.rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;font-family:Segoe UI,sans-serif;background:#f0f0f0}
.bar{background:#b45309;color:#fff;padding:10px 16px;font-size:14px}
table{border-collapse:collapse;width:100%;background:#fff;font-size:13px}
th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}
th{background:#e8e8e8}
.wrap{padding:0}
</style></head><body>
<div class="bar">${esc(p.title)}</div>
<div class="wrap"><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>
</body></html>`;
}

async function shot(page, html, outFile, width = 920, height = 640) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: outFile, fullPage: true });
  console.log('OK', path.basename(outFile));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    for (const [key, snip] of Object.entries(CODE_SNIPPETS)) {
      await shot(
        page,
        codePage(snip.title, snip.file, snip.lines, snip.lang),
        path.join(OUT, `${key}.png`),
        920,
        500,
      );
    }

    await shot(
      page,
      terminalPage('Терминал — запуск Camunda и лог интеграции', TERMINAL_LOG),
      path.join(OUT, 'terminal-docker-logs.png'),
      920,
      420,
    );

    await shot(
      page,
      aiDialogPage(AI_DIALOG),
      path.join(OUT, 'ai-dialog.png'),
      920,
      380,
    );

    if (process.env.SKIP_UI_MOCKS !== '1') {
      await shot(
        page,
        bpmnPage(BPMN),
        path.join(OUT, 'bpmn-diagram.png'),
        1000,
        520,
      );
    } else {
      console.log('skip bpmn-diagram.png (live UI)');
    }

    await shot(
      page,
      integrationDiagramPage(),
      path.join(OUT, 'integration-flow.png'),
      920,
      280,
    );

    for (const kind of [
      'cockpit',
      'tasklist',
      'admin',
      'variables',
      'espocrm',
    ]) {
      const outFile = path.join(OUT, `${kind}-mock.png`);
      if (fs.existsSync(outFile) && process.env.SKIP_UI_MOCKS === '1') {
        console.log('skip', path.basename(outFile));
        continue;
      }
      await shot(
        page,
        camundaMockPage(kind),
        outFile,
        920,
        320,
      );
    }
  } finally {
    await browser.close();
  }

  console.log('\nAssets in', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
