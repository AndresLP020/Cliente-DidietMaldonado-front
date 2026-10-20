/** Contratos de la API administrativa. Los importes son centavos calculados por el backend. */
import type { PackageCategory } from "@/types/catalog";
import type { QuoteCalculation, QuoteSelection, QuoteStatus } from "@/types/quote";

export type Role = "owner" | "admin" | "sales" | "viewer";
export type Permission =
  | "dashboard:read"
  | "catalog:read"
  | "catalog:write"
  | "costs:read"
  | "prices:write"
  | "prices:publish"
  | "quotes:read"
  | "quotes:write"
  | "clients:read"
  | "leads:read"
  | "leads:write"
  | "settings:read"
  | "settings:write"
  | "users:manage"
  | "audit:read"
  | "billing:read"
  | "billing:write"
  | "testimonials:manage";

export interface SessionView {
  user: { id: string; email: string; name: string; role: Role; permissions: Permission[] };
  csrfToken: string;
  expiresAt: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type PriceMode = "fixed" | "starting_at" | "pending";
export type PriceStatus = "draft" | "published" | "superseded";

export interface AdminComponentPrice {
  id: string;
  version: number;
  status: PriceStatus;
  mode: PriceMode;
  saleCents: number | null;
  notes?: string;
  createdBy: string;
  publishedBy?: string;
  publishedAt?: string;
  restoredFromVersion?: number;
  createdAt?: string;
  /** Solo con permiso costs:read. */
  costCents?: number | null;
  markupBp?: number | null;
  marginBp?: number | null;
  grossProfitCents?: number | null;
}

export interface AdminComponent {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description?: string;
  category: { slug?: string; name?: string };
  kind: string;
  billing: string;
  unit: string;
  status: "draft" | "active" | "inactive";
  pricingStatus: "pending_pricing" | "priced";
  publicVisible: boolean;
  requiresEvaluation: boolean;
  hasDraft: boolean;
  price: AdminComponentPrice | null;
}

export interface AdminPackageSummary {
  id: string;
  slug: string;
  name: string;
  category: PackageCategory;
  status: "draft" | "active" | "inactive";
  featured: boolean;
  hasDraft: boolean;
  pendingVariants: number;
  pendingCredits: number;
  price: { id: string; version: number; mode: PriceMode; baseCents: number | null } | null;
  rentalEnabled: boolean;
  rental: { mode: PriceMode; monthlyCents: number | null } | null;
}

export interface RentalPrice {
  mode: PriceMode;
  monthlyCents: number | null;
  /** Pago inicial (instalación o, en POS, el equipo de contado). */
  setupFeeCents: number | null;
}

export interface RentalProfile {
  enabled: boolean;
  hostingCostKey: string | null;
  storageGb: number;
  includesDomain: boolean;
  recoverableMode: "package_price" | "manual" | "combo_parts";
  recoverableCents: number | null;
  hardwareUpfront: boolean;
  services: string[];
  coveredComponents: string[];
}

/** Mensualidad sugerida (solo con permiso de costos). */
export interface RentalSuggestion {
  lines: { key: string; label: string; monthlyCents: number | null; note?: string }[];
  rawMonthlyCents: number | null;
  suggestedMonthlyCents: number | null;
  mode: PriceMode;
  missing: string[];
  unconfirmed: string[];
  termMonths: number;
  financingBp: number;
  enabled: boolean;
}

export interface OperatingCost {
  id: string;
  key: string;
  name: string;
  unit: "month" | "year" | "gb_month";
  costCents: number;
  sourceNote: string;
  sourceUrl: string;
  confirmed: boolean;
}

export interface PackagePriceVersion {
  id: string;
  version: number;
  status: PriceStatus;
  mode: PriceMode;
  baseCents: number | null;
  variantPrices: { groupKey: string; optionKey: string; mode: "fixed" | "pending"; deltaCents: number | null }[];
  removalCredits: { componentId: string; mode: "fixed" | "pending"; creditCents: number | null }[];
  rental: RentalPrice | null;
  notes?: string;
  createdBy: string;
  publishedBy?: string;
  publishedAt?: string;
  restoredFromVersion?: number;
  createdAt?: string;
}

export interface AdminPackageDetail {
  id: string;
  slug: string;
  name: string;
  category: PackageCategory;
  status: string;
  featured: boolean;
  comboPolicy: { onEssentialRemoval: string; onVariantChange: string } | null;
  variantGroups: { key: string; name: string; defaultOption: string; options: { key: string; name: string }[] }[];
  removableItems: { componentId: string; name: string; essential: boolean }[];
  rentalProfile: RentalProfile;
  rentalSuggestion: RentalSuggestion | null;
  history: PackagePriceVersion[];
}

export interface AdminQuoteRow {
  id: string;
  folio: string;
  status: QuoteStatus;
  client: { id: string; name: string; company?: string; email: string } | null;
  packageName: string;
  totalCents: number;
  hasPendingAmounts: boolean;
  reviewReasonCodes: string[];
  paymentMode?: "purchase" | "subscription";
  monthlyCents?: number | null;
  subscriptionPlan?: string | null;
  version: number;
  createdAt: string;
  validUntil: string | null;
}

export interface AdminQuoteDetail {
  id: string;
  folio: string;
  status: QuoteStatus;
  allowedTransitions: QuoteStatus[];
  industry?: string;
  solution?: string;
  comments?: string;
  channels: { email: boolean; whatsapp: boolean };
  validUntil: string | null;
  accessExpiresAt: string;
  createdAt: string;
  currentVersion: number;
  client: { id: string; name: string; company?: string; email: string; phone?: string; whatsapp?: string; country?: string } | null;
  lead: { id: string; status: string; reference: string } | null;
  versions: { version: number; reason: string; createdBy: string; createdAt: string; selection: QuoteSelection; calculation: QuoteCalculation }[];
  history: { action: string; actor: string; at: string; after?: Record<string, unknown> }[];
  deliveries: AdminDelivery[];
  integrations: { emailSimulated: boolean; whatsappSimulated: boolean };
}

export type DeliveryKind =
  | "quote_issued"
  | "quote_received"
  | "admin_new_quote"
  | "admin_new_lead"
  | "payment_reminder"
  | "admin_billing_digest"
  | "admin_new_testimonial";
export type DeliveryStatus = "queued" | "sending" | "sent" | "delivered" | "read" | "failed" | "simulated" | "skipped";

export interface AdminDelivery {
  id: string;
  channel: "email" | "whatsapp";
  kind: DeliveryKind;
  recipient: string;
  status: DeliveryStatus;
  attempts: number;
  maxAttempts: number;
  quoteVersion: number | null;
  lastError: string | null;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  events: { status: string; at: string; detail?: string }[];
}

export interface AdminClientRow {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  quotes: number;
  lastRequestAt?: string;
}

export interface AdminClientDetail {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  consents: { channel: string; granted: boolean; textVersion: string; at: string; source: string }[];
  quotes: { id: string; folio: string; status: QuoteStatus; packageName: string; totalCents: number; createdAt: string }[];
}

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "discarded";

export interface AdminLead {
  id: string;
  reference: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  industry?: string;
  interest?: string;
  message: string;
  source: "contact_form" | "quote_builder";
  status: LeadStatus;
  quoteId: string | null;
  createdAt: string;
}

export interface BusinessSettings {
  tradeName: string;
  legalName: string;
  legalAddress: string;
  privacyNotice: { published: boolean; publishedAt: string | null };
  currency: "MXN";
  tax: { rateBp: number; treatment: "exclusive" | "inclusive"; confirmed: boolean };
  quote: { depositRateBp: number; validityDays: number | null; folioPrefix: string };
  warranty: { referenceDays: number | null; confirmed: boolean };
  commercialTerms: string[];
  contact: { email?: string; whatsapp?: string; facebook?: string; instagram?: string; tiktok?: string };
  rental: { minimumTermMonths: number; financingBp: number; monthToMonthSurchargeBp: number; semiannualDiscountBp: number; annualDiscountBp: number };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  locked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  before?: unknown;
  after?: unknown;
  at: string;
}

export interface Dashboard {
  quotes: {
    byStatus: Record<string, number>;
    needsReview: number;
    last30Days: number;
    issuedThisMonth: number;
    issuedValueThisMonthCents: number;
    perDay: { date: string; count: number }[];
  };
  leads: { new: number; last30Days: number };
  catalog: { pendingPricing: number; drafts: number };
  alerts: { code: string; message: string; href: string }[];
  recentQuotes: { id: string; folio: string; status: QuoteStatus; packageName: string; totalCents: number; hasPendingAmounts: boolean; createdAt: string }[];
  recentLeads: { id: string; reference: string; name: string; company?: string; source: string; status: LeadStatus; createdAt: string }[];
}

// ------------------------------------------------------------------ cobranza (rentas y compras)

export type ContractType = "rental" | "purchase";
export type ContractStatus = "active" | "paused" | "cancelled" | "completed";
export type PaymentMethod = "cash" | "transfer" | "card" | "other";
export type BillingMonths = 1 | 6 | 12;
/** Derivado por el backend: vencido | vence en ≤ 7 días | al corriente | sin cobro pendiente. */
export type DueState = "overdue" | "due_soon" | "current" | "none";

export interface ContractListItem {
  id: string;
  reference: string;
  type: ContractType;
  status: ContractStatus;
  client: { id: string; name: string; company?: string; email: string } | null;
  packageName: string;
  monthlyCents: number | null;
  billingMonths: BillingMonths;
  /** Renta: mensualidad × periodo; compra: saldo pendiente. */
  chargeCents: number | null;
  totalCents: number | null;
  paidCents: number;
  balanceCents: number | null;
  nextDueDate: string | null;
  dueState: DueState;
  /** Negativo = días de atraso. */
  daysUntilDue: number | null;
  startDate: string;
  createdAt: string;
}

export interface ContractPayment {
  id: string;
  amountCents: number;
  paidAt: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  periods: number;
  coveredDueDate: string | null;
  voided: boolean;
  voidReason?: string;
  recordedBy: string;
  createdAt: string;
}

export interface ContractReminder {
  id: string;
  channel: "email";
  kind: "payment_reminder" | "admin_billing_digest";
  recipient: string;
  status: DeliveryStatus;
  dueDate: string | null;
  lastError: string | null;
  requestedBy: string;
  createdAt: string;
}

export interface ContractDetail extends Omit<ContractListItem, "client"> {
  client: { id: string; name: string; company?: string; email: string; phone?: string } | null;
  packageId: string | null;
  quoteId: string | null;
  termMonths: number;
  remindersEnabled: boolean;
  notes?: string;
  payments: ContractPayment[];
  reminders: ContractReminder[];
  history: { action: string; actor: string; at: string; after?: unknown }[];
  emailSimulated: boolean;
}

export interface CreateContractInput {
  type: ContractType;
  clientId?: string;
  newClient?: { name: string; email: string; phone?: string; company?: string };
  packageId?: string;
  packageName: string;
  startDate: string;
  monthlyCents?: number;
  billingMonths?: BillingMonths;
  firstDueDate?: string;
  termMonths?: number;
  totalCents?: number;
  balanceDueDate?: string;
  quoteId?: string;
  remindersEnabled?: boolean;
  notes?: string;
}

export interface UpdateContractInput {
  status?: ContractStatus;
  packageName?: string;
  monthlyCents?: number;
  billingMonths?: BillingMonths;
  totalCents?: number;
  nextDueDate?: string | null;
  termMonths?: number;
  remindersEnabled?: boolean;
  notes?: string;
}

export interface RegisterPaymentInput {
  amountCents: number;
  paidAt: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  periods?: number;
}

export interface BillingSummary {
  activeRentals: number;
  monthlyRecurringCents: number;
  overdue: { count: number; amountCents: number };
  dueSoon: { count: number; amountCents: number };
  collectedThisMonthCents: number;
  collectedLastMonthCents: number;
  outstandingPurchasesCents: number;
  activePurchases: number;
  /** Del más antiguo al actual. */
  incomeByMonth: { month: string; rentalCents: number; purchaseCents: number }[];
  overdueContracts: ContractListItem[];
  upcomingContracts: ContractListItem[];
}

// ------------------------------------------------------------------ testimonios

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface AdminTestimonial {
  id: string;
  name: string;
  company?: string;
  role?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  message: string;
  createdAt: string;
  /** Privado: nunca se publica. */
  email?: string;
  status: TestimonialStatus;
  featured: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}
