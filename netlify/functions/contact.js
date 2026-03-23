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

  if (!name || !phone || !message) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "Name, phone, and message are required.",
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "no-reply@kappstonerealty.com";

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
        to: [toEmail],
        subject,
        text,
        reply_to: email || undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
        body: `Email sending failed. ${errorText}`,
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "OK",
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};
