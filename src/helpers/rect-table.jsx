import React, { useMemo, useState } from 'react';
import './rect-table.css';
export const helperMeta = {
  id: 'rect-table',
  title: 'Прямоугольные столы',
  description: 'DXDY, карта, поворот, экспорт шаблона',
  order: 10,
};
const SEAT_SIZE = 24;
const SEAT_INTERVAL = 6;
const SEAT_STEP = SEAT_SIZE + SEAT_INTERVAL;
const PIVOT_X = 12;
const PIVOT_Y = 12;
const TABLE_SIDE_BASE = 34;
const TABLE_SIDE_STEP = 30;

function getTableSide(n) {
  return TABLE_SIDE_BASE + Math.max(0, n - 1) * TABLE_SIDE_STEP;
}

const TABLE_PRESETS = [
  {
    label: 'Стол 1x1',
    sizeX: 34,
    sizeY: 34,
    dx0: 25,
    dy0: -5,
    mapText: `[1, '1']`,
  },
  {
    label: 'Стол 1x2',
    sizeX: 34,
    sizeY: 64,
    dx0: 25,
    dy0: -5,
    mapText: `[1, '2 =1 1']`,
  },
  {
    label: 'Стол 1x3',
    sizeX: 34,
    sizeY: 94,
    dx0: 25,
    dy0: -5,
    mapText: `[1, '3 =1 2 =1 1']`,
  },
  {
    label: 'Стол 1x4',
    sizeX: 34,
    sizeY: 124,
    dx0: 25,
    dy0: -5,
    mapText: `[1, '4 =1 3 =1 2 =1 1']`,
  },
  {
    label: 'Стол 2x1',
    sizeX: 64,
    sizeY: 34,
    dx0: 10,
    dy0: -5,
    mapText: `[1, '1 2']`,
  },
  {
    label: 'Стол 2x2',
    sizeX: 64,
    sizeY: 64,
    dx0: 10,
    dy0: -5,
    mapText: `[1, '1 2']
[1]
[2, '3 4']`,
  },
  {
    label: 'Стол 3x1',
    sizeX: 94,
    sizeY: 34,
    dx0: -5,
    dy0: -5,
    mapText: `[1, '1 2 3']`,
  },
];

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function rotatePoint(x, y, deg, pivotX = PIVOT_X, pivotY = PIVOT_Y) {
  const a = degToRad(deg);
  const dx = x - pivotX;
  const dy = y - pivotY;

  return {
    x: pivotX + dx * Math.cos(a) - dy * Math.sin(a),
    y: pivotY + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

function rotateDxdy(dxdy0, size, deg) {
  const centerX = 12 - size[0] / 2;
  const centerY = 12 - size[1] / 2;
  const a = degToRad(deg);

  const vx = dxdy0[0] - centerX;
  const vy = dxdy0[1] - centerY;

  return [
    Math.round(centerX + vx * Math.cos(a) - vy * Math.sin(a)),
    Math.round(centerY + vx * Math.sin(a) + vy * Math.cos(a)),
  ];
}

function parseExpr(expr) {
  const parts = String(expr || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const result = [];

  for (const part of parts) {
    if (/^=\d+(?:\.\d+)?$/.test(part)) {
      result.push({
        type: 'gap',
        value: Number(part.slice(1)),
      });
      continue;
    }

    if (/^=?\d+-\d+$/.test(part)) {
      const raw = part.startsWith('=') ? part.slice(1) : part;
      const [a, b] = raw.split('-').map(Number);
      const step = a <= b ? 1 : -1;

      for (let i = a; step > 0 ? i <= b : i >= b; i += step) {
        result.push({
          type: 'seat',
          value: i,
        });
      }
      continue;
    }

    if (/^\d+$/.test(part)) {
      result.push({
        type: 'seat',
        value: Number(part),
      });
    }
  }

  return result;
}

function parseMapText(mapText) {
  return String(mapText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith('[') && line.endsWith(']') && !line.includes(',')) {
        const skipValue = Number(line.slice(1, -1).trim());

        if (!Number.isNaN(skipValue)) {
          return {
            type: 'skip',
            skip: skipValue,
            raw: line,
          };
        }
      }

      if (line.startsWith('[') && line.endsWith(']') && line.includes(',')) {
        const commaIndex = line.indexOf(',');
        const rowPart = line.slice(1, commaIndex).trim();
        const exprPart = line.slice(commaIndex + 1, -1).trim();
        const rowNumber = Number(rowPart);

        if (Number.isNaN(rowNumber)) {
          return null;
        }

        let expr = exprPart;

        if (
          (expr.startsWith("'") && expr.endsWith("'")) ||
          (expr.startsWith('"') && expr.endsWith('"'))
        ) {
          expr = expr.slice(1, -1);
        }

        return {
          type: 'row',
          row: rowNumber,
          expr,
          tokens: parseExpr(expr),
          raw: line,
        };
      }

      return null;
    })
    .filter(Boolean);
}

function buildSeatRects(rows) {
  const seatRects = [];
  let rowCursor = 0;

  for (const row of rows) {
    if (row.type === 'skip') {
      rowCursor += row.skip;
      continue;
    }

    let colCursor = 0;

    for (const token of row.tokens) {
      if (token.type === 'seat') {
        seatRects.push({
          x: colCursor * SEAT_STEP,
          y: rowCursor * SEAT_STEP,
          w: SEAT_SIZE,
          h: SEAT_SIZE,
          label: token.value,
          row: row.row,
        });

        colCursor += 1;
      } else {
        colCursor += token.value;
      }
    }

    rowCursor += 1;
  }

  return seatRects;
}
function buildParamOpen(sizeX, sizeY, deg) {
  const lineHeight = sizeY - 2;

  if (!deg) {
    return `<div style="font-size:22px;line-height:${lineHeight}px;text-align:center;width:${sizeX}px;height:${sizeY}px;background:#eeeeee;border:1px solid #cccccc;box-sizing:border-box;">`;
  }

  return `<div style="position:relative;width:${sizeX}px;height:${sizeY}px;background:#eeeeee;border:1px solid #cccccc;box-sizing:border-box;"><div style="position:absolute;top:0;left:0;width:${sizeX}px;height:${sizeY}px;font-size:22px;line-height:${lineHeight}px;text-align:center;transform:rotate(${-deg}deg);transform-origin:center center;">`;
}
function buildPhpSnippet(state, rotatedDxdy) {
  const param = buildParamOpen(state.sizeX, state.sizeY, state.rotate);

  const mapRows = String(state.mapText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `    ${line}`)
    .join(',\n');

  return `$${state.snippetName} = [
    'dxdy' => [${rotatedDxdy[0]}, ${rotatedDxdy[1]}],
    'size' => [${state.sizeX}, ${state.sizeY}],
    'param' => '
    ${param}',
];

$${state.mapName} = [
${mapRows}
];`;
}

function buildBounds(seatRects, tableRect, rotate, rotatedDxdy) {
  const points = [];

  const pushRectCorners = (rect) => {
    points.push(rotatePoint(rect.x, rect.y, rotate));
    points.push(rotatePoint(rect.x + rect.w, rect.y, rotate));
    points.push(rotatePoint(rect.x + rect.w, rect.y + rect.h, rotate));
    points.push(rotatePoint(rect.x, rect.y + rect.h, rotate));
  };

  seatRects.forEach(pushRectCorners);
  pushRectCorners(tableRect);

  points.push({ x: PIVOT_X, y: PIVOT_Y });
  points.push({ x: rotatedDxdy[0], y: rotatedDxdy[1] });

  const pad = 40;

  const minX = Math.min(...points.map((p) => p.x)) - pad;
  const minY = Math.min(...points.map((p) => p.y)) - pad;
  const maxX = Math.max(...points.map((p) => p.x)) + pad;
  const maxY = Math.max(...points.map((p) => p.y)) + pad;

  return { minX, minY, maxX, maxY };
}
function NumberInput({ value, onChange, step = 1 }) {
  return (
    <input
      type="number"
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rect-tool-input"
    />
  );
}

function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rect-tool-input"
    />
  );
}

