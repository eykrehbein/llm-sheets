import { PDFService } from '@/api/services/PDFService'
import { anthropic } from '@ai-sdk/anthropic'
import { streamObject } from 'ai'
import { z } from 'zod'
import path from 'path'
import fs from 'fs'
import { SchemaService } from '@/api/services/SchemaService'
import { jsonSchemaToZod } from 'json-schema-to-zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const context = await req.json()

    // imageDir = path.join(process.cwd(), 'temp-data', fileName-images])
    // get all images from there in order. They are numerically ordered .png

    const imageDir = path.join(
        process.cwd(),
        'temp-data',
        path.basename(context.fileName, path.extname(context.fileName)) + '-images'
    )
    const imagePaths = fs
        .readdirSync(imageDir)
        .map((image) => path.join(imageDir, image))
        .sort()

    // load all images into base64
    const base64Images = imagePaths.map((imagePath) => {
        const imageBuffer = fs.readFileSync(imagePath)
        return imageBuffer.toString('base64')
    })

    const result = await streamObject({
        model: anthropic('claude-3-5-sonnet-20240620'),
        system: `Current Date: 2024-07-17

You are given every page of a PDF in order, that contain document you should extract information from. Look closely at the images and extract the information from them.
Your task is to extract the information from the CV and store it in a structured JSON format that is given below.

If values are nullable, set them to null if they are not present, but set them. Do never omit them.`,
        schema: eval(
            `const {z} = require("zod");\n ${SchemaService.generateZodSchemaFromColumns(context.columns)}`
        ),
        messages: [
            {
                role: 'user',
                content: base64Images.map((base64) => ({
                    type: 'image',
                    image: base64,
                })),
            },
        ],
    })

    return result.toTextStreamResponse()
}
