import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ═══════════════════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════════════════ */
const LeafIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const BackIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const BotIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M12 2a3 3 0 0 1 3 3v6H9V5a3 3 0 0 1 3-3Z"/>
    <path d="M8 20v1M16 20v1M9 14h.01M15 14h.01"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.3l-6.2 4.4 2.4-7.6L2 9.6h7.6z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

/** Renders **bold** and bullet markdown */
const MessageText = ({ text }) =>
  text.split("\n").map((line, i, arr) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const bullet = /^[•\-\*]\s/.test(line);
    return (
      <span key={i} style={bullet ? { display: "block", paddingLeft: "6px" } : {}}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });

const TypingIndicator = () => (
  <div className="typing-dots"><span /><span /><span /></div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const ChatPage = () => {
  const { t, i18n } = useTranslation();

  /* ── State ── */
  const [messages,      setMessages]      = useState([]);
  const [inputMessage,  setInputMessage]  = useState("");
  const [isLoading,     setIsLoading]     = useState(false);
  const [showWelcome,   setShowWelcome]   = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [charCount,     setCharCount]     = useState(0);

  /* ── Refs ── */
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const bodyRef     = useRef(null);

  /* ── Suggestions from i18n (re-computed when language changes) ── */
  const suggestions = [
    t("chatSuggestion1"), t("chatSuggestion2"),
    t("chatSuggestion3"), t("chatSuggestion4"),
    t("chatSuggestion5"), t("chatSuggestion6"),
  ];

  /* ── Auto-scroll on new message ── */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  /* ── Show scroll-to-bottom FAB when user scrolls up ── */
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [inputMessage]);

  /* ── Send message ── */
  const sendMessage = useCallback(async (text = inputMessage) => {
    const userText = (typeof text === "string" ? text : inputMessage).trim();
    if (!userText || isLoading) return;

    const userMsg = { id: Date.now(), role: "user", text: userText, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setCharCount(0);
    setShowWelcome(false);
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chat/analyze`,
        { message: userText },
        { headers: { "Content-Type": "application/json" } }
      );
      const reply = res.data?.data?.response;
      if (!reply) throw new Error("Empty response");
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: reply, ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "bot",
        text: t("chatError"), ts: new Date(), isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, t]);

  const clearChat  = () => { setMessages([]); setShowWelcome(true); };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  const handleInput = (e) => { setInputMessage(e.target.value); setCharCount(e.target.value.length); };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString(
      i18n.language === "ne" ? "ne-NP" : "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );

  /* ── Render ── */
  return (
    <>
      <div className="cp-root">

        {/* Fixed background blobs — behind everything */}
        <div className="cp-blob cp-blob-tl" />
        <div className="cp-blob cp-blob-br" />

        {/* ════════════════════════════════════════════════════
            HEADER  ← fixed height, NEVER scrolls
        ════════════════════════════════════════════════════ */}
        <header className="cp-header">
          <div className="cp-header-glow" />

          {/* Back */}
          <button className="cp-btn cp-btn--back" onClick={() => window.history.back()}>
            <BackIcon /><span className="hide-xs">{t("back")}</span>
          </button>

          {/* Identity */}
          <div className="cp-identity">
            <div className="cp-avatar">
              <LeafIcon size={22} />
              <span className="cp-avatar-dot" />
            </div>
            <div>
              <h1 className="cp-brand">{t("agroSewaAI")}</h1>
              <p className="cp-status"><span className="cp-blink" />{t("chatOnlineStatus")}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="cp-header-right">
            {messages.length > 0 && (
              <span className="cp-count-badge"><SparkleIcon />{messages.length}</span>
            )}
            <button className="cp-btn cp-btn--clear" onClick={clearChat} title={t("clearChat")}>
              <TrashIcon /><span className="hide-xs">{t("clearChat")}</span>
            </button>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════
            BODY  ← THE ONLY SCROLLABLE REGION
        ════════════════════════════════════════════════════ */}
        <main className="cp-body" ref={bodyRef}>

          {/* Welcome */}
          {showWelcome && messages.length === 0 && (
            <div className="cp-welcome">
              <div className="cp-orb">
                <LeafIcon size={46} />
                <div className="cp-orb-ring r1" />
                <div className="cp-orb-ring r2" />
              </div>

              <h2 className="cp-welcome-title">{t("chatGreeting")}</h2>
              <p className="cp-welcome-sub">{t("chatWelcomeSub1")}<br />{t("chatWelcomeSub2")}</p>

              <div className="cp-tip-badge">
                <SunIcon /><span>{t("chatDailyTip")}</span>
              </div>

              <div className="cp-suggestions">
                <p className="cp-suggestions-label">{t("chatCommonQuestions")}</p>
                <div className="cp-chips-grid">
                  {suggestions.map((s, i) => (
                    <button key={i} className="cp-chip" onClick={() => sendMessage(s)}>
                      <span className="cp-chip-num">{i + 1}</span>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Thread */}
          <div className="cp-thread">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`cp-msg ${isUser ? "cp-msg--user" : "cp-msg--bot"}`}
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.15)}s` }}
                >
                  {!isUser && <div className="cp-av cp-av--bot"><BotIcon /></div>}
                  <div className={`cp-bubble ${isUser ? "cp-bubble--user" : "cp-bubble--bot"} ${msg.isError ? "cp-bubble--err" : ""}`}>
                    <div className="cp-bubble-text"><MessageText text={msg.text} /></div>
                    <time className="cp-bubble-ts">{formatTime(msg.ts)}</time>
                  </div>
                  {isUser && <div className="cp-av cp-av--user"><UserIcon /></div>}
                </div>
              );
            })}

            {isLoading && (
              <div className="cp-msg cp-msg--bot">
                <div className="cp-av cp-av--bot"><BotIcon /></div>
                <div className="cp-bubble cp-bubble--bot cp-bubble--typing"><TypingIndicator /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Scroll-to-bottom FAB */}
        {showScrollBtn && (
          <button className="cp-fab" onClick={scrollToBottom} aria-label="Scroll to bottom">
            <ChevronDownIcon />
          </button>
        )}

        {/* ════════════════════════════════════════════════════
            FOOTER  ← fixed height, NEVER scrolls
        ════════════════════════════════════════════════════ */}
        <footer className="cp-footer">
          {/* Quick chips mid-conversation */}
          {!showWelcome && !isLoading && (
            <div className="cp-quick-chips">
              {suggestions.slice(0, 3).map((s, i) => (
                <button key={i} className="cp-chip cp-chip--sm" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="cp-input-wrap">
            <div className={`cp-input-box ${isLoading ? "cp-input-box--off" : ""}`}>
              <textarea
                ref={textareaRef}
                className="cp-textarea"
                value={inputMessage}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={t("chatInputPlaceholder")}
                rows={1}
                disabled={isLoading}
                maxLength={1000}
              />
              {charCount > 0 && (
                <span className={`cp-char ${charCount > 900 ? "cp-char--warn" : ""}`}>
                  {charCount}/1000
                </span>
              )}
              <button
                className="cp-send"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                title={t("send")}
              >
                <SendIcon />
              </button>
            </div>
          </div>

          <p className="cp-disclaimer">{t("chatDisclaimer")}</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Noto+Sans:wght@300;400;500;600&family=Noto+Sans+Devanagari:wght@300;400;500;600&display=swap');

        :root {
          --g7: #2d6a4f; --g6: #40916c; --g4: #74c69d;
          --g1: #d8f3dc; --g0: #f0faf4;
          --a6: #d97706; --a1: #fef3c7;
          --r6: #dc2626; --r0: #fef2f2;
          --ink:  #0f1f17; --ink2: #1b3828; --ink3: #3a5c46;
          --ink4: #6b8f7a; --ink5: #a8c4b2; --ink6: #ccdfd5;
          --white: #fff;
          --sh0: 0 1px 3px rgba(15,31,23,.07);
          --sh1: 0 3px 12px rgba(15,31,23,.10);
          --r-sm: 10px; --r-md: 16px; --r-pill: 100px;
          --f-head: 'Fraunces', Georgia, serif;
          --f-body: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
          --ease: cubic-bezier(.4,0,.2,1);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: var(--f-body); cursor: pointer; }

        /* ── Root: exact viewport, no overflow leaks ── */
        .cp-root {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;       /* ← nothing escapes this box */
          position: relative;
          font-family: var(--f-body);
          background: var(--g0);
          color: var(--ink);
        }

        /* ── Fixed decorative blobs ── */
        .cp-blob {
          position: fixed; border-radius: 50%;
          filter: blur(90px); opacity: .18;
          pointer-events: none; z-index: 0;
          animation: blobDrift 14s ease-in-out infinite;
        }
        .cp-blob-tl { width: 460px; height: 460px; background: radial-gradient(circle, var(--g4), transparent 70%); top: -150px; left: -90px; }
        .cp-blob-br { width: 340px; height: 340px; background: radial-gradient(circle, #b7e4c7, transparent 70%); bottom: -100px; right: -70px; animation-direction: reverse; animation-duration: 18s; }
        @keyframes blobDrift {
          0%,100% { transform: translate(0,0); }
          45%     { transform: translate(26px,-36px); }
          70%     { transform: translate(-16px,16px); }
        }

        /* ════════ HEADER — flex-shrink:0, NEVER scrolls ════════ */
        .cp-header {
          flex-shrink: 0;              /* critical — stays fixed height */
          position: relative;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 18px;
          background: rgba(255,255,255,.84);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--ink6);
          box-shadow: var(--sh0);
          overflow: hidden;
        }
        /* Ambient glow in header */
        .cp-header-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 130px 55px at 78% 55%, rgba(116,198,157,.13), transparent),
            radial-gradient(ellipse 70px 35px at 18% 60%, rgba(64,145,108,.09), transparent);
          animation: glowShift 9s ease-in-out infinite alternate;
        }
        @keyframes glowShift {
          from { opacity: .7; transform: translateX(0); }
          to   { opacity: 1;  transform: translateX(8px); }
        }

        .cp-identity {
          display: flex; align-items: center; gap: 10px;
          flex: 1; justify-content: center;
        }
        .cp-avatar {
          position: relative;
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(145deg, var(--g7), var(--g6));
          color: var(--white);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(45,106,79,.3);
          flex-shrink: 0;
        }
        .cp-avatar-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #22c55e; border: 2px solid var(--white);
          animation: dotGlow 2.5s ease-in-out infinite;
        }
        @keyframes dotGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        .cp-brand {
          font-family: var(--f-head);
          font-size: 17px; font-weight: 700;
          color: var(--ink); letter-spacing: -.2px; line-height: 1.2;
        }
        .cp-status {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: var(--ink4); margin-top: 1px;
        }
        .cp-blink {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .28; } }

        .cp-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 11px; border-radius: var(--r-sm);
          border: 1px solid var(--ink6); background: var(--white);
          color: var(--ink3); font-size: 12.5px; font-weight: 500;
          transition: all .17s var(--ease);
          white-space: nowrap; flex-shrink: 0;
        }
        .cp-btn--back:hover { border-color: var(--g6); color: var(--g7); background: var(--g0); }
        .cp-btn--clear:hover { border-color: var(--r6); color: var(--r6); background: var(--r0); }

        .cp-header-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
        .cp-count-badge {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 9px; border-radius: var(--r-pill);
          background: var(--g1); color: var(--g7);
          font-size: 11.5px; font-weight: 600;
          border: 1px solid rgba(64,145,108,.2);
        }

        /* ════════ BODY — THE ONLY SCROLLING REGION ════════ */
        .cp-body {
          flex: 1;              /* fill all remaining space */
          overflow-y: auto;     /* scrolls here and ONLY here */
          overflow-x: hidden;
          position: relative; z-index: 1;
          padding: 24px 16px 20px;
          scroll-behavior: smooth;
        }
        .cp-body::-webkit-scrollbar { width: 4px; }
        .cp-body::-webkit-scrollbar-track { background: transparent; }
        .cp-body::-webkit-scrollbar-thumb { background: var(--ink6); border-radius: 99px; }

        /* Welcome */
        .cp-welcome {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 16px 0 56px;
          animation: fadeUp .5s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cp-orb {
          position: relative;
          width: 96px; height: 96px; border-radius: 50%;
          background: linear-gradient(145deg, var(--g7), var(--g6));
          color: var(--white);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          box-shadow: 0 12px 36px rgba(45,106,79,.28);
          animation: orbFloat 4.5s ease-in-out infinite;
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-9px) rotate(2deg); }
        }
        .cp-orb-ring {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(45,106,79,.15);
          animation: ringBreath 3.6s ease-in-out infinite;
        }
        .cp-orb-ring.r1 { inset: -13px; }
        .cp-orb-ring.r2 { inset: -27px; animation-delay: .55s; }
        @keyframes ringBreath {
          0%,100% { opacity: .5; transform: scale(1); }
          50%      { opacity: .14; transform: scale(1.05); }
        }
        .cp-welcome-title {
          font-family: var(--f-head);
          font-size: 25px; font-weight: 700;
          color: var(--ink); margin-bottom: 10px; letter-spacing: -.3px;
        }
        .cp-welcome-sub {
          font-size: 14.5px; color: var(--ink4);
          line-height: 1.78; max-width: 360px; margin-bottom: 20px;
        }
        .cp-tip-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 16px;
          background: var(--a1); border: 1px solid #fde68a;
          border-radius: var(--r-pill);
          font-size: 12.5px; color: var(--a6); font-weight: 500;
          margin-bottom: 32px;
          animation: tipIn 1s ease .3s both;
        }
        @keyframes tipIn {
          from { opacity: 0; transform: scale(.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .cp-suggestions { width: 100%; max-width: 560px; }
        .cp-suggestions-label {
          font-size: 11px; font-weight: 600; letter-spacing: .8px;
          text-transform: uppercase; color: var(--ink4); margin-bottom: 12px;
        }
        .cp-chips-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        /* Chips */
        .cp-chip {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 13px; border-radius: var(--r-sm);
          border: 1px solid var(--ink6); background: var(--white);
          color: var(--ink2); font-size: 13px; line-height: 1.4;
          text-align: left;
          transition: all .17s var(--ease);
          box-shadow: var(--sh0);
        }
        .cp-chip:hover {
          border-color: var(--g6); background: var(--g0); color: var(--g7);
          transform: translateY(-2px); box-shadow: var(--sh1);
        }
        .cp-chip-num {
          flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%;
          background: var(--g1); color: var(--g7);
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; margin-top: 1px;
        }
        .cp-chip--sm {
          font-size: 12px; padding: 6px 12px;
          border-radius: var(--r-pill); display: inline-flex;
          align-items: center; gap: 0;
        }
        .cp-chip--sm .cp-chip-num { display: none; }

        /* Thread */
        .cp-thread { display: flex; flex-direction: column; gap: 14px; max-width: 700px; margin: 0 auto; }
        .cp-msg { display: flex; align-items: flex-end; gap: 8px; animation: msgIn .26s ease both; }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cp-msg--user { flex-direction: row-reverse; }

        /* Avatars */
        .cp-av {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cp-av--bot { background: linear-gradient(145deg, var(--g7), var(--g6)); color: var(--white); box-shadow: 0 2px 8px rgba(45,106,79,.26); }
        .cp-av--user { background: linear-gradient(145deg, var(--a6), #b45309); color: var(--white); box-shadow: 0 2px 8px rgba(217,119,6,.26); }

        /* Bubbles */
        .cp-bubble {
          max-width: min(70%, 500px); padding: 11px 15px;
          border-radius: var(--r-md); box-shadow: var(--sh0);
        }
        .cp-bubble--bot { background: var(--white); border: 1px solid var(--ink6); border-bottom-left-radius: 4px; }
        .cp-bubble--user { background: linear-gradient(145deg, var(--g7), var(--g6)); color: var(--white); border-bottom-right-radius: 4px; }
        .cp-bubble--err { background: var(--r0) !important; border-color: #fca5a5 !important; color: var(--r6) !important; }
        .cp-bubble--typing { padding: 10px 14px; }
        .cp-bubble-text { font-size: 14.5px; line-height: 1.72; word-break: break-word; white-space: pre-wrap; }
        .cp-bubble--user .cp-bubble-text { color: rgba(255,255,255,.96); }
        .cp-bubble--user .cp-bubble-text strong { color: #fff; }
        .cp-bubble-ts { display: block; font-size: 10px; margin-top: 5px; opacity: .4; text-align: right; }

        /* Typing dots */
        .typing-dots { display: flex; gap: 4px; align-items: center; }
        .typing-dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--ink4); animation: dotBounce 1.3s ease-in-out infinite; }
        .typing-dots span:nth-child(2) { animation-delay: .16s; }
        .typing-dots span:nth-child(3) { animation-delay: .32s; }
        @keyframes dotBounce {
          0%,60%,100% { transform: translateY(0); opacity: .35; }
          30%          { transform: translateY(-7px); opacity: 1; }
        }

        /* Scroll FAB */
        .cp-fab {
          position: fixed; bottom: 100px; right: 20px; z-index: 300;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--ink6); background: var(--white);
          color: var(--g7); display: flex; align-items: center; justify-content: center;
          box-shadow: var(--sh1); transition: all .17s var(--ease);
          animation: fabIn .2s ease;
        }
        @keyframes fabIn { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }
        .cp-fab:hover { background: var(--g0); border-color: var(--g6); transform: scale(1.08); }

        /* ════════ FOOTER — flex-shrink:0, NEVER scrolls ════════ */
        .cp-footer {
          flex-shrink: 0;            /* critical */
          z-index: 200;
          background: rgba(255,255,255,.86);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid var(--ink6);
          padding: 10px 16px 14px;
        }
        .cp-quick-chips {
          display: flex; flex-wrap: wrap; gap: 6px;
          margin-bottom: 8px;
          max-width: 700px; margin-left: auto; margin-right: auto;
        }
        .cp-input-wrap { max-width: 700px; margin: 0 auto; }
        .cp-input-box {
          display: flex; align-items: flex-end; gap: 8px;
          background: var(--white); border: 1.5px solid var(--ink6);
          border-radius: var(--r-md); padding: 9px 9px 9px 14px;
          transition: all .17s var(--ease); box-shadow: var(--sh0);
        }
        .cp-input-box:focus-within { border-color: var(--g6); box-shadow: 0 0 0 3px rgba(64,145,108,.12); }
        .cp-input-box--off { opacity: .6; pointer-events: none; }
        .cp-textarea {
          flex: 1; background: none; border: none; outline: none; resize: none;
          font-family: var(--f-body); font-size: 14.5px; color: var(--ink);
          line-height: 1.55; max-height: 140px; overflow-y: auto;
        }
        .cp-textarea::placeholder { color: var(--ink5); }
        .cp-char {
          font-size: 10.5px; color: var(--ink4); flex-shrink: 0;
          align-self: flex-end; margin-bottom: 9px; transition: color .17s;
        }
        .cp-char--warn { color: var(--r6); }
        .cp-send {
          width: 37px; height: 37px; border-radius: 50%; border: none;
          background: linear-gradient(145deg, var(--g7), var(--g6));
          color: var(--white); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all .17s var(--ease);
          box-shadow: 0 3px 12px rgba(45,106,79,.3);
        }
        .cp-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 5px 16px rgba(45,106,79,.42); }
        .cp-send:active:not(:disabled) { transform: scale(.92); }
        .cp-send:disabled { opacity: .28; cursor: not-allowed; box-shadow: none; }
        .cp-disclaimer {
          font-size: 11px; color: var(--ink4); text-align: center;
          margin-top: 7px; line-height: 1.5;
          max-width: 500px; margin-left: auto; margin-right: auto;
        }

        /* Responsive */
        .hide-xs { }
        @media (max-width: 580px) {
          .hide-xs { display: none; }
          .cp-header { padding: 10px 12px; }
          .cp-brand { font-size: 15px; }
          .cp-btn { padding: 7px 9px; }
          .cp-body { padding: 16px 10px 12px; }
          .cp-footer { padding: 8px 10px 12px; }
          .cp-bubble { max-width: 86%; }
          .cp-chips-grid { grid-template-columns: 1fr; }
          .cp-orb { width: 80px; height: 80px; }
          .cp-welcome-title { font-size: 21px; }
          .cp-fab { bottom: 86px; right: 12px; }
        }
      `}</style>
    </>
  );
};

export default ChatPage;