function Field({ label, children, hint = '' }) {
  return (
    <label className="rect-tool-field">
      <div className="rect-tool-label-row">
        <div className="rect-tool-label">{label}</div>
        {hint ? <div className="rect-tool-field-hint">{hint}</div> : null}
      </div>
      {children}
    </label>
  );
}

function QuickRotate({ value, onChange }) {
  const angles = [0, 15, 30, 45, 60, 75, 90, 120, 135, 150, 180];

  return (
    <div className="rect-tool-angle-list">
      {angles.map((angle) => (
        <button
          key={angle}
          type="button"
          className={
            value === angle
              ? 'rect-tool-angle-btn is-active'
              : 'rect-tool-angle-btn'
          }
          onClick={() => onChange(angle)}
        >
          {angle}°
        </button>
      ))}
    </div>
  );
}

function Section({ title, note = '', actions = null, children }) {
  return (
    <section className="rect-tool-card">
      <div className="rect-tool-section-head">
        <div>
          <div className="rect-tool-section-title">{title}</div>
          {note ? <div className="rect-tool-section-note">{note}</div> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function TablePreview({ state, rows, rotatedDxdy }) {
  const seatRects = useMemo(() => buildSeatRects(rows), [rows]);

  const baseX = rotatedDxdy[0];
  const baseY = rotatedDxdy[1];

  const localSeatRects = useMemo(
    () =>
      seatRects.map((seat) => ({
        ...seat,
        x: seat.x - state.dx0,
        y: seat.y - state.dy0,
      })),
    [seatRects, state.dx0, state.dy0]
  );

  const rotateCx = state.sizeX / 2;
  const rotateCy = state.sizeY / 2;
  const rotatePivotX = baseX + rotateCx;
  const rotatePivotY = baseY + rotateCy;

  const absoluteSeatRects = useMemo(
    () =>
      localSeatRects.map((seat) => ({
        ...seat,
        x: baseX + seat.x,
        y: baseY + seat.y,
      })),
    [localSeatRects, baseX, baseY]
  );

  const previewBounds = useMemo(() => {
    const points = [];

    const pushRectCorners = (rect) => {
      points.push(
        rotatePoint(
          rect.x,
          rect.y,
          state.rotate,
          rotatePivotX,
          rotatePivotY
        )
      );
      points.push(
        rotatePoint(
          rect.x + rect.w,
          rect.y,
          state.rotate,
          rotatePivotX,
          rotatePivotY
        )
      );
      points.push(
        rotatePoint(
          rect.x + rect.w,
          rect.y + rect.h,
          state.rotate,
          rotatePivotX,
          rotatePivotY
        )
      );
      points.push(
        rotatePoint(
          rect.x,
          rect.y + rect.h,
          state.rotate,
          rotatePivotX,
          rotatePivotY
        )
      );
    };

    absoluteSeatRects.forEach(pushRectCorners);

    pushRectCorners({
      x: baseX,
      y: baseY,
      w: state.sizeX,
      h: state.sizeY,
    });

    points.push({ x: PIVOT_X, y: PIVOT_Y });
    points.push({ x: baseX, y: baseY });

    const pad = 36;

    const minX = Math.min(...points.map((p) => p.x)) - pad;
    const minY = Math.min(...points.map((p) => p.y)) - pad;
    const maxX = Math.max(...points.map((p) => p.x)) + pad;
    const maxY = Math.max(...points.map((p) => p.y)) + pad;

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [
    absoluteSeatRects,
    baseX,
    baseY,
    state.sizeX,
    state.sizeY,
    state.rotate,
    rotatePivotX,
    rotatePivotY,
  ]);

  return (
    <div className="rect-tool-preview-card">
      <div className="rect-tool-section-head">
        <div>
          <div className="rect-tool-section-title">Предпросмотр</div>
          <div className="rect-tool-section-note">
            Красная точка — pivot, синяя — текущий dxdy
          </div>
        </div>

        <div className="rect-tool-meta-list">
          <span className="rect-tool-meta-chip">
            size: {state.sizeX} × {state.sizeY}
          </span>
          <span className="rect-tool-meta-chip">
            dxdy: [{rotatedDxdy[0]}, {rotatedDxdy[1]}]
          </span>
          <span className="rect-tool-meta-chip">rotate: {state.rotate}°</span>
        </div>
      </div>

      <div className="rect-tool-preview-stage">
        <svg
          className="rect-tool-preview-svg"
          viewBox={`${previewBounds.minX} ${previewBounds.minY} ${previewBounds.width} ${previewBounds.height}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id="rectMinorGrid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 10 0 L 0 0 0 10" className="rect-tool-grid-minor" />
            </pattern>

            <pattern
              id="rectMajorGrid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <rect width="30" height="30" fill="url(#rectMinorGrid)" />
              <path d="M 30 0 L 0 0 0 30" className="rect-tool-grid-major" />
            </pattern>
          </defs>

          <rect
            x={previewBounds.minX}
            y={previewBounds.minY}
            width={previewBounds.width}
            height={previewBounds.height}
            fill="url(#rectMajorGrid)"
          />

          <g transform={`rotate(${state.rotate} ${rotatePivotX} ${rotatePivotY})`}>
            <rect
              x={baseX}
              y={baseY}
              width={state.sizeX}
              height={state.sizeY}
              className="rect-tool-table-origin-svg"
            />

            <rect
              x={baseX}
              y={baseY}
              width={state.sizeX}
              height={state.sizeY}
              className="rect-tool-table-svg"
            />

            <g transform={`rotate(${-state.rotate} ${rotatePivotX} ${rotatePivotY})`}>
              <text
                x={baseX + state.sizeX / 2}
                y={baseY + state.sizeY / 2}
                dominantBaseline="middle"
                textAnchor="middle"
                className="rect-tool-table-text-svg"
              >
                {state.tableNumber}
              </text>
            </g>

            {absoluteSeatRects.map((seat, index) => (
              <g key={index}>
                <rect
                  x={seat.x}
                  y={seat.y}
                  width={seat.w}
                  height={seat.h}
                  rx="12"
                  ry="12"
                  className="rect-tool-seat-svg"
                />
                <text
                  x={seat.x + seat.w / 2}
                  y={seat.y + seat.h / 2}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="rect-tool-seat-text-svg"
                >
                  {seat.label}
                </text>
              </g>
            ))}
          </g>

          <circle
            cx={PIVOT_X}
            cy={PIVOT_Y}
            r="4"
            className="rect-tool-pivot-svg"
          />

          <circle
            cx={baseX}
            cy={baseY}
            r="5"
            className="rect-tool-dxdy-svg"
          />
        </svg>
      </div>
    </div>
  );
}

export default function RectTableHelper() {
  const [state, setState] = useState({
    snippetName: 's1',
    mapName: 'map1',
    tableNumber: '1',
    sizeX: 34,
    sizeY: 34,
    dx0: 25,
    dy0: -5,
    rotate: 0,
    mapText: `[1, '2 =1 1']`,
  });
  const [copyState, setCopyState] = useState('');

  const applyTablePreset = (preset) => {
    setState((prev) => ({
      ...prev,
      sizeX: preset.sizeX,
      sizeY: preset.sizeY,
      dx0: preset.dx0,
      dy0: preset.dy0,
      mapText: preset.mapText,
    }));
  };

  const rows = useMemo(() => parseMapText(state.mapText), [state.mapText]);

  const rotatedDxdy = useMemo(
    () =>
      rotateDxdy(
        [state.dx0, state.dy0],
        [state.sizeX, state.sizeY],
        state.rotate
      ),
    [state.dx0, state.dy0, state.sizeX, state.sizeY, state.rotate]
  );

  const phpSnippet = useMemo(
    () => buildPhpSnippet(state, rotatedDxdy),
    [state, rotatedDxdy]
  );

  const presetMap = useMemo(
    () =>
      [15, 30, 45, 60, 120].map((deg) => ({
        deg,
        dxdy: rotateDxdy(
          [state.dx0, state.dy0],
          [state.sizeX, state.sizeY],
          deg
        ),
      })),
    [state.dx0, state.dy0, state.sizeX, state.sizeY]
  );

  const seatCount = useMemo(
    () =>
      rows.reduce((total, row) => {
        if (row.type !== 'row') return total;
        return (
          total + row.tokens.filter((token) => token.type === 'seat').length
        );
      }, 0),
    [rows]
  );

  const parsedRowCount = useMemo(
    () => rows.filter((row) => row.type === 'row').length,
    [rows]
  );

  const copyPhp = async () => {
    try {
      await navigator.clipboard.writeText(phpSnippet);
      setCopyState('Скопировано');
      window.setTimeout(() => setCopyState(''), 1500);
    } catch (error) {
      setCopyState('Ошибка копирования');
      window.setTimeout(() => setCopyState(''), 1500);
    }
  };

  return (
    <div className="rect-tool">
      <div className="rect-tool-topline">
        <div>
          <div className="rect-tool-title">Конструктор прямоугольного стола</div>
          <div className="rect-tool-subtitle">
            Быстрый рабочий интерфейс без лишних блоков
          </div>
        </div>
      </div>

      <div className="rect-tool-layout">
        <div className="rect-tool-sidebar">
          <Section
            title="Шаблоны"
            note="Быстрый старт с типовыми размерами и картами"
          >
            <div className="rect-tool-preset-grid">
              {TABLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="rect-tool-preset-btn"
                  onClick={() => applyTablePreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </Section>

          <Section
            title="Параметры"
            note="Размеры, имена, номер стола, поворот и исходный dxdy"
          >
            <div className="rect-tool-grid rect-tool-grid-2">
              <Field label="Имя шаблона">
                <TextInput
                  value={state.snippetName}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, snippetName: v }))
                  }
                />
              </Field>

              <Field label="Имя карты">
                <TextInput
                  value={state.mapName}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, mapName: v }))
                  }
                />
              </Field>
            </div>

            <div className="rect-tool-grid rect-tool-grid-2">
              <Field label="Номер стола">
                <TextInput
                  value={state.tableNumber}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, tableNumber: v }))
                  }
                />
              </Field>

              <Field label="Поворот">
                <NumberInput
                  value={state.rotate}
                  onChange={(v) => setState((prev) => ({ ...prev, rotate: v }))}
                />
              </Field>
            </div>

            <Field label="Быстрые повороты" hint="Популярные промежуточные углы">
              <QuickRotate
                value={state.rotate}
                onChange={(v) => setState((prev) => ({ ...prev, rotate: v }))}
              />
            </Field>

            <div className="rect-tool-grid rect-tool-grid-2">
              <Field label="size X">
                <NumberInput
                  value={state.sizeX}
                  onChange={(v) => setState((prev) => ({ ...prev, sizeX: v }))}
                />
              </Field>

              <Field label="size Y">
                <NumberInput
                  value={state.sizeY}
                  onChange={(v) => setState((prev) => ({ ...prev, sizeY: v }))}
                />
              </Field>
            </div>

            <div className="rect-tool-grid rect-tool-grid-2">
              <Field label="dxdy X для 0°">
                <NumberInput
                  value={state.dx0}
                  onChange={(v) => setState((prev) => ({ ...prev, dx0: v }))}
                />
              </Field>

              <Field label="dxdy Y для 0°">
                <NumberInput
                  value={state.dy0}
                  onChange={(v) => setState((prev) => ({ ...prev, dy0: v }))}
                />
              </Field>
            </div>

            <div className="rect-tool-stats">
              <div className="rect-tool-stat">
                <div className="rect-tool-stat-label">Актуальный dxdy</div>
                <div className="rect-tool-stat-value">
                  [{rotatedDxdy[0]}, {rotatedDxdy[1]}]
                </div>
              </div>

              <div className="rect-tool-stat">
                <div className="rect-tool-stat-label">Рядов</div>
                <div className="rect-tool-stat-value">{parsedRowCount}</div>
              </div>

              <div className="rect-tool-stat">
                <div className="rect-tool-stat-label">Мест</div>
                <div className="rect-tool-stat-value">{seatCount}</div>
              </div>
            </div>
          </Section>

          <Section
            title="Карта мест"
            note="Только ввод. Без отдельного разбора карты"
          >
            <Field
              label="map"
              hint="[1] — пропуск, [1, '2 =1 1'] — ряд, =1 — шаг 30px"
            >
              <textarea
                value={state.mapText}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, mapText: e.target.value }))
                }
                rows={12}
                className="rect-tool-textarea"
              />
            </Field>
          </Section>
        </div>

        <div className="rect-tool-main">
          <TablePreview state={state} rows={rows} rotatedDxdy={rotatedDxdy} />

          <Section
            title="Готовые данные"
            note="PHP-шаблон и быстрые значения по популярным углам"
            actions={
              <button className="rect-tool-copy-btn" onClick={copyPhp}>
                {copyState || 'Копировать'}
              </button>
            }
          >
            <div className="rect-tool-angle-summary">
              {presetMap.map((item) => (
                <div key={item.deg} className="rect-tool-angle-summary-item">
                  <span>{item.deg}°</span>
                  <strong>
                    [{item.dxdy[0]}, {item.dxdy[1]}]
                  </strong>
                </div>
              ))}
            </div>

            <textarea
              readOnly
              value={phpSnippet}
              className="rect-tool-code"
              rows={18}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}