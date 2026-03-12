import { parseFile } from "@/lib/parseFile";
import { chunkText } from "@/lib/chunker";
import { embedTexts } from "@/lib/embeddings";
import { addDocuments } from "@/lib/vectorStore";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Support to upload multi files
        const files = formData.getAll("files") as File[];

        if (!files.length) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
        }
        let totalChunks = 0;

        for (const file of files) {
            // Extract text from files
            const text = await parseFile(file);
            // 把长文本切成小块，每块约500字
            // overlap=50 保证块与块之间有重叠，避免语义断裂
            const chunks = chunkText(text, file.name);

            // 批量生成每个块的向量（embedding）
            // 向量是一串数字，代表文本的语义位置
            const embeddings = await embedTexts(chunks.map(c => c.text));

            await addDocuments({
                ids: chunks.map(() => randomUUID()),
                embeddings,
                documents: chunks.map(c => c.text),
                metadatas: chunks.map(c => ({ source: c.source, index: String(c.index) })),
            });

            totalChunks += chunks.length;
        }

        return Response.json({
            success: true,
            filesProcessed: files.length,
            chunksStored: totalChunks,
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Error processing file" }, { status: 500 });
    }
}