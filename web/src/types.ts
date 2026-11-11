export interface Feature {
  name: string;
  desc: string;
  demo: string;
  status: string;
}

export interface Algorithm {
  name: string;
  lib: string;
  area: string;
  metric: string;
  desc: string;
  demo: string;
}

export interface AppItem {
  name: string;
  desc: string;
  libs: string;
  status: string;
}

export interface Bench {
  name: string;
  from: string;
  to: string;
  speedup: number;
  note: string;
}
