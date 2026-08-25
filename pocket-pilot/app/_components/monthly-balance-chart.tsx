"use client";

import { useState, type PointerEvent } from "react";

import type { MonthlyBalancePoint } from "@/lib/dashboard/monthly-cockpit";
import { formatCents } from "@/lib/finance/format-cents";

const WIDTH = 760;
const HEIGHT = 220;
const PADDING = { bottom: 28, left: 16, right: 16, top: 18 } as const;

function getGeometry(points: readonly MonthlyBalancePoint[]) {
  const values = points.map((point) => point.remainingCents);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const range = maximum === minimum ? 1 : maximum - minimum;
  const drawableWidth = WIDTH - PADDING.left - PADDING.right;
  const drawableHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const lastDay = Math.max(points.at(-1)?.day ?? 1, 1);
  const coordinates = points.map((point) => ({
    ...point,
    x: PADDING.left + (point.day / lastDay) * drawableWidth,
    y: PADDING.top + ((maximum - point.remainingCents) / range) * drawableHeight,
  }));
  const linePath = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const baselineY = HEIGHT - PADDING.bottom;
  const areaPath = `${linePath} L${coordinates.at(-1)?.x ?? PADDING.left},${baselineY} L${PADDING.left},${baselineY} Z`;

  return { areaPath, coordinates, drawableWidth, lastDay, linePath, maximum, minimum };
}

export function MonthlyBalanceChart({
  currencyCode,
  currentDay,
  points,
}: {
  currencyCode: string;
  currentDay: number;
  points: MonthlyBalancePoint[];
}) {
  const geometry = getGeometry(points);
  const initialDay = Math.min(currentDay, geometry.lastDay);
  const [activeDay, setActiveDay] = useState(initialDay);
  const activePoint = geometry.coordinates.find((point) => point.day === activeDay) ?? geometry.coordinates[0];
  const lastPoint = geometry.coordinates.at(-1);
  const tickDays = [1, 8, 15, 22, geometry.lastDay].filter((day, index, all) => all.indexOf(day) === index && day <= geometry.lastDay);

  function updateFromPointer(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const relativeX = Math.max(0, Math.min(geometry.drawableWidth, svgX - PADDING.left));
    setActiveDay(Math.round((relativeX / geometry.drawableWidth) * geometry.lastDay));
  }

  return (
    <div className="chart-shell">
      <div className="chart-toolbar">
        <span>{formatCents(geometry.maximum, currencyCode)}</span>
        <span><i aria-hidden="true" /> Solde journalier</span>
      </div>
      <div className="chart-stage">
        <div
          className="chart-tooltip"
          style={{ left: `${Math.min(90, Math.max(10, (activePoint.x / WIDTH) * 100))}%` }}
        >
          <span>Jour {activePoint.day || 1}</span>
          <strong>{formatCents(activePoint.remainingCents, currencyCode)}</strong>
          <small>{formatCents(activePoint.spentCents, currencyCode)} dépensés</small>
        </div>
        <svg
          aria-labelledby="monthly-balance-chart-title monthly-balance-chart-description"
          onPointerMove={updateFromPointer}
          role="img"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <title id="monthly-balance-chart-title">Évolution du reste réel pendant le mois</title>
          <desc id="monthly-balance-chart-description">Le budget disponible diminue aux dates des transactions. Utilisez le curseur sous le graphique pour explorer chaque jour.</desc>
          <defs>
            <linearGradient id="balance-area-premium" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.2, 0.5, 0.8].map((ratio) => (
            <line key={ratio} className="chart-grid-line" x1={PADDING.left} x2={WIDTH - PADDING.right} y1={PADDING.top + ratio * (HEIGHT - PADDING.top - PADDING.bottom)} y2={PADDING.top + ratio * (HEIGHT - PADDING.top - PADDING.bottom)} />
          ))}
          <path d={geometry.areaPath} fill="url(#balance-area-premium)" />
          <path className="chart-line-path" d={geometry.linePath} />
          <line className="chart-crosshair" x1={activePoint.x} x2={activePoint.x} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} />
          <circle className="chart-active-dot" cx={activePoint.x} cy={activePoint.y} r="5" />
          {tickDays.map((day) => {
            const point = geometry.coordinates.find((item) => item.day === day);
            return point ? <text key={day} className="chart-axis-label" textAnchor={day === 1 ? "start" : day === geometry.lastDay ? "end" : "middle"} x={point.x} y={HEIGHT - 7}>{day}</text> : null;
          })}
          {geometry.minimum < 0 ? <text className="chart-negative-label" x={PADDING.left} y={HEIGHT - PADDING.bottom - 7}>Zone négative</text> : null}
        </svg>
        <input
          aria-label="Explorer le solde quotidien"
          className="chart-scrubber"
          max={geometry.lastDay}
          min={0}
          onChange={(event) => setActiveDay(Number(event.target.value))}
          type="range"
          value={activeDay}
        />
      </div>
      <p className="sr-only" aria-live="polite" role="status">Jour {activePoint.day || 1} : {formatCents(activePoint.remainingCents, currencyCode)} disponibles.</p>
      <div className="chart-footnote"><span>Début du mois</span><span>Aujourd’hui · {initialDay}</span><span>Fin du mois · {lastPoint?.day}</span></div>
    </div>
  );
}
