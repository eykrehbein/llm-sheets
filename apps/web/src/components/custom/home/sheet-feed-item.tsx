import { ISheetMetadata } from '@/lib/local-storage/entities/sheets'
import Link from 'next/link'
import { FileSpreadsheetIcon } from 'lucide-react'

export const SheetFeedItem = ({ title, id }: ISheetMetadata) => {
    return (
        <Link href={`/sheet/${id}`}>
            <div className="flex flex-row justify-between border-b py-3 cursor-pointer hover:bg-neutral-100 px-4">
                <div className="flex flex-row items-center gap-2">
                    <FileSpreadsheetIcon className="w-4 h-4" />
                    <p className="font-medium">{title}</p>
                </div>
            </div>
        </Link>
    )
}
