import { useEffect, useState } from 'react';
import type { Algorithm, AppItem, Bench, Feature } from './types';
import { getAlgorithms, getApps, getBench, getFeatures } from './api';

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

function Features({ data }: { data: Feature[] }) {
  return (
    <div className="grid">
      {data.map((f, i) => (
        <div className="card" key={i}>
          <div className="title">
            <h3>{f.name}</h3>
            <span className={`badge ${f.status === 'ok' ? 'ok' : ''}`}>{f.status}</span>
          </div>
          <p className="desc">{f.desc}</p>
          <div className="demo">{f.demo}</div>
        </div>
      ))}
    </div>
  );
}

function Algorithms({ data }: { data: Algorithm[] }) {
  return (
    <div className="grid">
      {data.map((a, i) => (
        <div className="card" key={i}>
          <div className="title">
            <h3>{a.name}</h3>
            <span className="badge">{a.lib}</span>
            <span className="badge">{a.area}</span>
          </div>
          <p className="metric">{a.metric}</p>
          <p className="desc">{a.desc}</p>
          <div className="demo">{a.demo}</div>
        </div>
      ))}
    </div>
  );
}

function Apps({ data }: { data: AppItem[] }) {
  return (
    <div className="grid">
      {data.map((a, i) => (
        <div className="card" key={i}>
          <div className="title">
            <h3>{a.name}</h3>
            <span className={`badge ${a.status === 'ok' ? 'ok' : ''}`}>{a.status}</span>
          </div>
          <p className="desc">{a.desc}</p>
          <div className="demo">{a.libs}</div>
        </div>
      ))}
    </div>
  );
}

// Performance comparison (wall 1/2/3 · lume-core measured): bar width is
// log10(speedup)-scaled so 207x and 1.02x stay balanced on a linear axis.
function Performance({ data }: { data: Bench[] }) {
  const maxLog = Math.log10(Math.max(...data.map((d) => d.speedup)));
  return (
    <div className="grid">
      {data.map((b, i) => {
        const w = Math.max(2, (Math.log10(b.speedup) / maxLog) * 100);
        return (
          <div className="card" key={i}>
            <div className="title">
              <h3>{b.name}</h3>
              <span className="badge ok">{b.speedup}×</span>
            </div>
            <p className="desc">{b.from} → {b.to}</p>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${w}%` }} />
            </div>
            <p className="metric">{b.note}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('features');
  const feats = useFetch(getFeatures);
  const algos = useFetch(getAlgorithms);
  const apps = useFetch(getApps);
  const bench = useFetch(getBench);

  return (
    <div className="app">
      <header>
        <h1>lume showcase</h1>
        <p>lume language features · algorithm status · public application landscape — served by lume-core</p>
      </header>

      <div className="tabs">
        <button
          className={tab === 'features' ? 'active' : ''}
          onClick={() => setTab('features')}
          aria-pressed={tab === 'features'}
        >
          Language features
        </button>
        <button
          className={tab === 'algorithms' ? 'active' : ''}
          onClick={() => setTab('algorithms')}
          aria-pressed={tab === 'algorithms'}
        >
          Algorithms
        </button>
        <button
          className={tab === 'apps' ? 'active' : ''}
          onClick={() => setTab('apps')}
          aria-pressed={tab === 'apps'}
        >
          Applications
        </button>
        <button
          className={tab === 'bench' ? 'active' : ''}
          onClick={() => setTab('bench')}
          aria-pressed={tab === 'bench'}
        >
          Performance
        </button>
      </div>

      {tab === 'features' &&
        (feats.error ? <div className="error">{feats.error}</div> :
         feats.data ? <Features data={feats.data} /> : <div className="loading">loading…</div>)}

      {tab === 'algorithms' &&
        (algos.error ? <div className="error">{algos.error}</div> :
         algos.data ? <Algorithms data={algos.data} /> : <div className="loading">loading…</div>)}

      {tab === 'apps' &&
        (apps.error ? <div className="error">{apps.error}</div> :
         apps.data ? <Apps data={apps.data} /> : <div className="loading">loading…</div>)}

      {tab === 'bench' &&
        (bench.error ? <div className="error">{bench.error}</div> :
         bench.data ? <Performance data={bench.data} /> : <div className="loading">loading…</div>)}

      <footer>
        <b>Stack</b>: lume language (static typing · enum/match · HOF · Result·? · modules) +
        lume-core runtime ({'server{}'}/run() HTTP · docroot · sql_query · C-kernel matmul) +
        React frontend (Vite). Data above is produced by <code>lume-core server.lume</code> —
        each feature/algorithm demo ran on the interpreter.
      </footer>
    </div>
  );
}
