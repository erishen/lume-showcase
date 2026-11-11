import { lazy, Suspense } from 'react';
import type { Feature } from '../types';
import { localize, ui } from '../i18n';
import type { Lang } from '../i18n';

// content.ts (detail table) is deferred: loads only on card expand.
const Detail = lazy(() => import('../Detail'));

export default function Features({ data, lang, open, onToggle }: { data: Feature[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
  return (
    <div className="grid">
      {data.map((f, i) => {
        const x = localize(f, lang);
        const isOpen = open.has(f.name);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
              <span className={`badge ${x.status === 'ok' ? 'ok' : ''}`}>{x.status}</span>
            </div>
            <p className="desc">{x.desc}</p>
            <div className="demo">{x.demo}</div>
            <button className="detail-toggle" onClick={() => onToggle(f.name)} aria-expanded={isOpen}>
              {isOpen ? ui.hide[lang] : ui.details[lang]}
            </button>
            {isOpen && (
              <Suspense fallback={null}>
                <Detail name={f.name} lang={lang} />
              </Suspense>
            )}
          </div>
        );
      })}
    </div>
  );
}
