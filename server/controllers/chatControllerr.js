import Groq    from "groq-sdk";
import Booking  from "../models/Booking.js";
import userModel from "../models/usermodel.js";

/* ═══════════════════════════════════════════════════════════════════
   GROQ CLIENT
   Set GROQ_API_KEY in your .env file
═══════════════════════════════════════════════════════════════════ */
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ═══════════════════════════════════════════════════════════════════
   DATE HELPERS
═══════════════════════════════════════════════════════════════════ */
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const diffToMon = d.getDay() === 0 ? -6 : 1 - d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() + diffToMon); mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { start: mon, end: sun };
};

const getMonthRange = (date = new Date()) => ({
  start: new Date(date.getFullYear(), date.getMonth(), 1, 0,0,0,0),
  end:   new Date(date.getFullYear(), date.getMonth() + 1, 0, 23,59,59,999),
});

const getTodayRange     = () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) });
const getYesterdayRange = () => { const y = new Date(); y.setDate(y.getDate()-1); return { start: startOfDay(y), end: endOfDay(y) }; };

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

/* ═══════════════════════════════════════════════════════════════════
   INTENT DETECTION  (for analytics queries)
═══════════════════════════════════════════════════════════════════ */
function detectIntent(msg) {
  const q = msg.toLowerCase().trim();

  const isToday     = /\btoday\b/.test(q);
  const isYesterday = /\byesterday\b/.test(q);
  const isWeek      = /\bthis week\b|\bweek\b|\bweekly\b/.test(q);
  const isMonth     = /\bthis month\b|\bmonth\b|\bmonthly\b/.test(q);
  const isAll       = /\ball time\b|\bever\b|\btotal\b|\boverall\b/.test(q);

  const statusMap = {
    completed: /\bcomplete[d]?\b|\bfinish[ed]?\b|\bdone\b|\bclos[ed]?\b/.test(q),
    pending:   /\bpending\b|\bwaiting\b|\bnot assigned\b/.test(q),
    assigned:  /\bassigned\b|\bnew job[s]?\b/.test(q),
    accepted:  /\baccepted\b|\bconfirm[ed]?\b/.test(q),
    collected: /\bcollect[ed]?\b|\bsample[s]?\b/.test(q),
    cancelled: /\bcancel[led]?\b/.test(q),
  };
  const detectedStatus = Object.keys(statusMap).find((k) => statusMap[k]);

  const isCount    = /\bhow many\b|\bcount\b|\bnumber of\b|\btotal\b/.test(q);
  const isList     = /\bshow\b|\blist\b|\bgive me\b|\bwhat are\b|\bwho are\b|\bwhich\b/.test(q);
  const isEarning  = /\bearn[ed]?\b|\bincome\b|\bmoney\b|\bnpr\b|\bpay[ment]?\b|\brevenue\b/.test(q);
  const isNext     = /\bnext\b|\bupcoming\b|\bschedul[ed]?\b/.test(q);
  const isSummary  = /\bsummary\b|\boverview\b|\bstat[s]?\b|\bdashboard\b|\bperformance\b/.test(q);
  const isLocation = /\barea\b|\blocation\b|\bmunicipality\b|\bward\b|\bwhere\b/.test(q);
  const isReport   = /\breport[s]?\b|\bpending report\b/.test(q);
  const isFarmer   = /\bfarmer[s]?\b|\bclient[s]?\b|\bcustomer[s]?\b/.test(q);

  let period = null;
  if (isToday)     period = "today";
  if (isYesterday) period = "yesterday";
  if (isWeek)      period = "week";
  if (isMonth)     period = "month";
  if (isAll)       period = "all";

  if (isSummary)  return { type: "summary",         params: { period } };
  if (isEarning)  return { type: "earning_estimate", params: { period } };
  if (isReport)   return { type: "pending_reports",  params: {} };
  if (isNext)     return { type: "next_booking",     params: {} };
  if (isLocation) return { type: "top_location",     params: { period } };
  if (isFarmer)   return { type: "list_farmers",     params: {} };
  if (isCount && detectedStatus) return { type: "count_by_status", params: { status: detectedStatus, period } };
  if (isCount && period)         return { type: "count_by_period",  params: { period } };
  if (isList && detectedStatus)  return { type: "list_bookings",    params: { status: detectedStatus, period } };
  if (isList)                    return { type: "list_bookings",    params: { period } };
  if (detectedStatus)            return { type: "count_by_status",  params: { status: detectedStatus, period } };
  if (period)                    return { type: "count_by_period",  params: { period } };

  return { type: "summary", params: {} };
}

