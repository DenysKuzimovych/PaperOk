import { Resend } from "resend";
import {
  SITE_NAME,
  CONTACT_EMAIL,
  LOGO_WITH_BACKGROUND,
} from "lib/constants";
import { getBaseUrl } from "lib/utils";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Where Resend actually delivers notifications.
 * Without a verified domain, Resend only allows sending TO the account email.
 * Set RESEND_TO_EMAIL to that address (e.g. avoex.contact@gmail.com) while testing.
 */
const notificationTo =
  process.env.RESEND_TO_EMAIL || CONTACT_EMAIL;

/**
 * From address. Without a verified domain use onboarding@resend.dev.
 * After verifying a domain: PaperOK <noreply@yourdomain.com>
 */
const fromAddress =
  process.env.RESEND_FROM_EMAIL || "PaperOK <onboarding@resend.dev>";

const siteName = SITE_NAME;
const siteUrl = getBaseUrl();
const logoUrl = `${siteUrl}${LOGO_WITH_BACKGROUND}`;

function emailLogoHtml() {
  return `
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${logoUrl}" alt="${siteName}" width="220" height="106" style="max-width:220px;height:auto;border:0;" />
    </div>
  `;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
}

export interface BusinessInquiryData {
  name: string;
  company?: string;
  email: string;
  phone: string;
  productType: string;
  quantity?: string;
  message: string;
}

export interface OrderNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  totalPrice: number;
  paymentMethod: "cash_on_delivery" | "card";
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  comment?: string;
}

type SendResult = { success: true } | { success: false; error: string };

function ensureResend(): Resend {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return resend;
}

/**
 * Send email notification for contact form submission
 */
