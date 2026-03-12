'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import SourceCard from './SourceCard';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
}

interface Source {
    source: string;
    excerpt: string;
    distance: number;
}

interface Props {
    isReady: boolean; // 文档是否已上传完成
}

export default function ChatPanel({ isReady }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // 每次新消息自动滚到底部
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !isReady) return;

        const question = input.trim();
        setInput('');

        // 立即把用户消息加入界面，体验更流畅
        const userMessage: Message = { role: 'user', content: question };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    // 把历史记录传给 API，支持多轮对话
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer,
                sources: data.sources,
            }]);

        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: err instanceof Error ? err.message : 'Something went wrong.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 支持 Enter 发送，Shift+Enter 换行
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            height: '65vh',
        }}>
            {/* 消息列表 */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
            }}>
                {/* 空状态提示 */}
                {!messages.length && (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)',
                        textAlign: 'center',
                        gap: '0.8rem',
                    }}>
                        <div style={{ fontSize: '2rem' }}>💬</div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                            {isReady ? 'Ask anything about your documents' : 'Upload documents to get started'}
                        </div>
                        <div style={{ fontSize: '0.82rem', maxWidth: 280, lineHeight: 1.6 }}>
                            {isReady
                                ? 'I\'ll answer based on the content you uploaded and show you the exact sources.'
                                : 'Upload one or more files on the left, then start chatting.'}
                        </div>
                    </div>
                )}

                {/* 消息气泡 */}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            // 用户消息靠右，AI消息靠左
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            animation: 'fadeUp 0.3s ease both',
                        }}
                    >
                        <div style={{
                            maxWidth: '80%',
                            padding: '0.8rem 1rem',
                            borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                            border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                            fontSize: '0.88rem',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap', // 保留换行
                        }}>
                            {msg.content}
                        </div>

                        {/* AI 回答附带来源卡片 */}
                        {msg.role === 'assistant' && msg.sources && (
                            <div style={{ maxWidth: '80%', width: '100%' }}>
                                <SourceCard sources={msg.sources} />
                            </div>
                        )}
                    </div>
                ))}

                {/* 加载中气泡 */}
                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            padding: '0.8rem 1rem',
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px 12px 12px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.82rem',
                            color: 'var(--muted)',
                        }}>
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            Thinking...
                        </div>
                    </div>
                )}

                {/* 滚动锚点 */}
                <div ref={bottomRef} />
            </div>

            {/* 输入框 */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '0.8rem',
                alignItems: 'flex-end',
            }}>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isReady ? 'Ask a question... (Enter to send)' : 'Upload documents first...'}
                    disabled={!isReady || isLoading}
                    rows={1}
                    style={{
                        flex: 1,
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: 'var(--text)',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        padding: '0.7rem 1rem',
                        resize: 'none',
                        outline: 'none',
                        opacity: isReady ? 1 : 0.5,
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !isReady}
                    style={{
                        width: 40, height: 40,
                        background: input.trim() && isReady ? 'var(--accent)' : 'var(--border)',
                        border: 'none',
                        borderRadius: 10,
                        cursor: input.trim() && isReady ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                    }}
                >
                    <Send size={16} color="white" />
                </button>
            </div>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}