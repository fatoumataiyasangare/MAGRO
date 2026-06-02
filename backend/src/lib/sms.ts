export async function sendSMS(to: string, text: string) {
  const enabled = process.env.SMS_API_ENABLED === 'true';
  if (!enabled) {
    console.log(`[SMS Simulation] To: ${to} | Text: ${text}`);
    return;
  }

  const apiKey = process.env.SMS_API_KEY;
  const baseUrl = process.env.SMS_API_URL;
  const sender = process.env.SMS_SENDER_ID || "MAGRO";

  if (!apiKey || !baseUrl) {
    console.warn("SMS credentials not found. Simulating SMS.");
    console.log(`[SMS Simulation] To: ${to} | Text: ${text}`);
    return;
  }

  // Infobip prefers numbers without the '+' sign
  const toFormatted = to.replace("+", "");

  try {
    const response = await fetch(`https://${baseUrl}/sms/2/text/advanced`, {
      method: "POST",
      headers: {
        "Authorization": `App ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to: toFormatted }],
            from: sender,
            text: text
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send SMS to ${to}:`, errorText);
    } else {
      console.log(`SMS sent successfully to ${to}`);
    }
  } catch (err) {
    console.error("Error sending SMS via Infobip:", err);
  }
}
