/**
 * Google Apps Script: Web App endpoint to receive contact form submissions.
 *
 * Usage:
 * 1. Create a Google Sheet with columns (headers) in row 1: Timestamp, Name, Email, Message
 * 2. Copy this script into Apps Script editor and set the `SHEET_ID` constant below.
 * 3. Deploy as Web App: Execute as: Me, Who has access: Anyone
 * 4. Use the deployed Web App URL in your frontend `script.js` as WEB_APP_URL.
 *
 * Security notes:
 * - The sheet ID is stored server-side only.
 * - This endpoint only appends rows; it never returns sheet contents.
 */

// Paste your Google Sheet ID here (the long id from the sheet URL)
const SHEET_ID = '1BkzVUcCTuYJA2Zi67Hl6C-lpeocLGvELX83_IXBdhhE';

/**
 * doPost: handles POST requests with JSON body containing name, email, message, and optional honeypot.
 * Expects Content-Type: application/json
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.type) {
      return contentJson(false, 400, 'Invalid request');
    }

    // Support JSON and form submissions. For browser FormData (multipart/form-data)
    // Apps Script exposes form fields in `e.parameter` / `e.parameters`.
    let payload = {};
    const contentType = (e.postData.type || '').toString();
    if (contentType.indexOf('application/json') !== -1) {
      payload = JSON.parse(e.postData.contents || '{}');
    } else {
      // Prefer the parsed `e.parameter` (works for both urlencoded and multipart/form-data)
      if (e.parameter && Object.keys(e.parameter).length) {
        payload = e.parameter;
      } else if (e.postData && e.postData.contents) {
        // Fallback: try parsing as urlencoded string
        try { payload = Utilities.parseQueryString(e.postData.contents || ''); } catch (ex) { payload = {}; }
        Object.keys(payload).forEach(k => { if (Array.isArray(payload[k])) payload[k] = payload[k][0]; });
      } else {
        return contentJson(false, 415, 'Unsupported content type');
      }
    }

    // Basic validation
    // Log the raw postData and parsed payload so we can debug what the server received (visible in Executions logs)
    console.log('doPost postData.type:', e.postData.type);
    console.log('doPost postData.contents:', e.postData.contents);
    console.log('doPost parsed payload:', JSON.stringify(payload));
    const name = (payload.name || '').toString().trim();
    const email = (payload.email || '').toString().trim();
    const message = (payload.message || '').toString().trim();
    const honey = (payload.honey || '').toString().trim(); // honeypot

    // If honeypot filled, silently accept to avoid revealing anti-spam
    if (honey) {
      return contentJson(true, 200, 'ok');
    }

    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!message) missing.push('message');
    if (missing.length) {
      console.log('doPost validation failed, missing:', missing.join(','));
      // Return debug info to help trace what the server actually received
      const debugExtra = {
        receivedType: e.postData.type || null,
        receivedRaw: e.postData.contents || null,
        parsedPayload: payload
      };
      return contentJson(false, 422, 'Missing required fields: ' + missing.join(','), debugExtra);
    }

    // Append to sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];

    // Build row: Timestamp (ISO), Name, Email, Message
    const timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, name, email, message]);

    return contentJson(true, 200, 'ok');
  } catch (err) {
    // Log on server for owner visibility
    console.error('doPost error', err);
    return contentJson(false, 500, 'Server error');
  }
}

/**
 * Helper to return JSON ContentService response
 */
function contentJson(success, code, message, extra) {
  const payload = { success: !!success, message: message || null };
  if (extra && typeof extra === 'object') {
    Object.keys(extra).forEach(k => { payload[k] = extra[k]; });
  }
  const options = { status: code };
  // Return JSON result. Do not attempt to set response headers here (Apps Script TextOutput doesn't support setHeader).
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
