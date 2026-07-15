// NVIDIA NIM API Adapter for StayWise AI Assistant
// Interfaces with https://integrate.api.nvidia.com/v1/chat/completions using google/gemma-4-31b-it

const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const callNvidiaLLM = async ({
  systemPrompt = '',
  userPrompt = '',
  responseSchema = null,
  maxTokens = 4096,
  temperature = 0.7,
  topP = 0.95,
  timeoutMs = 12000,
}) => {
  const apiKey = process.env.NVIDIA_API_KEY || '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';
  const model = process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it';

  if (!apiKey || apiKey === 'YOUR_NVIDIA_API_KEY') {
    throw new Error('NVIDIA_API_KEY not configured');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userPrompt || 'Extract parameters and return JSON.' });

  const payload = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    stream: false,
    chat_template_kwargs: { enable_thinking: true },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA NIM API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // 1. Extract <think>...</think> block before stripping
    const match = content.match(/<think>([\s\S]*?)<\/think>/i);
    const thinking = match ? match[1].trim() : '';

    // Strip <think>...</think> blocks from main content
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 2. Strip markdown code blocks like ```json ... ```
    content = content.replace(/```json([\s\S]*?)```/gi, '$1').trim();
    content = content.replace(/```([\s\S]*?)```/gi, '$1').trim();

    // 3. Extract JSON object substring if surrounded by text
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    const parsedJson = JSON.parse(content);

    // 4. Verify against Zod schema if provided
    if (responseSchema && typeof responseSchema.parse === 'function') {
      const validated = responseSchema.parse(parsedJson);
      return { ...validated, thinking };
    }

    if (typeof parsedJson === 'object' && parsedJson !== null) {
      return { ...parsedJson, thinking };
    }

    return { result: parsedJson, thinking };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`NVIDIA NIM API request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
};

const callChatLLM = async ({
  systemPrompt = '',
  messages = [],
  userPrompt = '',
  maxTokens = 2048,
  temperature = 0.7,
  topP = 0.95,
  timeoutMs = 4000,
}) => {
  const apiKey = process.env.NVIDIA_API_KEY || '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';
  const model = process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it';

  if (!apiKey || apiKey === 'YOUR_NVIDIA_API_KEY') {
    throw new Error('NVIDIA_API_KEY not configured');
  }

  const payloadMessages = [];
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }

  // Append history messages if present
  if (Array.isArray(messages)) {
    messages.forEach((m) => {
      if (m && m.role && m.content && (m.role === 'user' || m.role === 'assistant' || m.role === 'system')) {
        payloadMessages.push({ role: m.role, content: m.content });
      }
    });
  }

  if (userPrompt) {
    payloadMessages.push({ role: 'user', content: userPrompt });
  }

  const payload = {
    model,
    messages: payloadMessages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    stream: false,
    chat_template_kwargs: { enable_thinking: true },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA NIM API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Extract <think>...</think> block before stripping
    const match = content.match(/<think>([\s\S]*?)<\/think>/i);
    const thinking = match ? match[1].trim() : '';

    // Strip <think>...</think> blocks from main content so the reply is clean chat text
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return { reply: content, thinking };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`NVIDIA NIM API request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
};

module.exports = { callNvidiaLLM, callChatLLM };
