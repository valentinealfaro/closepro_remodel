import { GoogleGenAI } from "@google/genai";

const GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.API_KEY ||
  "";


// ── Style / Budget descriptions ───────────────────────────────────────────────

const KITCHEN_STYLE_DESCS: Record<string, string> = {
  modern:       "clean, bright, sleek, minimal, updated, professional, with smooth finishes and a fresh modern layout",
  luxury:       "high-end, premium, elegant, magazine-quality, with upgraded materials, dramatic lighting, and expensive finishes",
  farmhouse:    "warm, inviting, clean, with shaker cabinets, natural textures, wood accents, and a comfortable family-home feel",
  traditional:  "timeless, balanced, classic, with warm finishes, detailed cabinetry, and a polished residential look",
  contemporary: "stylish, clean, refined, with bold contrast, smooth finishes, and modern design choices",
  budget:       "clean, simple, affordable, practical, with updated surfaces while keeping the remodel realistic and cost-conscious",
};

const BATHROOM_STYLE_DESCS: Record<string, string> = {
  modern:      "clean, sleek, bright, updated, minimal, and easy to imagine as a real remodel",
  luxury:      "high-end, relaxing, hotel-inspired, elegant, with premium tile, soft lighting, and a calm luxury feel",
  minimalist:  "simple, clean, open, uncluttered, with neutral finishes and modern fixtures",
  traditional: "classic, warm, polished, with timeless finishes and practical residential design",
  budget:      "clean, practical, affordable, updated, and realistic without expensive luxury materials",
  bold:        "dramatic, modern, high-contrast, with darker finishes, strong lighting, and premium design impact",
};

const BUDGET_DESC: Record<string, string> = {
  basic:    "Basic/Economy ($5K–$15K): Use affordable materials, keep changes realistic, avoid premium luxury finishes.",
  midrange: "Mid-Range ($15K–$35K): Use quality finishes, better lighting, updated surfaces, realistic upgraded look.",
  highend:  "High-End ($35K–$75K): Use premium materials, luxury lighting, custom design details, magazine-quality presentation.",
  luxury:   "Luxury ($75K+): Spare no expense. Highest quality materials, bespoke design, ultra-premium result.",
};

const NEGATIVE_PROMPT =
  "Do not change the original room layout. Do not add people. Do not add text or logos. Do not create unrealistic cabinets, distorted counters, warped appliances, or fantasy design elements. Avoid: cartoon, anime, illustration, drawing, painting, low quality, blurry, distorted proportions, warped cabinets, warped countertops, warped appliances, unrealistic shower glass, distorted vanity, distorted mirror, broken tile lines, impossible layout, changed camera angle, changed room structure, extra doors, extra windows, people, hands, faces, text, logo, watermark, brand names, clutter, messy construction, unrealistic lighting, overexposed, underexposed, fantasy design, CGI-looking, plastic textures.";

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildKitchenPrompt(
  style: string,
  budget: string,
  mats: Record<string, string>,
  mode: string,
  notes: string
): string {
  const styleDesc = KITCHEN_STYLE_DESCS[style] || KITCHEN_STYLE_DESCS.modern;
  const budgetDesc = BUDGET_DESC[budget] || BUDGET_DESC.midrange;
  const modeNote =
    mode === "creative"
      ? "Creative mode: Allow more dramatic design choices while still preserving the main room layout."
      : "Realistic mode: Keep original structure very close. Focus on finishes and surface updates only.";

  return `Transform this kitchen into a realistic ${style} kitchen remodel.

Preserve the existing room layout, camera angle, wall locations, windows, doors, ceiling, and overall structure.

Design details:
- Cabinet style: ${mats.cabinetStyle || "shaker cabinets"}
- Cabinet color: ${mats.cabinetColor || "white"}
- Countertop material: ${mats.countertop || "white quartz with subtle gray veining"}
- Backsplash: ${mats.backsplash || "white subway tile"}
- Flooring: ${mats.flooring || "luxury vinyl plank"}
- Hardware finish: ${mats.hardware || "matte black"}
- Lighting: ${mats.lighting || "recessed lighting with pendant lights"}
- Appliance style: ${mats.appliances || "stainless steel"}
- Budget level: ${budgetDesc}
- Mode: ${modeNote}

Create a realistic contractor-grade remodel preview that a homeowner could use to visualize the finished kitchen.

The kitchen should feel ${styleDesc}.

User notes: ${notes || "Make the kitchen look fresh, updated, and high-quality for a remodeling sales presentation."}

Image style: Photorealistic, high detail, realistic lighting, professional interior remodel photography, clean finish, realistic textures, natural shadows, premium contractor presentation.

${NEGATIVE_PROMPT}`;
}

