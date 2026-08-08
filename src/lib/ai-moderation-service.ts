import { env } from "./env";
import { logger } from "./logger";
import { connectDB } from "@/database/connect";
import AIConversationFlag from "@/database/models/ai-conversation-flag.model";
import AIRiskProfile from "@/database/models/ai-risk-profile.model";
import { notifyAdmin } from "./admin-notifier";
import mongoose from "mongoose";
import type { AIFlagCategory, AIFlagLevel, IAIRiskProfile } from "../../types";

export interface RuleMatch {
  matched: boolean;
  rule?: string;
  category?: AIFlagCategory;
  level?: AIFlagLevel;
  riskScore?: number;
  flaggedContent?: string;
}

export interface AIModerationResult {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  riskScore: number;
  confidenceScore: number;
  level: AIFlagLevel;
  category: AIFlagCategory;
  categories: AIFlagCategory[];
  recommendedAction: string;
  explanation: string;
}

export interface IAIProvider {
  name: string;
  analyzeConversation(conversationText: string, context?: string): Promise<AIModerationResult>;
}

/* ============================================================
   LAYER 1: Fast Rule Engine (always runs first)
   ============================================================ */
const RULES: Array<{
  id: string;
  patterns: RegExp[];
  category: AIFlagCategory;
  level: AIFlagLevel;
  riskScore: number;
}> = [
  {
    id: "phone_number",
    patterns: [
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,5}/g, // typical phone numbers
      /\b\d{10,13}\b/g, // 10-13 digit raw numbers
    ],
    category: "contact_sharing",
    level: "high",
    riskScore: 75,
  },
  {
    id: "whatsapp",
    patterns: [/whatsapp|wa\.me|whats app|w\/a/gi],
    category: "contact_sharing",
    level: "high",
    riskScore: 80,
  },
  {
    id: "telegram_discord_instagram_facebook",
    patterns: [/telegram|t\.me|discord|@[\w]{3,}|instagram|ig:|facebook|fb\.com/gi],
    category: "contact_sharing",
    level: "medium",
    riskScore: 65,
  },
  {
    id: "email",
    patterns: [/[\w.+-]+@[\w-]+\.[\w.-]+/g],
    category: "contact_sharing",
    level: "high",
    riskScore: 78,
  },
  {
    id: "external_url",
    patterns: [
      /(https?:\/\/(?!(www\.)?(ravencrest|achieveacademy|yourdomain))[^\s]+)/gi,
      /\b[a-z0-9-]+\.(com|pk|co\.uk|in|net|org|io)\b/gi,
    ],
    category: "contact_sharing",
    level: "medium",
    riskScore: 60,
  },
  {
    id: "qr_code",
    patterns: [/qr code|scan qr|my qr/gi],
    category: "contact_sharing",
    level: "medium",
    riskScore: 65,
  },
  {
    id: "payment_methods",
    patterns: [
      /jazzcash|jazz cash|easy paisa|easypaisa|bank transfer|pay directly|contact me outside|outside platform|pay here|dm me|whatsapp me|inbox me/gi,
    ],
    category: "payment_bypass",
    level: "critical",
    riskScore: 95,
  },
  {
    id: "profanity",
    patterns: [
      /\b(f[u*]+ck|sh[i*]+t|b[i*]+tch|a[s*]+s|d[i*]+ck|p[u*]+ssy|c[u*]+nt|motherfucker|bastard)\b/gi,
    ],
    category: "profanity",
    level: "medium",
    riskScore: 50,
  },
];

export function runRuleEngine(messageText: string): RuleMatch {
  const allMatches: RuleMatch[] = [];

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = messageText.match(pattern);
      if (match) {
        allMatches.push({
          matched: true,
          rule: rule.id,
          category: rule.category,
          level: rule.level,
          riskScore: rule.riskScore,
          flaggedContent: match.slice(0, 3).join(", "),
        });
        break; // one match per rule is enough
      }
    }
  }

  if (allMatches.length === 0) {
    return { matched: false };
  }

  // Pick highest risk
  const worst = allMatches.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))[0];
  return {
    matched: true,
    rule: allMatches.map(m => m.rule).join(", "),
    category: worst.category,
    level: worst.level,
    riskScore: worst.riskScore,
    flaggedContent: allMatches.map(m => m.flaggedContent).filter(Boolean).join("; "),
  };
}

