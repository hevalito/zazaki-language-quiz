
import { create } from 'zustand'

export interface Badge {
    id: string
    title: any
    description: any
    iconUrl: string | null
    imageUrl: string | null
    criteria: any
}

interface UnlockStore {
    unlockQueue: Badge[]
    addBadges: (badges: Badge[]) => void
    popBadge: () => void
    clearQueue: () => void
}

export const useUnlockStore = create<UnlockStore>((set) => ({
    unlockQueue: [],
    addBadges: (badges) => set((state) => ({
        unlockQueue: [...state.unlockQueue, ...badges]
    })),
    popBadge: () => set((state) => ({
        unlockQueue: state.unlockQueue.slice(1)
    })),
    clearQueue: () => set({ unlockQueue: [] })
}))
