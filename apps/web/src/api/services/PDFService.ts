import { PDFDocument } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const outputDir = './output'

export class PDFService {
    public static async splitPdfToImages(pdfPath: string) {
        // Read the PDF file
        const pdfBuffer = await fs.readFile(pdfPath)
        const pdfDoc = await PDFDocument.load(pdfBuffer)

        const filePaths: string[] = []
        const base64Images: string[] = []

        // Iterate through each page
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const page = pdfDoc.getPages()[i]
            const { width, height } = page.getSize()

            // Create a new PDF document with just this page
            const singlePagePdf = await PDFDocument.create()
            const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i])
            singlePagePdf.addPage(copiedPage)

            // Convert the single-page PDF to PNG
            const pngBuffer = await sharp(await singlePagePdf.save())
                .png()
                .resize({ width: Math.round(width), height: Math.round(height), fit: 'contain' })
                .toBuffer()

            // Save the image
            const outputPath = path.join(process.cwd(), `output_${i + 1}.png`)
            await fs.writeFile(outputPath, pngBuffer)
            filePaths.push(outputPath)

            // Convert to base64
            const base64 = pngBuffer.toString('base64')
            base64Images.push(base64)
        }

        return { filePaths, base64Images }
    }
}
