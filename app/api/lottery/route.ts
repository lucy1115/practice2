// 抽獎在後端判斷，前端無法竄改結果
const WIN_RATE = 0.3;

export async function POST() {
  const win = Math.random() < WIN_RATE;
  return Response.json({
    win,
    message: win ? "恭喜中獎！" : "可惜沒中，再試一次吧",
  });
}
