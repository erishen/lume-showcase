import type { Algorithm, AppItem, Bench, Feature } from './types';

// lume-core 后端返回 { status, type, body }，body 是 JSON 字符串。
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const env = await res.json();
  return JSON.parse(env.body) as T;
}

export const getFeatures = () => getJson<Feature[]>('/api/features');
export const getAlgorithms = () => getJson<Algorithm[]>('/api/algorithms');
export const getApps = () => getJson<AppItem[]>('/api/apps');
export const getBench = () => getJson<Bench[]>('/api/bench');
