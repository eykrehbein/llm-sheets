import jsonSchemaToZod from 'json-schema-to-zod'

// duplicate from frontend
export interface ISheetColumn {
    id: string
    title: string
    type: 'text' | 'number' | 'file' | 'image' | 'date' | 'checkbox' | 'json'
    tool: 'llm' | 'manual'
    description?: string
    width?: number
}
export class SchemaService {
    public static generateZodSchemaFromColumns(columns: ISheetColumn[]) {
        const properties: { [key: string]: Record<string, unknown> } = {}

        columns
            .filter((col) => {
                if (col.tool === 'llm') {
                    return true
                }
            })
            .forEach((column) => {
                let type: string | string[]

                switch (column.type) {
                    case 'text':
                    case 'file':
                    case 'image':
                    case 'date':
                        type = 'string'
                        break
                    case 'number':
                        type = 'number'
                        break
                    case 'checkbox':
                        type = 'boolean'
                        break
                    case 'json':
                        type = 'object'
                        break
                    default:
                        type = 'string'
                }

                properties[column.id] = {
                    type: [type, 'null'],
                    title: column.title,
                }

                if (column.description) {
                    properties[column.id].description = column.description
                }
            })

        const schema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: properties,
        }

        return jsonSchemaToZod(schema)
    }
}
