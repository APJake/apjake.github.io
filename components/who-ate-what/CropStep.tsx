"use client";

import { useRef, useState } from "react";
import type { Pt, Quad } from "@/lib/who-ate-what/ocr/image";
import styles from "./WhoAteWhat.module.css";

const NAMES = ["top-left", "top-right", "bottom-right", "bottom-left"];
/** Magnifier diameter, px (matches .loupe in the CSS). */
const LOUPE = 112;

/**
 * The photo with the slip outlined; drag a corner (or focus it and use the
 * arrow keys) to fit the outline to the paper. A magnifier shows the spot
 * under your finger while dragging.
 */
export default function CropStep({
  preview, width, height, quad, found, onChange, onScan, onBack,
}: {
  preview: string;
  /** Photo size the quad is measured in. */
  width: number;
  height: number;
  quad: Quad;
  found: boolean;
  onChange: (q: Quad) => void;
  onScan: () => void;
  onBack: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const toPhoto = (clientX: number, clientY: number): Pt => {
    const r = box.current!.getBoundingClientRect();
    return {
      x: Math.min(width, Math.max(0, ((clientX - r.left) / r.width) * width)),
      y: Math.min(height, Math.max(0, ((clientY - r.top) / r.height) * height)),
    };
  };
  const move = (i: number, p: Pt) => onChange(quad.map((q, j) => (j === i ? p : q)) as Quad);
  const pct = (p: Pt) => ({ left: `${(p.x / width) * 100}%`, top: `${(p.y / height) * 100}%` });

  const outline = quad.map((p) => `${p.x},${p.y}`).join(" ");
  const dragged = drag !== null ? quad[drag] : null;
  const zoom = 3;

  return (
    <div className={styles.sheetBody}>
      <p className={styles.desc}>
        {found
          ? "Check the outline sits on the slip. Drag a corner to fix it; it's fine to include a little background."
          : "Couldn't spot the slip by itself. Drag the corners onto the slip's corners."}
      </p>
      <div className={styles.cropWrap}>
        <div className={styles.cropBox} ref={box}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.cropImg} src={preview} alt="Your bill slip" draggable={false} />
          <svg className={styles.cropSvg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            <path
              d={`M0 0H${width}V${height}H0Z M${quad.map((p) => `${p.x} ${p.y}`).join("L")}Z`}
              fillRule="evenodd"
              className={styles.cropShade}
            />
            <polygon points={outline} className={styles.cropLine} vectorEffect="non-scaling-stroke" />
          </svg>
          {quad.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.handle} ${drag === i ? styles.handleActive : ""}`}
              style={pct(p)}
              aria-label={`Move the ${NAMES[i]} corner (arrow keys)`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag(i);
              }}
              onPointerMove={(e) => drag === i && move(i, toPhoto(e.clientX, e.clientY))}
              onPointerUp={() => setDrag(null)}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={(e) => {
                const step = (e.shiftKey ? 0.04 : 0.01) * Math.max(width, height);
                const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
                if (!d) return;
                e.preventDefault();
                move(i, { x: Math.min(width, Math.max(0, p.x + d[0])), y: Math.min(height, Math.max(0, p.y + d[1])) });
              }}
            />
          ))}
          {dragged && box.current && (() => {
            const r = box.current.getBoundingClientRect();
            const bw = r.width * zoom;
            const bh = r.height * zoom;
            return (
              <div
                className={styles.loupe}
                aria-hidden="true"
                style={{
                  ...pct(dragged),
                  backgroundImage: `url(${preview})`,
                  backgroundSize: `${bw}px ${bh}px`,
                  backgroundPosition: `${LOUPE / 2 - (dragged.x / width) * bw}px ${LOUPE / 2 - (dragged.y / height) * bh}px`,
                }}
              />
            );
          })()}
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={onScan}>
          Read this slip
        </button>
        <button type="button" className={styles.btnGhost} onClick={() => onChange([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }])}>
          Use whole photo
        </button>
        <button type="button" className={styles.btnGhost} onClick={onBack}>
          Another photo
        </button>
      </div>
    </div>
  );
}
