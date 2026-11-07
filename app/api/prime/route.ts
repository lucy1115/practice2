// 用 BigInt 支援很長的數字，用 Miller-Rabin 判斷質數
// 以前 12 個質數為底，對小於 3.3 × 10^24 的數字結果保證正確，更大的數字錯誤機率極低
const BASES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
const MAX_DIGITS = 100;

function modPow(base: bigint, exp: bigint, mod: bigint) {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

function isPrime(n: bigint) {
  if (n < 2n) return false;
  for (const p of BASES) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }

  // n - 1 = d × 2^r
  let d = n - 1n;
  let r = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }

  for (const a of BASES) {
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let i = 1; i < r; i++) {
      x = (x * x) % n;
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

// 用法：/api/prime?n=97
export async function GET(request: Request) {
  const n = new URL(request.url).searchParams.get("n")?.trim() ?? "";

  if (!/^\d+$/.test(n)) {
    return Response.json({ error: "請輸入非負整數，例如 /api/prime?n=97" }, { status: 400 });
  }
  if (n.length > MAX_DIGITS) {
    return Response.json({ error: `數字最多 ${MAX_DIGITS} 位` }, { status: 400 });
  }

  const prime = isPrime(BigInt(n));
  const number = BigInt(n).toString(); // 去掉開頭多餘的 0
  return Response.json({
    number,
    isPrime: prime,
    message: prime ? `${number} 是質數` : `${number} 不是質數`,
  });
}
