import { create } from 'zustand';
import { IMember } from '@afx/interfaces/member.iface';

interface IMembersStore {
  members: IMember[];
  activeMembers: IMember[];
  selectedMember: IMember | null;
  setMembers: (members: IMember[]) => void;
  setActiveMembers: (members: IMember[]) => void;
  setSelectedMember: (member: IMember | null) => void;
  addMember: (member: IMember) => void;
  updateMember: (id: number, member: Partial<IMember>) => void;
  removeMember: (id: number) => void;
  clearMembers: () => void;
  findMemberById: (id: number) => IMember | undefined;
  findMemberByPhone: (phone: string) => IMember | undefined;
  findMemberByEmail: (email: string) => IMember | undefined;
}

/**
 * Members store for caching member data
 * This reduces API calls and improves search performance
 */
export const useMembersStore = create<IMembersStore>((set, get) => ({
  members: [],
  activeMembers: [],
  selectedMember: null,

  setMembers: (members) => set({ members }),

  setActiveMembers: (activeMembers) => set({ activeMembers }),

  setSelectedMember: (member) => set({ selectedMember: member }),

  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member],
    })),

  updateMember: (id, memberData) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...memberData } : m)),
      activeMembers: state.activeMembers.map((m) => (m.id === id ? { ...m, ...memberData } : m)),
      selectedMember:
        state.selectedMember?.id === id ? { ...state.selectedMember, ...memberData } : state.selectedMember,
    })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      activeMembers: state.activeMembers.filter((m) => m.id !== id),
      selectedMember: state.selectedMember?.id === id ? null : state.selectedMember,
    })),

  clearMembers: () =>
    set({
      members: [],
      activeMembers: [],
      selectedMember: null,
    }),

  findMemberById: (id) => {
    const { members } = get();
    return members.find((m) => m.id === id);
  },

  findMemberByPhone: (phone) => {
    const { members } = get();
    return members.find((m) => m.phone === phone);
  },

  findMemberByEmail: (email) => {
    const { members } = get();
    return members.find((m) => m.email === email);
  },
}));
