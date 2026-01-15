import React, { useMemo, useRef, useState } from "react";

type Hand = "right" | "left";
type HistItem = { kind: "add"; hand: Hand; token: string } | { kind: "newline" };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// +: dot above U+0307, -: dot below U+0323
function withOctaveDots(text: string, octave: number) {
  if (text === "0" || text === "-" || text === "\n" || text === "|") return text;
  let s = text;
  if (octave > 0) {
    for (let i = 0; i < octave; i++) s += "\u0307";
  } else if (octave < 0) {
    for (let i = 0; i < Math.abs(octave); i++) s += "\u0323";
  }
  return s;
}

function joinTokens(tokens: string[]) {
  return tokens.join(" ");
}

function popToken(tokens: string[]) {
  return tokens.slice(0, Math.max(0, tokens.length - 1));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function captureElementAsPng(el: HTMLElement, filename: string) {
  // 外部ライブラリ無し：SVG foreignObject でDOMを画像化（CSSは内包する必要がある）
  const rect = el.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  // 画面上の見た目を保つため、計算済みスタイルをstyle属性に焼き付ける（簡易版）
  const cloned = el.cloneNode(true) as HTMLElement;

  const inlineAllStyles = (src: Element, dst: Element) => {
    const s = window.getComputedStyle(src);
    const d = dst as HTMLElement;
    // よく効くやつ中心に焼く（全部焼くと重いので主要だけ）
    const props = [
      "font",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "border",
      "borderRadius",
      "padding",
      "margin",
      "boxSizing",
      "whiteSpace",
    ];
    props.forEach((p) => {
      // @ts-ignore
      d.style[p] = s.getPropertyValue(p);
    });

    // 子も再帰
    const srcChildren = Array.from(src.children);
    const dstChildren = Array.from(dst.children);
    for (let i = 0; i < Math.min(srcChildren.length, dstChildren.length); i++) {
      inlineAllStyles(srcChildren[i], dstChildren[i]);
    }
  };

  inlineAllStyles(el, cloned);

  // スケール2倍でクッキリ
  const scale = 2;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}">
  <foreignObject x="0" y="0" width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      width:${width}px;
      height:${height}px;
      transform: scale(${scale});
      transform-origin: top left;
      background: white;
    ">
      ${new XMLSerializer().serializeToString(cloned)}
    </div>
  </foreignObject>
</svg>`;

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("PNG化に失敗しました"));
    img.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvasが使えません");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(svgUrl);

  const pngBlob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/png")
  );

  downloadBlob(pngBlob, filename);
}

export default function Home() {
  const notes = useMemo(
    () => [
      { note: "ド", num: "1" },
      { note: "レ", num: "2" },
      { note: "ミ", num: "3" },
      { note: "ファ", num: "4" },
      { note: "ソ", num: "5" },
      { note: "ラ", num: "6" },
      { note: "シ", num: "7" },
    ],
    []
  );

  // 主旋律（右手） / 副旋律（左手）
  const [octave, setOctave] = useState(0); // -2..2
  const [activeHand, setActiveHand] = useState<Hand>("right");

  // 1段 = 右手lineと左手lineがペア
  const [rightLines, setRightLines] = useState<string[][]>([[]]);
  const [leftLines, setLeftLines] = useState<string[][]>([[]]);

  const [history, setHistory] = useState<HistItem[]>([]);

  // PNG化する出力枠
  const outputRef = useRef<HTMLDivElement | null>(null);

  const addToken = (hand: Hand, raw: string) => {
    const token = withOctaveDots(raw, octave);

    if (hand === "right") {
      setRightLines((prev) => {
        const next = prev.map((line) => [...line]);
        next[next.length - 1].push(token);
        return next;
      });
    } else {
      setLeftLines((prev) => {
        const next = prev.map((line) => [...line]);
        next[next.length - 1].push(token);
        return next;
      });
    }

    setHistory((h) => [...h, { kind: "add", hand, token }]);
  };

  const newLine = () => {
    setRightLines((r) => [...r, []]);
    setLeftLines((l) => [...l, []]);
    setHistory((h) => [...h, { kind: "newline" }]);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];

      if (last.kind === "newline") {
        setRightLines((r) => (r.length > 1 ? r.slice(0, -1) : r));
        setLeftLines((l) => (l.length > 1 ? l.slice(0, -1) : l));
      } else {
        if (last.hand === "right") {
          setRightLines((r) => {
            const next = r.map((line) => [...line]);
            const idx = next.length - 1;
            next[idx] = popToken(next[idx]);
            return next;
          });
        } else {
          setLeftLines((l) => {
            const next = l.map((line) => [...line]);
            const idx = next.length - 1;
            next[idx] = popToken(next[idx]);
            return next;
          });
        }
      }

      return h.slice(0, -1);
    });
  };

  const clear = () => {
    setRightLines([[]]);
    setLeftLines([[]]);
    setHistory([]);
  };

  const savePng = async () => {
    if (!outputRef.current) return;
    const filename = `jumpmaker_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.png`;
    try {
      await captureElementAsPng(outputRef.current, filename);
    } catch (e) {
      alert(
        "PNG保存に失敗しました。\n（Replitのプレビュー内だと制限が出る場合があるので、上の『New tab』で開いた方で試してみて！）"
      );
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 18, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 24 }}>🎵</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>ハートピア楽譜生成ツール</div>
          <div style={{ color: "#666", marginTop: 2 }}>ドレミからゲーム内楽譜に変換されます</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>オクターブ</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setOctave((o) => clamp(o - 1, -2, 2))}>↓</button>
            <div style={{ fontSize: 22, fontWeight: 900, minWidth: 18, textAlign: "center" }}>{octave}</div>
            <button onClick={() => setOctave((o) => clamp(o + 1, -2, 2))}>↑</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveHand("right")}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: activeHand === "right" ? "#ffe5e5" : "white",
              color: activeHand === "right" ? "#c62828" : "#333",
              fontWeight: 800,
            }}
          >
            主旋律（右手）
          </button>
          <button
            onClick={() => setActiveHand("left")}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: activeHand === "left" ? "#e7f0ff" : "white",
              color: activeHand === "left" ? "#1565c0" : "#333",
              fontWeight: 800,
            }}
          >
            副旋律（左手）
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => addToken(activeHand, " ")}>休符（空白）</button>
          <button onClick={() => addToken(activeHand, "|")}>区切り（|）</button>
          <button onClick={() => addToken(activeHand, "-")}>伸ばす（−）</button>
          <button onClick={newLine}>改行</button>
          <button onClick={undo}>ひとつ前に戻る</button>
          <button onClick={clear}>全削除</button>
          <button onClick={savePng} style={{ fontWeight: 900 }}>PNGで保存</button>
        </div>
      </div>

      {/* Note buttons */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(7, minmax(60px, 1fr))", gap: 8, maxWidth: 520 }}>
        {notes.map((n) => (
          <button
            key={n.num}
            onClick={() => addToken(activeHand, n.num)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: "10px 6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900 }}>{n.num}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{n.note}</div>
          </button>
        ))}
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        style={{
          marginTop: 14,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 12,
          maxWidth: 820,
          background: "white",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>出力</div>
        <div style={{ color: "#666", marginTop: 4 }}>オクターブ：{octave}</div>

        <div style={{ marginTop: 10 }} />

        {rightLines.map((rLine, i) => {
          const lLine = leftLines[i] ?? [];
          const r = joinTokens(rLine);
          const l = joinTokens(lLine);

          return (
            <div key={i} style={{ marginBottom: 14 }}>
              {/* 主旋律(赤) */}
              <div
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 20,
                  lineHeight: 1.6,
                  color: "#c62828",
                  padding: "2px 0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {r || " "}
              </div>

              {/* 副旋律(青) */}
              <div
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 20,
                  lineHeight: 1.6,
                  color: "#1565c0",
                  padding: "2px 0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {l || " "}
              </div>

              {/* 改行の見える化 */}
              {i < rightLines.length - 1 && (
                <div style={{ color: "#666", marginTop: 6 }}>⏎ 改行</div>
              )}
            </div>
          );
        })}

        <div style={{ color: "#666", marginTop: 8 }}>
          ※「PNGで保存」は、この出力枠だけを画像化して保存します
        </div>
      </div>
    </div>
  );
}
