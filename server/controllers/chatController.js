import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ==========================================
   Analyze Chat Message (Nepal Focused)
========================================== */
export const analyzeChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
तपाईं AgroSewa AI हुनुहुन्छ। 
नेपालको कृषि प्रणाली, हावापानी, माटो, सिँचाइ, धान, मकै, गहुँ, तरकारी, पशुपालन लगायत विषयमा विशेषज्ञ सल्लाह दिनुहोस्।

जवाफ सधैं:
- नेपाली (देवनागरी लिपि) मा दिनुहोस्।
- नेपाल केन्द्रित सल्लाह दिनुहोस्।
- सरल र किसानमैत्री भाषामा दिनुहोस्।
- आवश्यक परेमा बुँदागत रूपमा लेख्नुहोस्।
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const reply =
      completion.choices?.[0]?.message?.content || "जवाफ उपलब्ध भएन।";

    return res.json({
      success: true,
      data: {
        response: reply,
      },
    });
  } catch (error) {
    console.log("🔥 GROQ ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Chatbot failed",
    });
  }
};
