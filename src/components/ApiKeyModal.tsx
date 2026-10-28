'use client';

import React, { useState } from 'react';
import { Key, X, ExternalLink, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ApiSettings } from '@/types/exam';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'custom'>(
    currentSettings.provider === 'demo' ? 'gemini' : (currentSettings.provider as any)
  );
  const [apiKey, setApiKey] = useState(currentSettings.apiKey || '');
  const isDiscontinued = (m?: string) => {
    if (!m) return true;
    const list = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-3.8-pro', 'gemini-3.1-pro'];
    return list.includes(m);
  };

  const initialModel = isDiscontinued(currentSettings.model)
    ? 'gemini-flash-lite-latest'
    : (currentSettings.model || 'gemini-flash-lite-latest');
  const [model, setModel] = useState(initialModel);
  const [customBaseUrl, setCustomBaseUrl] = useState(currentSettings.customBaseUrl || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setApiKey(currentSettings.apiKey || '');
      setProvider(currentSettings.provider === 'demo' ? 'gemini' : (currentSettings.provider as any));
      const m = isDiscontinued(currentSettings.model)
        ? 'gemini-flash-lite-latest'
        : (currentSettings.model || 'gemini-flash-lite-latest');
      setModel(m);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Vui lòng nhập API Key trước khi kiểm tra.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Đang kết nối kiểm tra...');

    try {
      if (provider === 'gemini') {
        const candidateModels = Array.from(new Set([
          model,
          'gemini-flash-lite-latest',
          'gemini-3.5-flash-lite',
          'gemini-3.5-flash',
          'gemini-3.6-flash',
          'gemini-3-flash-preview',
        ].filter(m => m && !isDiscontinued(m))));

        let connectedModel = '';
        let lastErr = '';

        for (const m of candidateModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Ping test. Trả lời đúng từ: OK' }] }],
              }),
            });

            if (res.ok) {
              connectedModel = m;
              break;
            } else {
              const err = await res.json().catch(() => ({}));
              lastErr = err?.error?.message || `Lỗi HTTP ${res.status}`;
              continue;
            }
          } catch (e: any) {
            lastErr = e.message;
            continue;
          }
        }

        if (connectedModel) {
          if (connectedModel !== model) {
            setModel(connectedModel);
            setTestStatus('success');
            setTestMessage(`Kết nối Google Gemini thành công! (Hệ thống đã tự động chọn mô hình ổn định '${connectedModel}').`);
          } else {
            setTestStatus('success');
            setTestMessage(`Kết nối Google Gemini (${connectedModel}) thành công! API Key hợp lệ.`);
          }
        } else {
          throw new Error(lastErr || 'Các mô hình Google Gemini tạm thời không phản hồi. Vui lòng kiểm tra lại API Key.');
        }
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        if (!res.ok) throw new Error(`Lỗi kết nối OpenAI (${res.status})`);
        setTestStatus('success');
        setTestMessage('Kết nối OpenAI thành công! API Key hợp lệ.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Không thể xác thực API Key.');
    }
  };

  const handleSave = () => {
    onSave({
      provider,
      apiKey: apiKey.trim(),
      model,
      customBaseUrl: customBaseUrl.trim(),
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(4px)',
      padding: 16,
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxWidth: 580,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#1e40af',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                Cấu hình API Key AI
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Người dùng tự quản lý và bảo mật API Key của mình
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Provider selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              Chọn Nhà cung cấp AI:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setModel('gemini-flash-lite-latest');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `2px solid ${provider === 'gemini' ? '#2563eb' : '#e2e8f0'}`,
                  backgroundColor: provider === 'gemini' ? '#eff6ff' : '#f8fafc',
                  color: provider === 'gemini' ? '#1e40af' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Google Gemini
                <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>
                  ★ Khuyên dùng (Miễn phí)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setModel('gpt-4o-mini');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `2px solid ${provider === 'openai' ? '#2563eb' : '#e2e8f0'}`,
                  backgroundColor: provider === 'openai' ? '#eff6ff' : '#f8fafc',
                  color: provider === 'openai' ? '#1e40af' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                OpenAI (ChatGPT)
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                  GPT-4o / 4o-mini
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('custom');
                  setModel('deepseek-chat');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `2px solid ${provider === 'custom' ? '#2563eb' : '#e2e8f0'}`,
                  backgroundColor: provider === 'custom' ? '#eff6ff' : '#f8fafc',
                  color: provider === 'custom' ? '#1e40af' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Tùy chỉnh khác
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                  DeepSeek / Groq
                </div>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                {provider === 'gemini' ? 'Gemini API Key' : provider === 'openai' ? 'OpenAI API Key' : 'API Key'}:
              </label>
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#2563eb',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 600,
                  }}
                >
                  Lấy Key miễn phí tại Google AI Studio <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              🔒 Khóa được lưu trực tiếp trong localStorage của trình duyệt của Thầy/Cô và không bao giờ lưu trữ trên máy chủ bên ngoài.
            </p>
          </div>

          {/* Model selection */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Mô hình AI (Model):
            </label>
            {provider === 'gemini' ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="gemini-flash-lite-latest">Gemini Flash Lite (Khuyên dùng - Ổn định cao nhất, cực nhanh)</option>
                <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Rất ổn định, phản hồi tức thì)</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Thông minh, giải bài tập chuyên sâu)</option>
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (Bản cập nhật nâng cao)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Chuẩn khảo thí)</option>
              </select>
            ) : provider === 'openai' ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Nhanh, tiết kiệm)</option>
                <option value="gpt-4o">GPT-4o (Mạnh nhất)</option>
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ví dụ: deepseek-chat hoặc llama-3-70b"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                }}
              />
            )}
          </div>

          {provider === 'custom' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Base URL:
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          )}

          {/* Test connection alert */}
          {testStatus !== 'idle' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: testStatus === 'success' ? '#f0fdf4' : testStatus === 'error' ? '#fef2f2' : '#eff6ff',
              color: testStatus === 'success' ? '#15803d' : testStatus === 'error' ? '#b91c1c' : '#1d4ed8',
              border: `1px solid ${testStatus === 'success' ? '#86efac' : testStatus === 'error' ? '#fca5a5' : '#bfdbfe'}`,
            }}>
              {testStatus === 'success' ? <Check size={16} /> : testStatus === 'error' ? <AlertCircle size={16} /> : null}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {testStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#1e40af',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(30,64,175,0.25)',
              }}
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
