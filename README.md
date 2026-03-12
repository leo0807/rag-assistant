# RAG Assistant — Document Q&A

An AI-powered knowledge base that lets you chat with your documents. Upload files and get accurate answers with source citations powered by RAG (Retrieval-Augmented Generation).

**Live Demo:** [rag-assistant-mu.vercel.app](https://rag-assistant-mu.vercel.app)

## Features

- **Multi-format Upload** — Supports PDF, DOCX, TXT, and MD files
- **Semantic Search** — Finds relevant content using vector similarity search
- **Source Citations** — Every answer includes the source document and matching excerpt
- **Conversation History** — Multi-turn Q&A with context awareness
- **Drag & Drop** — Upload multiple files at once

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript
- **AI:** Claude Haiku via OpenRouter
- **Embeddings:** all-MiniLM-L6-v2 via OpenRouter
- **Vector Database:** Pinecone
- **File Parsing:** unpdf (PDF), mammoth (DOCX)
- **Deployment:** Vercel

## Architecture
```
Upload Flow:
File → Text Extraction → Chunking (800 chars) → Embedding → Pinecone

Query Flow:
Question → Embedding → Pinecone Similarity Search → Top 5 Chunks → Claude → Answer + Sources
```

## Getting Started

### Prerequisites
- Node.js 18+
- OpenRouter API key → [openrouter.ai](https://openrouter.ai)
- Pinecone account → [pinecone.io](https://pinecone.io)

### Installation
```bash
git clone https://github.com/leo0807/rag-assistant
cd rag-assistant
npm install
```

Create `.env.local`:
```
OPENROUTER_API_KEY=your_openrouter_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_HOST=your_pinecone_host_url
```
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Upload** — Files are parsed and split into 800-character chunks with 50-character overlap
2. **Embed** — Each chunk is converted to a 384-dimensional vector using all-MiniLM-L6-v2
3. **Store** — Vectors and metadata are stored in Pinecone
4. **Query** — User questions are embedded and matched against stored vectors via cosine similarity
5. **Answer** — Top 5 relevant chunks are passed to Claude as context, with source citations returned

## License

MIT