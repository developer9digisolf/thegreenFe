// Additional Cost (for listing)
export interface IAdditionalCost {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description?: string;
  costType: string;
  defaultPrice: number;
  isPercentage: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  branchAdditionalCostCount: number;
}

// Additional Cost Detail
export interface IAdditionalCostDetail extends IAdditionalCost {
  // Add any additional fields if needed for detail view
}

// Create Additional Cost Request
export interface ICreateAdditionalCostRequest {
  code: string;
  name: string;
  description?: string;
  costType: string;
  defaultPrice: number;
  isPercentage: boolean;
  sortOrder?: number;
}

// Update Additional Cost Request
export interface IUpdateAdditionalCostRequest {
  code?: string;
  name?: string;
  description?: string;
  costType?: string;
  defaultPrice?: number;
  isPercentage?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

// Additional Cost Type Enum
export const AdditionalCostTypeEnum = {
  ServiceFee: "service_fee",
  Tax: "tax",
  Gratuity: "gratuity",
  DeliveryFee: "delivery_fee",
  PackagingFee: "packaging_fee",
  AdminFee: "admin_fee",
  VipFee: "vip_fee",
  Other: "other",
} as const;

export type AdditionalCostType =
  (typeof AdditionalCostTypeEnum)[keyof typeof AdditionalCostTypeEnum];
