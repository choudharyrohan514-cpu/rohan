import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const getGeminiInsights = async (
  query: string,
  inventory: Product[],
  sales: Sale[]
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "API Key is missing. Please check your environment configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Prepare context data
  const inventorySummary = inventory.map(p => 
    `- ${p.name} (${p.category}): Stock ${p.stock}, Buy ₹${p.wholesalePrice}, Sell ₹${p.retailPrice}`
  ).join('\n');

  const recentSales = sales.slice(0, 20).map(s => 
    `- Date: ${new Date(s.date).toLocaleDateString()}, Total: ₹${s.totalAmount}, Items: ${s.items.length}`
  ).join('\n');

  const systemInstruction = `
    You are an intelligent business assistant for a Wholesale General Store.
    You have access to the current inventory and recent sales data.
    
    Your goal is to help the store owner:
    1. Identify low stock items.
    2. Suggest pricing strategies (Retail vs Wholesale margin).
    3. Analyze sales trends.
    4. Write marketing descriptions for products.
    
    Always answer clearly, professionally, and concisely.
    Currency is INR (₹).
  `;

  const prompt = `
    Current Inventory Data:
    ${inventorySummary}

    Recent Sales Data (Last 20 transactions):
    ${recentSales}

    User Query: "${query}"
    
    Please provide a helpful response based on the data above.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
};