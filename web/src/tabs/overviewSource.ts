// Teaching source for the "What is lume" tour, keyed by the API's English
// section name. This lives in the Overview chunk (not content.ts) so the
// first paint does not need to download the full 47-entry detail table —
// that only loads on demand when a card is expanded.
export const overviewCode: Record<string, string> = {
  'what is lume': `// hello.lume — a lume program, no build step, one binary
func main(): int {
  let nums: int[] = [1, 2, 3];
  let total = reduce((acc, x) => acc + x, nums, 0);
  print("sum=" + str(total));   // sum=6
  return 0;
}`,
  'three backends': `// the core rule: '/' is always float, on every backend
let r = 7 / 2;
print(str(r));                  // 3.5, not 3
// run it three ways:
//   ./bin/lume-core app.lume           # interpreter
//   ./bin/lume-core --compile-text ... # IR text -> clang
//   ./bin/lume-core --compile ...      # libLLVM`,
  'core syntax': `enum Shape { Cir(r: float) | Sq(w: float) }
func area(s: Shape): float {
  return match (s) { Cir(r) => r * r * 3.14159, Sq(w) => w * w };
}
let xs = [1, 2, 3, 4, 5];
let evens = filter((x) => x % 2 == 0, xs);  // [2, 4]`,
  'builtin HTTP': `// one process: routes + static docroot + SSE
get "/api/health", (req) => {
  return { status: 200, type: "application/json", body: "{}" };
};
server { host = "127.0.0.1"; port = 18793; docroot = "web/dist"; }
run();`,
  'quick start': `# one binary, no node, no pnpm, no server runtime
./bin/lume-core app.lume             # interpret
./bin/lume-core --check app.lume     # parse + type-check only
./bin/lume-core --compile app.lume   # native via libLLVM
./bin/lume-core --compile-text app.lume  # IR text -> clang`,
};