/* ============================================================
   LAYER 2: AI Analysis (OpenAI / Anthropic / Mock)
   ============================================================ */
class MockAIProvider implements IAIProvider {
  name = "mock";

  async analyzeConversation(conversationText: string, _context?: string): Promise<AIModerationResult> {
    const hasPaymentBypass = /jazzcash|easypaisa|pay directly|outside platform/i.test(conversationText);
    const hasContact = /whatsapp|email|@/i.test(conversationText);

    const category: AIFlagCategory = hasPaymentBypass
      ? "payment_bypass"
      : hasContact
      ? "contact_sharing"
      : "suspicious";

    const riskScore = hasPaymentBypass ? 95 : hasContact ? 75 : 40;
    const level: AIFlagLevel =
      riskScore >= 90 ? "critical" : riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

    return {
      summary: hasPaymentBypass
        ? "Conversation appears to be attempting payment bypass."
        : hasContact
        ? "Conversation may contain contact-sharing attempt."
        : "Conversation flagged for review.",
      sentiment: "negative",
      riskScore,
      confidenceScore: 70,
      level,
      category,
      categories: [category],
      recommendedAction: hasPaymentBypass
        ? "Admin should review conversation and warn user(s)."
        : hasContact
        ? "Admin should verify and warn if contact-sharing occurred."
        : "Manual review recommended.",
      explanation: "This is a mock AI result. Connect OpenAI or Anthropic for real analysis.",
    };
  }
}

class OpenAIProvider implements IAIProvider {
  name = "openai";

  async analyzeConversation(conversationText: string, context?: string): Promise<AIModerationResult> {
    if (!env.OPENAI_API_KEY) {
      return new MockAIProvider().analyzeConversation(conversationText, context);
    }

    try {
      const systemPrompt = `You are a Trust & Safety AI moderator for Ravencrest Academy, a tutoring marketplace. 

Analyze the conversation for these categories: contact_sharing, payment_bypass, profanity, spam, toxicity, harassment, scam, grooming, fraud, tutor_extra_fee, student_abuse.

Output valid JSON with these fields:
{
  "summary": "short 1-sentence summary",
  "sentiment": "positive | neutral | negative",
  "riskScore": 0-100,
  "confidenceScore": 0-100,
  "level": "low | medium | high | critical",
  "category": "AIFlagCategory",
  "categories": ["AIFlagCategory"],
  "recommendedAction": "1 sentence action for admin",
  "explanation": "1 sentence short explanation"
}`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.AI_MODERATION_MODEL || "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Context: ${context || "n/a"}\n\nConversation:\n${conversationText}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI request failed: ${res.status}`);
      }
      const data = await res.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content) as AIModerationResult;
    } catch (err) {
      logger.error("OpenAI moderation error", { error: err });
      return new MockAIProvider().analyzeConversation(conversationText, context);
    }
  }
}

class AnthropicProvider implements IAIProvider {
  name = "anthropic";

  async analyzeConversation(conversationText: string, context?: string): Promise<AIModerationResult> {
    if (!env.ANTHROPIC_API_KEY) {
      return new MockAIProvider().analyzeConversation(conversationText, context);
    }

    try {
      const system = `You are a Trust & Safety AI for Ravencrest Academy. Output ONLY a valid JSON object, no prose.`;
      const prompt = `Context: ${context || "n/a"}\nConversation: ${conversationText}\n\nReturn JSON: { summary, sentiment ("positive|neutral|negative"), riskScore (0-100), confidenceScore (0-100), level ("low|medium|high|critical"), category (contact_sharing|payment_bypass|profanity|spam|toxicity|harassment|scam|grooming|fraud|tutor_extra_fee|student_abuse|suspicious), categories: [], recommendedAction, explanation }`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 800,
          system,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        throw new Error(`Anthropic request failed: ${res.status}`);
      }
      const data = await res.json();
      const content = data.content?.[0]?.text || "{}";
      return JSON.parse(content) as AIModerationResult;
    } catch (err) {
      logger.error("Anthropic moderation error", { error: err });
      return new MockAIProvider().analyzeConversation(conversationText, context);
    }
  }
}

function getAIProvider(): IAIProvider {
  switch (env.AI_MODERATION_PROVIDER) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "none":
    case "mock":
    default:
      return new MockAIProvider();
  }
}

export const aiProvider = getAIProvider();

