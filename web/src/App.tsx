import { useEffect, useState } from 'react';
import type { Algorithm, AppItem, Bench, Feature } from './types';
import { getAlgorithms, getApps, getBench, getFeatures } from './api';
import { getInitialLang, localize, saveLang, ui } from './i18n';
import type { Lang } from './i18n';

type Tab = 'features' | 'algorithms' | 'apps' | 'bench';

function useFetch<T>(loader: () => Promise<T>): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loader()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [loader]);
  return { data, error };
}

function Features({ data, lang }: { data: Feature[]; lang: Lang }) {
  return (
    <div className="grid">
      {data.map((f, i) => {
        const x = localize(f, lang);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{x.name}</h3>
              <span className={`badge ${x.status === 'ok' ? 'ok' : ''}`}>{x.status}</span>
            </div>
            <p className="desc">{x.desc}</p>
            <div className="demo">{x.demo}</div>
          </div>
        );
      })}
    </div>
  );
}

function Algorithms({ data, lang }: { data: Algorithm[]; lang: Lang }) {
  return (
    <div className="grid">
      {data.map((a, i) => {
        const x = localize(a, lang);
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
  const feats = useFetch(getFeatures);
  const algos = useFetch(getAlgorithms);
  const apps = useFetch(getApps);
  const bench = useFetch(getBench);

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'zh' : 'en';
    setLang(next);
    saveLang(next);
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
          className={tab === 'bench' ? 'active' : ''}
          onClick={() => setTab('bench')}
          aria-pressed={tab === 'bench'}
        >
          {tabLabels[3]}
        </button>
      </div>

      {tab === 'features' &&
        (feats.error ? <div className="error">{feats.error}</div> :
         feats.data ? <Features data={feats.data} lang={lang} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'algorithms' &&
        (algos.error ? <div className="error">{algos.error}</div> :
         algos.data ? <Algorithms data={algos.data} lang={lang} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'apps' &&
        (apps.error ? <div className="error">{apps.error}</div> :
         apps.data ? <Apps data={apps.data} lang={lang} /> : <div className="loading">{ui.loading[lang]}</div>)}

      {tab === 'bench' &&
        (bench.error ? <div className="error">{bench.error}</div> :
         bench.data ? <Performance data={bench.data} lang={lang} /> : <div className="loading">{ui.loading[lang]}</div>)}

      <footer>
        <b>{f.stack}</b>: {f.body}<code>{f.code}</code>{f.tail}
      </footer>
    </div>
  );
}
