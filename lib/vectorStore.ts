import { ChromaClient, Collection } from "chromadb";

let client: ChromaClient | null = null;
let collection: Collection | null = null;

const COLLECTION_NAME = "rag-assistant";

function getClient(): ChromaClient {
    if (!client) {
        client = new ChromaClient({ path: "http://localhost:8000" });
    }
    return client;
}

export async function getCollection(): Promise<Collection> {
    if (collection) return collection;
    const chroma = getClient();
    collection = await chroma.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' },
    });
    return collection;
}

export async function addDocuments(params: {
    ids: string[],
    embeddings: number[][],
    documents?: string[],
    metadatas?: Record<string, string>[],
}) {
    const collection = await getCollection();
    await collection.add(params);
}

export async function queryDocuments(params: {
    embedding: number[],
    nResults: number,
}): Promise<{
    documents: string[];
    metadatas: Record<string, string>[];
    distances: number[];
}> {
    const collection = await getCollection();
    const results = await collection.query({
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
    collection = null;
}