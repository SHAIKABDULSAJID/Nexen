import { GoogleGenAI } from "@google/genai";

// The GoogleGenAI client requires an API key when running in the browser.
// Ensure this module can be imported in browser bundles without throwing.
const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn("GoogleGenAI client could not be initialized:", error);
    return null;
  }
};

export const generatePostIdeas = async (topic: string) => {
  const ai = getAI();
  if (!ai) {
    console.warn(
      "Gemini API key missing - generatePostIdeas will not run in the browser.",
    );
    return "AI is not available right now.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 short, engaging professional post ideas for a tech social network about the topic: ${topic}. Format as a simple list.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating post ideas:", error);
    return "Could not generate ideas right now. Try again later!";
  }
};

export const refinePostText = async (content: string) => {
  const ai = getAI();
  if (!ai) {
    console.warn(
      "Gemini API key missing - refinePostText will not run in the browser.",
    );
    return content;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional social media manager for tech experts. Refine this post to be more engaging and concise, keeping it professional but with a 'building in public' vibe. Add 2-3 relevant hashtags: "${content}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Error refining post:", error);
    return content;
  }
};
