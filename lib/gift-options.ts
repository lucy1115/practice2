// 禮物推薦的下拉選單選項，前端顯示和後端檢查共用同一份
export const GIFT_FIELDS = [
  {
    key: "relation",
    label: "送給誰",
    options: ["伴侶", "家人", "朋友", "同事", "長輩", "小孩"],
  },
  {
    key: "age",
    label: "年齡",
    options: ["12 歲以下", "13–18 歲", "19–25 歲", "26–35 歲", "36–50 歲", "51–65 歲", "65 歲以上"],
  },
  {
    key: "gender",
    label: "性別",
    options: ["男", "女", "不指定"],
  },
  {
    key: "region",
    label: "地區",
    options: ["台北", "新北", "桃園", "台中", "台南", "高雄", "其他台灣地區", "海外"],
  },
  {
    key: "interest",
    label: "興趣",
    options: ["運動健身", "美食料理", "閱讀寫作", "音樂", "電玩遊戲", "旅行戶外", "藝術手作", "科技3C", "美妝保養", "居家生活"],
  },
  {
    key: "budget",
    label: "預算",
    options: ["500 元以下", "500–1,000 元", "1,000–3,000 元", "3,000–10,000 元", "10,000 元以上"],
  },
  {
    key: "occasion",
    label: "場合",
    options: ["生日", "聖誕節", "情人節", "畢業", "新年", "感謝", "其他"],
  },
] as const;

export type GiftFieldKey = (typeof GIFT_FIELDS)[number]["key"];
export type GiftAnswers = Record<GiftFieldKey, string>;
