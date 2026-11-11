import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AgentItem, Algorithm, AppItem, Bench, Feature, OverviewItem } from './types';
import { getAgent, getAlgorithms, getApps, getBench, getFeatures, getOverview } from './api';
import { getInitialLang, saveLang, ui } from './i18n';
import type { Lang } from './i18n';

// Each tab is its own lazy chunk: the first paint loads only the shell and
// the active tab (Overview), and the other five load on first open — the
// page shows content instead of waiting for the whole 187 KB single bundle.
const Overview = lazy(() => import('./tabs/Overview'));
const Features = lazy(() => import('./tabs/Features'));
const Algorithms = lazy(() => import('./tabs/Algorithms'));
const Apps = lazy(() => import('./tabs/Apps'));
const Agent = lazy(() => import('./tabs/Agent'));
const Performance = lazy(() => import('./tabs/Performance'));

type Tab = 'overview' | 'features' | 'algorithms' | 'apps' | 'agent' | 'bench';

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
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
      overview: getOverview,
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

  // The shell (header + tabs + footer) renders immediately; the active tab's
  // lazy chunk + API data appear under Suspense.
  const tabView = (node: ReactNode) =>
    error ? <div className="error">{error}</div> :
    data ? node : <div className="loading">{ui.loading[lang]}</div>;

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
          className={tab === 'overview' ? 'active' : ''}
          onClick={() => setTab('overview')}
          aria-pressed={tab === 'overview'}
        >
          {tabLabels[0]}
        </button>
        <button
          className={tab === 'features' ? 'active' : ''}
          onClick={() => setTab('features')}
          aria-pressed={tab === 'features'}
        >
          {tabLabels[1]}
        </button>
        <button
          className={tab === 'algorithms' ? 'active' : ''}
          onClick={() => setTab('algorithms')}
          aria-pressed={tab === 'algorithms'}
        >
          {tabLabels[2]}
        </button>
        <button
          className={tab === 'apps' ? 'active' : ''}
          onClick={() => setTab('apps')}
          aria-pressed={tab === 'apps'}
        >
          {tabLabels[3]}
        </button>
        <button
          className={tab === 'agent' ? 'active' : ''}
          onClick={() => setTab('agent')}
          aria-pressed={tab === 'agent'}
        >
          {tabLabels[4]}
        </button>
        <button
          className={tab === 'bench' ? 'active' : ''}
          onClick={() => setTab('bench')}
          aria-pressed={tab === 'bench'}
        >
          {tabLabels[5]}
        </button>
      </div>

      <Suspense fallback={<div className="loading">{ui.loading[lang]}</div>}>
        {tab === 'overview' && tabView(<Overview data={data as OverviewItem[]} lang={lang} open={open} onToggle={toggleDetail} />)}
        {tab === 'features' && tabView(<Features data={data as Feature[]} lang={lang} open={open} onToggle={toggleDetail} />)}
        {tab === 'algorithms' && tabView(<Algorithms data={data as Algorithm[]} lang={lang} open={open} onToggle={toggleDetail} />)}
        {tab === 'apps' && tabView(<Apps data={data as AppItem[]} lang={lang} open={open} onToggle={toggleDetail} />)}
        {tab === 'agent' && tabView(<Agent data={data as AgentItem[]} lang={lang} open={open} onToggle={toggleDetail} />)}
        {tab === 'bench' && tabView(<Performance data={data as Bench[]} lang={lang} open={open} onToggle={toggleDetail} />)}
      </Suspense>

      <footer>
        <b>{f.stack}</b>: {f.body}<code>{f.code}</code>{f.tail}
        <div className="project-links">
          <a className="repo" href="https://github.com/erishen/lume" target="_blank" rel="noopener noreferrer">
            github.com/erishen/lume ↗
          </a>
          <a className="repo" href="https://github.com/erishen/lume-core" target="_blank" rel="noopener noreferrer">
            github.com/erishen/lume-core ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
