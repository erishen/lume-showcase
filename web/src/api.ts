import type { AgentItem, Algorithm, AppItem, Bench, Feature } from './types';

// The lume-core backend returns { status, type, body } where body is a JSON string.
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const env = await res.json();
  return JSON.parse(env.body) as T;
}

export const getFeatures = () => getJson<Feature[]>('/api/features');
export const getAlgorithms = () => getJson<Algorithm[]>('/api/algorithms');
export const getApps = () => getJson<AppItem[]>('/api/apps');
export const getAgent = () => getJson<AgentItem[]>('/api/agent');
export const getBench = () => getJson<Bench[]>('/api/bench');