function buildDateFilter(period) {
  if (!period || period === "all") return {};
  const ranges = { today: getTodayRange, yesterday: getYesterdayRange, week: getWeekRange, month: getMonthRange };
  const r = ranges[period]?.();
  return r ? { collectionDate: { $gte: r.start, $lte: r.end } } : {};
}

function periodLabel(period) {
  const map = { today: "today", yesterday: "yesterday", week: "this week", month: "this month", all: "overall" };
  return map[period] || "overall";
}

/* ═══════════════════════════════════════════════════════════════════
   HANDLER 1 — ANALYTICS  (reads expert's own DB data)
   POST /api/chat/expert
   Auth: expert JWT required
═══════════════════════════════════════════════════════════════════ */
export const expertChat = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const { message } = req.body;
    if (!message?.trim()) return res.json({ success: false, message: "Please send a message." });

    const expertId = req.user.id;
    const { type, params } = detectIntent(message);
    const dateFilter = buildDateFilter(params.period);
    const label      = periodLabel(params.period);
    const base       = { expert: expertId, ...dateFilter };

    /* ── summary ── */
    if (type === "summary") {
      const all = await Booking.find({ expert: expertId, ...buildDateFilter(params.period) })
        .populate("farmer","name").sort({ collectionDate: -1 });
      const counts = {};
      ["pending","assigned","accepted","collected","completed","cancelled"].forEach((s) => {
        counts[s] = all.filter((b) => b.status === s).length;
      });
      const totalAmount  = all.filter((b) => b.status === "completed").reduce((s, b) => s + (b.amount || 500), 0);
      const recentFields = all.slice(0, 3).map((b) => b.fieldName).join(", ");
      const suffix = params.period ? ` ${label}` : "";
      let reply = `Here is your performance summary${suffix}:\n\n`;
      reply += `• Total bookings: ${all.length}\n• New / Assigned: ${counts.assigned}\n• Accepted: ${counts.accepted}\n`;
      reply += `• Sample collected: ${counts.collected}\n• Completed: ${counts.completed}\n• Cancelled: ${counts.cancelled}\n`;
      reply += `• Estimated earnings: NPR ${totalAmount.toLocaleString()}`;
      if (recentFields) reply += `\n\nRecent fields: ${recentFields}`;
      return res.json({ success: true, reply, intent: type });
    }

    /* ── count by status ── */
    if (type === "count_by_status") {
      const count = await Booking.countDocuments({ ...base, status: params.status });
      const suffix = label ? ` ${label}` : "";
      return res.json({ success: true, reply: `You have ${count} ${params.status} booking${count !== 1 ? "s" : ""}${suffix}.`, intent: type });
    }

    /* ── count by period ── */
    if (type === "count_by_period") {
      const count = await Booking.countDocuments(base);
      return res.json({ success: true, reply: `You have ${count} booking${count !== 1 ? "s" : ""} ${label}.`, intent: type });
    }

    /* ── list bookings ── */
    if (type === "list_bookings") {
      const filter = { ...base };
      if (params.status) filter.status = params.status;
      const bookings = await Booking.find(filter).populate("farmer","name").sort({ collectionDate: 1 }).limit(8);
      if (bookings.length === 0) {
        const suffix = [params.status, label].filter(Boolean).join(" ");
        return res.json({ success: true, reply: `No ${suffix} bookings found.`, intent: type });
      }
      const lines = bookings.map((b, i) =>
        `${i+1}. ${b.fieldName} — ${b.farmer?.name || "Unknown"} — ${b.location?.municipality}, Ward ${b.location?.ward} — ${fmtDate(b.collectionDate)} at ${b.timeSlot} [${b.status.toUpperCase()}]`
      );
      const suffix = [params.status, label].filter(Boolean).join(" ");
      return res.json({ success: true, reply: `Your ${suffix} bookings:\n\n${lines.join("\n")}`, intent: type });
    }

    /* ── earnings ── */
    if (type === "earning_estimate") {
      const completed = await Booking.find({ expert: expertId, status: "completed", ...buildDateFilter(params.period) });
      const total = completed.reduce((s, b) => s + (b.amount || 500), 0);
      const avg   = completed.length > 0 ? Math.round(total / completed.length) : 500;
      const suffix = label ? ` ${label}` : "";
      return res.json({
        success: true,
        reply: `You completed ${completed.length} booking${completed.length !== 1 ? "s" : ""}${suffix}.\nEstimated earnings: NPR ${total.toLocaleString()} (avg NPR ${avg} per booking).`,
        intent: type,
      });
    }

    /* ── next booking ── */
    if (type === "next_booking") {
      const next = await Booking.findOne({
        expert: expertId, status: { $in: ["assigned","accepted"] }, collectionDate: { $gte: new Date() },
      }).populate("farmer","name contactNumber").sort({ collectionDate: 1 });
      if (!next) return res.json({ success: true, reply: "You have no upcoming scheduled bookings at the moment.", intent: type });
      const reply = `Your next booking:\n\n• Field: ${next.fieldName}\n• Farmer: ${next.farmer?.name || "Unknown"}${next.farmer?.contactNumber ? ` (${next.farmer.contactNumber})` : ""}\n• Location: ${next.location?.municipality}, Ward ${next.location?.ward}\n• Date: ${fmtDate(next.collectionDate)}\n• Time: ${next.timeSlot}\n• Status: ${next.status.toUpperCase()}`;
      return res.json({ success: true, reply, intent: type });
    }

    /* ── top locations ── */
    if (type === "top_location") {
      const bookings = await Booking.find({ expert: expertId, ...buildDateFilter(params.period) });
      const locCount = {};
      bookings.forEach((b) => {
        const key = `${b.location?.municipality}, Ward ${b.location?.ward}`;
        locCount[key] = (locCount[key] || 0) + 1;
      });
      const sorted = Object.entries(locCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (sorted.length === 0) return res.json({ success: true, reply: `No location data found ${label}.`, intent: type });
      const lines  = sorted.map(([loc, cnt], i) => `${i+1}. ${loc} — ${cnt} booking${cnt !== 1 ? "s" : ""}`);
      const suffix = label ? ` ${label}` : "";
      return res.json({ success: true, reply: `Your top locations${suffix}:\n\n${lines.join("\n")}`, intent: type });
    }

    /* ── pending reports ── */
    if (type === "pending_reports") {
      const bookings = await Booking.find({ expert: expertId, status: "collected", reportFile: { $in: [null,""] } })
        .populate("farmer","name").sort({ collectionDate: 1 });
      if (bookings.length === 0) return res.json({ success: true, reply: "All your collected bookings have reports uploaded. Nothing pending.", intent: type });
      const lines = bookings.map((b, i) => `${i+1}. ${b.fieldName} — ${b.farmer?.name || "Unknown"} — ${fmtDate(b.collectionDate)}`);
      return res.json({ success: true, reply: `You have ${bookings.length} booking${bookings.length !== 1 ? "s" : ""} missing reports:\n\n${lines.join("\n")}\n\nPlease upload reports before marking them complete.`, intent: type });
    }

    /* ── list farmers ── */
    if (type === "list_farmers") {
      const bookings = await Booking.find({ expert: expertId }).populate("farmer","name email contactNumber").sort({ createdAt: -1 });
      const farmerMap = {};
      bookings.forEach((b) => {
        if (b.farmer?._id) {
          const id = b.farmer._id.toString();
          if (!farmerMap[id]) farmerMap[id] = { name: b.farmer.name, phone: b.farmer.contactNumber, count: 0 };
          farmerMap[id].count++;
        }
      });
      const farmers = Object.values(farmerMap).sort((a, b) => b.count - a.count);
      if (farmers.length === 0) return res.json({ success: true, reply: "No farmers found in your booking history.", intent: type });
      const lines = farmers.slice(0,8).map((f, i) => `${i+1}. ${f.name}${f.phone ? ` (${f.phone})` : ""} — ${f.count} booking${f.count !== 1 ? "s" : ""}`);
      return res.json({ success: true, reply: `Your farmers (${farmers.length} total, showing top 8):\n\n${lines.join("\n")}`, intent: type });
    }

    /* ── fallback ── */
    const all = await Booking.find({ expert: expertId });
    const counts = {};
    ["pending","assigned","accepted","collected","completed","cancelled"].forEach((s) => {
      counts[s] = all.filter((b) => b.status === s).length;
    });
    return res.json({
      success: true,
      reply: `I did not quite understand that. Here is a quick overview:\n\n• Total: ${all.length} bookings\n• Assigned: ${counts.assigned}  |  Accepted: ${counts.accepted}\n• Collected: ${counts.collected}  |  Completed: ${counts.completed}\n• Cancelled: ${counts.cancelled}\n\nTry:\n- "How many tests did I complete this week?"\n- "Show my upcoming bookings"\n- "What are my pending reports?"\n- "Estimate my earnings this month"`,
      intent: "unknown",
    });

  } catch (error) {
    console.error("expertChat error:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   HANDLER 2 — GROQ AI FARMING ADVICE
   POST /api/chat/analyze
   Auth: expert JWT required (or any logged-in user)
   Body: { message: "best fertilizer for rice?" }
═══════════════════════════════════════════════════════════════════ */
export const analyzeChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "Message is required." });

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: "GROQ_API_KEY is not configured in .env" });
    }

    // Build personalized context from expert's data if they are an expert
    let expertContext = "";
    if (req.user?.role === "expert") {
      try {
        const expert = await userModel.findById(req.user.id).select("name labName labMunicipality labWard skills");
        const recentCompleted = await Booking.find({ expert: req.user.id, status: "completed" })
          .sort({ updatedAt: -1 }).limit(5).select("fieldName cropType location soilResults");

        if (expert) {
          expertContext += `\n\nExpert context: The user is ${expert.name}, a soil testing expert`;
          if (expert.labMunicipality) expertContext += ` based in ${expert.labMunicipality}`;
          if (expert.skills?.length)  expertContext += `, specializing in: ${expert.skills.join(", ")}`;
          expertContext += ".";
        }

        if (recentCompleted.length > 0) {
          const cropTypes   = [...new Set(recentCompleted.map((b) => b.cropType).filter(Boolean))];
          const avgPh       = recentCompleted.filter((b) => b.soilResults?.ph).map((b) => b.soilResults.ph);
          const avgPhVal    = avgPh.length ? (avgPh.reduce((a, b) => a + b, 0) / avgPh.length).toFixed(1) : null;

          if (cropTypes.length)  expertContext += ` Recently tested crops include: ${cropTypes.join(", ")}.`;
          if (avgPhVal)          expertContext += ` Average soil pH in their area: ${avgPhVal}.`;
        }
      } catch (_) {
        // context enrichment failed — continue without it
      }
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are AgroSewa AI, an expert agricultural assistant for Nepal. You help soil testing experts and farmers with:
- Crop disease diagnosis and treatment
- Soil health and fertilizer recommendations
- Irrigation and water management
- Pest and weed control
- Seasonal farming advice specific to Nepal
- Interpretation of soil test results (pH, nitrogen, phosphorus, potassium, organic matter)
- Best farming practices for Nepali climate and terrain

Keep answers practical, concise, and easy to understand. Use bullet points when listing recommendations. When soil data is mentioned, provide specific NPK recommendations with quantities per ropani or bigha.${expertContext}`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.65,
      max_tokens:  900,
    });

    const reply = completion.choices?.[0]?.message?.content || "No response received.";
    return res.json({ success: true, data: { response: reply } });

  } catch (error) {
    console.error("analyzeChat Groq error:", error);
    return res.status(500).json({
      success: false,
      message: error?.error?.message || error.message || "AI service failed. Please try again.",
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   HANDLER 3 — SUGGESTIONS (static, no auth needed for GET)
   GET /api/chat/suggestions
═══════════════════════════════════════════════════════════════════ */
export const getSuggestions = (_req, res) => {
  res.json({
    success: true,
    data: {
      suggestions: [
        "How to improve crop yield?",
        "Best fertilizer for rice in Nepal?",
        "How to control pests naturally?",
        "What does low soil pH mean?",
        "Irrigation tips for dry season?",
        "How to read my soil test results?",
        "Signs of nitrogen deficiency in crops?",
        "Best crops for clay soil?",
      ],
    },
  });
};