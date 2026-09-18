import type { Request, Response } from 'express';
import { Resend } from 'resend';

// In-memory rate limiter for server API
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Clean up expired entries to prevent memory growth
  for (const [key, entry] of ipRequestCounts.entries()) {
    if (now > entry.resetTime) {
      ipRequestCounts.delete(key);
    }
  }

  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function parseBrowser(ua?: string): string {
  if (!ua) return 'Not available';
  if (ua.includes('Firefox/')) return 'Firefox ' + (ua.split('Firefox/')[1]?.split(' ')[0] || '');
  if (ua.includes('Edg/')) return 'Edge ' + (ua.split('Edg/')[1]?.split(' ')[0] || '');
  if (ua.includes('Chrome/')) return 'Chrome ' + (ua.split('Chrome/')[1]?.split(' ')[0] || '');
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari ' + (ua.split('Version/')[1]?.split(' ')[0] || '');
  return ua;
}

function parseOS(osStr?: string, ua?: string): string {
  if (!osStr && !ua) return 'Not available';
  const combined = `${osStr || ''} ${ua || ''}`.toLowerCase();
  if (combined.includes('win')) return 'Windows';
  if (combined.includes('mac')) return 'macOS';
  if (combined.includes('linux')) return 'Linux';
  if (combined.includes('android')) return 'Android';
  if (combined.includes('iphone') || combined.includes('ipad')) return 'iOS';
  return osStr || 'Not available';
}

