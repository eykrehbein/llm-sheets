'use client'
import { LOCAL_STORAGE_KEYS } from '@/lib/local-storage/keys'
import { useLocalData } from '@/lib/local-storage/utils'
import { atom } from 'jotai'

export interface ISheetMetadata {
    id: string
    title: string
    createdAt: string
    updatedAt: string
}

export const sheetsMetadataAtom = atom<ISheetMetadata[]>([])

export const useSheetsMetadata = () => {
    return useLocalData<ISheetMetadata[]>(LOCAL_STORAGE_KEYS.sheetsMetadata, sheetsMetadataAtom, [])
}
