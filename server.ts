import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Base Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", apiKeyConfigured: !!apiKey });
  });

  // 1. AI COACH: Chat completion with real-time SSE streaming support
  app.post("/api/coach/chat", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing on the server configuration." });
      }

      const { messages, profile, stream } = req.body;
      const recentMessages = messages || [];
      const userProfile = profile || {};

      // Build general prompt instruction with user profile context
      const systemInstruction = `You are Coach AzharFit, a world-class, elite personal trainer and sports nutritionist.
Your mission is to motivate, instruct, and build elite physical trajectories for your athletes.
Be direct, professional, encouraging, and highly technical yet action-oriented.

Athlete Profile:
- Name: ${userProfile.name || "Athlete"}
- Age: ${userProfile.age || "Not specified"}
- Height: ${userProfile.height ? userProfile.height + ' cm' : 'Not specified'}
- Weight: ${userProfile.weight ? userProfile.weight + ' kg' : 'Not specified'}
- Goal: ${userProfile.fitnessGoal || "Build Muscle"}
- Experience: ${userProfile.experienceLevel || "Intermediate"}

Format your responses with clean, readable Markdown (headings, lists, bold keywords, and short tables where appropriate).
Never use dry or robotic language. Focus on physical performance, progressive overload, and solid metabolic nutrition.
Keep your answers comprehensive and tailored to the questions. Address pain points such as knee pain or equipment limitations immediately and offer actionable modifications.`;

      // Sanitize and format messages into chat contents for Gemini API
      // Rules:
      // 1. Must alternate roles: user, model, user, model
      // 2. Must start with "user" role
      // 3. Must end with "user" role
      let chatContents: any[] = [];
      for (const m of recentMessages) {
        if (!m.text || !m.text.trim()) continue;
        const role = m.sender === "user" ? "user" : "model";
        
        if (chatContents.length > 0 && chatContents[chatContents.length - 1].role === role) {
          // Merge text if role matches the last one to preserve alternation
          chatContents[chatContents.length - 1].parts[0].text += "\n" + m.text;
        } else {
          chatContents.push({
            role: role,
            parts: [{ text: m.text }]
          });
        }
      }

      // Ensure start with user
      while (chatContents.length > 0 && chatContents[0].role !== "user") {
        chatContents.shift();
      }

      // Ensure end with user
      while (chatContents.length > 0 && chatContents[chatContents.length - 1].role !== "user") {
        chatContents.pop();
      }

      // Fallback if empty
      if (chatContents.length === 0) {
        const lastUserText = recentMessages.reverse().find((m: any) => m.sender === "user")?.text || "Hello Coach!";
        chatContents.push({
          role: "user",
          parts: [{ text: lastUserText }]
        });
      }

      if (stream) {
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        try {
          const responseStream = await ai.models.generateContentStream({
            model: "gemini-3.5-flash",
            contents: chatContents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });

          for await (const chunk of responseStream) {
            const chunkText = chunk.text || "";
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        } catch (streamErr: any) {
          console.error("Gemini Streaming Error:", streamErr);
          res.write(`data: ${JSON.stringify({ error: streamErr.message || "Streaming error occurred." })}\n\n`);
          res.end();
          return;
        }
      }

      // Non-streaming fallback
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I was unable to formulate a strategy for this rep. Let's try adjusting the target plan.";
      res.json({ text: replyText });
    } catch (err: any) {
      console.error("AI Coach Chat Error:", err);
      res.status(500).json({ error: err.message || "An error occurred during AI inference." });
    }
  });

  // 2. AI WORKOUT GENERATOR (JSON Output)
  app.post("/api/coach/generate-workout", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing." });
      }

      const { prompt, profile } = req.body;
      const userProfile = profile || {};

      const promptText = `Generate a customized workout plan based on this request: "${prompt}".
User profile context:
- Fitness Goal: ${userProfile.fitnessGoal || "Build Muscle"}
- Experience Level: ${userProfile.experienceLevel || "Intermediate"}
- Current Weight: ${userProfile.weight || "Not specified"} kg
- Current Height: ${userProfile.height || "Not specified"} cm

You MUST respond ONLY with a single JSON object (no markdown code blocks, no trailing text, pure raw JSON) matching this structure:
{
  "title": "A highly premium, energetic workout title (e.g. 'Titan Core & Upper Split')",
  "description": "Short description focusing on target muscles and biomechanics (e.g. 'A high-tension split designed to build absolute shoulder stability and bench chest hypertrophy')",
  "duration": 45, // integer (mins)
  "calories": 380, // integer (estimated burned kcal)
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "category": "Strength" | "Hypertrophy" | "Cardio" | "Endurance" | "Recovery",
  "exercises": [
    { "name": "Exercise Name", "sets": 3, "reps": "8-10 reps" },
    { "name": "Exercise Name 2", "sets": 4, "reps": "10-12 reps" }
  ]
}

Provide 4 to 6 specific exercises. Take into account any pain or equipment constraints specified in the prompt. Make sure reps matches typical ranges.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const jsonString = response.text || "{}";
      const workoutPlan = JSON.parse(jsonString);
      res.json(workoutPlan);
    } catch (err: any) {
      console.error("AI Workout Generator Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate workout plan." });
    }
  });

  // 3. AI MEAL PLANNER (JSON Output)
  app.post("/api/coach/generate-meal", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing." });
      }

      const { prompt, profile } = req.body;
      const userProfile = profile || {};

      const promptText = `Generate a customized premium meal plan based on this request: "${prompt}".
User profile context:
- Fitness Goal: ${userProfile.fitnessGoal || "Lose Fat / Build Muscle"}
- Current Weight: ${userProfile.weight || "75"} kg
- Caloric Target context: ${userProfile.caloriesBurnedGoal ? userProfile.caloriesBurnedGoal + 1500 : 2200} kcal

