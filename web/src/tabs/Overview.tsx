import { lazy, Suspense } from 'react';
import type { OverviewItem } from '../types';
import { localize, ui } from '../i18n';
import type { Lang } from '../i18n';
import { overviewCode } from './overviewSource';

// content.ts (the 47-entry detail table) is deferred: it loads only when a
// card is expanded, not on first paint. The teaching source above comes from
// overviewSource.ts (this chunk).
const Detail = lazy(() => import('../Detail'));

// "What is lume" tour: the sample source is always visible (it is teaching
// text from overviewSource.ts), with the real executed output underneath.
export default function Overview({ data, lang, open, onToggle }: { data: OverviewItem[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
  return (
    <div className="grid">
      {data.map((o, i) => {
        const x = localize(o, lang);
        const isOpen = open.has(o.name);
        const code = overviewCode[o.name];
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
              <span className="badge ok">{x.status}</span>
            </div>
            <p className="desc">{x.desc}</p>
            {code && (
              <>
                <div className="code-label">{ui.codeLabel[lang]}</div>
                <pre className="code">{code}</pre>
              </>
            )}
            <div className="demo">{x.output}</div>
            <button className="detail-toggle" onClick={() => onToggle(o.name)} aria-expanded={isOpen}>
              {isOpen ? ui.hide[lang] : ui.details[lang]}
            </button>
            {isOpen && (
              <Suspense fallback={null}>
                <Detail name={o.name} lang={lang} showCode={false} />
              </Suspense>
            )}
          </div>
        );
      })}
    </div>
  );
}
