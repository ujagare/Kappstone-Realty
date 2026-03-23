function parseMultipartFormData(bodyText, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    return {};
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const parts = bodyText.split(`--${boundary}`);
  const data = {};

  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/i);

    if (!nameMatch) {
      continue;
    }

    const valueMatch = part.match(/\r?\n\r?\n([\s\S]*?)\r?\n$/);

    if (!valueMatch) {
      continue;
    }

    data[nameMatch[1]] = valueMatch[1].trim();
  }

  return data;
}

function formatTimestamp(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function buildLeadSubject({ subject, formSource, name, propertyType, budget }) {
  const pieces = [subject || "New Lead"];

  if (formSource) {
    pieces.push(formSource);
  }

  if (propertyType) {
    pieces.push(propertyType);
  }

  if (budget) {
    pieces.push(budget);
  }

  if (name) {
    pieces.push(name);
  }

  return pieces.join(" | ");
}

async function sendEmail(resendApiKey, payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function postOptionalWebhook(url, payload) {
  if (!url) {
    return;
  }

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "Method Not Allowed",
    };
  }

  const headers = event.headers || {};
  const contentType = headers["content-type"] || headers["Content-Type"] || "";

  let body = {};

  try {
    if (contentType.includes("application/json")) {
      body = JSON.parse(event.body || "{}");
    } else if (contentType.includes("multipart/form-data")) {
      body = parseMultipartFormData(event.body || "", contentType);
    } else {
      body = Object.fromEntries(new URLSearchParams(event.body || ""));
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "Invalid form submission.",
    };
  }

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const budget = (body.budget || "").toString().trim();
  const propertyType = (body.property_type || "").toString().trim();
  const subject = (body.subject || "Contact Inquiry").toString().trim();
  const message = (body.message || "").toString().trim();
  const company = (body.company || "").toString().trim();
  const formSource = (body.form_source || "Website Form").toString().trim();
  const submittedAt = (body.submitted_at || "").toString().trim();
  const pageUrl = (body.page_url || "").toString().trim();

  if (company) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "OK",
    };
  }

  if (submittedAt) {
    const submittedTime = Date.parse(submittedAt);

    if (!Number.isNaN(submittedTime) && Date.now() - submittedTime < 4000) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
        body: "OK",
      };
    }
  }

  if (!name || !phone || !message || !email) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "Name, phone, email, and message are required.",
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "no-reply@kappstonerealty.com";
  const autoReplyFromEmail =
    process.env.CONTACT_AUTO_REPLY_FROM_EMAIL || fromEmail;
  const googleSheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const crmWebhookUrl = process.env.CRM_WEBHOOK_URL;

  if (!resendApiKey || !toEmail) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "Contact form is not configured yet. Add RESEND_API_KEY and CONTACT_TO_EMAIL in Netlify environment variables.",
    };
  }

  const text = [
    `Lead Source: ${formSource}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    budget ? `Budget: ${budget}` : "",
    propertyType ? `Property Type: ${propertyType}` : "",
    pageUrl ? `Page URL: ${pageUrl}` : "",
    `Received At: ${formatTimestamp(new Date())}`,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const leadPayload = {
    name,
    email,
    phone,
    budget,
    propertyType,
    formSource,
    subject,
    message,
    pageUrl,
    receivedAt: new Date().toISOString(),
  };

  const leadSubject = buildLeadSubject({
    subject,
    formSource,
    name,
    propertyType,
    budget,
  });

  try {
    await sendEmail(resendApiKey, {
        from: fromEmail,
        to: [toEmail],
        subject: leadSubject,
        text,
        reply_to: email,
    });

    await sendEmail(resendApiKey, {
      from: autoReplyFromEmail,
      to: [email],
      subject: "We received your enquiry | Kappstone Realty",
      text: [
        `Hello ${name},`,
        "",
        "Thank you for contacting Kappstone Realty.",
        "We have received your enquiry and our team will get in touch with you shortly.",
        "",
        "Your submitted details:",
        `Phone: ${phone}`,
        budget ? `Budget: ${budget}` : "",
        propertyType ? `Property Type: ${propertyType}` : "",
        formSource ? `Source: ${formSource}` : "",
        "",
        "Warm regards,",
        "Kappstone Realty",
        "Phone: +91 70306 36565",
        "Email: sales@kappstonerealty.com",
      ]
        .filter(Boolean)
        .join("\n"),
      reply_to: toEmail,
    });

    await Promise.allSettled([
      postOptionalWebhook(googleSheetsWebhookUrl, leadPayload),
      postOptionalWebhook(crmWebhookUrl, leadPayload),
    ]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "OK",
    };
  } catch (error) {
    return {
      statusCode:
        error instanceof Error && error.message
          ? 502
          : 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body:
        error instanceof Error
          ? `Email sending failed. ${error.message}`
          : "Unexpected server error.",
    };
  }
};
