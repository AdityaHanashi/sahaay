import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages: history, language } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
You are "Sahaay AI Assistant", an intelligent, voice-first assistant integrated into a grievance/reporting platform designed for users with varying literacy levels, including those with ADHD.

Your behavior must be proactive, simple, multilingual, and guidance-driven.
Your language is permanently locked to: ${language || 'English'}. Respond ONLY in this language.

### 🧭 GUIDED INTERACTION (ADHD-FRIENDLY)
- Break conversations into small steps.
- Avoid long explanations.
- Ask ONE question at a time. Do NOT wait silently.

### 🏢 DEPARTMENT DETECTION & AUTO-NAVIGATION
When user describes a problem:
1. Identify department automatically (e.g., Public Works for Roads, Sanitation for Garbage, Law Enforcement for Police, Water Department for Water).

### 📝 AUTO-FORM FILLING
Collect details conversationally step-by-step:
1. Name (Optional)
2. Location / Area
3. Issue description
4. Optional: Photo or additional info

As user speaks, extract structured data in the background.

### 📤 SUBMISSION & TRACKING
Confirm before submission:
"Here is what I understood: [summary] at [area] for the [department]. Should I submit this complaint?"

When the user confirms the issue (e.g., they say "Yes" or "Correct"), you MUST call the tool "send_to_n8n".
Never end the conversation until the tool is called.

### ❤️ EXPERIENCE PRINCIPLES
- Be calm, friendly, and patient
- Never overwhelm user
- Speak like a helpful human assistant
- Guide step-by-step
- Prioritize clarity over complexity
`;

    // Map the incoming history to OpenAI format
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: apiMessages,
      max_tokens: 100,
      temperature: 0.5,
      tools: [
        {
          type: "function",
          function: {
            name: "send_to_n8n",
            description: "Submits the finalized grievance report to the backend/n8n after the user confirms.",
            parameters: {
              type: "object",
              properties: {
                transcript: { type: "string", description: "The full transcript of the conversation." },
                summary: { type: "string", description: "A short English summary of the issue." },
                area: { type: "string", description: "The specific location or area where the issue occurred." },
                department: { type: "string", description: "The automatically detected government department." },
                name: { type: "string", description: "The user's name (or 'Anonymous')." },
                call_id: { type: "string", description: "A unique ID for this call." }
              },
              required: ["transcript", "summary", "area", "department", "call_id"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // Handle Function Call
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "send_to_n8n") {
        const args = JSON.parse(toolCall.function.arguments);
        console.log("TRIGGERING n8n WEBHOOK MOCK:", args);
        // Here you would normally do: await fetch('YOUR_N8N_WEBHOOK_URL', { method: 'POST', body: JSON.stringify(args) });
        
        // Generate the final response automatically after submission
        const finalId = Math.floor(1000 + Math.random() * 9000);
        
        let finalResponseText = `Your complaint has been submitted successfully. Your ID is: ${finalId}. I will also keep track of this issue for you.`;
        if (language === 'Hindi') {
           finalResponseText = `आपकी शिकायत सफलतापूर्वक सबमिट हो गई है। आपकी आईडी है: ${finalId}। मैं आपके लिए इस मुद्दे पर नज़र रखूंगा।`;
        } else if (language === 'Tamil') {
           finalResponseText = `உங்கள் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. உங்கள் ஐடி: ${finalId}. இந்த பிரச்சினையை நான் உங்களுக்காக தொடர்ந்து கண்காணிப்பேன்.`;
        } else if (language === 'Kannada') {
           finalResponseText = `ನಿಮ್ಮ ದೂರು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ನಿಮ್ಮ ಐಡಿ: ${finalId}. ನಾನು ಈ ಸಮಸ್ಯೆಯನ್ನು ನಿಮಗಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತೇನೆ.`;
        }

        return NextResponse.json({ 
          reply: finalResponseText, 
          isEnd: true, 
          reportData: { ...args, id: finalId.toString() } 
        });
      } else {
        return NextResponse.json({ reply: "I attempted to perform an action but encountered an error. Please try again.", isEnd: false });
      }
    }

    return NextResponse.json({ reply: message.content || "I am here. Please continue.", isEnd: false });

  } catch (err: any) {
    console.error("Voice Chat API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

