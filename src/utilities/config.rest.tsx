export const rest = {
  // Auth (Admin)
  authLogin: "auth/login",
  authRegister: "auth/register",
  authMe: "auth/me",
  authValidate: "auth/validate",
  authLogout: "auth/logout",
  authSwitchCompany: "auth/switch-company",

  // Images
  imageUpload: "images/upload",
  imageUploadMultiple: "images/upload-multiple",

  // Therapist Auth (Portal Terapis)
  therapistAuthLogin: "therapist-auth/login",
  therapistAuthLogout: "therapist-auth/logout",
  therapistAuthProfile: "therapist-auth/profile",
  therapistAuthQRToken: "therapist-auth/qr-token",
  therapistAuthVerifyQR: "therapist-auth/verify-qr",
  therapistAuthStatus: "therapist-auth/status",
  therapistAuthCheckOut: "therapist-auth/check-out",
  therapistAuthAttendance: "therapist-auth/attendance",

  // Service Categories
  serviceCategory: "service-categories",
  serviceCategoryActive: "service-categories/active",
  serviceCategoryCheckName: "service-categories/check-name",
  serviceCategoryDetail: "service-categories/:id",
  serviceCategoryWithServices: "service-categories/:id/services",

  // Services
  service: "services",
  serviceActive: "services/active",
  serviceDetail: "services/:id",
  serviceDetailFull: "services/:id/detail",
  serviceByCategory: "services/category/:categoryId",
  servicesUnregistered: "services/unregistered",
  serviceVariantsUnregistered: "services/:serviceId/variants/unregistered",

  // Service Variants
  serviceVariants: "services/variants",
  serviceVariantsByService: "services/:serviceId/variants",
  serviceVariantDetail: "services/variants/:variantId",

  // Packages (Voucher)
  package: "packages",
  packageActive: "packages/active",
  posServicePackages: "customer/service-packages",
  packageDetail: "packages/:id",
  packageCheckName: "packages/check-name",

  // Credit Packages
  creditPackage: "master/credit-packages",
  creditPackageActive: "master/credit-packages/active",
  creditPackageDetail: "master/credit-packages/:id",
  creditPackageCheckName: "master/credit-packages/check-name",

  // Members
  member: "members",
  memberActive: "members/active",
  memberDetail: "members/:id",
  memberDetailFull: "members/:id/detail",
  memberCheckPhone: "members/check-phone",
  memberCheckEmail: "members/check-email",
  memberServicePackages: "members/:id/service-packages",

  // Therapists
  therapist: "therapists",
  therapistActive: "therapists/active",
  therapistAvailable: "therapists/available",
  therapistDetail: "therapists/:id",
  therapistDetailFull: "therapists/:id/detail",
  therapistCheckPhone: "therapists/check-phone",

  // Rooms
  room: "rooms",
  roomActive: "rooms/active",
  roomAvailable: "rooms/available",
  roomDetail: "rooms/:id",
  roomDetailFull: "rooms/:id/detail",
  roomCheckName: "rooms/check-name",

  // Payment Methods
  paymentMethod: "payment-methods",
  paymentMethodActive: "payment-methods/active",
  posPaymentMethods: "pos/payment-methods",
  paymentMethodDetail: "payment-methods/:id",
  paymentMethodByCode: "payment-methods/code/:code",
  paymentMethodCheckCode: "payment-methods/check-code",

  // Cashier Sessions
  cashierSession: "cashier-sessions",
  cashierSessionDetail: "cashier-sessions/:id",
  cashierSessionDetailFull: "cashier-sessions/:id/detail",
  cashierSessionCurrent: "cashier-sessions/current",
  cashierSessionMySession: "cashier-sessions/my-session",
  cashierSessionHasOpen: "cashier-sessions/has-open-session",
  cashierSessionOpen: "cashier-sessions/open",
  cashierSessionClose: "cashier-sessions/:id/close",
  cashierSessionMovement: "cashier-sessions/:id/movements",
  cashierSessionBalance: "cashier-sessions/:id/balance",

  // POS
  posInit: "pos/init",
  posSales: "pos/sales",
  posOrders: "pos/orders",
  posOrdersPending: "pos/orders/pending",
  posOrderDetail: "pos/orders/:id",
  posOrderItems: "pos/orders/:id/items",
  posOrderItem: "pos/orders/:id/items/:itemId",
  posOrderMember: "pos/orders/:id/member",
  posOrderDiscount: "pos/orders/:id/discount",
  posOrderPay: "pos/orders/:id/pay",
  posOrderHold: "pos/orders/:id/hold",
  posOrderCancel: "pos/orders/:id",

  // Bookings (Admin)
  booking: "bookings",
  bookingSummary: "bookings/summary",
  bookingDetail: "bookings/:id",

  // Dashboard
  dashboardSummaryRevenue: "dashboard/summary-revenue",
  dashboardSalesPerformance: "dashboard/sales-performance",
  dashboardPeakHours: "dashboard/peak-hour",
  dashboardCustomerSegmentation: "dashboard/customer-segmentation",
  dashboardTopTherapists: "dashboard/top-therapists",
  dashboardTopMembers: "dashboard/top-loyal-members",
  dashboardPaymentMethodTotals: "dashboard/payment-method-totals",
  dashboardRecentSales: "dashboard/recent-sales",
  dashboardRecentSessions: "dashboard/recent-sessions",
  dashboardTopServices: "dashboard/top-services",

  // Sales
  sales: "sales",
  salesPaid: "sales/paid",
  salesSummary: "sales/summary",
  salesDetail: "sales/:id",
  salesExport: "export/excel/sales",

  master: {
    companies: {
      index: "master/companies",
      show: "master/companies/:ID",
      create: "master/companies",
      update: "master/companies/:ID",
      delete: "master/companies/:ID",
    },
    branches: {
      index: "master/branches",
      show: "master/branches/:ID",
      create: "master/branches",
      update: "master/branches/:ID",
      delete: "master/branches/:ID",
    },
    positions: {
      index: "master/positions",
      show: "master/positions/:ID",
      create: "master/positions",
      update: "master/positions/:ID",
      delete: "master/positions/:ID",
    },
    departments: {
      index: "master/departments",
      show: "master/departments/:ID",
      create: "master/departments",
      update: "master/departments/:ID",
      delete: "master/departments/:ID",
    },
    branchOperatingHours: {
      byBranch: "master/branch-operating-hours/branch/:ID",
      create: "master/branch-operating-hours",
      update: "master/branch-operating-hours/:ID",
    },
    branchPaymentMethods: {
      index: "branch-payment-methods",
      show: "branch-payment-methods/:ID",
      create: "branch-payment-methods",
      update: "branch-payment-methods/:ID",
      delete: "branch-payment-methods/:ID",
      toggleStatus: "branch-payment-methods/:ID/toggle-status",
    },
    shifts: {
      index: "master/shifts",
      show: "master/shifts/:ID",
      create: "master/shifts",
      update: "master/shifts/:ID",
      delete: "master/shifts/:ID",
    },
    users: {
      index: "master/users",
      show: "master/users/:ID",
      create: "master/users",
      update: "master/users/:ID",
      delete: "master/users/:ID",
      companies: "master/users/:ID/companies",
      branches: "master/users/:ID/branches",
    },
    userHasCompanies: {
      index: "master/user-has-companies",
      detail: "master/user-has-companies/:ID",
    },
    userHasBranches: {
      index: "master/user-has-branches",
      detail: "master/user-has-branches/:ID",
    },
    employees: {
      index: "master/employees",
      show: "master/employees/:ID",
      create: "master/employees",
      update: "master/employees/:ID",
      delete: "master/employees/:ID",
    },
    employeeOneTimeShifts: {
      index: "master/employee-one-time-shifts",
      create: "master/employee-one-time-shifts",
      update: "master/employee-one-time-shifts/:ID",
      delete: "master/employee-one-time-shifts/:ID",
      import: "master/employee-one-time-shifts/import",
    },
    employeeRecurringShifts: {
      byEmployee: "master/employee-recurring-shifts/employee/:ID",
      create: "master/employee-recurring-shifts",
    },
    attendanceQRSessions: "master/attendance-qr-sessions",
    devicePairingCodesGenerate: "master/device-pairing-codes/generate",
    branchServiceVariants: {
      index: "master/branch-service-variants",
      show: "master/branch-service-variants/:ID",
      create: "master/branch-service-variants",
      update: "master/branch-service-variants/:ID",
      delete: "master/branch-service-variants/:ID",
    },
    servicePackages: {
      index: "master/service-packages",
      show: "master/service-packages/:ID",
      create: "master/service-packages",
      update: "master/service-packages/:ID",
      delete: "master/service-packages/:ID",
    },
    commissions: {
      byEmployee: "master/commissions/by-employee",
      sessions: "master/commissions/sessions",
      export: "export/excel/commissions",
    },
    attendance: {
      timesheets: "attendance/timesheets",
    },
    additionalCosts: {
      index: "master/additional-costs",
      show: "master/additional-costs/:ID",
      create: "master/additional-costs",
      update: "master/additional-costs/:ID",
      delete: "master/additional-costs/:ID",
    },
  },
};
