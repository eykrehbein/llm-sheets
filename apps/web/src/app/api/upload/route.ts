import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path, { join } from 'path'
import os from 'os'

import { spawn } from 'child_process'

function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        // Path to the Python executable in your virtual environment
        const pythonPath = path.join(process.cwd(), 'venv/bin/python')

        // Spawn a new process
        const pythonProcess = spawn(pythonPath, [scriptPath, ...args])

        let output = ''

        // Collect data from stdout
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
        })

        // Collect data from stderr
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`)
        })

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}`))
            } else {
                resolve(output.trim())
            }
        })
    })
}

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save the file to a temporary directory
    const tempDir = path.join(process.cwd(), 'temp-data')
    const filePath = join(tempDir, file.name)

    try {
        await writeFile(filePath, buffer)
        await runPythonScript(path.join(process.cwd(), 'scripts', 'convert.py'), [filePath])
        console.log(`File saved to ${filePath}`)
        return NextResponse.json({ message: 'File uploaded successfully' })
    } catch (error) {
        console.error('Error saving file:', error)
        return NextResponse.json({ error: 'Error saving file' }, { status: 500 })
    }
}
