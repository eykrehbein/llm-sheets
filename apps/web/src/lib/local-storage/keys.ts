'use client'
export const LOCAL_STORAGE_KEYS = {
    sheetsMetadata: 'sheetsMetadata',
    sheetsColumns: (id: string) => `sheetsColumns-${id}`,
}
