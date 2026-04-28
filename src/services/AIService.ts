import { GoogleGenAI, Type } from "@google/genai";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const MODEL_NAME = "gemini-3-flash-preview";

export class AIService {
  private static getAI() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please check your environment variables (GEMINI_API_KEY or API_KEY).');
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Generates an initial follow-up message for a new lead.
   */
  static async generateFollowUp(tenantId: string, leadData: any): Promise<string> {
    try {
      const ai = this.getAI();
      const prompt = `
        You are a professional sales assistant for a high-end home remodeling contractor.
        A new lead just came in:
        Name: ${leadData.name}
        Service Interested In: ${leadData.serviceType}
        Source: ${leadData.source}
        Notes: ${leadData.notes || 'None'}

        Goal: Write a short, friendly, and professional SMS message (under 160 characters) to introduce yourself and ask if they have time for a quick 5-minute discovery call today or tomorrow.
        
        Guidelines:
        - Be personal but professional.
        - Mention their specific interest (${leadData.serviceType}).
        - Do not use placeholders like [Name], use their actual name.
        - Keep it concise for SMS.
        - End with a clear call to action.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      const message = response.text || "Hi! Thanks for reaching out. We'd love to discuss your project. When's a good time to chat?";
      
      // Log the AI interaction
      await this.logAIInteraction(tenantId, leadData.id, 'follow_up', prompt, message);

      return message;
    } catch (error) {
      console.error("AI Follow-up generation failed:", error);
      return "Hi! Thanks for your interest in our services. We'll be in touch shortly to discuss your project.";
    }
  }

  /**
   * Analyzes a lead's data to provide a "Lead Score" and "Sales Strategy".
   */
  static async analyzeLead(tenantId: string, leadData: any): Promise<{ score: number; strategy: string }> {
    try {
      const ai = this.getAI();
      const prompt = `
        Analyze this remodeling lead and provide a lead score (0-100) and a brief sales strategy.
        Lead Data:
        Name: ${leadData.name}
        Service: ${leadData.serviceType}
        Source: ${leadData.source}
        Job Value: $${leadData.jobValue || 'Unknown'}
        Notes: ${leadData.notes || 'None'}

        Return the result in JSON format:
        {
          "score": number,
          "strategy": "string"
        }
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{"score": 50, "strategy": "Standard follow-up required."}');
      
      // Log the analysis
      await this.logAIInteraction(tenantId, leadData.id, 'lead_analysis', prompt, response.text);

      return result;
    } catch (error) {
      console.error("Lead analysis failed:", error);
      return { score: 50, strategy: "Manual review recommended." };
    }
  }

  /**
   * Generates a professional scope of work for an estimate.
   */
  static async generateScopeOfWork(tenantId: string, projectName: string, serviceType: string, notes: string = ''): Promise<string> {
    try {
      const ai = this.getAI();
      const prompt = `
        Generate a professional scope of work for a ${serviceType} project named "${projectName}".
        Additional notes: ${notes}
        
        Provide a detailed, bulleted list of tasks and materials.
        Respond with a professional, concise scope of work.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      const scope = response.text || "Standard scope of work for " + serviceType;
      
      // Log the AI interaction
      await this.logAIInteraction(tenantId, 'estimate_gen', 'generate_scope', prompt, scope);

      return scope;
    } catch (error) {
      console.error("AI Scope generation failed:", error);
      return "Standard scope of work for " + serviceType;
    }
  }

  /**
   * Generates a complete website structure for a remodeling business.
   */
  static async generateWebsiteContent(tenantId: string, businessName: string, services: string[]) {
    try {
      const ai = this.getAI();
      const prompt = `Generate a comprehensive website structure and content for a home services business.
      Business Name: ${businessName}
      Services: ${services.join(', ')}

      Make the content professional, high-converting, and tailored to the home services industry.
      Include at least 4 pages: Home, Services, About, and Contact.
      Ensure the Home page has a Hero, Features, and Testimonials section.
      Ensure the Services page lists the provided services in detail.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              globalSettings: {
                type: Type.OBJECT,
                properties: {
                  businessName: { type: Type.STRING },
                  brandColors: {
                    type: Type.OBJECT,
                    properties: {
                      primary: { type: Type.STRING },
                      secondary: { type: Type.STRING },
                      accent: { type: Type.STRING }
                    },
                    required: ["primary", "secondary", "accent"]
                  },
                  fontFamily: { type: Type.STRING },
                  borderRadius: { type: Type.STRING },
                  buttonStyle: { type: Type.STRING }
                },
                required: ["businessName", "brandColors", "fontFamily", "borderRadius", "buttonStyle"]
              },
              conversionSettings: {
                type: Type.OBJECT,
                properties: {
                  primaryCta: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      link: { type: Type.STRING },
                      action: { type: Type.STRING, enum: ["form", "booking", "call", "link"] }
                    },
                    required: ["text", "link", "action"]
                  },
                  stickyCta: { type: Type.BOOLEAN },
                  chatWidget: { type: Type.BOOLEAN },
                  exitIntentPopup: { type: Type.BOOLEAN }
                },
                required: ["primaryCta", "stickyCta", "chatWidget", "exitIntentPopup"]
              },
              pages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    slug: { type: Type.STRING },
                    isHomepage: { type: Type.BOOLEAN },
                    seo: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["title", "description", "keywords"]
                    },
                    sections: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          content: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              subtitle: { type: Type.STRING },
                              description: { type: Type.STRING },
                              ctaText: { type: Type.STRING },
                              ctaLink: { type: Type.STRING },
                              headline: { type: Type.STRING },
                              subheadline: { type: Type.STRING },
                              buttonText: { type: Type.STRING },
                              imageUrl: { type: Type.STRING },
                              items: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    icon: { type: Type.STRING },
                                    image: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                    rating: { type: Type.NUMBER },
                                    question: { type: Type.STRING },
                                    answer: { type: Type.STRING }
                                  }
                                }
                              }
                            }
                          }
                        },
                        required: ["type", "content"]
                      }
                    }
                  },
                  required: ["title", "slug", "isHomepage", "seo", "sections"]
                }
              }
            },
            required: ["globalSettings", "conversionSettings", "pages"]
          }
        }
      });

      console.log('AI Website Generation Response:', response.text);
      
      let result;
      try {
        const text = response.text || '{}';
        // Clean potential markdown blocks
        const jsonStr = text.replace(/```json\n?|```/g, '').trim();
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', response.text);
        throw new Error('Failed to parse AI response as JSON');
      }
      
      // Log the AI interaction
      await this.logAIInteraction(tenantId, 'website_gen', 'generate_website', prompt, response.text || 'No response text');

      return result;
    } catch (error) {
      console.error('Error generating website content:', error);
      throw error;
    }
  }

  /**
   * Logs AI interactions to Firestore for transparency and debugging.
   */
  private static async logAIInteraction(tenantId: string, leadId: string | null, type: string, prompt: string, response: string) {
    const path = `tenants/${tenantId}/ai_logs`;
    try {
      await addDoc(collection(db, path), {
        leadId: leadId || 'none',
        type,
        prompt,
        response,
        model: MODEL_NAME,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}
