import { lazy, Suspense } from 'react';
import type { Bench } from '../types';
import { localize, ui } from '../i18n';
import type { Lang } from '../i18n';

// content.ts (detail table) is deferred: loads only on card expand.
const Detail = lazy(() => import('../Detail'));

// Performance comparison (wall 1/2/3 · lume-core measured): bar width is
// log10(speedup)-scaled so 207x and 1.02x stay balanced on a linear axis.
export default function Performance({ data, lang, open, onToggle }: { data: Bench[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
  const maxLog = Math.log10(Math.max(...data.map((d) => d.speedup)));
  return (
    <div className="grid">
      {data.map((b, i) => {
        const x = localize(b, lang);
        const w = Math.max(2, (Math.log10(b.speedup) / maxLog) * 100);
        const isOpen = open.has(b.name);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
              <span className="badge ok">{b.speedup}×</span>
            </div>
            <p className="desc">{x.from} → {x.to}</p>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${w}%` }} />
            </div>
            <p className="metric">{x.note}</p>
            <button className="detail-toggle" onClick={() => onToggle(b.name)} aria-expanded={isOpen}>
              {isOpen ? ui.hide[lang] : ui.details[lang]}
            </button>
            {isOpen && (
              <Suspense fallback={null}>
                <Detail name={b.name} lang={lang} />
              </Suspense>
            )}
          </div>
        );
      })}
    </div>
  );
}
