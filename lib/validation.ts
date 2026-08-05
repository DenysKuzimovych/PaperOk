export type FieldErrors<T extends string = string> = Partial<
  Record<T, string>
>;

export const VALIDATION_MESSAGES = {
  required: "Това поле е задължително",
  email: "Въведете валиден имейл адрес",
  phone: "Въведете валиден телефонен номер (напр. 0888123456)",
  privacy: "Моля, приемете Политиката за поверителност",
  shipping: "Моля, изберете населено място и начин на доставка",
  productType: "Моля, изберете вид продукт",
} as const;

/** Basic email shape check (client + server). */
export function isValidEmail(email: string): boolean {
  const value = email.trim();
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Bulgarian phone numbers:
 * - mobile: 08[7-9]XXXXXXX
 * - local landline: 0X… (9–10 digits total)
 * - international: +359… / 00359…
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return false;

  let local = digits;
  if (local.startsWith("359") && local.length >= 12) {
    local = `0${local.slice(3)}`;
  }

  // Mobile (10 digits) or landline (9–10 digits), must start with 0
  return /^0[1-9]\d{7,8}$/.test(local);
}

export function requiredTrimmed(value: string): boolean {
  return value.trim().length > 0;
}

export type ContactFields =
  | "name"
  | "email"
  | "phone"
  | "message"
  | "privacy_policy_accepted";

export function validateContactForm(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  privacy_policy_accepted: boolean;
}): FieldErrors<ContactFields> {
  const errors: FieldErrors<ContactFields> = {};

  if (!requiredTrimmed(data.name)) {
    errors.name = VALIDATION_MESSAGES.required;
  }
  if (!requiredTrimmed(data.email)) {
    errors.email = VALIDATION_MESSAGES.required;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.email;
  }
  if (!requiredTrimmed(data.phone)) {
    errors.phone = VALIDATION_MESSAGES.required;
  } else if (!isValidPhone(data.phone)) {
    errors.phone = VALIDATION_MESSAGES.phone;
  }
  if (!requiredTrimmed(data.message)) {
    errors.message = VALIDATION_MESSAGES.required;
  }
  if (!data.privacy_policy_accepted) {
    errors.privacy_policy_accepted = VALIDATION_MESSAGES.privacy;
  }

  return errors;
}

export type BusinessFields =
  | "name"
  | "email"
  | "phone"
  | "productType"
  | "message"
  | "privacy_policy_accepted";

export function validateBusinessInquiryForm(data: {
  name: string;
  email: string;
  phone: string;
  productType: string;
  message: string;
  privacy_policy_accepted: boolean;
}): FieldErrors<BusinessFields> {
  const errors: FieldErrors<BusinessFields> = {};

  if (!requiredTrimmed(data.name)) {
    errors.name = VALIDATION_MESSAGES.required;
  }
  if (!requiredTrimmed(data.email)) {
    errors.email = VALIDATION_MESSAGES.required;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.email;
  }
  if (!requiredTrimmed(data.phone)) {
    errors.phone = VALIDATION_MESSAGES.required;
  } else if (!isValidPhone(data.phone)) {
    errors.phone = VALIDATION_MESSAGES.phone;
  }
  if (!requiredTrimmed(data.productType)) {
    errors.productType = VALIDATION_MESSAGES.productType;
  }
  if (!requiredTrimmed(data.message)) {
    errors.message = VALIDATION_MESSAGES.required;
  }
  if (!data.privacy_policy_accepted) {
    errors.privacy_policy_accepted = VALIDATION_MESSAGES.privacy;
  }

  return errors;
}

export type CheckoutFields =
  | "customer_name"
  | "customer_email"
  | "customer_phone"
  | "shipping"
  | "privacy_policy_accepted";

export function validateCheckoutForm(data: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  hasShipping: boolean;
  privacy_policy_accepted: boolean;
}): FieldErrors<CheckoutFields> {
  const errors: FieldErrors<CheckoutFields> = {};

  if (!requiredTrimmed(data.customer_name)) {
    errors.customer_name = VALIDATION_MESSAGES.required;
  }
  if (!requiredTrimmed(data.customer_email)) {
    errors.customer_email = VALIDATION_MESSAGES.required;
  } else if (!isValidEmail(data.customer_email)) {
    errors.customer_email = VALIDATION_MESSAGES.email;
  }
  if (!requiredTrimmed(data.customer_phone)) {
    errors.customer_phone = VALIDATION_MESSAGES.required;
  } else if (!isValidPhone(data.customer_phone)) {
    errors.customer_phone = VALIDATION_MESSAGES.phone;
  }
  if (!data.hasShipping) {
    errors.shipping = VALIDATION_MESSAGES.shipping;
  }
  if (!data.privacy_policy_accepted) {
    errors.privacy_policy_accepted = VALIDATION_MESSAGES.privacy;
  }

  return errors;
}

export function hasFieldErrors(
  errors: FieldErrors<string>,
): boolean {
  return Object.keys(errors).length > 0;
}
