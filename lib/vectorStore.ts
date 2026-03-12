import { Pinecone } from '@pinecone-database/pinecone';

let pinecone: Pinecone | null = null;

function getClient(): Pinecone {
    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }
    return pinecone;
}

function getIndex() {
    // 直接用 host 连接，跳过 describe_index 的网络请求，更快
    return getClient().index('rag-documents', process.env.PINECONE_HOST);
}

export async function addDocuments(params: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
    metadatas: Record<string, string>[];
}) {
    const index = getIndex();

    // Pinecone 的数据格式是 vectors 数组
    const vectors = params.ids.map((id, i) => ({
        id,
        values: params.embeddings[i],
        metadata: {
            ...params.metadatas[i],
            // 把文档内容也存进 metadata，查询时直接取出来
            text: params.documents[i],
        },
    }));

    // Pinecone 建议每批最多 100 条
    const BATCH_SIZE = 100;
    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
        await index.upsert({ records: vectors.slice(i, i + BATCH_SIZE) });
    }
}

export async function queryDocuments(params: {
    embedding: number[];
    nResults: number;
}): Promise<{ documents: string[]; metadatas: Record<string, string>[]; distances: number[] }> {
    const index = getIndex();

    const results = await index.query({
        vector: params.embedding,
        topK: params.nResults,
        includeMetadata: true,
    });

    const matches = results.matches ?? [];

    return {
        // 从 metadata 里取回文档内容
        documents: matches.map(m => (m.metadata?.text as string) ?? ''),
        metadatas: matches.map(m => ({
            source: (m.metadata?.source as string) ?? '',
            index: (m.metadata?.index as string) ?? '',
        })),
        // Pinecone 返回的是 score（相似度），转成 distance = 1 - score
        distances: matches.map(m => 1 - (m.score ?? 0)),
    };
}

export async function deleteCollection(): Promise<void> {
    const index = getIndex();
    // 删除所有向量
    await index.deleteAll();
}