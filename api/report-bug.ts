import type { Request, Response } from 'express';
import { Resend } from 'resend';

// In-memory rate limiter for server API
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

export async function handleReportBug(req: Request, res: Response) {
  try {
    // 1. IP Rate Limiting
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    if (isRateLimited(clientIp)) {
      return res.status(429).json({ error: 'Too many bug report requests. Please try again later.' });
    }

    // 2. Honeypot Validation
    const honeypot = req.body?.website || req.body?.company_url;
    if (honeypot && String(honeypot).trim().length > 0) {
      // Silently discard bot submission with 200 OK
      return res.status(200).json({ success: true });
    }

    // 3. Payload Validation
    const { category, description, contact, metadata, screenshot } = req.body || {};

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
      return res.status(400).json({ error: 'Invalid category provided.' });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    if (description.length > 2000) {
      return res.status(400).json({ error: 'Description must be 2000 characters or fewer.' });
    }

    if (contact && typeof contact === 'string' && contact.length > 300) {
      return res.status(400).json({ error: 'Contact information is too long.' });
    }

    if (metadata && JSON.stringify(metadata).length > 4000) {
      return res.status(400).json({ error: 'Metadata payload is too large.' });
    }

    // 4. Read Credentials EXCLUSIVELY from Server-side Environment Variables
    const apiKey = process.env.RESEND_API_KEY || process.env.BUG_REPORT_PROVIDER_KEY;
    const bugReportTo = process.env.BUG_REPORT_TO;
    const bugReportFrom =
      process.env.BUG_REPORT_FROM || 'LitasDark Bug Reports <onboarding@resend.dev>';

    // Parse screenshot attachment if present
    let attachments: { filename: string; content: Buffer }[] | undefined = undefined;
    if (screenshot && typeof screenshot === 'string' && screenshot.startsWith('data:image/')) {
      const matches = screenshot.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] || 'png';
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
          console.error('[Resend API Error]:', JSON.stringify(error, null, 2));
          // Fallback log to server console so user report is preserved
          console.log('--------------------------------------------------');
          console.log('[SERVER FALLBACK LOG] REPORT CAPTURED IN CONSOLE');
          console.log(formattedBody);
          console.log('--------------------------------------------------');
          // Return success so user's submission completes reliably
          return res.status(200).json({ success: true, note: 'Logged to server fallback' });
        }

        console.log('[Resend Email Dispatched Successfully]: ID =', data?.id);
        return res.status(200).json({ success: true, id: data?.id });
      } catch (err) {
        console.error('Error invoking Resend SDK:', err);
        // Log to server console
        console.log('--------------------------------------------------');
        console.log('[SERVER FALLBACK LOG] REPORT CAPTURED IN CONSOLE');
        console.log(formattedBody);
        console.log('--------------------------------------------------');
        return res.status(200).json({ success: true, note: 'Logged to server fallback' });
      }
    }

    // Fallback logging for local development / unconfigured environment
    console.log('--------------------------------------------------');
    console.log('[SERVER LOG] BUG REPORT RECEIVED (No RESEND_API_KEY set)');
    console.log(`Category: ${formattedCategory}`);
    console.log(`BUG_REPORT_TO: ${bugReportTo || 'Not set'}`);
    console.log(formattedBody);
    if (attachments) console.log(`Attachment: ${attachments[0].filename} (${attachments[0].content.length} bytes)`);
    console.log('--------------------------------------------------');

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unhandled server error in handleReportBug:', error);
    return res.status(500).json({ error: 'Unable to process report at this time.' });
  }
}