You MUST respond ONLY with a single JSON object (no markdown blocks, no trailing comments, pure raw JSON) matching this structure:
{
  "title": "Name of the meal plan (e.g., 'Metabolic Fat Oxidation Protocol')",
  "description": "Brief description highlighting nutritional integrity and metabolic targets",
  "caloriesTarget": 2200,
  "proteinTarget": 160,
  "carbsTarget": 200,
  "fatsTarget": 70,
  "meals": [
    { "name": "Meal Name", "type": "Breakfast" | "Lunch" | "Dinner" | "Snack", "calories": 500, "protein": 40, "carbs": 50, "fats": 15 },
    { "name": "Meal Name 2", "type": "Lunch", "calories": 650, "protein": 50, "carbs": 60, "fats": 20 }
  ]
}

Ensure the meal list contains at least 3-4 entries (e.g. Breakfast, Lunch, Dinner, Snack). Balance macros cleanly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const jsonString = response.text || "{}";
      const mealPlan = JSON.parse(jsonString);
      res.json(mealPlan);
    } catch (err: any) {
      console.error("AI Meal Planner Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate meal plan." });
    }
  });

  // 4. AI PROGRESS ANALYSIS & REPORTS
  app.post("/api/coach/analyze-progress", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing." });
      }

      const { logs, profile } = req.body;
      const userProfile = profile || {};
      const { weightHistory, sleepLogs, completedWorkoutsCount, streak } = logs || {};

      const weightStr = weightHistory && weightHistory.length > 0
        ? weightHistory.map((w: any) => `Date: ${w.date}, Weight: ${w.value}kg`).join("; ")
        : "No historical logs yet.";

      const sleepStr = sleepLogs && sleepLogs.length > 0
        ? sleepLogs.slice(0, 5).map((s: any) => `Date: ${s.date}, Hours: ${s.hours}, Quality: ${s.quality}`).join("; ")
        : "No sleep logs yet.";

      const promptText = `Analyze this athlete's logs and generate a professional, highly encouraging fitness and nutrition coach report.
Athlete Profile:
- Goal: ${userProfile.fitnessGoal || "Build Muscle"}
- Experience Level: ${userProfile.experienceLevel || "Intermediate"}
- Current Streak: ${streak || 0} days
- Completed Workouts: ${completedWorkoutsCount || 0} sessions

Logs:
- Weight History: ${weightStr}
- Sleep Logs (Last 5 nights): ${sleepStr}

Please construct a comprehensive report in beautiful Markdown with the following sections:
1. ### EXECUTIVE PERFORMANCE SUMMARY
   Synthesize their overall compliance and current trajectory.
2. ### TRACKING HIGHLIGHTS
   Acknowledge positive logs (streak, workout compliance, hydration milestones, or consistent weights).
3. ### METABOLIC & BIOMETRIC CRITIQUE
   Analyze their weight trends or sleep quality. Connect sleep hours/quality with skeletal muscle repair and CNS restoration.
4. ### TACTICAL ADVICE & STRATEGIES
   Provide 3 to 4 hyper-specific action items to optimize their workout splits, sleep setups, or eating timelines over the next 14 days.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          temperature: 0.7,
        }
      });

      res.json({ report: response.text || "Unable to parse biometric trends. Let's record more sessions first." });
    } catch (err: any) {
      console.error("AI Progress Analyzer Error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze progress." });
    }
  });

  // 5. AI GOAL RECOMMENDATIONS
  app.post("/api/coach/recommend-goals", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing." });
      }

      const { profile } = req.body;
      const userProfile = profile || {};

      const promptText = `Recommend 3 tailored high-performance fitness/nutrition goals based on this profile:
- Name: ${userProfile.name || "Athlete"}
- Gender: ${userProfile.gender || "Not specified"}
- Age: ${userProfile.age || "Not specified"}
- Weight: ${userProfile.weight || "Not specified"} kg
- Height: ${userProfile.height || "Not specified"} cm
- Goal Context: ${userProfile.fitnessGoal || "General Conditioning"}

Write your recommendations in clean, scannable Markdown. Each goal should contain:
- Title of Goal (bold)
- Description of why it makes biomechanical/nutritional sense for them
- Measurable key results or milestones (e.g. 'Log 3 Liters of water daily', 'Increase 1RM Bench by 5kg')`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          temperature: 0.7,
        }
      });

      res.json({ recommendations: response.text || "No goals available. Let's start with recording water and workouts!" });
    } catch (err: any) {
      console.error("AI Goal Recommendations Error:", err);
      res.status(500).json({ error: err.message || "Failed to recommend goals." });
    }
  });

  // 6. AI FORM CORRECTION SUGGESTIONS
  app.post("/api/coach/form-correction", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing." });
      }

      const { exerciseName, description } = req.body;

      const promptText = `Provide elite form corrections, biomechanical cues, and safety guidelines for the following:
Exercise Name: ${exerciseName}
Athlete Form Description: "${description}"

Generate a short, tactical guide in Markdown addressing:
1. **Critical Biomechanical Flaws**: Highlight risk points based on their description.
2. **Coach Cues & Adjustments**: Provide 3 powerful, mental/physical cues (e.g., 'Drive through heels', 'Keep elbows at 45 degrees').
3. **Alternative Progressions**: Suggest 1 modification if pain/limitations occur.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          temperature: 0.7,
        }
      });

      res.json({ correction: response.text || "Keep core tight and execute with controlled concentric force!" });
    } catch (err: any) {
      console.error("AI Form Correction Error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze technique." });
    }
  });

  // Vite integration / Static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
