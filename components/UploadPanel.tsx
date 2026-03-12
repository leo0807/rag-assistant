'use client';

import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    onUploadComplete: (fileNames: string[]) => void;
}

interface UploadState {
    status: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
}

export default function UploadPanel({ onUploadComplete }: Props) {

    const [files, setFiles] = useState<File[]>([]);
    const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', message: '' });
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        // Merge new files, filtering out duplicates by name
        setFiles(prev => {
            const existingNames = new Set(prev.map(f => f.name));
            const newFiles = Array.from(incoming).filter(f => !existingNames.has(f.name));
            return [...prev, ...newFiles];
        });
    }

    const removeFile = (name: string) => {
        setFiles(prev => prev.filter(f => f.name !== name));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploadState({ status: 'uploading', message: 'Processing documents...' });
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUploadState({
                status: 'success',
                message: `${data.filesProcessed} file(s) · ${data.chunksStored} chunks stored`,
            });

            // 通知父组件上传完成，传入文件名列表
            onUploadComplete(files.map(f => f.name));
        } catch (error) {
            setUploadState({ status: 'error', message: error instanceof Error ? error.message : 'Upload failed' });
        }
    };

    // Drag and drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const statusColor = {
        idle: 'var(--muted)',
        uploading: 'var(--accent)',
        success: 'var(--accent3)',
        error: 'var(--accent2)',
    }[uploadState.status];

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '1.5em',
            marginBottom: '1rem',
        }}
        >
            <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}>
                Knowledge Base
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Dragging Area */}
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: '1.5px dashed var(--border)',
                    borderRadius: 10,
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '1rem',
                }}
            >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📁</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--accent)' }}>Click to upload</span> or drag & drop<br />
                    PDF, DOCX, TXT, MD
                </div>
                <input
                    ref={inputRef}
                    type='file'
                    multiple
                    accept=".pdf,.docx,.txt,.md"
                    style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)}
                />
            </div>

            {/* Selected File List */}
            {
                files.length > 0 && (
                    <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {
                            files.map(f => (
                                <div
                                    key={f.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'var(--surface2)',
                                        borderRadius: 8,
                                        padding: '0.5rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontFamily: 'DM Mono monospace'
                                    }}
                                >
                                    <span style={{ color: 'var(--accent3)' }}>✓ &nbsp;{f.name}</span>
                                    {/* 上传前可以移除文件 */}
                                    {uploadState.status !== 'success' && (
                                        <button
                                            onClick={e => { e.stopPropagation(); removeFile(f.name); }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--muted)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                lineHeight: 1,
                                            }}
                                        >X</button>
                                    )}
                                </div>
                            ))}
                    </div>
                )}

            {/* Upload Button */}
            {
                uploadState.status !== 'success' && (
                    <button
                        onClick={handleUpload}
                        disabled={!files.length || uploadState.status === 'uploading'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: files.length ? 'var(--accent)' : 'var(--border)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: files.length ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                        }}
                    >
                        {uploadState.status === 'uploading' ? 'Processing...' : `Upload ${files.length ? `(${files.length})` : ''}`}
                    </button>
                )
            }

            {/* State Info */}
            {uploadState.message && (
                <div style={{
                    marginTop: '0.8rem',
                    fontSize: '0.75rem',
                    fontFamily: 'DM Mono, monospace',
                    color: statusColor,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                }}>
                    {uploadState.status === 'uploading' && (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    {uploadState.status === 'success' && <CheckCircle size={14} />}
                    {uploadState.status === 'error' && <AlertCircle size={14} />}
                    {uploadState.message}
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div >
    )
}
