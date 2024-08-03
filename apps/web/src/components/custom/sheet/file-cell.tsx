'use client'

import React, { useEffect, useRef } from 'react'
import {
    CustomCell,
    type CustomRenderer,
    getMiddleCenterBias,
    GridCellKind,
    TextCellEntry,
} from '@glideapps/glide-data-grid'

interface IFileCellProps {
    kind: 'file-cell'
    file: File | null
}

type IFileCell = CustomCell<IFileCellProps>

const renderer: CustomRenderer<IFileCell> = {
    kind: GridCellKind.Custom,
    isMatch: (c): c is IFileCell => (c.data as any).kind === 'file-cell',
    needsHover: true,
    draw: (args, cell) => {
        const { ctx, theme, rect } = args
        const { file } = cell.data

        if (!file) {
            ctx.fillStyle = theme.textLight
            ctx.fillText(
                'Select a file...',
                rect.x + theme.cellHorizontalPadding,
                rect.y + rect.height / 2 + getMiddleCenterBias(ctx, theme)
            )

            return true
        }

        ctx.fillStyle = theme.textDark
        ctx.fillText(
            file.name,
            rect.x + theme.cellHorizontalPadding,
            rect.y + rect.height / 2 + getMiddleCenterBias(ctx, theme)
        )

        return true
    },
    provideEditor: () => ({
        editor: ((p) => {
            const inputRef = useRef<HTMLInputElement>(null)
            const initialized = useRef(false)

            useEffect(() => {
                if (!initialized.current) {
                    initialized.current = true

                    inputRef.current?.click()
                }
            }, [])

            const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]

                p.onFinishedEditing({
                    ...p.value,
                    data: {
                        ...p.value,
                        data: {
                            ...p.value.data,
                            file: file,
                        },
                    },
                })
            }

            return <input type="file" ref={inputRef} onChange={onChange} accept=".pdf" />
        }) as React.FC<any>,

        styleOverride: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 2,
        },
        disablePadding: true,
    }),
    onPaste: (val, d) => ({
        ...d,
    }),
}

export const FileCellRenderer = renderer
