// web/src/i18n.ts — client-side language switch (en/zh).
// The lume-core API stays English (public, neutral source of truth). The
// frontend translates display strings for the zh view; any field without a
// zh override falls back to the API's English value. The `demo` field is the
// actual executed program output (technical, language-neutral), except a few
// prose-like demos which get a zh override.

export type Lang = 'en' | 'zh';

const KEY = 'lume-showcase-lang';

export function getInitialLang(): Lang {
  try {
    const s = localStorage.getItem(KEY);
    if (s === 'en' || s === 'zh') return s;
  } catch { /* storage unavailable */ }
  // No stored preference: follow the browser language, default to English.
  return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch { /* storage unavailable */ }
}

// Overridable display fields; the dict is keyed by the API's English `name`.
type Fields = {
  name?: string;
  desc?: string;
  metric?: string;
  area?: string;
  libs?: string;
  note?: string;
  from?: string;
  to?: string;
  demo?: string;
};

const zhDict: Record<string, Fields> = {
  // ---- features (src/features.lume) ----
  'static typing & inference': {
    name: '静态类型与推断',
    desc: '类型标注 + let 推断 + int→float 加宽',
  },
  'enum + match': {
    name: '枚举 + 模式匹配',
    desc: '代数数据类型 · 穷尽 match · 模式绑定',
  },
  'higher-order + trailing closure': {
    name: '高阶函数 + 尾闭包',
    desc: 'map/filter/reduce · 尾闭包',
  },
  range: {
    name: 'range 序列',
    desc: '整数序列 · 迭代',
  },
  'Result + ?': {
    name: 'Result + ?',
    desc: '错误传播 · ? 解包 ok · err 自动上抛',
  },
  'string cast & concat': {
    name: '字符串转换与拼接',
    desc: 'str/int/float + map 访问器',
  },
  'module import': {
    name: '模块导入',
    desc: 'import 别名 · 跨模块成员调用',
    demo: 'export func feature_list() 可跨模块使用（server.lume 已 import）',
  },
  'list reference semantics': {
    name: 'list 引用语义',
    desc: 'list 是可变容器 · push 原地追加（实测 · 非值语义）',
  },
  'float division': {
    name: '浮点除法',
    desc: "'/' 恒 float · 整数除法保留小数",
  },
  'builtin HTTP server': {
    name: '内建 HTTP 服务',
    desc: 'server{} + run() · docroot 静态服务',
    demo: 'server { port/docroot } + run() 内建 · 此处可被 HTTP 路由调用',
  },
  'builtin HTTP client': {
    name: '内建 HTTP 客户端',
    desc: 'http_get · SSRF 闸门拒绝私有地址',
    demo: 'http_get(url, opts) 解释器内建 · SSRF 闸门拒私有地址 · 编译后端未接入（边界）',
  },
  'C kernel matmul': {
    name: 'C 内核 matmul',
    desc: '墙 3 · 三后端逐位一致 · 12×',
  },

  // ---- algorithms (src/algorithms.lume) ----
  'dense matmul (C kernel)': {
    name: '稠密矩阵乘法（C 内核）',
    area: '线性代数 / 墙 3',
    metric: '128×128 · 30 次 0.05s vs 0.60s ≈ 12× · 逐位一致',
    desc: '内建 matmul · 严格 FP（k 升序 · 无 FMA 紧缩）· 三后端共享',
  },
  'PINN analytic gradient': {
    name: 'PINN 解析梯度',
    area: '科学机器学习 / 墙 1',
    metric: '训练 4.5min → 1.3s ≈ 200× · loss 0.573 → 0.00224 · 相对 L2 1.43%',
    desc: '伴随 dual 反扫（无磁带分配）· Adam 换解析梯度',
  },
  'MLP backprop': {
    name: 'MLP 反向传播',
    area: '深度学习',
    metric: 'v0.3.0 同批落地 · 解析梯度',
    desc: '两层 MLP · tanh/sigmoid · BCE 损失',
  },
  'linear algebra (LU/QR/eig/SVD)': {
    name: '线性代数（LU/QR/特征值/SVD）',
    area: '线性代数',
    metric: '纯 lume · legacy 0.12.2 可 import',
    desc: '矩阵构造/转置/加减乘/迹/行列式/求解/逆/LU/QR/幂法特征/SVD',
  },
  'numerical integration': {
    name: '数值积分',
    area: '科学计算',
    metric: 'trapz/simpson · 1/3 精确',
    desc: '积分/插值/散度/互信息/统计',
  },
  'gradient descent': {
    name: '梯度下降',
    area: '优化',
    metric: '50 步收敛 x→3',
    desc: '梯度下降/牛顿法/线搜索',
  },
  'k-means': {
    name: 'k-means',
    area: '聚类',
    metric: '单次迭代 · 簇心更新',
    desc: '无监督 · kNN/k-means 同族',
  },
  '1D heat equation (FDM)': {
    name: '一维热方程（有限差分）',
    area: '偏微分方程',
    metric: '显式格式 · 稳定条件 dt≤0.5dx²',
    desc: '有限差分 · 边界/初值',
  },
  'KL divergence': {
    name: 'KL 散度',
    area: '概率',
    metric: '验证 KL(p||q)≥0',
    desc: '分布散度/熵/统计检验',
  },
  'complex arithmetic': {
    name: '复数运算',
    area: '代数',
    metric: 'i²=-1 · z² 复乘',
    desc: '复数四则/模/辐角',
  },
  'signal smoothing': {
    name: '信号平滑',
    area: '信号处理',
    metric: '滑动平均 · 边界处理',
    desc: '平滑/差分/频谱基础',
  },
  'graph BFS': {
    name: '图 BFS',
    area: '图',
    metric: '最短步数 · 队列',
    desc: '遍历/最短路/连通性',
  },

  // ---- apps (server.lume) ----
  'HTTP API / Web service': {
    name: 'HTTP API / Web 服务',
    desc: '内建 server{} + run() · docroot 静态服务 · SSE · 路由闭包',
    libs: 'lume-core 内建',
  },
  'scientific computing CLI': {
    name: '科学计算 CLI',
    desc: '数值积分/插值/线性求解/特征值（sci · linalg 库）',
    libs: 'sci.lume, linalg.lume',
  },
  'ML training & inference': {
    name: 'ML 训练与推理',
    desc: 'MLP/注意力/聚类/降维 · 纯 .lume 训练循环（ml 库）',
    libs: 'ml.lume',
  },
  'PINN solver': {
    name: 'PINN 求解器',
    desc: '物理约束神经求解 · 解析梯度（墙 1 · 200×）',
    libs: 'pinn.lume',
  },
  'PDE numerical solver': {
    name: '偏微分方程数值解',
    desc: '有限差分 · 热方程/波动（pde 库）',
    libs: 'pde.lume',
  },
  'data pipeline / batch': {
    name: '数据管道 / 批处理',
    desc: 'map/filter/reduce · list 引用语义 · 文件内建',
    libs: 'lume 内建',
  },
  'static site + API in one process': {
    name: '静态站点 + API 同进程',
    desc: 'docroot 静态 + 路由 API · 单一二进制进程',
    libs: 'server{}',
  },
  'MCP server': {
    name: 'MCP 服务器',
    desc: 'mcp_fs / mcp_math 先例 · 模型上下文协议',
    libs: 'lume-core 内建',
  },
  'graph / signal / statistics tools': {
    name: '图 / 信号 / 统计工具',
    desc: '图遍历 · 信号平滑 · 分布散度（graph · sig · dist 库）',
    libs: 'graph.lume, sig.lume, dist.lume',
  },
  'SQLite data storage': {
    name: 'SQLite 数据存储',
    desc: 'sql_query 内建 · 结构化查询',
    libs: 'lume-core 内建',
  },
  'crypto / hash tools': {
    name: '加密 / 哈希工具',
    desc: 'crypt_sha512 · hmac_sha256 · spawn 子进程',
    libs: 'lume-core 内建',
  },
  'optimization / operations research': {
    name: '优化 / 运筹',
    desc: '梯度下降/牛顿法/线搜索（optim 库）',
    libs: 'optim.lume',
  },

  // ---- bench (server.lume) ----
  'wall 1 · PINN analytic gradient': {
    name: '墙 1 · PINN 解析梯度',
    from: '4.5 分钟（数值）',
    to: '1.3 秒（解析）',
    note: '训练 · 编译后端 · loss 0.573 → 0.00224 · 相对 L2 1.43%',
  },
  'wall 2 · codegen vs C': {
    name: '墙 2 · codegen vs C',
    from: '1.00×（C）',
    to: '1.02×（lume）',
    note: '标量循环 · codegen 已达 C 速',
  },
  'wall 3 · blas C kernel': {
    name: '墙 3 · blas C 内核',
    from: '0.60 秒（纯 lume）',
    to: '0.05 秒（C 内核）',
    note: '128×128 · 30 次 · 逐位一致',
  },
};

