import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "zinna:checkout",
});

export const orderLookupRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "zinna:order-lookup",
});

export const orderLookupCodeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "zinna:order-lookup-code",
});

export const newsletterRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "zinna:newsletter",
});

export const adminLoginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "zinna:admin-login",
});

export const chatbotRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "zinna:chatbot",
});

export function getClientIdentifier(request: Request) {
  const vercelForwardedFor = request.headers.get(
    "x-vercel-forwarded-for",
  );

  const cloudflareIp = request.headers.get(
    "cf-connecting-ip",
  );

  const forwardedFor = request.headers.get("x-forwarded-for");

  const realIp = request.headers.get("x-real-ip");

  const ipAddress =
    vercelForwardedFor?.split(",")[0]?.trim() ??
    cloudflareIp ??
    forwardedFor?.split(",")[0]?.trim() ??
    realIp ??
    "unknown";

  return `ip:${ipAddress}`;
}

export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": String(retryAfterSeconds),
  };
}