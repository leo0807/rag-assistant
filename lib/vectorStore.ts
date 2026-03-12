import { ChromaClient } from 'chromadb';

let client: ChromaClient | null = null;

const COLLECTION_NAME = 'rag_documents';

function getClient(): ChromaClient {
    if (!client) {
        client = new ChromaClient({
            host: 'localhost',
            port: 8000,
            ssl: false,
        });
    }
    return client;
}

export async function getCollection() {
    const chroma = getClient();
    return await chroma.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' },
        // 禁用默认 embedding function，我们自己提供向量
        embeddingFunction: null as any,
    });
}

export async function addDocuments(params: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
    metadatas: Record<string, string>[];
}) {
    const col = await getCollection();
    await col.add(params);
}

export async function queryDocuments(params: {
    embedding: number[];
    nResults: number;
}): Promise<{ documents: string[]; metadatas: Record<string, string>[]; distances: number[] }> {
    const col = await getCollection();
    const results = await col.query({
        queryEmbeddings: [params.embedding],
        nResults: params.nResults,
    });

    return {
        documents: results.documents[0] as string[],
        metadatas: results.metadatas[0] as Record<string, string>[],
        distances: (results.distances?.[0] ?? []).filter((d): d is number => d !== null),
    };
}

export async function deleteCollection(): Promise<void> {
    const chroma = getClient();
    await chroma.deleteCollection({ name: COLLECTION_NAME });
}