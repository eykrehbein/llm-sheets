'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ISheetColumn } from '@/lib/local-storage/entities/sheets-columns'

import {
    SigmaIcon,
    CaseSensitiveIcon,
    FileImageIcon,
    FileJson2Icon,
    TextIcon,
    SquareCheckIcon,
    FileTextIcon,
    BotIcon,
    KeyboardIcon,
} from 'lucide-react'
import { useState } from 'react'

export interface IAddColumnPopoverProps {
    handleAddColumn: (column: ISheetColumn) => void
    handleOpenChange?: (open: boolean) => void
    isOpen?: boolean
}

const defaultState: ISheetColumn = {
    id: '',
    title: '',
    type: 'text',
    tool: 'llm',
}

export const AddColumnPopover = ({
    handleAddColumn,
    isOpen,
    handleOpenChange,
}: IAddColumnPopoverProps) => {
    const [draft, setDraft] = useState<ISheetColumn>(defaultState)

    return (
        <Popover defaultOpen open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button className="outline-none h-[33px] w-[120px] text-xl bg-[#F7F7F8] text-[#000000dd] border-b  border-[#E2E2E5] hover:cursor-pointer hover:bg-[#EFEFF1] transform transition-all duration-100">
                    +
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" collisionPadding={10}>
                <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault()

                        handleAddColumn(draft)
                        setDraft(defaultState)
                    }}
                >
                    <div className="space-y-2">
                        <Input
                            placeholder="Column Title"
                            onChange={(e) =>
                                setDraft({
                                    ...draft,
                                    title: e.target.value,
                                    id: e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-zA-Z0-9]/g, '_')
                                        .split(' ')
                                        .join('_'),
                                })
                            }
                            value={draft.title}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Data Type</Label>
                            <Select
                                defaultValue={draft.type}
                                value={draft.type}
                                onValueChange={(val: ISheetColumn['type']) => {
                                    setDraft({ ...draft, type: val })
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">
                                        <div className="flex flex-row items-center gap-1">
                                            <TextIcon className="w-3.5 h-3.5" />
                                            Text
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="number">
                                        <div className="flex flex-row items-center gap-1">
                                            <SigmaIcon className="w-3.5 h-3.5" />
                                            Number
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="json">
                                        <div className="flex flex-row items-center gap-1">
                                            <FileJson2Icon className="w-3.5 h-3.5" />
                                            JSON
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="image">
                                        <div className="flex flex-row items-center gap-1">
                                            <FileImageIcon className="w-3.5 h-3.5" />
                                            Image
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="checkbox">
                                        <div className="flex flex-row items-center gap-1">
                                            <SquareCheckIcon className="w-3.5 h-3.5" />
                                            Checkbox
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="file">
                                        <div className="flex flex-row items-center gap-1">
                                            <FileTextIcon className="w-3.5 h-3.5" />
                                            File
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Tool</Label>
                            <Select
                                defaultValue={draft.tool}
                                value={draft.tool}
                                onValueChange={(val: ISheetColumn['tool']) => {
                                    setDraft({ ...draft, tool: val })
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="llm">
                                        <div className="flex flex-row items-center gap-1">
                                            <BotIcon className="w-3.5 h-3.5" />
                                            LLM
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="manual">
                                        <div className="flex flex-row items-center gap-1">
                                            <KeyboardIcon className="w-3.5 h-3.5" />
                                            Manual
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                            <Label>Description / Prompt</Label>
                            <Textarea
                                placeholder="An optional description or prompt to give more context about the expected value"
                                className="text-xs"
                                value={draft.description}
                                onChange={(e) =>
                                    setDraft({ ...draft, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="w-full">
                            <Button
                                disabled={!draft.title || !draft.type || !draft.tool || !draft.id}
                                className="w-full"
                                type="submit"
                            >
                                Add Column
                            </Button>
                        </div>
                        {/* <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Type</Label>
                            <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxWidth">Max. width</Label>
                            <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxHeight">Max. height</Label>
                            <Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
                        </div> */}
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    )
}
