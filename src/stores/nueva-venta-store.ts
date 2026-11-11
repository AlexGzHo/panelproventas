import { create } from 'zustand'

interface NuevaVentaStore {
  isOpen: boolean
  openNuevaVenta: () => void
  closeNuevaVenta: () => void
  setIsOpen: (isOpen: boolean) => void
}

export const useNuevaVentaStore = create<NuevaVentaStore>((set) => ({
  isOpen: false,
  openNuevaVenta: () => set({ isOpen: true }),
  closeNuevaVenta: () => set({ isOpen: false }),
  setIsOpen: (isOpen) => set({ isOpen }),
}))
