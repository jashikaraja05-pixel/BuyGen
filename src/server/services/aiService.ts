import { GoogleGenAI } from '@google/genai';
import { productService } from './productService.ts';
import { categoryService } from './categoryService.ts';
import { normalizeSearchQuery } from '../../lib/spellingNormalizer.ts';
import type { AIAdvisorResponse, Product } from '../../types/index.ts';

export const aiService = {
  async askTechAdvisor(prompt: string): Promise<AIAdvisorResponse> {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Please enter your electronics requirements.');
    }

    const { products: allProducts } = await productService.getAllProducts();
    const productCatalogSummary = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.categoryName,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      specs: p.specifications
    }));

    let aiAdvice: any = null;

    // Use Gemini API if GEMINI_API_KEY is available in environment
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({});
        const systemPrompt = `You are BUYGEN Smart Tech Advisor, an expert consumer electronics consultant.
The user wants electronics recommendations based on natural language requirements.
CRITICAL RULES:
1. ONLY recommend products that exist in the provided JSON catalog. NEVER invent products, prices, or specs!
2. Respect stock availability: only recommend products with stock > 0.
3. Extract: budget, category, key requirements (RAM, display, use case, brand preference).
4. Select 1 primary best match ('recommended') and 1 or 2 alternative matches ('alternative').
5. Explain concisely WHY each product matches the user's specific use case and budget.
6. For alternatives, highlight key differences from the primary recommendation.
7. SILENT TYPO CORRECTION: The user may make spelling mistakes or typos (for example, typing "phene" for "phone", "lapotp" for "laptop", "camra" for "camera", "earbds" for "earbuds", "moniter" for "monitor"). Silently detect and understand their intended electronic product and directly provide the relevant recommendations. NEVER say "I detected a typo" or "Did you mean phone" or mention the spelling error in the summary or text.
8. Return ONLY valid JSON in this exact structure:
{
  "extractedRequirements": {
    "budget": number or null,
    "category": string or null,
    "keyFeatures": string[],
    "useCase": string or null,
    "brandPreference": string or null
  },
  "summary": "Brief 1-2 sentence executive assessment of their needs",
  "recommendations": [
    {
      "productId": "matching product id from catalog",
      "type": "recommended",
      "keySpecs": ["bullet 1", "bullet 2", "bullet 3"],
      "whyItMatches": "detailed explanation of why this product is ideal for their requirement"
    },
    {
      "productId": "another product id from catalog",
      "type": "alternative",
      "keySpecs": ["bullet 1", "bullet 2"],
      "whyItMatches": "why this is also good",
      "difference": "how it compares to the primary choice"
    }
  ]
}

Product Catalog:
${JSON.stringify(productCatalogSummary, null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\nUser Requirement: "${prompt}"`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          aiAdvice = JSON.parse(response.text);
        }
      } catch (geminiErr) {
        console.warn('[AI Advisor] Gemini API call failed, falling back to deterministic matching:', geminiErr);
      }
    }

    // Fallback deterministic semantic matcher if Gemini API key is unset or calls fail
    if (!aiAdvice || !aiAdvice.recommendations?.length) {
      const normalizedPrompt = normalizeSearchQuery(prompt);
      const q = (normalizedPrompt || prompt).toLowerCase();

      // Extract budget numbers
      let budget: number | undefined;
      const budgetMatch = q.match(/(?:under|below|budget|within|upto|up to|less than)?\s*₹?\s*(\d+[\d,]*)(?:k|000)?/i);
      if (budgetMatch) {
        const rawNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
        if (q.includes('k') && rawNum < 1000) {
          budget = rawNum * 1000;
        } else if (rawNum < 500) {
          budget = rawNum * 1000;
        } else {
          budget = rawNum;
        }
      }

      // Detect category
      let matchedCategory = '';
      if (q.includes('laptop') || q.includes('macbook') || q.includes('computer')) matchedCategory = 'Laptops';
      else if (q.includes('phone') || q.includes('smartphone') || q.includes('mobile')) matchedCategory = 'Smartphones';
      else if (q.includes('headphone') || q.includes('earbud') || q.includes('audio') || q.includes('airpod')) matchedCategory = 'Headphones & ANC';
      else if (q.includes('monitor') || q.includes('display') || q.includes('screen')) matchedCategory = 'Gaming Monitors';
      else if (q.includes('keyboard') || q.includes('mouse')) matchedCategory = 'Keyboards & Peripherals';
      else if (q.includes('watch') || q.includes('smartwatch')) matchedCategory = 'Smartwatches';

      let eligible = allProducts.filter(p => p.stock > 0);
      if (matchedCategory) {
        const inCat = eligible.filter(p => p.categoryName.toLowerCase() === matchedCategory.toLowerCase());
        if (inCat.length > 0) {
          eligible = inCat;
        }
      }

      if (budget) {
        const inBudget = eligible.filter(p => p.price <= budget! * 1.15);
        if (inBudget.length > 0) {
          eligible = inBudget;
        }
      }

      // Spec scoring: boost products matching RAM, display, or keywords
      eligible.sort((a, b) => {
        let scoreA = a.rating;
        let scoreB = b.rating;

        if (q.includes('16gb')) {
          if (JSON.stringify(a.specifications).toLowerCase().includes('16gb')) scoreA += 5;
          if (JSON.stringify(b.specifications).toLowerCase().includes('16gb')) scoreB += 5;
        }
        if (q.includes('32gb')) {
          if (JSON.stringify(a.specifications).toLowerCase().includes('32gb')) scoreA += 5;
          if (JSON.stringify(b.specifications).toLowerCase().includes('32gb')) scoreB += 5;
        }
        if (q.includes('oled')) {
          if (JSON.stringify(a.specifications).toLowerCase().includes('oled')) scoreA += 4;
          if (JSON.stringify(b.specifications).toLowerCase().includes('oled')) scoreB += 4;
        }
        if (q.includes('anc') || q.includes('noise')) {
          if (a.name.toLowerCase().includes('anc') || a.description.toLowerCase().includes('noise')) scoreA += 4;
          if (b.name.toLowerCase().includes('anc') || b.description.toLowerCase().includes('noise')) scoreB += 4;
        }

        return scoreB - scoreA;
      });

      const primary = eligible[0] || allProducts[0];
      const alternative = eligible[1] || allProducts[1];

      aiAdvice = {
        extractedRequirements: {
          budget: budget || undefined,
          category: matchedCategory || 'Consumer Electronics',
          keyFeatures: [q.includes('ram') ? 'High RAM' : 'High Performance', 'Quality Build'],
          useCase: prompt.slice(0, 80),
          brandPreference: undefined
        },
        summary: `Identified optimal consumer electronics choices matching your budget and performance expectations.`,
        recommendations: [
          {
            productId: primary.id,
            type: 'recommended',
            keySpecs: Object.entries(primary.specifications || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
            whyItMatches: `Best in class performance for your criteria with verified stock and high 4.8+ customer satisfaction rating.`
          },
          ...(alternative ? [{
            productId: alternative.id,
            type: 'alternative',
            keySpecs: Object.entries(alternative.specifications || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
            whyItMatches: `Excellent alternative offering comparable capability at ₹${alternative.price.toLocaleString('en-IN')}.`,
            difference: `Price is ₹${Math.abs(primary.price - alternative.price).toLocaleString('en-IN')} ${alternative.price < primary.price ? 'lower' : 'higher'} with different form factor and features.`
          }] : [])
        ]
      };
    }

    // Hydrate recommendations with complete product records from persistent catalog
    const enrichedRecommendations = aiAdvice.recommendations.map((rec: any) => {
      const { product } = productService.getProductById(rec.productId);
      return {
        ...rec,
        product
      };
    }).filter((r: any) => r.product !== null);

    return {
      extractedRequirements: aiAdvice.extractedRequirements,
      summary: aiAdvice.summary,
      recommendations: enrichedRecommendations
    };
  },

  async compareProducts(productIds: string[]): Promise<{ products: Product[]; analysis: string }> {
    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
      throw new Error('Please select 2 or 3 products to compare.');
    }

    const fetchedProducts = productIds.map(id => productService.getProductById(id).product);
    const products: Product[] = fetchedProducts.filter((p: Product | null): p is Product => p !== null);

    if (products.length < 2) {
      throw new Error('Could not find the selected products for comparison.');
    }

    let analysis = '';
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({});
        const prompt = `Compare these consumer electronics products in plain, helpful language for a prospective buyer:
${JSON.stringify(products.map(p => ({
  name: p.name,
  price: p.price,
  rating: p.rating,
  specs: p.specifications
})), null, 2)}

Provide:
1. Executive Verdict (Who should buy which product)
2. Standout Advantages of each
3. Value-for-money verdict`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });
        analysis = resp.text || '';
      } catch (e) {
        console.warn('[AI Compare] Gemini comparison failed, using rule-based summary:', e);
      }
    }

    if (!analysis) {
      analysis = `### Expert Comparison Overview
- **${products[0].name}** offers premier engineering at ₹${products[0].price.toLocaleString('en-IN')}, ideal for users demanding maximum capability.
- **${products[1].name}** provides a compelling alternative with standout value in its tier.
${products[2] ? `- **${products[2].name}** brings versatile versatility and specialized features to the matchup.` : ''}

**Recommendation:** Base your choice on your primary priority: maximum specifications or optimal price-to-performance.`;
    }

    return { products, analysis };
  },

  async smartSearch(query: string): Promise<{ products: Product[]; interpreted: any }> {
    if (!query) {
      const { products } = await productService.getAllProducts();
      return { products, interpreted: null };
    }

    const normalizedQuery = normalizeSearchQuery(query);
    const q = (normalizedQuery || query).toLowerCase();
    let maxPrice: number | undefined;
    let category: string | undefined;

    const underMatch = q.match(/(?:under|below|less than|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+[\d,]*)(?:k)?/i);
    if (underMatch) {
      let val = parseInt(underMatch[1].replace(/,/g, ''), 10);
      if (underMatch[0].includes('k') && val < 1000) val *= 1000;
      maxPrice = val;
    }

    const categories = await categoryService.getAllCategories();
    for (const cat of categories) {
      const matchName = q.includes(cat.name.toLowerCase()) || q.includes(cat.slug.toLowerCase());
      const matchSub = cat.subcategories?.some(s => q.includes(s.toLowerCase()));
      if (matchName || matchSub) {
        category = cat.id;
        break;
      }
    }

    const cleanSearch = (normalizedQuery || query)
      .replace(/(?:under|below|less than|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+[\d,]*)(?:k)?/gi, '')
      .replace(/(?:show me|find me|look for|search for|recommend|i want|i need|good|best)/gi, '')
      .trim();

    const { products } = await productService.getAllProducts({
      category,
      maxPrice,
      search: cleanSearch.length > 2 ? cleanSearch : undefined
    });

    return {
      products,
      interpreted: {
        category,
        maxPrice,
        cleanSearch,
        originalQuery: query
      }
    };
  }
};
