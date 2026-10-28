'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, HelpCircle, ArrowRight, Bot, ChevronDown, Check } from 'lucide-react';
import { ChatMessage, INITIAL_BOT_MESSAGES, KNOWLEDGE_BASE_RESPONSES } from '@/lib/chatbotKnowledge';
import { ApiSettings } from '@/types/exam';

interface ChatbotAssistantProps {
  apiSettings: ApiSettings;
  onApplyPreset?: (presetName: string) => void;
  onOpenApiKeyModal?: () => void;
}

export const ChatbotAssistant: React.FC<ChatbotAssistantProps> = ({
  apiSettings,
  onApplyPreset,
  onOpenApiKeyModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Call serverless chat API or knowledge base
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          apiKey: apiSettings.apiKey,
          provider: apiSettings.provider,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Dạ em luôn sẵn sàng đồng hành cùng Thầy/Cô ạ!',
          timestamp: 'Vừa xong',
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error('Fallback KB');
      }
    } catch {
      // Local knowledge fallback
      let replyText = 'Dạ em đã ghi nhận câu hỏi. Thầy/Cô có thể tham khảo bảng thiết lập từng bước ở cột bên trái để sinh đề thi hoàn chỉnh nhé!';
      const lower = text.toLowerCase();
      if (lower.includes('api') || lower.includes('key')) {
        replyText = KNOWLEDGE_BASE_RESPONSES.guide_api_key;
      } else if (lower.includes('ma trận') || lower.includes('đặc tả') || lower.includes('3280')) {
        replyText = KNOWLEDGE_BASE_RESPONSES.guide_matrix_standard;
      } else if (lower.includes('in') || lower.includes('xuất') || lower.includes('word')) {
        replyText = KNOWLEDGE_BASE_RESPONSES.guide_export;
      } else if (lower.includes('bước') || lower.includes('hướng dẫn') || lower.includes('dùng')) {
        replyText = KNOWLEDGE_BASE_RESPONSES.guide_steps;
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (action: string, label: string) => {
    if (action === 'load_preset_toan6') {
      onApplyPreset?.('toan6');
      setMessages((prev) => [
        ...prev,
        { id: `usr-${Date.now()}`, sender: 'user', text: label, timestamp: 'Vừa xong' },
        { id: `bot-${Date.now()}`, sender: 'bot', text: '✨ Em đã nạp sẵn bộ đề mẫu môn Toán 6 Giữa kỳ I vào bảng điều khiển cho Thầy/Cô rồi đó ạ!', timestamp: 'Vừa xong' },
      ]);
      return;
    }

    if (action === 'load_preset_van9') {
      onApplyPreset?.('van9');
      setMessages((prev) => [
        ...prev,
        { id: `usr-${Date.now()}`, sender: 'user', text: label, timestamp: 'Vừa xong' },
        { id: `bot-${Date.now()}`, sender: 'bot', text: '📚 Em đã nạp sẵn bộ đề mẫu Ngữ văn 9 Cuối kỳ vào bảng điều khiển cho Thầy/Cô rồi đó ạ!', timestamp: 'Vừa xong' },
      ]);
      return;
    }

    if (action === 'guide_api_key') {
      onOpenApiKeyModal?.();
    }

    const reply = KNOWLEDGE_BASE_RESPONSES[action];
    if (reply) {
      setMessages((prev) => [
        ...prev,
        { id: `usr-${Date.now()}`, sender: 'user', text: label, timestamp: 'Vừa xong' },
        { id: `bot-${Date.now()}`, sender: 'bot', text: reply, timestamp: 'Vừa xong' },
      ]);
    } else {
      handleSendMessage(label);
    }
  };

  return (
    <div className="chatbot-container" style={{ position: 'fixed', bottom: 20, right: 24, zIndex: 90 }}>
      {/* Floating Toggle Mascot Button */}
      {!isOpen && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(true)}
            className="animate-float"
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '3px solid #38bdf8',
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.45)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              overflow: 'hidden',
              transition: 'transform 0.2s ease',
            }}
            title="Bé Bút AI - Trợ lý Khảo thí hướng dẫn sử dụng"
          >
            <img
              src="/mascot.png"
              alt="Bé Bút AI"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.15)',
              }}
            />
          </button>

          {/* Unread badge & speech bubble prompt */}
          {hasUnread && (
            <div
              onClick={() => setIsOpen(true)}
              style={{
                position: 'absolute',
                bottom: 74,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: '8px 12px',
                boxShadow: '0 4px 15px rgba(37,99,235,0.15)',
                whiteSpace: 'nowrap',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1e40af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>👋 Thầy/Cô cần em hướng dẫn ra đề không ạ?</span>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                display: 'inline-block',
              }} />
            </div>
          )}
        </div>
      )}

      {/* Dialogflow-style Chat Window */}
      {isOpen && (
        <div
          className="animate-slide-up"
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 540,
            backgroundColor: '#ffffff',
            borderRadius: 20,
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.22)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
            color: '#ffffff',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #bae6fd',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src="/mascot.png"
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Bé Bút AI</span>
                  <span style={{
                    fontSize: '0.65rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: 10,
                  }}>
                    Online
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                  Trợ lý Khảo thí & Hướng dẫn ra đề
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                    backgroundColor: isBot ? '#ffffff' : '#1e40af',
                    color: isBot ? '#1e293b' : '#ffffff',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                    border: isBot ? '1px solid #e2e8f0' : 'none',
                    whiteSpace: 'pre-line',
                  }}>
                    {msg.text}
                  </div>

                  {/* Quick Replies if available */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, maxWidth: '100%' }}>
                      {msg.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickReply(qr.action, qr.label)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 14,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{qr.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.75rem', padding: '4px 8px' }}>
                <span className="animate-spin">●</span>
                <span>Bé Bút AI đang soạn câu trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <input
              type="text"
              placeholder="Nhập câu hỏi Thầy/Cô cần hỗ trợ..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 20,
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: inputValue.trim() ? '#1e40af' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'default',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
