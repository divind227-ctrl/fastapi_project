import { useState, useEffect, useRef } from "react";

const COLORS = {
  ink: "#0B0F14",
  panel: "#151B22",
  line: "#2A333C",
  text: "#E8E6E1",
  muted: "#7C8892",
  brass: "#C9A227",
  brassDim: "#8A701E",
};

export default function StatusPage3D() {
  const [time, setTime] = useState("");
  const [ms, setMs] = useState(0);
  const targetMs = useRef(8 + Math.floor(Math.random() * 20));
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [entered, setEntered] = useState(false);

  // live clock
  useEffect(() => {
    const paint = () => setTime(new Date().toLocaleTimeString([], { hour12: false }));
    paint();
    const id = setInterval(paint, 1000);
    return () => clearInterval(id);
  }, []);

  // one-time count-up
  useEffect(() => {
    let current = 0;
    let frame;
    const step = () => {
      current += Math.max(1, Math.round((targetMs.current - current) / 4));
      if (current >= targetMs.current) return setMs(targetMs.current);
      setMs(current);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  // one-time entrance
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0 -> 1
    const py = (e.clientY - rect.top) / rect.height;    // 0 -> 1
    const ry = (px - 0.5) * 14;   // rotateY range
    const rx = (0.5 - py) * 10;   // rotateX range
    setTilt({ rx, ry });
  };

  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div style={styles.scene}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(201,162,39,0.55); }
          70% { box-shadow: 0 0 0 12px rgba(201,162,39,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,162,39,0); }
        }
        @keyframes drift {
          0%   { transform: translate3d(0,0,0) scale(1); }
          50%  { transform: translate3d(-2%, 3%, 0) scale(1.05); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        .live-dot { animation: pulse 1.8s ease-out 1; }
        .orb { animation: drift 14s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .live-dot, .orb { animation: none !important; }
        }
      `}</style>

      {/* ambient depth field */}
      <div className="orb" style={styles.orbA}></div>
      <div className="orb" style={styles.orbB}></div>

      <div style={styles.stage}>
        <div
          ref={cardRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{
            ...styles.card,
            transform: `
              perspective(1200px)
              rotateX(${tilt.rx + (entered ? 0 : 8)}deg)
              rotateY(${tilt.ry + (entered ? 0 : -10)}deg)
              translateZ(0)
            `,
            opacity: entered ? 1 : 0,
            transition: entered
              ? "transform 120ms ease-out"
              : "opacity 700ms ease, transform 700ms ease",
          }}
        >
          <div style={{ ...styles.layer, transform: "translateZ(50px)" }}>
            <div style={styles.bar}>
              <span style={styles.project}>fastapi_project</span>
              <span style={styles.status}>
                <span className="live-dot" style={styles.dot}></span>
                live
              </span>
            </div>
          </div>

          <div style={{ ...styles.layer, transform: "translateZ(70px)" }}>
            <h1 style={styles.h1}>
              Hi, this is a <em style={styles.em}>test</em> message.
            </h1>
            <p style={styles.lede}>
              Your index route rendered correctly. This page replaces the
              default scaffold with a small status readout so you can see
              exactly what the server sent back.
            </p>
          </div>

          <div style={{ ...styles.layer, transform: "translateZ(40px)" }}>
            <div style={styles.readout}>
              <Row k="route" v="GET /" />
              <Row k="status" v="200 OK" accent />
              <Row k="response time" v={`${ms} ms`} />
              <Row k="served at" v={time || "—"} />
            </div>
          </div>

          <div style={{ ...styles.layer, transform: "translateZ(20px)" }}>
            <footer style={styles.footer}>
              Edit <span style={styles.footerStrong}>StatusPage3D.jsx</span> to
              change what's shown here.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, accent }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowKey}>{k}</span>
      <span style={{ ...styles.rowVal, ...(accent ? styles.rowValAccent : {}) }}>
        {v}
      </span>
    </div>
  );
}

const styles = {
  scene: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    background: COLORS.ink,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6vh 6vw",
    boxSizing: "border-box",
  },
  orbA: {
    position: "absolute",
    width: "38vw",
    height: "38vw",
    top: "-10%",
    left: "-8%",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,162,39,0.14), transparent 70%)",
    filter: "blur(10px)",
    pointerEvents: "none",
  },
  orbB: {
    position: "absolute",
    width: "30vw",
    height: "30vw",
    bottom: "-12%",
    right: "-6%",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(122,153,168,0.10), transparent 70%)",
    filter: "blur(10px)",
    pointerEvents: "none",
  },
  stage: {
    perspective: "1200px",
    width: "100%",
    maxWidth: "640px",
  },
  card: {
    transformStyle: "preserve-3d",
    background: `linear-gradient(160deg, ${COLORS.panel}, #10151B)`,
    border: `1px solid ${COLORS.line}`,
    borderRadius: "14px",
    padding: "3rem 2.6rem",
    boxShadow:
      "0 30px 60px -20px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.02) inset",
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
  },
  layer: {
    transformStyle: "preserve-3d",
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "3rem",
  },
  project: {
    fontSize: "0.85rem",
    color: COLORS.muted,
    letterSpacing: "0.01em",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: COLORS.muted,
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: COLORS.brass,
    display: "inline-block",
    boxShadow: `0 0 12px 2px rgba(201,162,39,0.5)`,
  },
  h1: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 400,
    fontSize: "clamp(1.9rem, 4.6vw, 2.7rem)",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    margin: "0 0 1.1rem 0",
    maxWidth: "15ch",
  },
  em: {
    fontStyle: "italic",
    fontWeight: 400,
    color: COLORS.brass,
  },
  lede: {
    fontSize: "1rem",
    lineHeight: 1.65,
    color: COLORS.muted,
    maxWidth: "42ch",
    margin: "0 0 2.4rem 0",
  },
  readout: {
    borderTop: `1px solid ${COLORS.line}`,
    paddingTop: "1.3rem",
  },
  row: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.82rem",
    padding: "0.45rem 0",
  },
  rowKey: { color: COLORS.muted },
  rowVal: { color: COLORS.text },
  rowValAccent: { color: COLORS.brass },
  footer: {
    marginTop: "2.4rem",
    fontSize: "0.78rem",
    color: COLORS.muted,
  },
  footerStrong: { color: COLORS.text },
};