const TOOL_CATEGORIES = ["tool", "utility", "ide"];

const GENERIC_SKILLS = [
  "web development",
  "full stack",
  "full-stack development",
  "software development",
  "programming",
  "coding",
  "computer science",
  "artificial intelligence",
  "data science",
  "technology"
];

const ALLOWED_TOOL_EXCEPTIONS = ["docker", "kubernetes", "jenkins", "git", "postman", "power bi", "tableau"];

const CATEGORY_WEIGHTS = {
  "programming language": 1.0,
  "framework": 1.0,      
  "database": 1.0,
  "machine learning": 1.1, 
  "devops": 1.1,
  "cloud": 1.05,
  "tool": 0.9,
  "other": 0.9,
};

export const normalizeSkills = (skills, limit = 15) => {
  return skills
    .map((s) => {
      const category = (s.category || "Other").toLowerCase();
      const weight = CATEGORY_WEIGHTS[category] ?? 1.0;

      let rawScore = Math.min(Math.max(s.score, 30), 100);

      let weightedScore = rawScore * weight;

      const finalScore = Math.round(Math.min(weightedScore, 99));

      return {
        name: s.name.trim(),
        score: finalScore,
        category: s.category,
        source: "resume_analysis", 
      };
    })
    .filter((s) => {
      const name = s.name.toLowerCase();
      const category = (s.category || "").toLowerCase();

      if (GENERIC_SKILLS.includes(name)) return false;
      
      if (name.length < 2 && !["c", "r"].includes(name)) return false;

      if (
        TOOL_CATEGORIES.includes(category) &&
        !ALLOWED_TOOL_EXCEPTIONS.includes(name)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};