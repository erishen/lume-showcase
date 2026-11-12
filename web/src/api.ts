import type { AgentItem, Algorithm, AppItem, Bench, Feature, OverviewItem } from './types';

// The lume-core backend returns { status, type, body } where body is a JSON string.
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const env = await res.json();
  return JSON.parse(env.body) as T;
}

export const getFeatures = () => getJson<Feature[]>('/api/features');
export const getOverview = () => getJson<OverviewItem[]>('/api/overview');
export const getAlgorithms = () => getJson<Algorithm[]>('/api/algorithms');
export const getApps = () => getJson<AppItem[]>('/api/apps');
export const getAgent = () => getJson<AgentItem[]>('/api/agent');
export const getBench = () => getJson<Bench[]>('/api/bench');

// 访客埋点：页面加载时上报一次 PV。visitor id 由 localStorage 持久化，
// 后端按它算 UV；path 只传 pathname（不把 query 里的参数入库）。
// 埋点失败不能影响页面渲染，所以吞掉所有异常。
function visitorId(): string {
  try {
    const key = 'lume_showcase_visitor';
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = (window.crypto && 'randomUUID' in window.crypto)
        ? window.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export async function recordVisit(): Promise<void> {
  try {
    await fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer,
        ua: navigator.userAgent,
        visitor: visitorId(),
        wd: String(navigator.webdriver),
      }),
      keepalive: true,
    });
  } catch {
    // 统计是旁路能力：网络/隐私模式下失败不阻塞展示。
  }
}
