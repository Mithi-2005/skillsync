import "../envloader.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const buildPrompt = (resumeText) => `
You are an expert technical recruiter and talent intelligence engine.

Task:
Extract ONLY technical skills from the resume text below.
For each skill:
- Assign a confidence score (0-100) based on EVIDENCE.
- Assign a category.

Allowed categories (use ONLY these):
- Programming Language
- Framework
- Machine Learning
- Database
- DevOps
- Tool
- Cloud
- Other

Scoring Algorithm Rules (CRITICAL):
1. **Project Verification:** If a skill is mentioned in a "Project" description or "Experience" bullet point with details on HOW it was used, score it **High (75-95)**.
2. **Keyword Only:** If a skill is just listed in a "Skills" section with no context, score it **Medium/Low (30-60)**.
3. **Frequency:** If a skill appears across multiple projects, boost the score.
4. **Context:** Distinguish between "used" and "familiar with".

Formatting Rules:
- Prefer specific technologies (e.g., "PostgreSQL" over "SQL", "Next.js" over "React" if applicable).
- Use "Tool" ONLY for IDEs (VS Code), design tools (Figma), or utilities (Jira).
- DO NOT invent skills.
- DO NOT include soft skills (Leadership, Communication).

Return ONLY valid JSON in the following format:
{
  "skills": [
    {
      "name": "string",
      "score": number,
      "category": "string"
    }
  ]
}

Resume text:
"""
${resumeText}
"""
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseResumeWithAI = async (resumeText) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env file");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = buildPrompt(resumeText);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleaned = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleaned);

    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      throw new Error("Invalid AI response format");
    }

    return parsed.skills;
  } catch (error) {
    console.error("AI PARSING ERROR:");
    console.error(error.message);
    if (error.response) console.error(error.response);
    throw new Error("AI resume parsing failed: " + error.message);
  }
};