const GEMINI_API_KEY = 'AIzaSyDc22ZLw_hgGnBtx3jJ24DDzTYG1d6dp6I';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: {
    text: string;
  }[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiService {
  private conversationHistory: GeminiMessage[] = [];
  private userContext: string = '';

  /**
   * Initialize with user data for context
   */
  initializeUserContext(userName: string, userRole: string): void {
    this.userContext = `User Information: Name: ${userName}, Role: ${userRole}`;
  }

  /**
   * Clean markdown formatting to plain text
   */
  private cleanMarkdownFormatting(text: string): string {
    // Remove markdown bold (**text** -> text)
    let cleaned = text.replace(/\*\*(.+?)\*\*/g, '$1');
    // Remove markdown italic (*text* -> text)
    cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
    // Remove markdown headers (# Header -> Header)
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    // Convert markdown numbered lists to plain text (1. -> •)
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '• ');
    // Remove markdown links [text](url) -> text
    cleaned = cleaned.replace(/\[(.+?)\]\(.+?\)/g, '$1');
    // Clean up excessive newlines
    cleaned = cleaned.replace(/\n\n+/g, '\n\n');
    return cleaned.trim();
  }

  /**
   * Send a message to Gemini and get a response
   */
  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Build the system prompt
      const systemPrompt = `You are SkillFlow AI, an intelligent learning assistant integrated within the SkillFlow educational platform. ${this.userContext}

Your role is to:
- Provide clear, concise, and helpful educational responses
- Format your responses in plain, natural language (NO markdown formatting)
- Adapt your teaching style to the user's learning needs
- Be encouraging and supportive
- Answer questions on various topics including academics, study techniques, and learning strategies
- Provide practical, actionable advice
- Keep responses conversational and easy to read
- Use simple bullet points with "•" instead of numbered lists or markdown
- Avoid technical jargon unless necessary, and explain terms when used

Important: Format all responses as clean, readable plain text. Do NOT use markdown, asterisks, or special formatting.`;

      // Add system context to first message if this is the start of conversation
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: systemPrompt }],
        });
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: 'I understand. I am SkillFlow AI, your learning assistant. I will provide clear, helpful responses in plain text format. How can I help you today?' }],
        });
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      // Call Gemini API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: this.conversationHistory,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message ||
          `API Error: ${response.status} ${response.statusText}`;

        // Handle specific error cases
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('API key is invalid. Please check your configuration.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data: GeminiResponse = await response.json();

      // Extract AI response and clean formatting
      let aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, I could not generate a response. Please try again.';

      // Clean markdown formatting
      aiResponse = this.cleanMarkdownFormatting(aiResponse);

      // Add AI response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiResponse }],
      });

      return aiResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Gemini API Error:', errorMessage);

      // Handle timeout specifically
      if (errorMessage.includes('abort')) {
        throw new Error('Request timeout. Please try again.');
      } else if (!navigator.onLine || errorMessage.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Clear conversation history (for when user clears chat)
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   */
  getHistory(): GeminiMessage[] {
    return this.conversationHistory;
  }
}

export default new GeminiService();
