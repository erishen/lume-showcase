// web/src/content.ts — richer per-item detail (bilingual) for the showcase.
// The lume-core API stays lean (name/desc/metric/demo); this module supplies
// the expandable detail panel: a longer description, the actual lume source
// that produced the demo, and a few key points. Keyed by the API's English
// name; a card without an entry simply shows no detail panel.

export interface Detail {
  longEn: string;
  longZh: string;
  code: string;
  pointsEn: string[];
  pointsZh: string[];
}

const d = (longEn: string, longZh: string, code: string, pointsEn: string[], pointsZh: string[]): Detail => ({
  longEn, longZh, code, pointsEn, pointsZh,
});

export const detail: Record<string, Detail> = {
  // ---- features (src/features.lume) ----
  'static typing & inference': d(
    'lume is statically typed: every binding has a type, inferred when possible or annotated explicitly. Literals widen automatically (int -> float), and the compiler rejects mismatches instead of failing at runtime.',
    'lume 是静态类型语言：每个绑定都有类型，可推断或显式标注。字面量自动加宽（int → float），类型不匹配在编译期拒绝而非运行期报错。',
    `let a: FPoint = { x: 3, y: 4 };   // struct type annotation
let dx = a.x;               // inferred int
let w: float = 7;           // int literal widens to float
return "p=" + str(a) + " dx=" + str(dx) + " widened=" + str(w);`,
    ['Annotation and inference both work', 'int literals widen to float automatically', 'Struct/field access is type-checked'],
    ['标注与推断皆可用', 'int 字面量自动加宽为 float', '结构体/字段访问有类型检查'],
  ),
  'enum + match': d(
    'Enums are algebraic data types with pattern matching. A match is exhaustive (the compiler checks all variants) and binds pattern variables per arm, so invalid states are unrepresentable.',
    '枚举是代数数据类型，支持模式匹配。match 穷尽（编译器检查所有分支）并按分支绑定模式变量，非法状态不可表示。',
    `let s = Cir(2.0);
let area = match (s) { Cir(r) => 3.14 * r * r, Rect(w, h) => w * h };
let name = match (s) { Cir(r) => "circle", Rect(w, h) => "rect" };
let c: FColor = Green;
let word = match (c) { Red => "stop", Green => "go", Blue => "cool" };
return "area=" + str(area) + " " + name + " " + word;`,
    ['ADTs: product + sum types', 'Exhaustive match with pattern binding', 'Arm-scoped variables (no leaking)'],
    ['代数数据类型：积 + 和类型', '穷尽 match + 模式绑定', '分支作用域变量（不泄漏）'],
  ),
  'higher-order + trailing closure': d(
    'Functions are values: map/filter/reduce take a closure. Trailing-closure syntax keeps the lambda at the end of the call, so collection pipelines read naturally without boilerplate.',
    '函数是一等值：map/filter/reduce 接受闭包。尾闭包语法把 lambda 放在调用末尾，集合管道无需样板即可读。',
    `let xs = [1, 2, 3, 4, 5];
let ys = map((x) => x * x, xs);                    // trailing closure
let evens = filter((x) => x % 2 == 0, xs);
let total = reduce((acc, x) => acc + x, xs, 0);
return "sq=" + str(ys) + " evens=" + str(evens) + " sum=" + str(total);`,
    ['map / filter / reduce are builtin HOFs', 'Trailing closures avoid extra parens', 'Pipelines compose without loops'],
    ['map / filter / reduce 为内建高阶函数', '尾闭包省去多余括号', '管道无循环即可组合'],
  ),
  range: d(
    'range(a, b) produces an integer sequence, the idiomatic way to iterate a fixed number of steps. Combined with len() it replaces the classic C-style loop header while keeping the index in scope.',
    'range(a, b) 生成整数序列，是固定步数迭代的惯用方式。配合 len() 取代 C 风格循环头，同时保留索引作用域。',
    `let r = range(1, 5);
let acc: string = "";
for (let i = 0; i < len(r); i = i + 1) {
  acc = acc + str(r[i]);
  if (i < len(r) - 1) { acc = acc + ","; }
}
return "range(1,5)=[" + acc + "] len=" + str(len(r));`,
    ['Half-open [a, b) integer sequence', 'Iterates with an explicit index', 'No manual counter bookkeeping'],
    ['半开区间 [a, b) 整数序列', '带显式索引迭代', '无需手动维护计数器'],
  ),
  'Result + ?': d(
    'Fallible calls return a Result that is either { ok } or { err }. The ? operator unwraps ok and propagates err up the call chain, so happy paths stay flat and error paths are explicit.',
    '可失败调用返回 Result（{ ok } 或 { err }）。? 操作符解包 ok 并把 err 沿调用链上抛，快乐路径保持平直，错误路径显式。',
    `func _report_ok(): Result {
  let q: float = _divide(21, 7)?;   // unwraps ok, propagates err
  return { ok: "q=" + str(q) };
}
func _divide(a: int, b: int): Result {
  if (b == 0) { return { err: "div by zero" }; }
  return { ok: a / b };
}`,
    ['Result = { ok } | { err }', '? unwraps ok / propagates err', 'No exceptions: errors are values'],
    ['Result = { ok } | { err }', '? 解包 ok / 上抛 err', '无异常：错误即值'],
  ),
  'string cast & concat': d(
    'str() converts values to strings and also reads map fields with a default; + concatenates strings. This keeps formatting explicit and safe — no implicit string coercion hiding type errors.',
    'str() 把值转字符串，也可带默认值读取 map 字段；+ 拼接字符串。格式化显式安全——无隐式字符串强转隐藏类型错误。',
    `let acc = { name: "lume", n: "42", amt: 3.5 };
let tag = "v" + str(acc, "n", "0");          // map accessor with default
let amt: float = float(get(acc, "amt", 0.0));
return tag + "|" + str(acc, "name", "") + "|" + str(amt);`,
    ['str(x) / str(map, key, default)', 'float() casts explicitly', '+ is the only string concat'],
    ['str(x) / str(map, key, default)', 'float() 显式转换', '+ 是唯一字符串拼接'],
  ),
  'module import': d(
    'A .lume file is a module: export func makes members importable. server.lume imports this module as an alias and calls feature_list() cross-module — the whole showcase is wired this way.',
    '一个 .lume 文件即模块：export func 使成员可导入。server.lume 以别名导入本模块并跨模块调用 feature_list()——整个 showcase 都这样接线。',
    `// src/features.lume (module)
export func feature_list() {
  // ... returns the 12 feature entries
}

// server.lume (importer)
import "./src/features.lume" as feats;
get "/api/features", (req) => {
  return json(stringify(feats.feature_list()));
};`,
    ['export func exposes members', 'import ... as alias', 'Cross-module member calls'],
    ['export func 暴露成员', 'import ... as 别名', '跨模块成员调用'],
  ),
  'list reference semantics': d(
    'A list is a mutable container: push appends in place and returns the same reference (measured, not value semantics). Two names can share one list, so aliasing is intentional and copy() is explicit.',
    'list 是可变容器：push 原地追加并返回同一引用（实测·非值语义）。两个名字可共享同一 list，别名是有意为之，复制需显式 copy()。',
    `let a: int[] = [1, 2];
let b: int[] = push(a, 3);   // appends in place, same ref
return "a_after=" + str(a) + " b=" + str(b)
     + " shared=" + str(len(a) == len(b));`,
    ['push mutates in place (measured)', 'Returns the same reference', 'Aliasing is intentional; copy() is explicit'],
    ['push 原地追加（实测）', '返回同一引用', '别名有意；复制需显式 copy()'],
  ),
  'float division': d(
    'The / operator always returns float, even for integer operands, so 7/2 is 3.5. This removes a whole class of integer-division bugs; use int() when a floored integer is wanted.',
    '/ 恒返回 float，即使整数操作数，7/2 得 3.5。这消除一整类整数除法 bug；需要向下取整整数时用 int()。',
    `let r = 7 / 2;   // 3.5, not 3
return "7/2=" + str(r) + " is_float=" + str(r > 3.0 and r < 4.0);`,
    ['/ is always float', 'No integer-truncation surprises', 'int() converts explicitly'],
    ['/ 恒 float', '无整数截断意外', 'int() 显式转换'],
  ),
  'builtin HTTP server': d(
    'server{} + run() is a builtin HTTP server with route closures and static docroot serving. server.lume runs on it to serve /api/* plus the built React frontend from one process.',
    'server{} + run() 是内建 HTTP 服务，支持路由闭包与静态 docroot。server.lume 运行其上，单进程服务 /api/* 与构建后的 React 前端。',
    `server {
  host = bind_host;
  port = 18793;
  docroot = "web/dist";
}
run();`,
    ['server{} + run() builtin', 'Route closures per path', 'Static docroot + API in one process'],
    ['server{} + run() 内建', '每路径路由闭包', '静态 docroot + API 同进程'],
  ),
  'builtin HTTP client': d(
    'http_get is an interpreter builtin with an SSRF gate that rejects private addresses (127.0.0.1, 10.x, 192.168.x, 172.16-31). The compiled backends have no builtin table entry, so this demo describes the boundary instead of calling it.',
    'http_get 是解释器内建，带 SSRF 闸门拒绝私有地址（127.0.0.1、10.x、192.168.x、172.16-31）。编译后端无内建表条目，故本 demo 描述边界而非实际调用。',
    `// interpreter-only builtin
let r = http_get("http://127.0.0.1/", { timeout: 2 });
// SSRF gate rejects private addresses -> { err: ... }`,
    ['Interpreter builtin', 'SSRF gate blocks private addrs', 'Compiled backends lack the entry (boundary)'],
    ['解释器内建', 'SSRF 闸门拦私有地址', '编译后端无条目（边界）'],
  ),
  'C kernel matmul': d(
    'The builtin matmul is a C kernel (wall 3): it runs the same FP ops with k ascending and no FMA contraction, so the interpreter, text and LLVM backends produce bit-identical results. ~12x faster than pure-lume.',
    '内建 matmul 是 C 内核（墙 3）：k 升序、无 FMA 紧缩，解释器/文本/LLVM 三后端逐位一致。比纯 lume 快约 12×。',
    `let A = [[1.0, 2.0], [3.0, 4.0]];
let B = [[5.0, 6.0], [7.0, 8.0]];
return "matmul=" + str(matmul(A, B));`,
    ['Builtin C kernel', 'Strict FP: k ascending, no FMA', 'Three-backend bit-identical'],
    ['内建 C 内核', '严格 FP：k 升序·无 FMA', '三后端逐位一致'],
  ),

  // ---- algorithms (src/algorithms.lume) ----
  'dense matmul (C kernel)': d(
    'The blas.lume matmul is a C kernel with strict floating-point semantics (accumulation in ascending k, no FMA contraction). It is shared by the interpreter, text and LLVM backends and produces bit-identical results on all three.',
    'blas.lume 的 matmul 是 C 内核，严格浮点语义（按升序 k 累加·无 FMA 紧缩）。解释器/文本/LLVM 三后端共享并逐位一致。',
    `let A = [[1.0, 2.0], [3.0, 4.0]];
let B = [[5.0, 6.0], [7.0, 8.0]];
let m = len(A); let n = len(B[0]); let p = len(B);
let out: float[][] = [];
for (let i = 0; i < m; i = i + 1) {
  let row: float[] = [];
  for (let j = 0; j < n; j = j + 1) {
    let s = 0.0;
    for (let k = 0; k < p; k = k + 1) { s = s + A[i][k] * B[k][j]; }
    row = push(row, s);
  }
  out = push(out, row);
}
return "matmul=" + str(out);`,
    ['C kernel · wall 3 · 12x', 'Strict FP: k ascending, no FMA', 'Bit-identical across 3 backends'],
    ['C 内核 · 墙 3 · 12×', '严格 FP：k 升序·无 FMA', '三后端逐位一致'],
  ),
  'PINN analytic gradient': d(
    'The physics-informed neural network uses an adjoint dual reverse sweep instead of tape-based autodiff, so the analytic gradient needs no allocation. Adam with the analytic gradient trains ~200x faster than numeric differentiation.',
    '物理约束神经网络用伴随 dual 反扫取代磁带自动微分，解析梯度无需分配。Adam + 解析梯度比数值微分快约 200×。',
    `// single-input net u(x)=tanh(w*x+b) with w=1,b=0
let w = 1.0; let b = 0.0;
let x = 0.5;
let u = tanh(w * x + b);
let du_dx = (1.0 - u * u) * w;   // tanh' = 1 - tanh^2
return "u(0.5)=" + str(u) + " du/dx=" + str(du_dx);`,
    ['Adjoint dual reverse sweep', 'No tape allocation', 'Adam + analytic grad ~200x'],
    ['伴随 dual 反扫', '无磁带分配', 'Adam + 解析梯度 ≈200×'],
  ),
  'MLP backprop': d(
    'The ml.lume MLP trains with backpropagation over tanh/sigmoid activations and a BCE loss. It landed with the v0.3.0 release alongside the analytic-gradient work.',
    'ml.lume 的 MLP 用反向传播训练，激活为 tanh/sigmoid，损失为 BCE。与 v0.3.0 同批发布（随解析梯度工作）。',
    `let W1 = [[0.5, -0.3], [0.2, 0.8]];
let b1 = [0.1, -0.2];  let W2 = [[0.7, -0.5]];  let b2 = [0.05];
let x = [1.0, -1.0];
let h: float[] = [];
for (let j = 0; j < len(W1); j = j + 1) {
  let s = b1[j];
  for (let k = 0; k < len(x); k = k + 1) { s = s + W1[j][k] * x[k]; }
  h = push(h, tanh(s));
}
let o = b2[0];
for (let k = 0; k < len(h); k = k + 1) { o = o + W2[0][k] * h[k]; }
return "mlp2(x)=" + str(_sigmoid(o));`,
    ['Two-layer MLP', 'tanh / sigmoid + BCE loss', 'Backprop training loop in pure lume'],
    ['两层 MLP', 'tanh / sigmoid + BCE 损失', '纯 lume 反向传播训练循环'],
  ),
  'linear algebra (LU/QR/eig/SVD)': d(
    'The linalg.lume library is pure lume (importable from legacy 0.12.2): matrix construction, transpose, add/sub/mul, trace, determinant, solve, inverse, LU and QR factorizations, power iteration for eigenvalues, and SVD.',
    'linalg.lume 是纯 lume 库（legacy 0.12.2 可 import）：矩阵构造、转置、加减乘、迹、行列式、求解、逆、LU/QR 分解、幂法特征值、SVD。',
    `let A = [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]];
let T = [];
for (let j = 0; j < len(A[0]); j = j + 1) {
  let col = [];
  for (let i = 0; i < len(A); i = i + 1) { col = push(col, A[i][j]); }
  T = push(T, col);
}
let M = [[2.0, 1.0], [1.0, 3.0]];
let det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
return "transpose=" + str(T) + " det=" + str(det);`,
    ['Pure lume', 'LU/QR/power-eig/SVD', 'Legacy 0.12.2 importable'],
    ['纯 lume', 'LU/QR/幂法特征值/SVD', 'legacy 0.12.2 可 import'],
  ),
  'numerical integration': d(
    'The sci.lume library covers numerical integration (trapezoid, Simpson), interpolation, divergence, mutual information and statistics. The demo integrates x^2 over [0,1] exactly to 1/3.',
    'sci.lume 覆盖数值积分（梯形、Simpson）、插值、散度、互信息与统计。demo 将 x² 在 [0,1] 精确积为 1/3。',
    `let xs = [0.0, 0.25, 0.5, 0.75, 1.0];
let ys = map((x) => x * x, xs);
let acc = 0.0;
for (let i = 0; i < len(xs) - 1; i = i + 1) {
  acc = acc + (ys[i] + ys[i + 1]) * 0.5 * (xs[i + 1] - xs[i]);
}
return "trapz(x^2,0..1)=" + str(acc);`,
    ['trapz / simpson', 'Interp / divergence / mutual-info', 'Exact 1/3 for x^2 over [0,1]'],
    ['trapz / simpson', '插值 / 散度 / 互信息', 'x² 在 [0,1] 精确 1/3'],
  ),
  'gradient descent': d(
    "The optim.lume library provides gradient descent, Newton's method and line search. The demo minimizes (x-3)^2: after 50 steps the iterate converges to x = 3.",
    'optim.lume 提供梯度下降、牛顿法与线搜索。demo 最小化 (x-3)²：50 步后收敛到 x=3。',
    `let x = 0.0; let lr = 0.1;
for (let i = 0; i < 50; i = i + 1) {
  let grad = 2.0 * (x - 3.0);
  x = x - lr * grad;
}
return "gd_min=(x-3)^2 -> x=" + str(x);`,
    ['Gradient descent / Newton / line search', 'Converges x->3 in 50 steps', 'Step size is explicit (lr)'],
    ['梯度下降 / 牛顿法 / 线搜索', '50 步收敛 x→3', '步长显式（lr）'],
  ),
  'k-means': d(
    'The ml.lume clustering family includes k-means and kNN. The demo runs one k-means iteration over two clearly separated clusters and updates the centroids.',
    'ml.lume 聚类族含 k-means 与 kNN。demo 对两个明显分离的簇跑一次 k-means 迭代并更新簇心。',
    `let pts = [[0.0, 0.0], [1.0, 1.0], [8.0, 8.0], [9.0, 9.0]];
let c0 = [0.5, 0.5];  let c1 = [8.5, 8.5];
let g0 = 0; let g1 = 0; let s0x = 0.0; let s0y = 0.0; let s1x = 0.0; let s1y = 0.0;
for (let i = 0; i < len(pts); i = i + 1) {
  let d0 = (pts[i][0]-c0[0])*(pts[i][0]-c0[0]) + (pts[i][1]-c0[1])*(pts[i][1]-c0[1]);
  let d1 = (pts[i][0]-c1[0])*(pts[i][0]-c1[0]) + (pts[i][1]-c1[1])*(pts[i][1]-c1[1]);
  if (d0 < d1) { g0 = g0+1; s0x = s0x+pts[i][0]; s0y = s0y+pts[i][1]; }
  else { g1 = g1+1; s1x = s1x+pts[i][0]; s1y = s1y+pts[i][1]; }
}
return "clusters=" + str(g0) + "+" + str(g1)
     + " c0=(" + str(s0x/(g0*1.0)) + "," + str(s0y/(g0*1.0)) + ")";`,
    ['Unsupervised · kNN/k-means family', 'Centroid update per iteration', 'Distance is Euclidean'],
    ['无监督 · kNN/k-means 同族', '每迭代簇心更新', '距离为欧氏'],
  ),
  '1D heat equation (FDM)': d(
    'The pde.lume library solves PDEs by finite differences. The demo solves the 1D heat equation with an explicit scheme (stable for dt <= 0.5 dx^2) from a single initial pulse, then reports the peak.',
    'pde.lume 用有限差分求解 PDE。demo 用显式格式（dt ≤ 0.5dx² 稳定）解一维热方程，从单脉冲初值出发，报告峰值。',
    `let N = 8; let dx = 1.0/(N*1.0); let dt = 0.4*dx*dx;
let u: float[] = [];
for (let i = 0; i <= N; i = i + 1) { u = push(u, 0.0); }
u = _set_f(u, int(N/2), 1.0);          // initial pulse
for (let step = 0; step < 5; step = step + 1) {
  let un: float[] = [];
  for (let i = 0; i <= N; i = i + 1) { un = push(un, u[i]); }
  for (let i = 1; i < N; i = i + 1) {
    let lap = (u[i-1] - 2.0*u[i] + u[i+1]) / (dx*dx);
    un = _set_f(un, i, u[i] + dt*lap);
  }
  u = un;
}
return "heat_peak=" + str(_max(u));`,
    ['Explicit scheme', 'Stability dt <= 0.5 dx^2', 'Boundary/initial conditions'],
    ['显式格式', '稳定条件 dt ≤ 0.5dx²', '边界/初值'],
  ),
  'KL divergence': d(
    'The dist.lume library measures distribution divergence and entropy and provides statistical tests. The demo computes KL(p||q) for two Bernoulli-like distributions and confirms it is non-negative.',
    'dist.lume 度量分布散度与熵并提供统计检验。demo 对两个类伯努利分布计算 KL(p||q) 并验证非负。',
    `let p = [0.5, 0.5];  let q = [0.9, 0.1];
let kl = 0.0;
for (let i = 0; i < len(p); i = i + 1) {
  kl = kl + p[i] * log(p[i] / q[i]);
}
return "kl(p||q)=" + str(kl);`,
    ['Divergence / entropy / tests', 'KL(p||q) >= 0 verified', 'Natural log basis'],
    ['散度 / 熵 / 检验', '验证 KL(p||q) ≥ 0', '自然对数底'],
  ),
  'complex arithmetic': d(
    'The complex.lume library supports add/sub/mul/div, modulus and argument. The demo squares z = 1+2i: (1+2i)^2 = -3+4i, checking i^2 = -1.',
    'complex.lume 支持四则/模/辐角。demo 求 z=1+2i 的平方：(1+2i)² = -3+4i，验证 i²=-1。',
    `let a = 1.0; let b = 2.0;               // z = 1+2i
let re = a*a - b*b;  let im = 2.0*a*b;     // z^2
return "z^2=(1+2i)^2=" + str(re) + "+" + str(im) + "i";`,
    ['Add/sub/mul/div/abs/arg', 'i^2 = -1 holds', 'z^2 via complex multiply'],
    ['四则/模/辐角', 'i² = -1 成立', 'z² 复乘'],
  ),
  'signal smoothing': d(
    'The sig.lume library does smoothing, differencing and spectral basics. The demo applies a 3-point moving average to a ramp with boundary handling (clamping the window to valid indices).',
    'sig.lume 做平滑、差分与频谱基础。demo 对斜坡施加 3 点滑动平均，边界处理（窗口夹到有效索引）。',
    `let xs = [1.0, 2.0, 3.0, 4.0, 5.0];  let k = 3;
let out: float[] = [];
for (let i = 0; i < len(xs); i = i + 1) {
  let lo = i - int(k/2);  let hi = i + int(k/2);
  let s = 0.0; let cnt = 0;
  for (let j = lo; j <= hi; j = j + 1) {
    if (j >= 0 and j < len(xs)) { s = s + xs[j]; cnt = cnt + 1; }
  }
  out = push(out, s / (cnt*1.0));
}
return "smooth=" + str(out);`,
    ['Moving average', 'Boundary window clamped', 'Smoothing / diff / spectral'],
    ['滑动平均', '边界窗口夹取', '平滑/差分/频谱'],
  ),
  'graph BFS': d(
    'The graph.lume library does traversal, shortest path and connectivity. The demo runs BFS from node 0 on a 0-1-2-3 chain and reports the shortest hop count to every node.',
    'graph.lume 做遍历、最短路与连通性。demo 从节点 0 对 0-1-2-3 链跑 BFS，报告到每个节点的最短步数。',
    `let adj = [[1], [0, 2], [1, 3], [2]];  let start = 0;
let dist: int[] = _init_dist(len(adj));
dist = _set_i(dist, start, 0);
let q = [start];  let qi = 0;
while (qi < len(q)) {
  let cur = q[qi];  qi = qi + 1;
  for (let nb = 0; nb < len(adj[cur]); nb = nb + 1) {
    let nx = adj[cur][nb];
    if (dist[nx] < 0) {
      dist = _set_i(dist, nx, dist[cur] + 1);
      q = push(q, nx);
    }
  }
}
return "bfs_dist_from_0=" + str(dist);`,
    ['BFS shortest hop count', 'Queue-based (FIFO)', 'Traversal / shortest path / connectivity'],
    ['BFS 最短步数', '队列（FIFO）', '遍历/最短路/连通性'],
  ),

  // ---- agent (src/agent.lume) ----
  'agent loop (plan -> act -> observe -> refine)': d(
    'An agent is a plan -> act -> observe -> refine cycle. The demo picks a deterministic policy (square then accumulate), executes the tool per task, observes the running total, and refines — producing a full trace. Self-contained: no external LLM call.',
    '智能体是「规划 → 执行 → 观察 → 优化」循环。demo 用确定性策略（先平方再累加），逐任务执行工具、观察累计值并优化，产出完整轨迹。自包含：不调外部 LLM。',
    `let xs = [1.0, 2.0, 3.0];
let plan = "square -> accumulate";
let trace = "";  let acc = 0.0;
for (let i = 0; i < len(xs); i = i + 1) {
  let x = xs[i];
  let sq: float = _tool_square(x);  // act (tool: square)
  let prior = acc;                  // observe
  acc = _tool_add(acc, sq);         // refine (tool: add)
  trace = trace + "step" + str(i) + "[sq(" + str(x) + ")=" + str(sq)
        + " obs " + str(prior) + "->" + str(acc) + "]";
  if (i < len(xs) - 1) { trace = trace + " "; }
}
return "agent(task=sum_squares, xs=[1,2,3]) plan=[" + plan
     + "] trace={" + trace + "} final=" + str(acc);`,
    ['plan -> act -> observe -> refine', 'Deterministic policy (no external LLM)', 'Full trace + final result'],
    ['规划 → 执行 → 观察 → 优化', '确定性策略（无外部 LLM）', '完整轨迹 + 最终结果'],
  ),
  'tool registry & dispatch': d(
    'Tools are first-class: a registry maps a name to a callable and dispatch resolves it deterministically. This is the substrate an agent uses to choose and invoke capabilities.',
    '工具是一等公民：注册表把名称映射到可调用项，调度确定性解析。这是智能体选择并调用能力的基础。',
    `func _tool_apply(name: string, x: float): float {
  if (name == "square") { return _tool_square(x); }
  if (name == "double") { return _tool_double(x); }
  return 0.0;
}
let calls = ["square", "double", "square"];
let out = "";
for (let i = 0; i < len(calls); i = i + 1) {
  let name = calls[i];
  let r: float = _tool_apply(name, 2.0);
  out = out + name + "(2.0)=" + str(r);
  if (i < len(calls) - 1) { out = out + " "; }
}
return "dispatch(calls=[square,double,square]) = [" + out + "]";`,
    ['name -> tool dispatch', 'Deterministic executor', 'Unknown tool -> 0.0 (safe)'],
    ['名称 → 工具调度', '确定性执行器', '未知工具 → 0.0（安全）'],
  ),
  'runtime wiring (catalog · tools · mcps · skills)': d(
    'lume-core exposes agent introspection (catalog/tools/mcps/skills) plus an optional LLM hook via LLM_API_URL/LLM_MODEL. Those builtins are interpreter-side; the agent backend is external/optional, so the demo stays self-contained and does not call it.',
    'lume-core 暴露智能体内省（catalog/tools/mcps/skills）与可选的 LLM 钩子（LLM_API_URL/LLM_MODEL）。这些内建在解释器侧；智能体后端外部/可选，故 demo 自包含、不调用它。',
    `// interpreter-side builtins (not called in the demo)
// catalog()  -> { skills, tools, mcps } full registry snapshot
// tools()    -> tool names + desc + OpenAI-style param schema
// mcps()     -> gateway + local MCP servers (source-tagged)
// skills()   -> named skill capabilities
// env hook: LLM_API_URL / LLM_MODEL (external model, optional)`,
    ['catalog/tools/mcps/skills introspection', 'LLM hook via env (optional)', 'Interpreter-side · demo self-contained'],
    ['catalog/tools/mcps/skills 内省', 'LLM 钩子经环境变量（可选）', '解释器侧 · demo 自包含'],
  ),
};

export function getDetail(name: string): Detail | undefined {
  return detail[name];
}
