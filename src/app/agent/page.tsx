'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

type ToolPart = {
  type: string;
  toolName?: string;
  toolCallId?: string;
  input?: unknown;
  output?: unknown;
};

export default function AgentPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent',
    }),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // デバッグ用: メッセージ構造を確認
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('=== Last Message Debug ===');
      console.log('Role:', lastMessage.role);
      console.log('ID:', lastMessage.id);
      console.log('Parts count:', lastMessage.parts.length);
      console.log('Parts types:', lastMessage.parts.map(p => p.type));
      lastMessage.parts.forEach((part, idx) => {
        console.log(`Part ${idx}:`, {
          type: part.type,
          hasText: 'text' in part,
          hasToolName: 'toolName' in part,
          hasInput: 'input' in part,
          hasOutput: 'output' in part,
          part: part
        });
      });
    }
  }, [messages]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Collection Agent</h1>
            <p className="text-sm text-blue-100 mt-1">
              Ask me to manage your collections and items
            </p>
          </div>

          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-12">
                <p className="text-lg mb-4">Welcome! I can help you with:</p>
                <div className="text-left inline-block">
                  <ul className="space-y-2">
                    <li>• Creating and managing collections</li>
                    <li>• Adding and updating items</li>
                    <li>• Searching through your data</li>
                    <li>• Organizing your information</li>
                  </ul>
                </div>
                <p className="mt-6 text-sm">Try asking something like:</p>
                <p className="text-blue-600 mt-2">
                  &quot;Create a book collection with title, author, and year fields&quot;
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {message.role === 'user' ? 'You' : 'Agent'}
                  </div>
                  <div className="whitespace-pre-wrap wrap-break-word">
                    {message.parts.map((part, partIndex) => {
                      if (part.type === 'text') {
                        const textPart = part as { type: 'text'; text: string };
                        return <span key={`${message.id}-text-${partIndex}`}>{textPart.text}</span>;
                      }
                      return null;
                    })}
                    {message.parts.filter(p => p.type === 'text').length === 0 && (
                      <div className="text-xs text-gray-400 italic">
                        (テキストコンテンツなし - デバッグ: {message.parts.length} parts)
                      </div>
                    )}
                  </div>
                  {message.parts.some((p) =>
                    p.type === 'dynamic-tool' ||
                    (typeof p.type === 'string' && p.type.startsWith('tool-'))
                  ) && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs font-semibold mb-2">実行したツール:</div>
                      <div className="space-y-2">
                        {message.parts
                          .filter((p) =>
                            p.type === 'dynamic-tool' ||
                            (typeof p.type === 'string' && p.type.startsWith('tool-'))
                          )
                          .map((part, toolIndex) => {
                            const p = part as ToolPart;
                            const toolName = p.toolName ||
                                           (typeof p.type === 'string' && p.type.startsWith('tool-')
                                             ? p.type.substring(5)
                                             : 'unknown');
                            const toolCallId = p.toolCallId || `tool-${toolIndex}`;
                            const input = p.input;
                            const output = p.output;

                            return (
                              <details key={`${message.id}-${toolCallId}-${toolIndex}`} className="text-xs">
                                <summary className="cursor-pointer hover:text-blue-600">
                                  {toolName}
                                </summary>
                                <div className="mt-1 ml-4 space-y-1">
                                  <div>
                                    <span className="font-semibold">入力:</span>
                                    <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
                                      {JSON.stringify(input, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="font-semibold">結果:</span>
                                    {output === undefined ? (
                                      <div className="mt-1 text-xs text-gray-500 italic">実行中...</div>
                                    ) : (
                                      <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
                                        {JSON.stringify(output, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                  <div className="mt-2 text-xs text-gray-400">
                                    Part type: {p.type}
                                  </div>
                                </div>
                              </details>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(status === 'submitted' || status === 'streaming') && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 bg-gray-50">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && status === 'ready') {
                sendMessage({ text: input });
                setInput('');
              }
            }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your collections..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={status !== 'ready'}
              />
              <button
                type="submit"
                disabled={status !== 'ready'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/collections"
            className="text-blue-600 hover:underline text-sm"
          >
            View Collections →
          </Link>
        </div>
      </div>
    </div>
  );
}
