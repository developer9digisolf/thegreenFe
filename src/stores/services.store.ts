import { create } from 'zustand';
import { IService } from '@afx/interfaces/service.iface';

interface IServicesStore {
  services: IService[];
  activeServices: IService[];
  categories: string[];
  setServices: (services: IService[]) => void;
  setActiveServices: (services: IService[]) => void;
  addService: (service: IService) => void;
  updateService: (id: number, service: Partial<IService>) => void;
  removeService: (id: number) => void;
  clearServices: () => void;
}

/**
 * Services store for caching service data
 * This reduces API calls and improves performance
 */
export const useServicesStore = create<IServicesStore>((set, get) => ({
  services: [],
  activeServices: [],
  categories: [],

  setServices: (services) =>
    set({
      services,
      categories: [...new Set(services.map((s) => s.categoryName).filter(Boolean))],
    }),

  setActiveServices: (activeServices) => set({ activeServices }),

  addService: (service) =>
    set((state) => ({
      services: [...state.services, service],
    })),

  updateService: (id, serviceData) =>
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, ...serviceData } : s)),
      activeServices: state.activeServices.map((s) => (s.id === id ? { ...s, ...serviceData } : s)),
    })),

  removeService: (id) =>
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
      activeServices: state.activeServices.filter((s) => s.id !== id),
    })),

  clearServices: () =>
    set({
      services: [],
      activeServices: [],
      categories: [],
    }),
}));