export async function sendContactFormEmail(
  data: ContactFormData,
): Promise<SendResult> {
  try {
    const { error } = await ensureResend().emails.send({
      from: fromAddress,
      to: [notificationTo],
      replyTo: data.email,
      subject: data.subject || `New Contact Form Submission from ${data.name}`,
      html: `
        ${emailLogoHtml()}
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
        ${data.subject ? `<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>This email was sent from the contact form on ${siteName}</small></p>
        ${
          notificationTo !== CONTACT_EMAIL
            ? `<p><small>Intended inbox: ${escapeHtml(CONTACT_EMAIL)}</small></p>`
            : ""
        }
      `,
      text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}\n` : ""}
${data.subject ? `Subject: ${data.subject}\n` : ""}
Message:
${data.message}

---
This email was sent from the contact form on ${siteName}
      `,
    });

    if (error) {
      console.warn("Contact form email not sent:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    const message = error?.message || "Failed to send contact form email";
    console.warn("Contact form email not sent:", message);
    return { success: false, error: message };
  }
}

/**
 * Send email notification for business inquiry form submission
 */
export async function sendBusinessInquiryEmail(
  data: BusinessInquiryData,
): Promise<SendResult> {
  try {
    const { error } = await ensureResend().emails.send({
      from: fromAddress,
      to: [notificationTo],
      replyTo: data.email,
      subject: `Бизнес запитване от ${data.name}${data.company ? ` (${data.company})` : ""}`,
      html: `
        ${emailLogoHtml()}
        <h2>Ново бизнес запитване</h2>
        <p><strong>Име:</strong> ${escapeHtml(data.name)}</p>
        ${data.company ? `<p><strong>Фирма:</strong> ${escapeHtml(data.company)}</p>` : ""}
        <p><strong>Имейл:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Телефон:</strong> ${escapeHtml(data.phone)}</p>
        <p><strong>Вид продукт:</strong> ${escapeHtml(data.productType)}</p>
        ${data.quantity ? `<p><strong>Количество:</strong> ${escapeHtml(data.quantity)}</p>` : ""}
        <p><strong>Съобщение:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>Този имейл е изпратен от формата за бизнес запитвания на ${siteName}</small></p>
      `,
      text: `
Ново бизнес запитване

Име: ${data.name}
${data.company ? `Фирма: ${data.company}\n` : ""}
Имейл: ${data.email}
Телефон: ${data.phone}
Вид продукт: ${data.productType}
${data.quantity ? `Количество: ${data.quantity}\n` : ""}
Съобщение:
${data.message}

---
Този имейл е изпратен от формата за бизнес запитвания на ${siteName}
      `,
    });

    if (error) {
      console.warn("Business inquiry email not sent:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    const message = error?.message || "Failed to send business inquiry email";
    console.warn("Business inquiry email not sent:", message);
    return { success: false, error: message };
  }
}

/**
 * Send email notification when a new order is created.
 * Never throws — checkout must succeed even if email fails.
 */
export async function sendNewOrderNotification(
  data: OrderNotificationData,
): Promise<SendResult> {
  try {
    const productsList = data.products
      .map(
        (product) =>
          `  • ${escapeHtml(product.name)} - ${product.quantity}x ${product.price.toFixed(2)} лв = ${(product.price * product.quantity).toFixed(2)} лв`,
      )
      .join("\n");

    const productsListHtml = data.products
      .map(
        (product) =>
          `<li>${escapeHtml(product.name)} - ${product.quantity}x ${product.price.toFixed(2)} лв = ${(product.price * product.quantity).toFixed(2)} лв</li>`,
      )
      .join("");

    const { data: emailData, error } = await ensureResend().emails.send({
      from: fromAddress,
      to: [notificationTo],
      replyTo: data.customerEmail,
      subject: `Нова поръчка #${data.orderId.substring(0, 8)} - ${siteName}`,
      html: `
        ${emailLogoHtml()}
        <h2>Нова поръчка</h2>
        <p><strong>Номер:</strong> ${escapeHtml(data.orderId)}</p>
        <p><strong>Обща сума:</strong> ${data.totalPrice.toFixed(2)} лв</p>
        
        <h3>Клиент</h3>
        <p><strong>Име:</strong> ${escapeHtml(data.customerName)}</p>
        <p><strong>Имейл:</strong> ${escapeHtml(data.customerEmail)}</p>
        ${data.customerPhone ? `<p><strong>Телефон:</strong> ${escapeHtml(data.customerPhone)}</p>` : ""}
        <p><strong>Адрес:</strong> ${escapeHtml(data.customerAddress).replace(/\n/g, "<br>")}</p>
        <p><strong>Плащане:</strong> ${data.paymentMethod === "cash_on_delivery" ? "Наложен платеж" : "Плащане с карта"}</p>
        
        <h3>Артикули</h3>
        <ul>
          ${productsListHtml}
        </ul>
        
        ${data.comment ? `<h3>Коментар</h3><p>${escapeHtml(data.comment).replace(/\n/g, "<br>")}</p>` : ""}
        
        <hr>
        <p><small>Автоматично известие от ${siteName}</small></p>
        <p><small>Админ: ${siteUrl}/admin/orders/${data.orderId}</small></p>
      `,
      text: `
Нова поръчка

Номер: ${data.orderId}
Обща сума: ${data.totalPrice.toFixed(2)} лв

Клиент:
Име: ${data.customerName}
Имейл: ${data.customerEmail}
${data.customerPhone ? `Телефон: ${data.customerPhone}\n` : ""}
Адрес: ${data.customerAddress}
Плащане: ${data.paymentMethod === "cash_on_delivery" ? "Наложен платеж" : "Плащане с карта"}

Артикули:
${productsList}

${data.comment ? `Коментар:\n${data.comment}\n` : ""}

---
Автоматично известие от ${siteName}
Админ: ${siteUrl}/admin/orders/${data.orderId}
      `,
    });

    if (error) {
      console.warn("Order notification email not sent:", error.message);
      return { success: false, error: error.message };
    }

    if (!emailData) {
      return { success: false, error: "No email data returned from Resend" };
    }

    return { success: true };
  } catch (error: any) {
    const message = error?.message || "Failed to send order notification email";
    console.warn("Order notification email not sent:", message);
    return { success: false, error: message };
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
