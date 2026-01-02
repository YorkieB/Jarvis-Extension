// OpenAI Provider Implementation
// This file provides OpenAI support for the extension

const OPENAI_API_URL = "https://api.openai.com/v1";

// Provider registry entry for OpenAI
export const openaiProvider = {
  label: "OpenAI",
  requiresApiKey: true,
  defaultUrl: OPENAI_API_URL
};

// List available OpenAI models
export async function listOpenAIModels(apiKey, customUrl) {
  // Define fallback models in priority order (newest first)
  const fallbackModels = [
    "gpt-5.2",
    "gpt-5",
    "o3",
    "o1-preview",
    "o1-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo"
  ];
  
  // If no API key, return fallback models immediately
  if (!apiKey || apiKey.trim() === "") {
    return fallbackModels;
  }
  
  const baseUrl = customUrl || OPENAI_API_URL;
  
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter for chat models and return their IDs
    const chatModels = data.data
      .filter(model => 
        model.id.includes("gpt") || 
        model.id.includes("o1") ||
        model.id.includes("o3")
      )
      .map(model => model.id);
    
    // Combine API models with fallback, removing duplicates
    // Prioritize fallback order for models that exist in both
    const allModelsSet = new Set([...fallbackModels, ...chatModels]);
    
    // Sort: put fallback models first in their order, then API-only models alphabetically
    const apiOnlyModels = chatModels.filter(m => !fallbackModels.includes(m)).sort();
    const result = [...fallbackModels.filter(m => allModelsSet.has(m)), ...apiOnlyModels];
    
    return result.length > 0 ? result : fallbackModels;
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    // Return fallback models on error
    return fallbackModels;
  }
}

// Convert messages to OpenAI format
function convertMessagesToOpenAI(messages) {
  return messages.map(msg => {
    const role = msg.role === "assistant" ? "assistant" : 
                 msg.role === "system" ? "system" : "user";
    
    let content = msg.content || "";
    
    // Handle attachments (images)
    if (msg.attachments && msg.attachments.length > 0) {
      const contentParts = [{ type: "text", text: content }];
      
      for (const attachment of msg.attachments) {
        if (attachment.type === "image") {
          contentParts.push({
            type: "image_url",
            image_url: {
              url: `data:${attachment.mediaType};base64,${attachment.data}`
            }
          });
        }
      }
      
      return { role, content: contentParts };
    }
    
    return { role, content };
  });
}

// Generate streaming response from OpenAI
export async function* generateOpenAI(messages, options, apiKey, signal, customUrl) {
  const baseUrl = customUrl || OPENAI_API_URL;
  const model = options.model || "gpt-4o";
  const systemPrompt = options.systemPrompt || "";
  
  // Prepare messages
  let openAIMessages = convertMessagesToOpenAI(messages);
  
  // Add system message if provided
  if (systemPrompt) {
    openAIMessages = [
      { role: "system", content: systemPrompt },
      ...openAIMessages
    ];
  }

  const requestBody = {
    model: model,
    messages: openAIMessages,
    stream: true,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens
  };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal: signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "" || line.startsWith(":")) continue;
        
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              yield delta.content;
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    throw error;
  }
}

