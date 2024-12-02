import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateChatResponse(messages: { role: string, content: string }[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response");
  }
}

export async function generateThreadTitle(content: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: "Generate a short, concise title (max 6 words) for this chat thread based on the first message. Respond with just the title.",
      }, {
        role: "user",
        content,
      }],
      temperature: 0.7,
      max_tokens: 20,
    });

    return completion.choices[0].message.content?.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "New Chat";
  }
}
