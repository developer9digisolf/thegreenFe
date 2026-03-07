import { create } from 'zustand';
import { ITherapist } from '@afx/interfaces/therapist.iface';

interface ITherapistsStore {
  therapists: ITherapist[];
  activeTherapists: ITherapist[];
  selectedTherapist: ITherapist | null;
  setTherapists: (therapists: ITherapist[]) => void;
  setActiveTherapists: (therapists: ITherapist[]) => void;
  setSelectedTherapist: (therapist: ITherapist | null) => void;
  updateTherapist: (id: number, therapist: Partial<ITherapist>) => void;
  clearTherapists: () => void;
  findAvailableTherapist: () => ITherapist | undefined;
  findTherapistById: (id: number) => ITherapist | undefined;
}

/**
 * Therapists store for caching therapist data
 * This reduces API calls and improves performance
 */
export const useTherapistsStore = create<ITherapistsStore>((set, get) => ({
  therapists: [],
  activeTherapists: [],
  selectedTherapist: null,

  setTherapists: (therapists) => set({ therapists }),

  setActiveTherapists: (activeTherapists) => set({ activeTherapists }),

  setSelectedTherapist: (therapist) => set({ selectedTherapist: therapist }),

  updateTherapist: (id, therapistData) =>
    set((state) => ({
      therapists: state.therapists.map((t) => (t.id === id ? { ...t, ...therapistData } : t)),
      activeTherapists: state.activeTherapists.map((t) => (t.id === id ? { ...t, ...therapistData } : t)),
      selectedTherapist:
        state.selectedTherapist?.id === id ? { ...state.selectedTherapist, ...therapistData } : state.selectedTherapist,
    })),

  clearTherapists: () =>
    set({
      therapists: [],
      activeTherapists: [],
      selectedTherapist: null,
    }),

  findAvailableTherapist: () => {
    const { activeTherapists } = get();
    return activeTherapists.find((t) => t.status === 'Available');
  },

  findTherapistById: (id) => {
    const { therapists } = get();
    return therapists.find((t) => t.id === id);
  },
}));
