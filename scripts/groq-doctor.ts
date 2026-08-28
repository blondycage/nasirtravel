import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const DEFAULT_BASE_URL = 'https://api.groq.com';
const DEFAULT_MODEL = 'openai/gpt-oss-20b';

function getEnv(name: string) {
  return process.env[name]?.trim();
}

function getBaseUrl() {
  return (getEnv('GROQ_BASE_URL') || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function getModel() {
  return getEnv('GROQ_MODEL') || DEFAULT_MODEL;
}

function getHeader(headers: Headers, name: string) {
  return headers.get(name) || undefined;
}

async function readResponse(res: Response) {
  const body = await res.text();

  return {
    status: res.status,
    ok: res.ok,
    cfRay: getHeader(res.headers, 'cf-ray'),
    server: getHeader(res.headers, 'server'),
    contentType: getHeader(res.headers, 'content-type'),
    bodyPreview: body.slice(0, 700),
  };
}

async function main() {
  const apiKey = getEnv('GROQ_API_KEY');

  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured.');
    process.exit(1);
  }

  const baseUrl = getBaseUrl();
  const model = getModel();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  console.log(JSON.stringify({
    baseUrl,
    model,
    apiKeyConfigured: true,
  }, null, 2));

  const modelsRes = await fetch(`${baseUrl}/openai/v1/models`, { headers });
  const modelsResult = await readResponse(modelsRes);
  console.log('\n/models');
  console.log(JSON.stringify(modelsResult, null, 2));

  if (!modelsRes.ok) {
    printAdvice(modelsResult.status, modelsResult.cfRay);
    process.exit(1);
  }

  const chatRes = await fetch(`${baseUrl}/openai/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with OK.' }],
      max_tokens: 8,
      temperature: 0,
    }),
  });
  const chatResult = await readResponse(chatRes);
  console.log('\n/chat/completions');
  console.log(JSON.stringify(chatResult, null, 2));

  if (!chatRes.ok) {
    printAdvice(chatResult.status, chatResult.cfRay);
    process.exit(1);
  }
}

function printAdvice(status: number, cfRay?: string) {
  console.log('\nDiagnosis');

  if (status === 403) {
    console.log('Groq is reachable, but Cloudflare/Groq denied this network path.');
    console.log('Try disabling VPN, iCloud Private Relay, corporate proxy/firewall, or switching network/hosting region.');
    console.log('If this is production hosting, contact Groq support with the cf-ray value below.');
    console.log(`cf-ray: ${cfRay || 'not returned'}`);
    return;
  }

  if (status === 401) {
    console.log('The API key was rejected. Create a new Groq API key and update GROQ_API_KEY.');
    return;
  }

  if (status === 404) {
    console.log('The endpoint or base URL is wrong. Check GROQ_BASE_URL.');
    return;
  }

  console.log('Unexpected Groq response. Check the status and body preview above.');
}

main().catch(error => {
  console.error('\nRequest failed before Groq returned an HTTP response.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
