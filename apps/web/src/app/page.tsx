'use client'

import { SheetFeedItem } from '@/components/custom/home/sheet-feed-item'
import { useSheetsMetadata } from '@/lib/local-storage/entities/sheets-metadata'
import { FilePlus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'

export default function Home() {
    const router = useRouter()

    const { data, setData } = useSheetsMetadata()

    const handleCreateSheet = async () => {
        if (!data) {
            return
        }
        const existingUntitledDocumentsCount = data.filter((el) =>
            el.title.startsWith('Untitled')
        ).length

        const newId = uuid()

        await setData([
            ...data,
            {
                id: newId,
                title: 'Untitled ' + (existingUntitledDocumentsCount + 1),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])

        router.push('/sheet/' + newId)
    }

    return (
        <main className="w-screen min-h-screen flex flex-col py-8 items-center">
            <div className="flex flex-col w-full max-w-screen-md">
                {/* <nav className="flex flex-row justify-between w-full">
                    <div>
                        <p className="font-cal text-2xl">Sheets</p>
                    </div>
                    <div className="flex flex-row">
                        <button className="text-sm">Logout</button>
                    </div>
                </nav> */}

                <div className="w-full flex flex-col">
                    <div className="flex flex-col">
                        <button
                            onClick={handleCreateSheet}
                            className="flex flex-row justify-between  py-3 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-4 mt-4 rounded"
                        >
                            <div className="flex flex-row items-center gap-2">
                                <FilePlus className="w-4 h-4" />
                                <p className="font-medium">Create a new sheet</p>
                            </div>
                        </button>

                        <div className="w-full px-4 mt-12">
                            <h2 className="text-xl font-bold">Recent Sheets</h2>
                        </div>

                        <div className="flex flex-col mt-3">
                            {data
                                ?.sort(
                                    (a, b) =>
                                        new Date(b.createdAt).getTime() -
                                        new Date(a.createdAt).getTime()
                                )
                                .map((el) => <SheetFeedItem key={el.id} {...el} />)}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
