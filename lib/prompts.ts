// Prompt builders for kitchen / bathroom remodels. Server-only.
// Single source of truth — both server.ts (dev) and api/generate-remodel.ts (Vercel) import from here.

const KITCHEN_STYLE_DESCS: Record<string, string> = {
  modern:       'clean, bright, sleek, minimal, updated, professional, with smooth finishes and a fresh modern layout',
  luxury:       'high-end, premium, elegant, magazine-quality, with upgraded materials, dramatic lighting, and expensive finishes',
  farmhouse:    'warm, inviting, clean, with shaker cabinets, natural textures, wood accents, and a comfortable family-home feel',
  traditional:  'timeless, balanced, classic, with warm finishes, detailed cabinetry, and a polished residential look',
  contemporary: 'stylish, clean, refined, with bold contrast, smooth finishes, and modern design choices',
  budget:       'clean, simple, affordable, practical, with updated surfaces while keeping the remodel realistic and cost-conscious',
};

const BATHROOM_STYLE_DESCS: Record<string, string> = {
  modern:      'clean, sleek, bright, updated, minimal, and easy to imagine as a real remodel',
  luxury:      'high-end, relaxing, hotel-inspired, elegant, with premium tile, soft lighting, and a calm luxury feel',
  minimalist:  'simple, clean, open, uncluttered, with neutral finishes and modern fixtures',
  traditional: 'classic, warm, polished, with timeless finishes and practical residential design',
  budget:      'clean, practical, affordable, updated, and realistic without expensive luxury materials',
  bold:        'dramatic, modern, high-contrast, with darker finishes, strong lighting, and premium design impact',
};

const BUDGET_DESC: Record<string, string> = {
  basic:    'Basic/Economy ($5K–$15K): Use affordable materials, keep changes realistic, avoid premium luxury finishes.',
  midrange: 'Mid-Range ($15K–$35K): Use quality finishes, better lighting, updated surfaces, realistic upgraded look.',
  highend:  'High-End ($35K–$75K): Use premium materials, luxury lighting, custom design details, magazine-quality presentation.',
  luxury:   'Luxury ($75K+): Spare no expense. Highest quality materials, bespoke design, ultra-premium result.',
};

// Lead instruction we prepend to every prompt — drives the image-to-image edit.
export const LAYOUT_PRESERVATION_PREAMBLE =
  'You are a professional interior designer and remodel visualizer. The supplied image is a real ' +
  'kitchen or bathroom photo from a homeowner. Generate a new image that PRESERVES the EXACT same ' +
  'room layout, walls, windows, doors, ceiling height, camera angle, perspective, and architectural ' +
  'features — only update the finishes, materials, fixtures, lighting, and color palette as described ' +
  'below. Do not invent new structural elements, do not change the camera position, and do not alter ' +
  'the room\'s footprint. Output: a single photorealistic image.';

const NEGATIVE_PROMPT =
  'Do not change the original room layout. Do not add people. Do not add text or logos. ' +
  'Do not create unrealistic cabinets, distorted counters, warped appliances, or fantasy ' +
  'design elements. Avoid: cartoon, anime, illustration, drawing, painting, low quality, ' +
  'blurry, distorted proportions, warped cabinets, warped countertops, warped appliances, ' +
  'unrealistic shower glass, distorted vanity, distorted mirror, broken tile lines, ' +
  'impossible layout, changed camera angle, changed room structure, extra doors, extra ' +
  'windows, people, hands, faces, text, logo, watermark, brand names, clutter, messy ' +
  'construction, unrealistic lighting, overexposed, underexposed, fantasy design, ' +
  'CGI-looking, plastic textures.';

export interface BuildPromptOpts {
  roomType: 'kitchen' | 'bathroom' | string;
  style: string;
  budget: string;
  materials?: Record<string, string>;
  mode?: string;
  notes?: string;
}

export function buildPrompt(opts: BuildPromptOpts): string {
  const isBath = opts.roomType === 'bathroom';
  return isBath ? buildBathroomPrompt(opts) : buildKitchenPrompt(opts);
}

function modeNote(mode?: string): string {
  return mode === 'creative'
    ? 'Creative mode: Allow more dramatic design choices while still preserving the main room layout.'
    : 'Realistic mode: Keep original structure very close. Focus on finishes and surface updates only.';
}

function buildKitchenPrompt({ style, budget, materials = {}, mode, notes }: BuildPromptOpts): string {
  const styleDesc = KITCHEN_STYLE_DESCS[style] || KITCHEN_STYLE_DESCS.modern;
  const budgetDesc = BUDGET_DESC[budget] || BUDGET_DESC.midrange;

  return `${LAYOUT_PRESERVATION_PREAMBLE}

Transform this kitchen into a realistic ${style} kitchen remodel.

Design details:
- Cabinet style: ${materials.cabinetStyle || 'shaker cabinets'}
- Cabinet color: ${materials.cabinetColor || 'white'}
- Countertop material: ${materials.countertop || 'white quartz with subtle gray veining'}
- Backsplash: ${materials.backsplash || 'white subway tile'}
- Flooring: ${materials.flooring || 'luxury vinyl plank'}
- Hardware finish: ${materials.hardware || 'matte black'}
- Lighting: ${materials.lighting || 'recessed lighting with pendant lights'}
- Appliance style: ${materials.appliances || 'stainless steel'}
- Budget level: ${budgetDesc}
- Mode: ${modeNote(mode)}

Create a realistic contractor-grade remodel preview that a homeowner could use to visualize the finished kitchen. The kitchen should feel ${styleDesc}.

User notes: ${notes || 'Make the kitchen look fresh, updated, and high-quality for a remodeling sales presentation.'}

Image style: Photorealistic, high detail, realistic lighting, professional interior remodel photography, clean finish, realistic textures, natural shadows, premium contractor presentation.

${NEGATIVE_PROMPT}`;
}

function buildBathroomPrompt({ style, budget, materials = {}, mode, notes }: BuildPromptOpts): string {
  const styleDesc = BATHROOM_STYLE_DESCS[style] || BATHROOM_STYLE_DESCS.modern;
  const budgetDesc = BUDGET_DESC[budget] || BUDGET_DESC.midrange;

  return `${LAYOUT_PRESERVATION_PREAMBLE}

Transform this bathroom into a realistic ${style} bathroom remodel.

Design details:
- Shower/tub type: ${materials.showerTub || 'tub and shower combo'}
- Tile style: ${materials.tile || 'large format porcelain tile'}
- Vanity type: ${materials.vanityType || 'single vanity'}
- Vanity color: ${materials.vanityColor || 'white'}
- Countertop material: ${materials.countertop || 'quartz'}
- Fixture finish: ${materials.fixtures || 'brushed nickel'}
- Flooring: ${materials.flooring || 'large format tile'}
- Lighting: ${materials.lighting || 'LED vanity lighting'}
- Mirror style: ${materials.mirror || 'large rectangular mirror'}
- Budget level: ${budgetDesc}
- Mode: ${modeNote(mode)}

Create a realistic contractor-grade remodel preview that a homeowner could use to visualize the finished bathroom. The bathroom should feel ${styleDesc}.

User notes: ${notes || 'Make the bathroom look clean, updated, and high-quality.'}

Image style: Photorealistic, high detail, realistic lighting, professional bathroom remodel photography, clean tile lines, realistic textures, natural shadows, accurate perspective.

${NEGATIVE_PROMPT}`;
}
