import mammoth from 'mammoth';
import { extractText } from 'unpdf';

export async function parseFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'pdf': {
            const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
            return text;
        }

        case 'docx':
            return (await mammoth.extractRawText({ buffer })).value;

        case 'txt':
        case 'md':
            return buffer.toString('utf-8');

        default:
            throw new Error(`Unsupported file type: .${ext}`);
    }
}