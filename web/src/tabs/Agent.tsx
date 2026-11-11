import { lazy, Suspense } from 'react';
import type { AgentItem } from '../types';
import { localize, ui } from '../i18n';
import type { Lang } from '../i18n';

// content.ts (detail table) is deferred: loads only on card expand.
const Detail = lazy(() => import('../Detail'));

export default function Agent({ data, lang, open, onToggle }: { data: AgentItem[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
  return (
    <div className="grid">
      {data.map((a, i) => {
        const x = localize(a, lang);
        const isOpen = open.has(a.name);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
            </div>
            <p className="desc">{x.desc}</p>
            <div className="demo">{x.demo}</div>
            <button className="detail-toggle" onClick={() => onToggle(a.name)} aria-expanded={isOpen}>
              {isOpen ? ui.hide[lang] : ui.details[lang]}
            </button>
            {isOpen && (
              <Suspense fallback={null}>
                <Detail name={a.name} lang={lang} />
              </Suspense>
            )}
          </div>
        );
      })}
    </div>
  );
}
