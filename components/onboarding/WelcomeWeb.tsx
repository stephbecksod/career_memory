import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const C = {
  moss:      '#5C7A52',
  mossDark:  '#3e5438',
  mossLight: '#7a9e6e',
  walnut:    '#2A2118',
  white:     '#FFFFFF',
};

const FEATURES = [
  { emoji: '🎙️', tint: 'rgba(92,122,82,0.5)',    label: 'Voice-first capture — done in 60 seconds' },
  { emoji: '✨',  tint: 'rgba(201,148,26,0.3)',   label: 'AI turns your words into polished bullets' },
  { emoji: '📋',  tint: 'rgba(173,156,142,0.25)', label: 'Resume-ready when you need it' },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&family=DM+Sans:wght@300;400;500&display=swap');

  .ob-root {
    font-family: 'DM Sans', sans-serif;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: ${C.moss};
  }
  .ob-bg {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, ${C.mossLight} 0%, ${C.moss} 50%, ${C.mossDark} 100%);
  }
  .ob-card {
    position: relative; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
    width: 100%; max-width: 460px;
    padding: 0 28px;
  }
  .ob-logo {
    width: 64px; height: 64px; border-radius: 18px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.14);
    animation: fadeDown 0.5s 0.1s ease both;
  }
  .ob-eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 0.16em;
    text-transform: uppercase; color: rgba(255,255,255,0.42);
    margin-bottom: 10px;
    animation: fadeUp 0.5s 0.18s ease both;
  }
  .ob-headline {
    font-family: 'Nunito', sans-serif;
    font-size: clamp(2rem, 4vw, 2.65rem); font-weight: 800;
    color: ${C.white}; text-align: center;
    line-height: 1.15; letter-spacing: -0.025em;
    margin-bottom: 14px;
    animation: fadeUp 0.5s 0.24s ease both;
  }
  .ob-headline em { color: rgba(255,255,255,0.45); font-style: normal; }
  .ob-subline {
    font-size: 15px; font-weight: 300;
    color: rgba(255,255,255,0.6); text-align: center;
    line-height: 1.65; max-width: 310px; margin-bottom: 28px;
    animation: fadeUp 0.5s 0.30s ease both;
  }
  .ob-features {
    width: 100%; display: flex; flex-direction: column;
    gap: 9px; margin-bottom: 28px;
  }
  .ob-feature {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 11px 14px;
    cursor: default;
    transition: background 0.18s, border-color 0.18s, transform 0.18s;
  }
  .ob-feature:nth-child(1) { animation: fadeUp 0.42s 0.36s ease both; }
  .ob-feature:nth-child(2) { animation: fadeUp 0.42s 0.44s ease both; }
  .ob-feature:nth-child(3) { animation: fadeUp 0.42s 0.52s ease both; }
  .ob-feature:hover {
    background: rgba(255,255,255,0.11);
    border-color: rgba(255,255,255,0.2);
    transform: translateX(3px);
  }
  .ob-feat-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .ob-feat-label {
    font-size: 13.5px; font-weight: 400;
    color: rgba(255,255,255,0.82); letter-spacing: 0.01em;
  }
  .ob-divider {
    width: 100%; height: 1px;
    background: rgba(255,255,255,0.1);
    margin-bottom: 20px;
    animation: fadeUp 0.5s 0.58s ease both;
  }
  .ob-btns {
    width: 100%; display: flex; flex-direction: column;
    gap: 10px;
    animation: fadeUp 0.5s 0.62s ease both;
  }
  .ob-btn {
    width: 100%; padding: 15px 24px; border-radius: 14px;
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    font-weight: 500; cursor: pointer; border: none;
    transition: all 0.18s ease; letter-spacing: 0.01em;
  }
  .ob-btn-primary {
    background: ${C.white}; color: ${C.walnut};
    box-shadow: 0 4px 18px rgba(0,0,0,0.22);
  }
  .ob-btn-primary:hover  { box-shadow: 0 7px 28px rgba(0,0,0,0.28); }
  .ob-btn-primary:active { transform: scale(0.98); }
  .ob-btn-secondary {
    background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75);
    border: 1px solid rgba(255,255,255,0.15);
  }
  .ob-btn-secondary:hover {
    background: rgba(255,255,255,0.13);
    border-color: rgba(255,255,255,0.26);
    color: rgba(255,255,255,0.92);
  }
  .ob-btn-secondary:active { transform: scale(0.98); }
  .ob-footer {
    font-size: 12px; color: rgba(255,255,255,0.28);
    margin-top: 16px; letter-spacing: 0.03em;
    animation: fadeUp 0.5s 0.68s ease both;
  }
  @keyframes fadeDown {
    from { opacity:0; transform:translateY(-12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

interface WelcomeWebProps {
  hasSession: boolean;
  onGetStarted: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export default function WelcomeWeb({ hasSession, onGetStarted, onSignIn, onCreateAccount }: WelcomeWebProps) {
  useEffect(() => {
    const tag = document.createElement('style');
    tag.id = 'ob-web-styles';
    tag.textContent = STYLES;
    if (!document.getElementById('ob-web-styles')) {
      document.head.appendChild(tag);
    }
    return () => {
      const el = document.getElementById('ob-web-styles');
      if (el) el.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* @ts-ignore — web-only dangerouslySetInnerHTML-free approach using className */}
      <div className="ob-root">
        <div className="ob-bg" />
        <div className="ob-card">
          <div className="ob-logo">★</div>
          <p className="ob-eyebrow">Career Memory</p>
          <h1 className="ob-headline">
            Your career,<br /><em>finally</em> remembered.
          </h1>
          <p className="ob-subline">
            Capture what you accomplish as it happens. Use it when it counts — for reviews, resumes, and job searches.
          </p>
          <div className="ob-features">
            {FEATURES.map((f) => (
              <div className="ob-feature" key={f.label}>
                <div className="ob-feat-icon" style={{ background: f.tint }}>{f.emoji}</div>
                <span className="ob-feat-label">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="ob-divider" />
          <div className="ob-btns">
            {hasSession ? (
              <button className="ob-btn ob-btn-primary" onClick={onGetStarted}>
                Get started
              </button>
            ) : (
              <>
                <button className="ob-btn ob-btn-primary" onClick={onSignIn}>
                  Sign in
                </button>
                <button className="ob-btn ob-btn-secondary" onClick={onCreateAccount}>
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </View>
  );
}
