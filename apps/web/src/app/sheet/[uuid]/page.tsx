'use client'
import { EditColumnDialog } from '@/components/custom/sheet/edit-column-dialog'
import { AddColumnPopover } from '@/components/custom/sheet/add-column-popover'
import { z } from 'zod'
import {
    AutoGridColumn,
    DataEditor,
    EditableGridCell,
    GridCell,
    GridCellKind,
    GridColumn,
    Item,
    SizedGridColumn,
    SpriteMap,
} from '@glideapps/glide-data-grid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FileCellRenderer } from '@/components/custom/sheet/file-cell'
import { ISheetColumn, useSheetColumns } from '@/lib/local-storage/entities/sheets-columns'
import { useParams } from 'next/navigation'
import { experimental_useObject as useObject } from 'ai/react'

interface ExtendedGridColumn extends SizedGridColumn {
    tool: ISheetColumn['tool']
    type: ISheetColumn['type']
}

export default function SheetPage() {
    const { uuid } = useParams<{ uuid: string }>()

    const [currentlyEditedColumn, setCurrentlyEditedColumn] = useState<GridColumn | null>(null)
    const [isAddColumnPopoverOpen, setIsAddColumnPopoverOpen] = useState(false)

    const { data: storedColumns, setData: setColumns } = useSheetColumns(uuid)

    const handleAddColumn = async (column: ISheetColumn) => {
        if (!storedColumns) {
            return
        }

        await setColumns([...storedColumns, column])
        setIsAddColumnPopoverOpen(false)
    }

    const [loadingRow, setLoadingRow] = useState<number | null>(null)
    const [loadingRowData, setLoadingRowData] = useState<Record<string, unknown> | null>(null)

    const [loadingCompletedColumnIds, setLoadingCompletedColumnIds] = useState<string[]>([])

    const computedGridColumns = useMemo<ExtendedGridColumn[]>(() => {
        if (!storedColumns) {
            return []
        }

        let columns: ExtendedGridColumn[] = []
        for (const col of storedColumns) {
            columns.push({
                type: col.type,
                tool: col.tool,
                width: col.width || 120,
                title: col.title,
                id: col.id,
                grow: 1,
                menuIcon: 'ellipsis',
                hasMenu: true,
                icon: col.type,
            })
        }

        console.log(`renderedColumns`, columns)

        return columns
    }, [storedColumns])

    const currentJsonSchema = useMemo(() => {}, [storedColumns])

    const {
        object,
        submit: generateObject,
        isLoading,
    } = useObject({
        api: '/api/row/process',
        // placeholder schema. instead, enter our SheetColumn schema
        schema: z.object({}),
    })

    console.log({ object })

    const [data, setData] = useState([
        {
            file: null,
        },
        {
            file: null,
        },
        {
            file: null,
        },
        {
            file: null,
        },
    ])

    useEffect(() => {
        if (object) {
            setData((prevData) => {
                const newData = [...prevData]
                for (const [key, value] of Object.entries(object)) {
                    const colIndex = storedColumns?.findIndex((col) => col.id === key)
                    // replace any non-alphanumeric characters with underscores

                    if (colIndex !== undefined && colIndex !== -1) {
                        newData[loadingRow as number] = {
                            ...newData[loadingRow as number],
                            [key]: value,
                        }

                        setLoadingCompletedColumnIds((prev) => [...prev, key])
                    }
                }

                return newData
            })
        }
    }, [object])

    // just temp to test multi rows
    useEffect(() => {
        if (!isLoading) {
            setLoadingCompletedColumnIds([])
            setLoadingRow(null)
        }
    }, [isLoading])

    const getCellContent = useCallback(
        (cell: Item): GridCell => {
            const [col, row] = cell
            const dataRow = data[row]

            // @ts-ignore
            const d = dataRow[computedGridColumns[col].id] || ''

            if (
                loadingRow === row &&
                computedGridColumns[col].tool === 'llm' &&
                !loadingCompletedColumnIds?.includes(computedGridColumns[col].id as string)
            ) {
                return {
                    kind: GridCellKind.Loading,
                    skeletonHeight: 16,
                    skeletonWidth: 100,
                    skeletonWidthVariability: 10,
                    allowOverlay: true,
                }
            }

            if (computedGridColumns[col].type === 'file') {
                return {
                    kind: GridCellKind.Custom,
                    allowOverlay: true,
                    readonly: false,
                    activationBehaviorOverride: d ? 'double-click' : 'single-click',
                    cursor: 'pointer',
                    copyData: d,
                    data: {
                        kind: 'file-cell',
                        // random name of a file
                        file: d,
                    },
                }
            } else if (computedGridColumns[col].type === 'number') {
                return {
                    kind: GridCellKind.Number,
                    displayData: d?.toString() ?? '',
                    allowOverlay: true,
                    readonly: false,
                    activationBehaviorOverride: 'double-click',
                    data: d?.toString() ?? '',
                }
            } else if (computedGridColumns[col].type === 'checkbox') {
                return {
                    kind: GridCellKind.Boolean,
                    allowOverlay: false,
                    readonly: false,
                    activationBehaviorOverride: 'double-click',
                    data: Boolean(d) ?? true,
                }
            } else {
                return {
                    kind: GridCellKind.Text,
                    displayData: d.toString() ?? '',
                    allowOverlay: true,
                    readonly: false,
                    activationBehaviorOverride: 'double-click',
                    data: d.toString() ?? '',
                }
            }
        },
        [computedGridColumns, loadingRow, loadingCompletedColumnIds, data]
    )

    const handleUpload = async (file: File) => {
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                console.log('File uploaded successfully')
            } else {
                console.log('File upload failed')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            console.log('Error uploading file')
        } finally {
            console.log(false)
        }
    }

    const onCellEdited = useCallback(
        async (cell: Item, newValue: EditableGridCell) => {
            const [col, row] = cell

            if (newValue.kind === GridCellKind.Text) {
                setData((prev) => {
                    prev[row] = {
                        ...prev[row],
                        [computedGridColumns[col].id as string]: newValue.data,
                    }
                    return prev
                })
            } else if (newValue.kind === GridCellKind.Number) {
                setData((prev) => {
                    prev[row] = {
                        ...prev[row],
                        [computedGridColumns[col].id as string]: newValue.data,
                    }
                    return prev
                })
            } else if (newValue.kind === GridCellKind.Custom) {
                // @ts-ignore
                if (newValue.data.data.file instanceof File) {
                    // @ts-ignore
                    const file = newValue.data.data.file
                    setData((prev) => {
                        prev[row] = {
                            ...prev[row],
                            [computedGridColumns[col].id as string]: file,
                        }
                        return prev
                    })

                    setLoadingRow(row)

                    await handleUpload(file)
                    generateObject({
                        fileName: file.name,
                        columns: storedColumns,
                    })
                }
            } else {
                console.error('Unsupported cell kind', newValue)
            }
        },
        [computedGridColumns]
    )

    const onColumnResize = useCallback(
        (column: GridColumn, newSize: number) => {
            const index = storedColumns?.findIndex((ci) => ci.title === column.title)
            const newArray = [...(storedColumns || [])]
            newArray.splice(index as number, 1, {
                ...storedColumns?.[index as number],
                width: newSize,
            } as ISheetColumn)

            setColumns(newArray)
        },
        [storedColumns]
    )

    const headerIcons = useMemo<SpriteMap>(
        () => ({
            file: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-spreadsheet"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>`,
            ellipsis: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
            text: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>`,
            number: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sigma"><path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/></svg>`,
            json: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-json-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M8 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`,
            image: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-image"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>`,
            checkbox: (p) =>
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-check-big"><path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/><path d="m9 11 3 3L22 4"/></svg>`,
        }),
        []
    )

    if (typeof window === 'undefined') {
        return null
    }

    return (
        <div className="w-screen h-screen bg-white">
            <DataEditor
                width={'100%'}
                height={'100%'}
                rowMarkers={'both'}
                getCellContent={getCellContent}
                columns={computedGridColumns}
                headerIcons={headerIcons}
                maxColumnAutoWidth={500}
                rows={data.length}
                className="w-screen h-screen border-b-[0.5px] border-b-[#E2E2E5] border-opacity-100"
                scaleToRem={true}
                headerHeight={32}
                onCellEdited={onCellEdited}
                customRenderers={[FileCellRenderer]}
                onCellsEdited={() => {}}
                editOnType={true}
                overscrollX={1000}
                onColumnResize={onColumnResize}
                smoothScrollX
                onHeaderClicked={(colIndex, event) => {
                    // is double click
                    if (event.isDoubleClick) {
                        setCurrentlyEditedColumn(computedGridColumns[colIndex])
                    }
                }}
                smoothScrollY
                theme={{
                    // accentColor: '#FF4F00',
                    // accentLight: '#FF4F0010',
                    headerIconSize: 16,
                }}
                onHeaderMenuClick={(colIndex) => {
                    setCurrentlyEditedColumn(computedGridColumns[colIndex])
                }}
                fillHandle={true}
                trailingRowOptions={{
                    sticky: true,
                    tint: true,
                    hint: 'New row...',
                }}
                rightElement={
                    <div className="w-[120px] flex flex-col bg-[#F7F7F8] h-full border-l border-[#E2E2E5]">
                        <AddColumnPopover
                            handleAddColumn={handleAddColumn}
                            isOpen={isAddColumnPopoverOpen}
                            handleOpenChange={(open) => setIsAddColumnPopoverOpen(open)}
                        />
                    </div>
                }
                onDrop={() => {
                    alert('dropped')
                }}
                onRowAppended={() => {}}
                rightElementProps={{
                    fill: false,
                    sticky: false,
                }}
            />

            {currentlyEditedColumn && (
                <EditColumnDialog open={!!currentlyEditedColumn} column={currentlyEditedColumn} />
            )}
        </div>
    )
}
