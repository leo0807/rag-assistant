import { FileText, Hash } from 'lucide-react';

interface Source {
    source: string;
    excerpt: string;
    distance: number;
}

interface Props {
    sources: Source[];
}

export default function SourceCard({ sources }: Props) {
    if (!sources.length) return null;

    return (
        <div style={{ marginTop: '0.8rem' }}>
            <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
            }}>
                <Hash size={10} />
                Sources
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {sources.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '0.7rem 0.9rem',
                            // 相似度越高（distance越低）边框越亮
                            borderLeftColor: `rgba(108,99,255,${1 - s.distance})`,
                            borderLeftWidth: 3,
                        }}
                    >
                        {/* 文件名 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            marginBottom: '0.3rem',
                        }}>
                            <FileText size={11} color="var(--accent)" />
                            <span style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '0.68rem',
                                color: 'var(--accent)',
                            }}>
                                {s.source}
                            </span>
                            {/* 相似度分数，distance越低越相关 */}
                            <span style={{
                                marginLeft: 'auto',
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '0.6rem',
                                color: 'var(--muted)',
                            }}>
                                {Math.round((1 - s.distance) * 100)}% match
                            </span>
                        </div>

                        {/* 原文摘要 */}
                        <div style={{
                            fontSize: '0.78rem',
                            color: 'var(--muted)',
                            lineHeight: 1.6,
                            fontStyle: 'italic',
                        }}>
                            "{s.excerpt}"
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}