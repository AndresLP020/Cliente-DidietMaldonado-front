/**
 * Contratos del cotizador. Todos los importes son enteros en centavos CALCULADOS POR EL BACKEND:
 * el frontend solo los presenta, nunca los calcula.
 */
import type { PackageCategory, PublicPricing, PublicSubscriptionOffer } from "./catalog";

export type SolutionKind = "landing" | "web" | "ecommerce" | "pos" | "combo" | "custom" | "unsure";
export type BillingType = "one_time" | "monthly" | "annual" | "third_party_variable";

export interface PublicIndustry {
  slug: string;
  name: string;
  description?: string;
  exampleSolutions: string[];
  suggestedSolutions: SolutionKind[];
}

export interface PublicComponent {
  slug: string;
  name: string;
  description?: string;
  category: { slug: string; name: string };
  kind: string;
  billing: BillingType;
  unit: string;
  pricing: PublicPricing;
  requiresEvaluation: boolean;
  maxQuantity: number;
  exclusiveGroup?: string;
  /** Módulos que debe tener la cotización para contratarlo (solo en el detalle del paquete). */
  requires?: { slug: string; name: string; message: string }[];
}

export interface PublicPackageItem {
  component: { slug: string; name: string; unit: string };
  quantity: number;
  removable: boolean;
}

export interface PublicVariantGroup {
  key: string;
  name: string;
  defaultOption: string;
  options: { key: string; name: string; description?: string; pricing: PublicPricing; items: PublicPackageItem[] }[];
}

export interface PublicPackageDetail {
  slug: string;
  name: string;
  category: PackageCategory;
  summary: string;
  pricing: PublicPricing;
  features: string[];
  notes: string[];
  pricingType: "fixed" | "calculated" | "evaluation";
  items: PublicPackageItem[];
  variantGroups: PublicVariantGroup[];
  includedPackages: { slug: string; name: string; variants: Record<string, string> }[];
  recommendedRecurring: PublicComponent[];
  /** Complementos compatibles con el paquete. Vacío = el paquete no los restringe. */
  addOns: PublicComponent[];
  subscription: PublicSubscriptionOffer | null;
  /** Servicios que la mensualidad ya cubre: en suscripción no se contratan aparte. */
  subscriptionIncludedServices: string[];
}

/** purchase = compra del sistema; subscription = renta mensual con plazo mínimo. */
export type PaymentMode = "purchase" | "subscription";
/** Mes con mes (sin plazo, con recargo), mensual (plazo mínimo), semestral (6 meses) o anual (12 meses). */
export type SubscriptionPlan = "month_to_month" | "monthly" | "semiannual" | "annual";

export interface QuoteSelection {
  paymentMode: PaymentMode;
  subscriptionPlan?: SubscriptionPlan;
  packageSlug: string | null;
  variants: Record<string, string>;
  removedComponents: string[];
  components: { slug: string; quantity: number }[];
  recurring: string[];
  /** Dominio u hosting con los que el cliente ya cuenta: no se cobran. */
  clientProvided: string[];
}

export type PriceMode = "fixed" | "starting_at" | "pending" | "credit";

export interface QuoteLine {
  kind: "package" | "variant" | "addon" | "removal_credit" | "subscription_setup";
  description: string;
  componentSlug?: string;
  quantity: number;
  includedQuantity?: number;
  unitCents: number | null;
  amountCents: number | null;
  priceMode: PriceMode;
  taxable: boolean;
}

export interface IncludedItem {
  componentSlug: string;
  name: string;
  quantity: number;
  fromPackage: string;
  removable: boolean;
  removed: boolean;
}

export interface RecurringLine {
  componentSlug: string;
  description: string;
  billing: BillingType;
  amountCents: number | null;
  priceMode: PriceMode;
}

export interface ReviewReason {
  code: string;
  message: string;
  componentSlug?: string;
}

export interface BlockingIssue {
  code: "compatibility_blocked";
  message: string;
  componentSlug: string;
  ruleKey: string;
}

export interface SubscriptionPlanOption {
  plan: SubscriptionPlan;
  label: string;
  billingMonths: number;
  /** 0 = sin plazo forzoso. */
  termMonths: number;
  /** Positivo = recargo, negativo = descuento (puntos base). */
  adjustmentBp: number;
  monthlyCents: number | null;
  monthlyTotalCents: number | null;
  /** Importe de cada cobro. */
  paymentCents: number | null;
  /** Presupuesto del plazo oficial. Null si no hay plazo. */
  budgetCents?: number | null;
  /** Ahorro (positivo) o sobrecosto (negativo) frente al plan mensual en el mismo plazo. */
  savingsVsMonthlyCents?: number | null;
}

