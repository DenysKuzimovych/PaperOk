import { Resend } from "resend";
import {
  SITE_NAME,
  SITE_URL,
  CONTACT_EMAIL,
  LOGO_WITH_BACKGROUND,
} from "lib/constants";
import { formatPrice } from "lib/utils";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Where Resend actually delivers notifications.
 * Without a verified domain, Resend only allows sending TO the account email.
 * Set RESEND_TO_EMAIL to that address while testing.
 */
const notificationTo =
  process.env.RESEND_TO_EMAIL || CONTACT_EMAIL;

/**
 * From address. Without a verified domain use onboarding@resend.dev.
 * After verifying paperok.bg: PaperOK <noreply@paperok.bg>
 */
const fromAddress =
  process.env.RESEND_FROM_EMAIL || "PaperOK <onboarding@resend.dev>";

const siteName = SITE_NAME;
const siteUrl = SITE_URL;
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
  productsSubtotal?: number;
  shippingPrice?: number;
  paymentMethod: "cash_on_delivery" | "card" | "bank_transfer";
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
          `  • ${escapeHtml(product.name)} - ${product.quantity}x ${formatPrice(product.price)} = ${formatPrice(product.price * product.quantity)}`,
      )
      .join("\n");

    const productsListHtml = data.products
      .map(
        (product) =>
          `<li>${escapeHtml(product.name)} - ${product.quantity}x ${formatPrice(product.price)} = ${formatPrice(product.price * product.quantity)}</li>`,
      )
      .join("");

    const subtotalHtml =
      data.productsSubtotal != null
        ? `<p><strong>Междинна сума:</strong> ${formatPrice(data.productsSubtotal)}</p>`
        : "";
    const shippingHtml =
      data.shippingPrice != null
        ? `<p><strong>Доставка:</strong> ${formatPrice(data.shippingPrice)}</p>`
        : "";
    const subtotalText =
      data.productsSubtotal != null
        ? `Междинна сума: ${formatPrice(data.productsSubtotal)}\n`
        : "";
    const shippingText =
      data.shippingPrice != null
        ? `Доставка: ${formatPrice(data.shippingPrice)}\n`
        : "";

    const { data: emailData, error } = await ensureResend().emails.send({
      from: fromAddress,
      to: [notificationTo],
      replyTo: data.customerEmail,
      subject: `Нова поръчка #${data.orderId.substring(0, 8)} - ${siteName}`,
      html: `
        ${emailLogoHtml()}
        <h2>Нова поръчка</h2>
        <p><strong>Номер:</strong> ${escapeHtml(data.orderId)}</p>
        ${subtotalHtml}
        ${shippingHtml}
        <p><strong>Обща сума:</strong> ${formatPrice(data.totalPrice)}</p>
        
        <h3>Клиент</h3>
        <p><strong>Име:</strong> ${escapeHtml(data.customerName)}</p>
        <p><strong>Имейл:</strong> ${escapeHtml(data.customerEmail)}</p>
        ${data.customerPhone ? `<p><strong>Телефон:</strong> ${escapeHtml(data.customerPhone)}</p>` : ""}
        <p><strong>Адрес:</strong> ${escapeHtml(data.customerAddress).replace(/\n/g, "<br>")}</p>
        <p><strong>Плащане:</strong> ${
          data.paymentMethod === "cash_on_delivery"
            ? "Наложен платеж"
            : data.paymentMethod === "bank_transfer"
              ? "Банков превод"
              : "Плащане с карта"
        }</p>
        
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
${subtotalText}${shippingText}Обща сума: ${formatPrice(data.totalPrice)}

Клиент:
Име: ${data.customerName}
Имейл: ${data.customerEmail}
${data.customerPhone ? `Телефон: ${data.customerPhone}\n` : ""}
Адрес: ${data.customerAddress}
Плащане: ${
          data.paymentMethod === "cash_on_delivery"
            ? "Наложен платеж"
            : data.paymentMethod === "bank_transfer"
              ? "Банков превод"
              : "Плащане с карта"
        }

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

export interface WithdrawalData {
  /** Server-side reference, e.g. "OTK-20261118-1A2B". */
  reference: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  /** "all" or a free-text list of the items being returned. */
  items: string;
  reason?: string;
  /** Human-readable submission time in Europe/Sofia. */
  submittedAt: string;
}

function withdrawalBodyHtml(data: WithdrawalData): string {
  return `
    <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
      <tr><td><strong>Номер на заявлението:</strong></td><td>${escapeHtml(data.reference)}</td></tr>
      <tr><td><strong>Подадено на:</strong></td><td>${escapeHtml(data.submittedAt)} (българско време)</td></tr>
      <tr><td><strong>Име:</strong></td><td>${escapeHtml(data.customerName)}</td></tr>
      <tr><td><strong>Имейл:</strong></td><td>${escapeHtml(data.customerEmail)}</td></tr>
      <tr><td><strong>Номер на поръчката:</strong></td><td>${escapeHtml(data.orderNumber)}</td></tr>
      <tr><td><strong>Артикули:</strong></td><td>${escapeHtml(data.items).replace(/\n/g, "<br>")}</td></tr>
      ${data.reason ? `<tr><td><strong>Причина (по желание):</strong></td><td>${escapeHtml(data.reason).replace(/\n/g, "<br>")}</td></tr>` : ""}
    </table>`;
}

function withdrawalBodyText(data: WithdrawalData): string {
  return `Номер на заявлението: ${data.reference}
Подадено на: ${data.submittedAt} (българско време)
Име: ${data.customerName}
Имейл: ${data.customerEmail}
Номер на поръчката: ${data.orderNumber}
Артикули: ${data.items}${data.reason ? `\nПричина (по желание): ${data.reason}` : ""}`;
}

/**
 * Confirmation of receipt of an online withdrawal statement (чл. 52а, ал. 5 ЗЗП),
 * sent to the consumer on a durable medium. Never throws.
 */
export async function sendWithdrawalConfirmationToCustomer(
  data: WithdrawalData,
): Promise<SendResult> {
  try {
    const { error } = await ensureResend().emails.send({
      from: fromAddress,
      to: [data.customerEmail],
      replyTo: CONTACT_EMAIL,
      subject: `Потвърждение за получен отказ от договора – ${data.reference}`,
      html: `
        ${emailLogoHtml()}
        <h2>Получихме Вашето заявление за отказ от договора</h2>
        <p>Здравейте, ${escapeHtml(data.customerName)}!</p>
        <p>Потвърждаваме, че на <strong>${escapeHtml(data.submittedAt)}</strong> (българско време) получихме Вашето заявление за отказ от договора със следното съдържание:</p>
        ${withdrawalBodyHtml(data)}
        <p>Моля, изпратете артикулите обратно до 14 дни от днес. Ще се свържем с Вас с указания за връщането. Сумата ще Ви бъде възстановена до 14 дни от получаване на заявлението, като можем да изчакаме, докато получим артикулите или доказателство, че са изпратени.</p>
        <p>Персонализираните артикули, изработени по Ваш дизайн или поръчка, не подлежат на връщане (чл. 57, т. 3 ЗЗП).</p>
        <p>Ако имате въпроси, отговорете на този имейл.</p>
        <p>Поздрави,<br>Екипът на ${siteName}</p>
      `,
      text: `Получихме Вашето заявление за отказ от договора

Здравейте, ${data.customerName}!

Потвърждаваме, че на ${data.submittedAt} (българско време) получихме Вашето заявление за отказ от договора със следното съдържание:

${withdrawalBodyText(data)}

Моля, изпратете артикулите обратно до 14 дни от днес. Ще се свържем с Вас с указания за връщането. Сумата ще Ви бъде възстановена до 14 дни от получаване на заявлението, като можем да изчакаме, докато получим артикулите или доказателство, че са изпратени.

Персонализираните артикули, изработени по Ваш дизайн или поръчка, не подлежат на връщане (чл. 57, т. 3 ЗЗП).

Ако имате въпроси, отговорете на този имейл.

Поздрави,
Екипът на ${siteName}`,
    });

    if (error) {
      console.warn("Withdrawal confirmation not sent:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    const message = error?.message || "Failed to send withdrawal confirmation";
    console.warn("Withdrawal confirmation not sent:", message);
    return { success: false, error: message };
  }
}

/** Internal notification + proof copy for the shop. Never throws. */
export async function sendWithdrawalNotification(
  data: WithdrawalData,
  customerEmailSent: boolean,
): Promise<SendResult> {
  try {
    const { error } = await ensureResend().emails.send({
      from: fromAddress,
      to: [notificationTo],
      replyTo: data.customerEmail,
      subject: `Отказ от договора ${data.reference} – поръчка ${data.orderNumber}`,
      html: `
        ${emailLogoHtml()}
        <h2>Ново заявление за отказ от договора</h2>
        ${withdrawalBodyHtml(data)}
        <p><strong>Потвърждение до клиента от сайта:</strong> ${
          customerEmailSent
            ? "изпратено автоматично"
            : "НЕ е изпратено – изпратете потвърждение на клиента до края на работния ден (чл. 52а, ал. 5 ЗЗП)"
        }</p>
        <hr>
        <p><small>Автоматично известие от ${siteName} – ${siteUrl}/otkaz-ot-dogovora</small></p>
      `,
      text: `Ново заявление за отказ от договора

${withdrawalBodyText(data)}

Потвърждение до клиента от сайта: ${
        customerEmailSent
          ? "изпратено автоматично"
          : "НЕ е изпратено – изпратете потвърждение на клиента до края на работния ден (чл. 52а, ал. 5 ЗЗП)"
      }`,
    });

    if (error) {
      console.warn("Withdrawal notification not sent:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    const message = error?.message || "Failed to send withdrawal notification";
    console.warn("Withdrawal notification not sent:", message);
    return { success: false, error: message };
  }
}