async function parseRequestBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf-8'));
      } catch {
        return {};
      }
    }
    if (typeof req.body === 'object') {
      return req.body;
    }
  }

  // Handle stream in case body-parser did not run
  if (typeof req.on === 'function') {
    try {
      const buffers: Buffer[] = [];
      let totalBytes = 0;
      const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB maximum payload safety limit

      for await (const chunk of req) {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        totalBytes += buf.length;
        if (totalBytes > MAX_PAYLOAD_BYTES) {
          return {};
        }
        buffers.push(buf);
      }
      const raw = Buffer.concat(buffers).toString('utf-8');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  return {};
}

function sendJson(res: any, status: number, data: Record<string, unknown>) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleReportBug(req: Request | any, res: Response | any) {
  // CORS & Method checks for Vercel / serverless runtime
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (typeof res.status === 'function') {
      return res.status(204).end();
    }
    res.statusCode = 204;
    return res.end();
  }

  if (req.method && req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed. Please use POST.' });
  }

  try {
    // Parse request body reliably across Vercel and Express
    const body = await parseRequestBody(req);

    // 1. IP Rate Limiting
    const clientIp =
      (req.headers?.['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      (req.headers?.['x-real-ip'] as string) ||
      req.socket?.remoteAddress ||
      'unknown';

    if (isRateLimited(clientIp)) {
      return sendJson(res, 429, { error: 'Too many bug report requests. Please try again later.' });
    }

    // 2. Honeypot Validation
    const honeypot = body?.website || body?.company_url;
    if (honeypot && String(honeypot).trim().length > 0) {
      // Silently discard bot submission with 200 OK
      return sendJson(res, 200, { success: true });
    }

    // 3. Payload Validation
    const { category, description, contact, metadata, screenshot } = body || {};

    const validCategories = [
      'bug',
      'feature',
      'performance',
      'other',
      'Bug Report',
      'Feature Request',
      'Performance Issue',
      'Other',
    ];

    if (!category || !validCategories.includes(category)) {
      return sendJson(res, 400, { error: 'Invalid category provided.' });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return sendJson(res, 400, { error: 'Description is required.' });
    }

    if (description.length > 2000) {
      return sendJson(res, 400, { error: 'Description must be 2000 characters or fewer.' });
    }

    if (contact && typeof contact === 'string' && contact.length > 300) {
      return sendJson(res, 400, { error: 'Contact information is too long.' });
    }

    if (metadata && JSON.stringify(metadata).length > 4000) {
      return sendJson(res, 400, { error: 'Metadata payload is too large.' });
    }

    if (screenshot) {
      if (typeof screenshot !== 'string' || screenshot.length > 600000 || !screenshot.startsWith('data:image/')) {
        return sendJson(res, 400, { error: 'Invalid screenshot attachment or file size exceeds limit.' });
      }
    }

    // 4. Read Credentials EXCLUSIVELY from Server-side Environment Variables
    const apiKey = process.env.RESEND_API_KEY || process.env.BUG_REPORT_PROVIDER_KEY;
    const bugReportTo = process.env.BUG_REPORT_TO;
    const bugReportFrom =
      process.env.BUG_REPORT_FROM || 'LitasDark Bug Reports <onboarding@resend.dev>';

    // Parse screenshot attachment if present
    let attachments: { filename: string; content: Buffer }[] | undefined = undefined;
    if (screenshot && typeof screenshot === 'string' && screenshot.startsWith('data:image/')) {
      const matches = screenshot.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        attachments = [
          {
            filename: `screenshot-${Date.now()}.${ext}`,
            content: Buffer.from(base64Data, 'base64'),
          },
        ];
      }
    }

    // Map Category to Human Readable Title
    const categoryMap: Record<string, string> = {
      bug: 'Bug Report',
      'Bug Report': 'Bug Report',
      feature: 'Feature Request',
      'Feature Request': 'Feature Request',
      performance: 'Performance Issue',
      'Performance Issue': 'Performance Issue',
      other: 'Other',
      Other: 'Other',
    };
    const formattedCategory = categoryMap[category] || category;

    // Date / Time Format
    const submittedTime = new Date().toUTCString();

    // Format Diagnostics
    let diagnosticsText = 'Diagnostics\n';
    if (metadata) {
      const browser = parseBrowser(metadata.browser);
      const os = parseOS(metadata.os, metadata.browser);
      const screen = metadata.screen ? String(metadata.screen).replace('x', ' × ') : 'Not available';
      const route = metadata.route || 'Not available';
      const language = metadata.language || 'Not available';
      const timezone = metadata.timezone || 'Not available';
      let operation = 'Not available';

      if (metadata.operationContext) {
        const op = metadata.operationContext;
        const details: string[] = [];
        if (op.toolName) details.push(`Tool: ${op.toolName}`);
        if (op.pageCount) details.push(`Pages: ${op.pageCount}`);
        if (op.fileSizeMb) details.push(`Size: ${op.fileSizeMb} MB`);
        if (op.lastError) details.push(`Last Error: ${op.lastError}`);
        operation = details.length > 0 ? details.join(', ') : (op.toolName || 'PDF Operation');
      }

      diagnosticsText += `Browser: ${browser}
OS: ${os}
Screen: ${screen}
Route: ${route}
Language: ${language}
Timezone: ${timezone}
Operation: ${operation}`;
    } else {
      diagnosticsText += `Browser: Not available
OS: Not available
Screen: Not available
Route: Not available
Language: Not available
Timezone: Not available
Operation: Not available`;
    }

    // Format report text for delivery
    const formattedSubject = `[LitasDark ${formattedCategory}] New Issue Submitted`;
    const formattedBody = `LITASDARK ISSUE REPORT

Category: ${formattedCategory}
Submitted: ${submittedTime}
Contact: ${contact ? contact : 'Not provided'}
Screenshot: ${attachments ? 'Attached' : 'None'}

Description
${description}

${diagnosticsText}
`;

    // 5. Send Report via Resend SDK if API Key exists
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const recipientEmail = bugReportTo || 'onboarding@resend.dev';

        // Only set replyTo if contact is a strictly valid email address (e.g. user@domain.com, not @handle)
        const validReplyTo = contact && isValidEmail(contact) ? contact.trim() : undefined;

        const { data, error } = await resend.emails.send({
          from: bugReportFrom,
          to: [recipientEmail],
          subject: formattedSubject,
          text: formattedBody,
          replyTo: validReplyTo,
          attachments,
        });

        if (error) {
          console.error('[Resend API Error]:', error.message || 'Send email failed');
          console.warn('[BugReport Fallback] Delivery failed via Resend', {
            category: formattedCategory,
            timestamp: submittedTime,
            hasScreenshot: Boolean(attachments?.length),
          });
          return sendJson(res, 200, { success: true, note: 'Logged to server fallback' });
        }

        console.log('[Resend Email Dispatched Successfully]: ID =', data?.id);
        return sendJson(res, 200, { success: true, id: data?.id });
      } catch (err) {
        console.error('Error invoking Resend SDK:', err instanceof Error ? err.message : 'Unknown error');
        console.warn('[BugReport Fallback] Delivery error via Resend SDK', {
          category: formattedCategory,
          timestamp: submittedTime,
          hasScreenshot: Boolean(attachments?.length),
        });
        return sendJson(res, 200, { success: true, note: 'Logged to server fallback' });
      }
    }

    // Safe logging for unconfigured environment (no RESEND_API_KEY set)
    console.log('[BugReport] Received report in unconfigured environment', {
      category: formattedCategory,
      timestamp: submittedTime,
      hasScreenshot: Boolean(attachments?.length),
    });

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Unhandled server error in handleReportBug:', error);
    return sendJson(res, 500, { error: 'Unable to process report at this time.' });
  }
}

// Vercel Serverless Function entry point
export default handleReportBug;
