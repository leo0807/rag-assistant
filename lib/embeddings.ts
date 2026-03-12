import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

export async function embedTexts(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        input: texts,
    });
    if (!response.data) {
        throw new Error(`Embedding failed: ${JSON.stringify(response)}`);
    }

    return response.data.map((item) => item.embedding);
}

export async function embedQuery(query: string): Promise<number[]> {
    const embedding = await embedTexts([query]);

    return embedding[0];
}
