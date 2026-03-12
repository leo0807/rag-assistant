'use client';

import { useState } from 'react';
import UploadPanel from '@/components/UploadPanel';
import ChatPanel from '@/components/ChatPanel';

export default function Home() {
  // 追踪已上传的文件名列表
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleUploadComplete = (fileNames: string[]) => {
    setUploadedFiles(prev => [...new Set([...prev, ...fileNames])]);
  };

  const isReady = uploadedFiles.length > 0;

  return (
    <main>
      {/* 背景光晕 */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `
          radial-gradient(ellipse 50% 40% at 0% 0%, rgba(108,99,255,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 100% 100%, rgba(67,232,176,0.05) 0%, transparent 60%)
        `,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <header style={{
          padding: '2rem 0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.3rem',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{
              width: 8, height: 8,
              background: 'var(--accent)',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            RAG Assistant
          </div>

          {/* 已上传文件状态 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: isReady ? 'var(--accent3)' : 'var(--muted)',
            padding: '0.25rem 0.75rem',
            border: `1px solid ${isReady ? 'rgba(67,232,176,0.3)' : 'var(--border)'}`,
            borderRadius: 100,
            transition: 'all 0.3s',
          }}>
            <div style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: isReady ? 'var(--accent3)' : 'var(--muted)',
              // 就绪时闪烁，表示知识库在线
              animation: isReady ? 'pulse 2s ease-in-out infinite' : 'none',
            }} />
            {isReady ? `${uploadedFiles.length} file(s) loaded` : 'No documents loaded'}
          </div>
        </header>

        {/* Hero */}
        <div style={{ marginBottom: '2rem', animation: 'fadeUp 0.6s ease both' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.7rem',
            color: 'var(--accent)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '0.8rem',
          }}>
            ⚡ Retrieval-Augmented Generation
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '0.6rem',
          }}>
            Chat with your <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>documents</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.7 }}>
            Upload files to your knowledge base, then ask questions.<br />
            Every answer includes citations from the source documents.
          </p>
        </div>

        {/* 主体布局：左侧上传，右侧聊天 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          {/* 左侧：上传面板 + 已加载文件列表 */}
          <div>
            <UploadPanel onUploadComplete={handleUploadComplete} />

            {/* 已加载文件列表 */}
            {uploadedFiles.length > 0 && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '1.2rem 1.5rem',
                animation: 'fadeUp 0.4s ease both',
              }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  Loaded
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {uploadedFiles.map((name, i) => (
                    <div key={i} style={{
                      fontSize: '0.75rem',
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--accent3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      <span style={{ color: 'var(--muted)' }}>✓</span>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：聊天面板 */}
          <ChatPanel isReady={isReady} />
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </main>
  );
}