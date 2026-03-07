/**
 * Zustand stores for global state management
 *
 * These stores provide centralized state management with better performance
 * than Context API for frequently updated data.
 *
 * Benefits:
 * - Reduced re-renders (components only re-render when specific data changes)
 * - Better performance (no prop drilling)
 * - Persistent storage (auth store)
 * - Easy data caching
 *
 * Usage:
 * ```tsx
 * import { useServicesStore, useMembersStore } from '@afx/stores';
 *
 * function MyComponent() {
 *   const services = useServicesStore((state) => state.services);
 *   const setServices = useServicesStore((state) => state.setServices);
 *   const { selectedMember, setSelectedMember } = useMembersStore();
 *
 *   // Use the data...
 * }
 * ```
 */

export { useAuthStore } from './auth.store';
export { useServicesStore } from './services.store';
export { useMembersStore } from './members.store';
export { useRoomsStore } from './rooms.store';
export { useTherapistsStore } from './therapists.store';
