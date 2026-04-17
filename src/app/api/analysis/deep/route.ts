import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!apiKey || apiKey.includes("your_")) {
      return NextResponse.json({ error: "Gemini APIキーが設定されていません。" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const dataString = JSON.stringify(data.experiments);

    const prompt = `あなたは「アルカダイアモンド空間安定実験」のチーフデータサイエンティストです。
以下の過去全ての実験データを用いて、研究開発チームに提出するレベルの詳細なレポートを作成してください。

【重要な前提知識 — 必ず踏まえて分析すること】
1. **EAV測定装置**: ドイツ発の医療機器。体内の電気抵抗値を測定する。赤ちゃんと同じ95,000Ωの電気抵抗値を「50」と定義し、0〜100のスケールで表示する。
2. **理想値 = 50**: 50が最もバランスの取れた健康状態。50より上はストレス過多（交感神経優位）、一定を超えると逆に病的状態でマイナスに振れる。50より下は機能低下（副交感神経優位すぎ）。
3. **7つの測定項目**: 各行は「1.抵抗力」「2.短期的精神系」「3.感情系」「4.こだわり性」「5.体内エネルギー」「6.生理的感情」「7.長期的精神系」の7か所の数値。
4. **アルカダイアモンドの特性**: この7か所すべてが50になるダイヤモンドのみを販売している。身に着けると免疫が向上するエビデンスがある。
5. **本実験の目的**: アルカダイアモンドを分電盤に貼ることで、その空間にいる人や物をすべて50に安定させられるかを検証する。
6. **検証すべき仮説**:
   - (A) 時間経過で各測定値が50に収束・安定するか？
   - (B) 電気を通電しておくことが50に安定する条件として必要か？
   - (C) 測定者が違っても同じ結果が出るか？（測定者依存性の排除）
7. **基準値行(REF)**: 各実験の最初に測る基準値。これが50に近いほど空間の初期状態が良い。
8. **measurement_time**: 時刻データが入っている場合、時間経過による変化（50への収束or発散）を追跡できる。

【出力要件】
1. HTMLタグ形式で出力すること（<h2>, <h3>, <p>, <ul>, <li>, <strong> を使用）。Markdown記法は使わないこと。
2. レポートは以下の構成にすること：
   - <h2>エグゼクティブ・サマリー</h2> — 「結論として分電盤貼付により空間安定化が達成されたか」を冒頭で明示
   - <h2>50への収束性分析</h2> — 各測定項目が時間経過で50にどれだけ近づいたか。|値-50|の偏差で数値的に評価
   - <h2>7項目のバランス分析</h2> — 7項目間のバラツキ（標準偏差）が小さいほど良い。項目ごとの傾向
   - <h2>測定条件の影響</h2> — 通電の有無、測定者の違い、時間帯などが結果に与えた影響
   - <h2>異常値・特異パターンの検出</h2> — 50から大きく外れた値やパターン
   - <h2>結論と次回実験への提案</h2> — 仮説A,B,Cに対する暫定的回答と、次に行うべき実験条件の具体的提案
3. 文字数は1500文字〜2500文字で、説得力のある専門的な記述にすること。
4. 具体的な数値を必ず引用すること（「平均偏差3.2」「項目4が62で12ポイント高い」等）。

【全データコンテキスト情報】
${dataString}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // マークダウンブロック等を除去してHTMLを抽出
    let htmlText = responseText
      .replace(/```html\n?/g, "")
      .replace(/```markdown\n?/g, "")
      .replace(/```\n?/g, "");

    // もしMarkdown記法が残っていたらHTMLに変換
    htmlText = htmlText
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n- (.*$)/gim, "<ul><li>$1</li></ul>")
      .replace(/<\/ul><ul>/g, "");

    if (!htmlText.startsWith("<")) {
      htmlText = `<p>${htmlText}</p>`;
    }

    return NextResponse.json({ success: true, text: htmlText });
  } catch (err: any) {
    console.error("Deep Analysis Error:", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