// Localize an API item: English is the source of truth; zh overrides fields.
export function localize<T extends { name: string }>(item: T, lang: Lang): T {
  if (lang === 'en') return item;
  const z = zhDict[item.name];
  if (!z) return item;
  return { ...item, ...z } as T;
}

// Static UI strings.
export const ui = {
  headerSub: {
    en: 'lume language features · algorithm status · public application landscape — served by lume-core',
    zh: 'lume 语言特性 · 算法现状 · 公共应用全景 — 由 lume-core 提供',
  },
  tabs: {
    en: ['Language features', 'Algorithms', 'Applications', 'Performance'],
    zh: ['语言特性', '算法', '应用', '性能'],
  },
  loading: { en: 'loading…', zh: '加载中…' },
  toggleLabel: { en: '中文', zh: 'EN' },
  toggleTitle: { en: 'Switch to Chinese', zh: '切换到英文' },
  footer: {
    en: {
      stack: 'Stack',
      body: 'lume language (static typing · enum/match · HOF · Result·? · modules) + lume-core runtime ({server{}}/run() HTTP · docroot · sql_query · C-kernel matmul) + React frontend (Vite). Data above is produced by ',
      code: 'lume-core server.lume',
      tail: ' — each feature/algorithm demo ran on the interpreter.',
    },
    zh: {
      stack: '技术栈',
      body: 'lume 语言（静态类型 · 枚举/模式匹配 · 高阶函数 · Result·? · 模块）+ lume-core 运行时（{server{}}/run() HTTP · docroot · sql_query · C 内核 matmul）+ React 前端（Vite）。上方数据由 ',
      code: 'lume-core server.lume',
      tail: ' 产生 —— 每个特性/算法 demo 都在解释器上运行过。',
    },
  },
} as const;
