const tracker = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const data = tracker.get(ip);
  
  if (!data || now > data.resetAt) {
    tracker.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  
  if (data.count >= limit) {
    return true;
  }
  
  data.count += 1;
  return false;
}
