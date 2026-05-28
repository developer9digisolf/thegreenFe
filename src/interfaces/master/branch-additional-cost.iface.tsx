export interface IAdditionalCostMaster {
  id: number;
  code: string;
  name: string;
  description: string;
  costType: string;
  defaultPrice: number;
  isPercentage: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface IBranchAdditionalCost {
  id: number;
  branchId: number;
  additionalCostId: number;
  price: number;
  isMandatory: boolean;
  isApplicableToServices: boolean;
  isApplicableToProducts: boolean;
  minimumTransactionAmount: number;
  maximumTransactionAmount: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  additionalCost: IAdditionalCostMaster;
}

export interface IBranchAdditionalCostPayload {
  additionalCostId: number;
  price: number;
  isMandatory: boolean;
  isApplicableToServices: boolean;
  isApplicableToProducts: boolean;
  minimumTransactionAmount: number;
  maximumTransactionAmount: number | null;
}