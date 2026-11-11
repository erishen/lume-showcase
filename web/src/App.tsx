import { useEffect, useState } from 'react';
import type { AgentItem, Algorithm, AppItem, Bench, Feature } from './types';
import { getAgent, getAlgorithms, getApps, getBench, getFeatures } from './api';
import { getInitialLang, localize, saveLang, ui } from './i18n';
import type { Lang } from './i18n';
import { getDetail } from './content';

type Tab = 'features' | 'algorithms' | 'apps' | 'agent' | 'bench';

// Expandable detail panel: longer description + key points + the actual lume
// source that produced the demo. Keyed by the API's English name (content.ts).
function Detail({ name, lang }: { name: string; lang: Lang }) {
  const d = getDetail(name);
  if (!d) return null;
  const zh = lang === 'zh';
  return (
    <div className="detail">
      <p className="longdesc">{zh ? d.longZh : d.longEn}</p>
      <div className="points-label">{ui.pointsLabel[lang]}</div>
      <ul className="points">
        {(zh ? d.pointsZh : d.pointsEn).map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <div className="code-label">{ui.codeLabel[lang]}</div>
      <pre className="code">{d.code}</pre>
    </div>
  );
}

function Features({ data, lang, open, onToggle }: { data: Feature[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
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
            {getDetail(f.name) && (
              <button className="detail-toggle" onClick={() => onToggle(f.name)} aria-expanded={isOpen}>
                {isOpen ? ui.hide[lang] : ui.details[lang]}
              </button>
            )}
            {isOpen && <Detail name={f.name} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

function Algorithms({ data, lang, open, onToggle }: { data: Algorithm[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
  return (
    <div className="grid">
      {data.map((a, i) => {
        const x = localize(a, lang);
        const isOpen = open.has(a.name);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
              <span className="badge">{x.lib}</span>
              <span className="badge">{x.area}</span>
            </div>
            <p className="metric">{x.metric}</p>
            <p className="desc">{x.desc}</p>
            <div className="demo">{x.demo}</div>
            {getDetail(a.name) && (
              <button className="detail-toggle" onClick={() => onToggle(a.name)} aria-expanded={isOpen}>
                {isOpen ? ui.hide[lang] : ui.details[lang]}
              </button>
            )}
            {isOpen && <Detail name={a.name} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

function Apps({ data, lang }: { data: AppItem[]; lang: Lang }) {
  return (
    <div className="grid">
      {data.map((a, i) => {
        const x = localize(a, lang);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
              <span className={`badge ${x.status === 'ok' ? 'ok' : ''}`}>{x.status}</span>
            </div>
            <p className="desc">{x.desc}</p>
            <div className="demo">{x.libs}</div>
          </div>
        );
      })}
    </div>
  );
}

function Agent({ data, lang, open, onToggle }: { data: AgentItem[]; lang: Lang; open: Set<string>; onToggle: (n: string) => void }) {
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
            {getDetail(a.name) && (
              <button className="detail-toggle" onClick={() => onToggle(a.name)} aria-expanded={isOpen}>
                {isOpen ? ui.hide[lang] : ui.details[lang]}
              </button>
            )}
            {isOpen && <Detail name={a.name} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

// Performance comparison (wall 1/2/3 · lume-core measured): bar width is
// log10(speedup)-scaled so 207x and 1.02x stay balanced on a linear axis.
function Performance({ data, lang }: { data: Bench[]; lang: Lang }) {
  const maxLog = Math.log10(Math.max(...data.map((d) => d.speedup)));
  return (
    <div className="grid">
      {data.map((b, i) => {
        const x = localize(b, lang);
        const w = Math.max(2, (Math.log10(b.speedup) / maxLog) * 100);
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
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('features');
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [open, setOpen] = useState<Set<string>>(new Set());
  // Lazy per-tab fetch: only the active tab is loaded (1 request on mount,
  // the rest on first open), then cached so switching back is instant.
  const [cache, setCache] = useState<Partial<Record<Tab, { data: unknown; error: string | null }>>>({});

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (cache[tab] !== undefined) return;
    const loaders: Record<Tab, () => Promise<unknown>> = {
      features: getFeatures,
      algorithms: getAlgorithms,
      apps: getApps,
      agent: getAgent,
      bench: getBench,
    };
    loaders[tab]().then(
      (data) => setCache((c) => (c[tab] !== undefined ? c : { ...c, [tab]: { data, error: null } })),
      (e) => setCache((c) => (c[tab] !== undefined ? c : { ...c, [tab]: { data: null, error: String(e) } })),
    );
  }, [tab, cache]);

  const current = cache[tab];
  const data = current?.data;
  const error = current?.error ?? null;

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'zh' : 'en';
    setLang(next);
    saveLang(next);
  };

  const toggleDetail = (name: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const tabLabels = ui.tabs[lang];
  const f = ui.footer[lang];

  return (
    <div className="app">
      <header>
        <div className="header-row">
          <div>
            <h1>lume showcase</h1>
            <p>{ui.headerSub[lang]}</p>
          </div>
          <button
            className="lang-toggle"
            onClick={toggle}
            aria-label={ui.toggleTitle[lang]}
            title={ui.toggleTitle[lang]}
          >
            {ui.toggleLabel[lang]}
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={tab === 'features' ? 'active' : ''}
          onClick={() => setTab('features')}
          aria-pressed={tab === 'features'}
        >
          {tabLabels[0]}
        </button>
        <button
          className={tab === 'algorithms' ? 'active' : ''}
          onClick={() => setTab('algorithms')}
          aria-pressed={tab === 'algorithms'}
        >
          {tabLabels[1]}
        </button>
        <button
          className={tab === 'apps' ? 'active' : ''}
          onClick={() => setTab('apps')}
          aria-pressed={tab === 'apps'}
        >
          {tabLabels[2]}
        </button>
        <button
          className={tab === 'agent' ? 'active' : ''}
          onClick={() => setTab('agent')}
          aria-pressed={tab === 'agent'}
        >
          {tabLabels[3]}
        </button>
        <button
          className={tab === 'bench' ? 'active' : ''}
          onClick={() => setTab('bench')}
          aria-pressed={tab === 'bench'}
        >
          {tabLabels[4]}
        </button>
      </div>

      {tab === 'features' &&
        (error ? <div className="error">{error}</div> :
         data ? <Features data={data as Feature[]} lang={lang} open={open} onToggle={toggleDetail} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'algorithms' &&
        (error ? <div className="error">{error}</div> :
         data ? <Algorithms data={data as Algorithm[]} lang={lang} open={open} onToggle={toggleDetail} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'apps' &&
        (error ? <div className="error">{error}</div> :
         data ? <Apps data={data as AppItem[]} lang={lang} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'agent' &&
        (error ? <div className="error">{error}</div> :
         data ? <Agent data={data as AgentItem[]} lang={lang} open={open} onToggle={toggleDetail} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'bench' &&
        (error ? <div className="error">{error}</div> :
         data ? <Performance data={data as Bench[]} lang={lang} /> : <div className="loading">{ui.loading[lang]}</div>)}

      <footer>
        <b>{f.stack}</b>: {f.body}<code>{f.code}</code>{f.tail}
      </footer>
    </div>
  );
}
