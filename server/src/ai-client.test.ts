import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.hoisted(() => vi.fn());

// Mock config before importing ai-client
vi.mock('./config.js', () => ({
  config: {
    createAI: {
      apiUrl: 'https://fake-create-ai.test/query',
      token: 'test-token',
      primaryModel: 'gemini-pro',
      backupModel: 'claude-3-opus',
    },
    aws: { region: 'us-east-1' },
  },
}));

// Mock Bedrock
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: class { send = mockSend; },
  ConverseCommand: class { constructor(public args: any) {} },
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { callAI } from './ai-client.js';

describe('callAI failover chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns result from primary CREATE AI model', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ response: 'gemini answer' }),
    });

    const result = await callAI('test prompt');
    expect(result).toBe('gemini answer');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('falls back to backup model when primary fails', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('primary down'))
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ response: 'opus answer' }),
      });

    const result = await callAI('test prompt');
    expect(result).toBe('opus answer');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('falls back to Bedrock when both CREATE AI models fail', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('primary down'))
      .mockRejectedValueOnce(new Error('backup down'));

    mockSend.mockResolvedValueOnce({
      output: { message: { content: [{ text: 'bedrock answer' }] } },
    });

    const result = await callAI('test prompt');
    expect(result).toBe('bedrock answer');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('throws when all providers fail', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('primary down'))
      .mockRejectedValueOnce(new Error('backup down'));

    mockSend.mockRejectedValueOnce(new Error('bedrock down'));

    await expect(callAI('test prompt')).rejects.toThrow('bedrock down');
  });

  it('treats empty CREATE AI response as failure', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ response: '' }),
    });
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ response: 'backup answer' }),
    });

    const result = await callAI('test prompt');
    expect(result).toBe('backup answer');
  });
});
