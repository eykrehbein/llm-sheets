'use client'

import { useState, useEffect, useCallback } from 'react'
import localForage from 'localforage'
import { Atom, useAtom } from 'jotai'

export function useLocalData<T>(key: string, atom: Atom<T | null | undefined>, initialValue: T) {
    const [data, setStoredData] = useAtom<T | null | undefined>(atom)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        ;(async function () {
            const value: T | null = await localForage.getItem(key)
            // @ts-ignore
            setStoredData(value == null ? initialValue : value)
            setIsLoading(false)

            if (value == null) {
                await localForage.setItem(key, initialValue)
            }
        })()
    }, [])

    const setData = useCallback(
        async (value: T) => {
            // @ts-ignore
            setStoredData(value)
            await localForage.setItem(key, value)
        },
        [key]
    )

    const deleteData = useCallback(() => {
        async function remove() {
            // @ts-ignore
            setStoredData(null)
            await localForage.removeItem(key)
        }

        remove()
    }, [key])

    return { data, setData, deleteData, isLoading } as const
}
