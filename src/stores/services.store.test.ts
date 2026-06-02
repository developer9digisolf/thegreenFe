import { describe, it, expect, beforeEach } from 'vitest'
import { useServicesStore } from './services.store'
import { IService } from '@afx/interfaces/service.iface'

describe('useServicesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useServicesStore.getState()
    store.clearServices()
  })

  it('should have initial empty state', () => {
    const state = useServicesStore.getState()
    expect(state.services).toEqual([])
    expect(state.activeServices).toEqual([])
    expect(state.categories).toEqual([])
  })

  describe('setServices', () => {
    it('should set services and extract unique categories', () => {
      const store = useServicesStore.getState()
      const services: IService[] = [
        { id: 1, name: 'Massage', categoryName: 'Body' },
        { id: 2, name: 'Facial', categoryName: 'Face' },
        { id: 3, name: 'Spa', categoryName: 'Body' },
      ] as IService[]

      store.setServices(services)

      const state = useServicesStore.getState()
      expect(state.services).toHaveLength(3)
      expect(state.categories).toEqual(['Body', 'Face'])
    })

    it('should handle empty services array', () => {
      const store = useServicesStore.getState()
      store.setServices([])

      const state = useServicesStore.getState()
      expect(state.services).toEqual([])
      expect(state.categories).toEqual([])
    })

    it('should filter out null/undefined category names', () => {
      const store = useServicesStore.getState()
      const services = [
        { id: 1, name: 'Massage', categoryName: 'Body' },
        { id: 2, name: 'Custom', categoryName: null },
        { id: 3, name: 'Other', categoryName: undefined },
      ] as IService[]

      store.setServices(services)

      const state = useServicesStore.getState()
      expect(state.categories).toEqual(['Body'])
    })
  })

  describe('setActiveServices', () => {
    it('should set active services', () => {
      const store = useServicesStore.getState()
      const activeServices = [{ id: 1, name: 'Active' }] as IService[]

      store.setActiveServices(activeServices)

      const state = useServicesStore.getState()
      expect(state.activeServices).toEqual(activeServices)
    })
  })

  describe('addService', () => {
    it('should append service to existing list', () => {
      const store = useServicesStore.getState()
      store.setServices([{ id: 1, name: 'First' }] as IService[])

      store.addService({ id: 2, name: 'Second' } as IService)

      const state = useServicesStore.getState()
      expect(state.services).toHaveLength(2)
      expect(state.services[1]).toMatchObject({ id: 2, name: 'Second' })
    })

    it('should add to empty list', () => {
      const store = useServicesStore.getState()
      store.addService({ id: 1, name: 'New' } as IService)

      const state = useServicesStore.getState()
      expect(state.services).toHaveLength(1)
    })
  })

  describe('updateService', () => {
    it('should update matching service in both lists', () => {
      const store = useServicesStore.getState()
      const services = [
        { id: 1, name: 'Old Name', price: 100 },
        { id: 2, name: 'Other', price: 200 },
      ] as IService[]

      store.setServices(services)
      store.setActiveServices(services)

      store.updateService(1, { name: 'New Name', price: 150 })

      const state = useServicesStore.getState()
      expect(state.services[0]).toMatchObject({ id: 1, name: 'New Name', price: 150 })
      expect(state.activeServices[0]).toMatchObject({ id: 1, name: 'New Name', price: 150 })
    })

    it('should not modify non-matching services', () => {
      const store = useServicesStore.getState()
      store.setServices([{ id: 1, name: 'First' }] as IService[])

      store.updateService(999, { name: 'Updated' })

      const state = useServicesStore.getState()
      expect(state.services[0]).toMatchObject({ id: 1, name: 'First' })
    })

    it('should merge partial updates', () => {
      const store = useServicesStore.getState()
      store.setServices([{ id: 1, name: 'Original', price: 100, duration: 60 }] as IService[])

      store.updateService(1, { price: 150 })

      const state = useServicesStore.getState()
      expect(state.services[0]).toMatchObject({
        id: 1,
        name: 'Original',
        price: 150,
        duration: 60,
      })
    })
  })

  describe('removeService', () => {
    it('should remove service by id from both lists', () => {
      const store = useServicesStore.getState()
      const services = [
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
      ] as IService[]

      store.setServices(services)
      store.setActiveServices(services)

      store.removeService(1)

      const state = useServicesStore.getState()
      expect(state.services).toHaveLength(1)
      expect(state.services[0].id).toBe(2)
      expect(state.activeServices).toHaveLength(1)
      expect(state.activeServices[0].id).toBe(2)
    })

    it('should handle removing from empty list', () => {
      const store = useServicesStore.getState()
      store.removeService(1)

      const state = useServicesStore.getState()
      expect(state.services).toEqual([])
    })
  })

  describe('clearServices', () => {
    it('should reset all state to initial values', () => {
      const store = useServicesStore.getState()
      store.setServices([{ id: 1, name: 'Test', categoryName: 'Cat' }] as IService[])
      store.setActiveServices([{ id: 1, name: 'Test' }] as IService[])

      store.clearServices()

      const state = useServicesStore.getState()
      expect(state.services).toEqual([])
      expect(state.activeServices).toEqual([])
      expect(state.categories).toEqual([])
    })
  })
})
