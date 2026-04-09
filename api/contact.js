module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Method Not Allowed");
    return;
  }

  const body = req.body || {};
  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const budget = (body.budget || "").toString().trim();
  const propertyType = (body.property_type || "").toString().trim();
  const subject = (body.subject || "Contact Inquiry").toString().trim();
  const message = (body.message || "").toString().trim();

  if (!name || !phone || !message) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Name, phone, and message are required.");
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "no-reply@kappstonerealty.com";
  const recipients = (toEmail || "")
    .split(/[;,]/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (!resendApiKey || recipients.length === 0) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      "Contact form is not configured yet. Add RESEND_API_KEY and CONTACT_TO_EMAIL in Vercel environment variables.",
    );
    return;
  }

  const text = [
    `Name: ${name}`,
    email ? `Email: ${email}` : "",
    `Phone: ${phone}`,
    budget ? `Budget: ${budget}` : "",
    propertyType ? `Property Type: ${propertyType}` : "",
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        text,
        reply_to: email || undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.statusCode = 502;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(`Email sending failed. ${errorText}`);
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("OK");
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(error instanceof Error ? error.message : "Unexpected server error.");
  }
};
