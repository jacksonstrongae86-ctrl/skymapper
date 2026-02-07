// API Middleware for SkyMapper
import { NextApiRequest, NextApiResponse } from 'next';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function checkRateLimit(req: NextApiRequest): boolean {
  const ip = getClientIp(req);
  const now = Date.now();
  
  // Get or initialize request timestamps for this IP
  let timestamps = rateLimitMap.get(ip) || [];
  
  // Remove old timestamps outside the window
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  // Check if limit exceeded
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Add current timestamp
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  
  return true;
}

export function setCorsHeaders(res: NextApiResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function apiResponse<T>(
  res: NextApiResponse,
  status: number,
  success: boolean,
  data?: T,
  error?: string
): void {
  setCorsHeaders(res);
  res.status(status).json({
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
  } as ApiResponse<T>);
}

export function withMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set CORS headers
    setCorsHeaders(res);
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Check rate limit
    if (!checkRateLimit(req)) {
      apiResponse(res, 429, false, undefined, 'Rate limit exceeded. Please try again later.');
      return;
    }
    
    // Log request
    const ip = getClientIp(req);
    console.log(`[API] ${req.method} ${req.url} from ${ip}`);
    
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      apiResponse(res, 500, false, undefined, errorMessage);
    }
  };
}
