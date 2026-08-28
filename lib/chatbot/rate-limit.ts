const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkChatRateLimit(identifier: string) {
  const now = Date.now();
  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIdentifier(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous';
}
