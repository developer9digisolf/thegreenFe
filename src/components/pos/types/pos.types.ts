/**
 * POS Page Types
 * All TypeScript interfaces for the POS system
 */

export interface ServiceVariant {
  id: number;
  serviceId: number;
  serviceName: string;
  variantName: string;
  displayName: string;
  duration: number;
  price: number;
  icon?: string;
  categoryColor?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  services: ServiceVariant[];
}

export interface Package {
  id: number;
  name: string;
  description?: string;
  totalSessions: number;
  price: number;
  validityDays: number;
  pricePerSession: number;
  savings?: number;
  serviceVariantName?: string;
}

export interface CreditPackage {
  id: number;
  name: string;
  description?: string;
  payAmount: number;
  creditAmount: number;
  bonusAmount: number;
  bonusPercentage: number;
  validityDays: number;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  type: number;
  typeName: string;
  icon?: string;
  requiresReference: boolean;
  isCash: boolean;
  sortOrder: number;
}

export interface Therapist {
  id: number;
  code: string;
  name: string;
  photo?: string;
  status: string;
  queueNumber?: number;
  currentService?: string;
  timeLeftMinutes?: number;
}

export interface CashierSession {
  id: number;
  sessionCode: string;
  userId: number;
  userName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  expectedClosingCash: number;
  actualClosingCash?: number;
  cashDifference?: number;
  status: number;
  statusName: string;
}

export interface OrderItem {
  id: number;
  itemType: number;
  itemTypeName: string;
  serviceVariantId?: number;
  packageId?: number;
  creditPackageId?: number;
  itemName: string;
  itemDescription?: string;
  categoryName?: string;
  duration: number;
  icon?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  saleCode: string;
  saleType: number;
  saleTypeName: string;
  cashierSessionId: number;
  memberId?: number;
  memberCode?: string;
  memberName?: string;
  memberPhone?: string;
  memberCreditBalance?: number;
  subtotal: number;
  discountAmount: number;
  discountPercent?: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  changeAmount: number;
  paymentStatus: number;
  paymentStatusName: string;
  notes?: string;
  items: OrderItem[];
  totalItems: number;
  totalDuration: number;
}

export interface PendingOrder {
  id: number;
  saleCode: string;
  memberName?: string;
  grandTotal: number;
  totalItems: number;
  createdAt: string;
  notes?: string;
}

export interface Member {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  creditBalance?: { totalBalance: number };
  totalVisits?: number;
  status: string;
  avoidAreas?: string[];
  vouchers?: { name: string; remaining: number; expiryDate: string }[];
  favoriteTherapistName?: string;
}

export interface PosInitData {
  currentSession?: CashierSession;
  hasOpenSession: boolean;
  categories: Category[];
  packages: Package[];
  creditPackages: CreditPackage[];
  paymentMethods: PaymentMethod[];
  pendingOrders: PendingOrder[];
  therapists: Therapist[];
}

export interface PaymentEntry {
  paymentMethodId: number;
  amount: number;
  referenceNumber?: string;
}

export type PosMode = 'session' | 'voucher' | 'redeem';
