/**
 * Создаёт группы, пользователей и права доступа к Camunda Webapps (ПР-05 / ПР-06).
 * Запуск после старта docker compose:
 *   node bpms/camunda/scripts/seed-identity.mjs
 */
const baseUrl =
  process.env.BPMS_BASE_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8080';
const engine = `${baseUrl}/engine-rest`;
const user = process.env.BPMS_USERNAME || 'demo';
const pass = process.env.BPMS_PASSWORD || 'demo';
const auth = Buffer.from(`${user}:${pass}`).toString('base64');

const headers = {
  Authorization: `Basic ${auth}`,
  'Content-Type': 'application/json',
};

/** Camunda resource type: APPLICATION (Cockpit, Tasklist, Admin). */
const RESOURCE_APPLICATION = 0;

async function request(method, path, body) {
  const res = await fetch(`${engine}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  return null;
}

async function requestIgnoreConflict(method, path, body) {
  try {
    return await request(method, path, body);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes('-> 409') ||
      msg.includes('already exists') ||
      msg.includes('-> 500') ||
      msg.includes('-> 403')
    ) {
      return null;
    }
    throw e;
  }
}

const groups = [
  { id: 'manager', name: 'Менеджер', type: 'WORKFLOW' },
  { id: 'admin', name: 'Администратор', type: 'WORKFLOW' },
  { id: 'farmer', name: 'Фермер', type: 'WORKFLOW' },
];

const users = [
  {
    id: 'agromanager',
    firstName: 'Менеджер',
    lastName: 'AgroTrade',
    password: 'manager123',
    groups: ['manager'],
    apps: ['tasklist', 'cockpit'],
  },
  {
    id: 'agroadmin',
    firstName: 'Админ',
    lastName: 'AgroTrade',
    password: 'admin123',
    groups: ['admin'],
    apps: ['tasklist', 'cockpit', 'admin'],
  },
  {
    id: 'agrofarmer',
    firstName: 'Фермер',
    lastName: 'AgroTrade',
    password: 'farmer123',
    groups: ['farmer'],
    apps: ['tasklist', 'cockpit'],
  },
];

async function ensureAppAccess(userId, appId) {
  const existing = await request(
    'GET',
    `/authorization?userId=${encodeURIComponent(userId)}&resourceType=${RESOURCE_APPLICATION}&resourceId=${encodeURIComponent(appId)}&maxResults=1`,
  );
  if (existing?.length) {
    console.log(`  = app ${userId} -> ${appId} (already granted)`);
    return;
  }

  await request('POST', '/authorization/create', {
    type: 1,
    permissions: ['ACCESS'],
    userId,
    resourceType: RESOURCE_APPLICATION,
    resourceId: appId,
  });
  console.log(`  + app ${userId} -> ${appId}`);
}

async function main() {
  console.log(`Camunda identity seed -> ${engine}`);

  for (const g of groups) {
    await requestIgnoreConflict('POST', '/group/create', {
      id: g.id,
      name: g.name,
      type: g.type,
    });
    console.log(`+ group ${g.id}`);
  }

  for (const u of users) {
    await requestIgnoreConflict('POST', '/user/create', {
      profile: {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
      },
      credentials: { password: u.password },
    });
    console.log(`+ user ${u.id}`);

    for (const groupId of u.groups) {
      await requestIgnoreConflict('PUT', `/group/${groupId}/members/${u.id}`);
      console.log(`  -> ${u.id} in ${groupId}`);
    }

    for (const appId of u.apps) {
      try {
        await ensureAppAccess(u.id, appId);
      } catch (e) {
        console.log(
          `  ! app ${u.id} -> ${appId} (${e instanceof Error ? e.message : e})`,
        );
      }
    }
  }

  console.log('Done.');
  console.log('');
  console.log('Camunda Webapps login:');
  console.log('  demo / demo              — полный доступ (Cockpit, Tasklist, Admin)');
  console.log('  agromanager / manager123 — Tasklist + Cockpit');
  console.log('  agroadmin / admin123     — Tasklist + Cockpit + Admin');
  console.log('  agrofarmer / farmer123   — Tasklist + Cockpit');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