export interface SubscriptionSummary {
  plan: SubscriptionPlan;
  planLabel: string;
  baseMonthlyCents: number | null;
  monthlyCents: number | null;
  priceMode: "fixed" | "starting_at" | "pending";
  monthlyTaxCents: number;
  monthlyTotalCents: number | null;
  billingMonths: number;
  /** Importe de cada cobro (mensualidad × meses del cobro). */
  paymentCents: number | null;
  /** 0 = sin plazo forzoso. */
  termMonths: number;
  commitmentCents: number | null;
  /** Hosting del primer pago. Si `upfront` no viene, cotizaciones viejas lo traían en cada periodo. */
  hostingCharge: {
    name: string;
    monthlyCents: number | null;
    billingMonths: number;
    chargeCents: number | null;
    upfront?: boolean;
  } | null;
  /** Dominio y hosting, cada año y aparte de la mensualidad. */
  annualCharge?: { name: string; cents: number } | null;
  /** Soporte al usuario ya incluido en la mensualidad. */
  supportIncludedCents?: number | null;
  /** La renta cubre solo el software. */
  softwareOnly?: boolean;
  /** Cargos de contado + dominio y hosting del año + primer periodo. */
  firstPaymentCents: number | null;
  /** Importe a partir del segundo cobro. */
  subsequentPaymentCents: number | null;
  plans: SubscriptionPlanOption[];
  hardwareUpfront: boolean;
  includes: string[];
}

export interface QuoteCalculation {
  currency: "MXN";
  status: "priced" | "needs_review" | "blocked";
  isFinal: boolean;
  paymentMode: PaymentMode;
  /** Solo en suscripción; las líneas y totales son entonces el pago inicial. */
  subscription: SubscriptionSummary | null;
  package: { slug: string; name: string; category: PackageCategory; variants: Record<string, string> } | null;
  lines: QuoteLine[];
  includedItems: IncludedItem[];
  recurring: RecurringLine[];
  /** Dominio u hosting que el cliente ya tiene (no se cobran). Ausente en cotizaciones anteriores. */
  providedByClient?: { componentSlug: string; name: string }[];
  totals: {
    subtotalCents: number;
    discountCents: number;
    taxableCents: number;
    taxCents: number;
    totalCents: number;
    depositCents: number;
    balanceCents: number;
    recurringMonthlyCents: number;
    recurringAnnualCents: number;
    hasPendingAmounts: boolean;
  };
  tax: { rateBp: number; treatment: "exclusive" | "inclusive"; confirmed: boolean };
  depositRateBp: number;
  comboSavingsCents: number | null;
  reviewReasons: ReviewReason[];
  blockingIssues: BlockingIssue[];
}

export type QuoteStatus = "needs_review" | "issued" | "sent" | "approved" | "rejected" | "expired" | "cancelled";

export interface DeliveryState {
  status: "not_requested" | "not_available" | "available" | "queued" | "simulated" | "deferred" | "sent" | "failed";
  message: string;
}

export interface CreateQuoteResult {
  folio: string;
  status: QuoteStatus;
  validUntil: string | null;
  accessToken: string;
  accessPath: string;
  accessExpiresAt: string;
  calculation: QuoteCalculation;
  deliveries: { pdf: DeliveryState; email: DeliveryState; whatsapp: DeliveryState };
}

export interface PublicQuoteView {
  folio: string;
  status: QuoteStatus;
  version: number;
  createdAt: string;
  validUntil: string | null;
  client: { name: string; company?: string };
  industry?: string;
  calculation: QuoteCalculation;
  terms: string[];
  business: { tradeName: string };
}

export interface CreateQuoteRequest {
  selection: QuoteSelection;
  industry?: string;
  solution?: SolutionKind;
  client: { name: string; company?: string; email: string; phone?: string; whatsapp?: string; country?: string };
  comments?: string;
  consents: { contact: true; whatsapp?: boolean };
  channels: { email: boolean; whatsapp: boolean };
  requestEvaluation?: boolean;
  website?: string;
}
