'use client'
import { LOCAL_STORAGE_KEYS } from '@/lib/local-storage/keys'
import { useLocalData } from '@/lib/local-storage/utils'
import { atom } from 'jotai'

export interface ISheetColumn {
    id: string
    title: string
    type: 'text' | 'number' | 'file' | 'image' | 'date' | 'checkbox' | 'json'
    tool: 'llm' | 'manual'
    description?: string
    width?: number
}

const initialColumns: ISheetColumn[] = [
    {
        id: 'file-input-pdf',
        title: 'File',
        tool: 'manual',
        type: 'file',
    },
]

export const sheetColumnsAtom = atom<ISheetColumn[]>(initialColumns)

export const useSheetColumns = (id: string) => {
    return useLocalData<ISheetColumn[]>(
        LOCAL_STORAGE_KEYS.sheetsColumns(id),
        sheetColumnsAtom,
        initialColumns
    )
}
