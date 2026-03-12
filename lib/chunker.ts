export interface Chunk {
    text: string;
    index: number;
    source: string;
}

export function chunkText(text: string, source: string, chunkSize = 500, overlap = 50): Chunk[] {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: Chunk[] = [];
    let current = "";
    let index = 0;

    for (const sentence of sentences) {
        if ((current + sentence).length > chunkSize && current.length > 0) {
            chunks.push({ text: current.trim(), index, source });
            // Keep Overlap
            const words = current.split(" ");
            current = words.slice(-overlap).join(" ") + " " + sentence;
            index++;
        } else {
            current += (current ? " " : " ") + sentence;
        }
    }

    if (current.trim()) {
        chunks.push({ text: current.trim(), index, source });
    }

    return chunks;
}