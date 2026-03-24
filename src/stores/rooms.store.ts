import { create } from 'zustand';
import { IRoom } from '@afx/interfaces/room.iface';

interface IRoomsStore {
  rooms: IRoom[];
  activeRooms: IRoom[];
  selectedRoom: IRoom | null;
  setRooms: (rooms: IRoom[]) => void;
  setActiveRooms: (rooms: IRoom[]) => void;
  setSelectedRoom: (room: IRoom | null) => void;
  updateRoom: (id: number, room: Partial<IRoom>) => void;
  clearRooms: () => void;
  findAvailableRoom: () => IRoom | undefined;
  findRoomById: (id: number) => IRoom | undefined;
}

/**
 * Rooms store for caching room data
 * This reduces API calls and improves performance
 */
export const useRoomsStore = create<IRoomsStore>((set, get) => ({
  rooms: [],
  activeRooms: [],
  selectedRoom: null,

  setRooms: (rooms) => set({ rooms }),

  setActiveRooms: (activeRooms) => set({ activeRooms }),

  setSelectedRoom: (room) => set({ selectedRoom: room }),

  updateRoom: (id, roomData) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...roomData } : r)),
      activeRooms: state.activeRooms.map((r) => (r.id === id ? { ...r, ...roomData } : r)),
      selectedRoom: state.selectedRoom?.id === id ? { ...state.selectedRoom, ...roomData } : state.selectedRoom,
    })),

  clearRooms: () =>
    set({
      rooms: [],
      activeRooms: [],
      selectedRoom: null,
    }),

  findAvailableRoom: () => {
    const { activeRooms } = get();
    return activeRooms.find((r) => r.status === 'Available');
  },

  findRoomById: (id) => {
    const { rooms } = get();
    return rooms.find((r) => r.id === id);
  },
}));