export async function hybridModeration(
  messageText: string,
  conversationId: string,
  participants: string[],
  extraContext?: string
) {
  const rule = runRuleEngine(messageText);

  // If no rules matched, return safe
  if (!rule.matched) {
    return { requiresLayer2: false, ruleMatch: rule };
  }

  // Layer 2 AI analysis (only if suspicious rule triggered)
  const aiResult = await aiProvider.analyzeConversation(messageText, extraContext);
  return {
    requiresLayer2: true,
    ruleMatch: rule,
    aiResult,
    conversationId,
    participants,
  };
}

/* ============================================================
   LAYER 3: Async Persistence & Notifications (Fire & Forget)
   ============================================================ */

export async function processMessageForModeration(data: {
  messageId: string;
  conversationId: string;
  senderId: string;
  participants: string[];
  messageContent: string;
  extraContext?: string;
}): Promise<void> {
  try {
    await connectDB();
    const result = await hybridModeration(
      data.messageContent,
      data.conversationId,
      data.participants,
      data.extraContext
    );

    if (!result.requiresLayer2 || !result.aiResult) {
      return;
    }

    const { ruleMatch, aiResult } = result;
    const conversationObjectId = new mongoose.Types.ObjectId(data.conversationId);
    const messageObjectId = new mongoose.Types.ObjectId(data.messageId);
    const participantObjectIds = data.participants.map(
      (p) => new mongoose.Types.ObjectId(p)
    );

    // 1. Create Conversation Flag
    const flag = await AIConversationFlag.create({
      conversationId: conversationObjectId,
      messageId: messageObjectId,
      flaggedBy: ruleMatch.rule ? "rule_engine" : "ai_analysis",
      ruleMatched: ruleMatch.rule,
      flaggedContent: ruleMatch.flaggedContent,
      summary: aiResult.summary,
      sentiment: aiResult.sentiment,
      riskScore: aiResult.riskScore,
      confidenceScore: aiResult.confidenceScore,
      level: aiResult.level,
      category: aiResult.category,
      categories: aiResult.categories,
      recommendedAction: aiResult.recommendedAction,
      explanation: aiResult.explanation,
      participants: participantObjectIds,
      handled: false,
    });

    logger.info("AI flag created", {
      flagId: flag._id.toString(),
      riskScore: aiResult.riskScore,
      level: aiResult.level,
      category: aiResult.category,
    });

    // 2. Update Risk Profiles for all participants
    for (const participantId of participantObjectIds) {
      const isSender = participantId.toString() === data.senderId.toString();
      const weight = isSender ? 1 : 0.3; // Sender gets higher weight
      const contribution = Math.floor(aiResult.riskScore * weight);

      let profile = (await AIRiskProfile.findOneAndUpdate(
        { user: participantId },
        {
          $inc: {
            overallRiskScore: contribution,
            flagsCount: 1,
            criticalFlagsCount: aiResult.level === "critical" ? 1 : 0,
          },
          $push: {
            recentCategories: {
              $each: [aiResult.category],
              $slice: -5,
            },
          },
          $set: { lastAnalyzedAt: new Date() },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )) as IAIRiskProfile & { overallRiskScore: number };

      const overall = Math.min(100, (profile.overallRiskScore || 0));
      let level: AIFlagLevel = "low";
      if (overall >= 90) level = "critical";
      else if (overall >= 70) level = "high";
      else if (overall >= 40) level = "medium";

      if (profile.riskLevel !== level || profile.overallRiskScore !== overall) {
        profile.overallRiskScore = overall;
        profile.riskLevel = level;
        await profile.save();
      }
    }

    // 3. Notify Admin for high/critical risks
    if (aiResult.level === "high" || aiResult.level === "critical") {
      await notifyAdmin({
        type: "ai_flag",
        title: `${aiResult.level.toUpperCase()} Risk: ${aiResult.category.replace(/_/g, " ")}`,
        message: aiResult.summary,
        relatedModel: "AIConversationFlag",
        relatedId: flag._id,
        payload: {
          flagId: flag._id.toString(),
          conversationId: data.conversationId,
          messageId: data.messageId,
          riskScore: aiResult.riskScore,
          level: aiResult.level,
          category: aiResult.category,
          recommendedAction: aiResult.recommendedAction,
        },
      });
    }
  } catch (err) {
    logger.error("processMessageForModeration failed silently", { error: err });
  }
}