function buildBathroomPrompt(
  style: string,
  budget: string,
  mats: Record<string, string>,
  mode: string,
  notes: string
): string {
  const styleDesc = BATHROOM_STYLE_DESCS[style] || BATHROOM_STYLE_DESCS.modern;
  const budgetDesc = BUDGET_DESC[budget] || BUDGET_DESC.midrange;
  const modeNote =
    mode === "creative"
      ? "Creative mode: Allow more dramatic design choices while still preserving the main room layout."
      : "Realistic mode: Keep original structure very close. Focus on finishes and surface updates only.";

  return `Transform this bathroom into a realistic ${style} bathroom remodel.

Preserve the existing room layout, camera angle, wall locations, windows, doors, ceiling, plumbing wall orientation, and overall structure.

Design details:
- Shower/tub type: ${mats.showerTub || "tub and shower combo"}
- Tile style: ${mats.tile || "large format porcelain tile"}
- Vanity type: ${mats.vanityType || "single vanity"}
- Vanity color: ${mats.vanityColor || "white"}
- Countertop material: ${mats.countertop || "quartz"}
- Fixture finish: ${mats.fixtures || "brushed nickel"}
- Flooring: ${mats.flooring || "large format tile"}
- Lighting: ${mats.lighting || "LED vanity lighting"}
- Mirror style: ${mats.mirror || "large rectangular mirror"}
- Budget level: ${budgetDesc}
- Mode: ${modeNote}

Create a realistic contractor-grade remodel preview that a homeowner could use to visualize the finished bathroom.

The bathroom should feel ${styleDesc}.

User notes: ${notes || "Make the bathroom look clean, updated, and high-quality."}

Image style: Photorealistic, high detail, realistic lighting, professional bathroom remodel photography, clean tile lines, realistic textures, natural shadows, accurate perspective.

${NEGATIVE_PROMPT}`;
}

// ── Vercel serverless handler ─────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  // CORS headers (needed for cross-origin fetch from the SPA)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    imageBase64,
    mimeType = "image/jpeg",
    roomType = "kitchen",
    style = "modern",
    budget = "midrange",
    materials = {},
    mode = "realistic",
    notes = "",
  } = req.body || {};

  if (!imageBase64) return res.status(400).json({ error: "imageBase64 is required" });
  if (!GEMINI_KEY)  return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  const prompt =
    roomType === "bathroom"
      ? buildBathroomPrompt(style, budget, materials, mode, notes)
      : buildKitchenPrompt(style, budget, materials, mode, notes);

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  // ── Step 1: Try Gemini img2img models ──────────────────────────────────────
  const IMG2IMG_MODELS = ["gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-2.0-flash-preview-image-generation", "gemini-2.0-flash-exp-image-generation"];

  for (const model of IMG2IMG_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] }],
        config: { responseModalities: ["IMAGE", "TEXT"] } as any,
      });
      const parts: any[] = response.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p: any) => p.inlineData?.data);
      if (imgPart?.inlineData) {
        return res.status(200).json({ success: true, imageData: imgPart.inlineData.data, mimeType: imgPart.inlineData.mimeType || "image/jpeg", model });
      }
      console.warn(`${model} returned no image, trying next`);
    } catch (err: any) {
      const skip = err.message?.includes("not found") || err.message?.includes("404") || err.message?.includes("INVALID_ARGUMENT") || err.message?.includes("is not supported") || err.message?.includes("does not support");
      if (skip) { console.warn(`${model} unavailable, trying next`); continue; }
      console.error("img2img error:", err.message);
      return res.status(500).json({ error: err.message || "Generation failed" });
    }
  }

  // ── Step 2: Vision analysis — describe the room ────────────────────────────
  console.log("img2img unavailable, analyzing room with vision...");
  let roomDesc = `a ${roomType} with standard layout`;
  try {
    const analysisRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: `Describe this ${roomType} for an AI image generator: camera angle, window/door positions, ceiling height, current materials, colors, lighting, fixtures. Be specific. 3-4 sentences.` }
      ]}],
    });
    roomDesc = analysisRes.text?.trim() || roomDesc;
  } catch (err: any) {
    console.warn("Vision analysis failed:", err.message);
  }

  const combinedPrompt = `Photorealistic interior design photo of a remodeled ${roomType}. Room: ${roomDesc}. ${prompt} Professional interior photography, realistic lighting, high detail.`;

  // ── Step 3: Imagen 3 (text-to-image with room description) ────────────────
  console.log("Trying Imagen 3...");
  try {
    const imgRes = await (ai.models as any).generateImages({
      model: "imagen-3.0-generate-001",
      prompt: combinedPrompt,
      config: { numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: "4:3" },
    });
    const imageBytes = imgRes?.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return res.status(200).json({ success: true, imageData: imageBytes, mimeType: "image/jpeg", model: "imagen-3.0-generate-001" });
    }
    console.warn("Imagen 3 returned no bytes");
  } catch (err: any) {
    console.warn("Imagen 3 failed:", err.message);
  }

  // ── Step 4: Pollinations.ai — always works, no API key needed ──────────────
  console.log("All Google models failed, falling back to Pollinations.ai...");
  try {
    const clean = combinedPrompt.replace(/\n+/g, " ").replace(/[^\w\s,.:;!?()'"-]/g, "").slice(0, 450);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(clean)}?width=1024&height=768&nologo=true&model=flux&enhance=true&seed=${Date.now()}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(50000) });
    if (r.ok) {
      const buf = await r.arrayBuffer();
      return res.status(200).json({ success: true, imageData: Buffer.from(buf).toString("base64"), mimeType: r.headers.get("content-type") || "image/jpeg", model: "pollinations-flux" });
    }
  } catch (err: any) {
    console.error("Pollinations failed:", err.message);
  }

  return res.status(422).json({
    error: "Image generation unavailable",
    message: "Generation failed. Please try again.",
  });
}
