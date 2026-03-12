import OpenAI from "openai";
import { embedQuery } from "@/lib/embeddings";
import { queryDocuments } from "@/lib/vectorStore";

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided context.

Rules:
- Only answer based on the context provided
- If the context doesn't contain enough information, say so honestly
- Always cite which document your answer comes from
- Be concise and precise`;

export async function POST(req: Request) {
    try {
        const { question, history } = await req.json();
        if (!question?.trim()) {
            return Response.json({ error: "Empty question" }, { status: 400 });
        }
        // 1. 向量化问题
        const queryEmbedding = await embedQuery(question);
        // 2. 检索相关文档
        const { documents, metadatas, distances } = await queryDocuments({
            embedding: queryEmbedding,
            nResults: 5,
        });
        // 3. 过滤掉相似度太低的结果（distance > 0.5 说明关联性很弱）
        //    cosine distance: 0 = 完全相同，1 = 完全无关
        const relevantDocs = documents.filter((_, i) => distances[i] < 0.5);

        if (!relevantDocs.length) {
            return Response.json({
                answer: "I couldn't find relevant information in the uploaded documents to answer your question.",
                sources: [],
            });
        }
        // 4. 把检索到的文档块拼成 context 传给 LLM
        //    同时附上来源文件名，方便 LLM 在回答中引用

        const context = documents.map((doc, i) => `[Source: ${metadatas[i].source}]\n${doc}`).join('\n--\n');

        // 5. 构建对话历史，支持多轮问答
        //    history 是之前的对话记录，让 LLM 理解上下文
        const message: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: `Context:\n${context}\n\nConversation history:\n${history?.map((h: { role: string; content: string }) => `${h.role}: ${h.content}`).join("\n") ?? "None"
                    }
            \n\nQuestion: ${question}`
            },
        ];
        // 6. 调用 OpenAI
        const client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });
        // 7. 调用 LLM
        const completion = await client.chat.completions.create({
            model: "anthropic/claude-haiku-4-5",
            messages: message,
            max_tokens: 1000,
        });
        const answer = completion.choices[0]?.message?.content ?? "";
        // 8. 整理来源信息返回给前端
        //    前端会把这些显示成引用卡片
        const sources = metadatas
            .filter((_, i) => distances[i] < 0.5)
            .map((meta, i) => ({
                source: meta.source,
                excerpt: documents[i].slice(0, 150) + '...', // 只显示前150字
                distance: distances[i],
            }));
        return Response.json({ answer, sources });
    } catch (error) {
        console.error("Char Error", error);
        return Response.json({ error: "Chat Failed" }, { status: 500 });
    }
}
