import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!apiKey || apiKey.includes('your_')) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません。' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    
    const prompt = `あなたは「アルカダイアモンド実験データ」の専門データ分析AIです。

【重要な前提知識 — 必ず踏まえて分析すること】
1. **EAV測定装置**: ドイツ発の医療機器。体内の電気抵抗値を測定する。赤ちゃんと同じ95,000Ωの電気抵抗値を「50」と定義し、0〜100のスケールで表示する。
2. **理想値 50 の意義**: 50が健康で最もバランスの取れた状態（赤ちゃんと同じ恒常性）。50より上はストレス過多を示し、一定を超えると逆に病的状態に陥りマイナス方向に振れる。50より下は機能低下。
3. **7つの測定項目**: 「抵抗力」「短期的精神系」「感情系」「こだわり性」「体内エネルギー」「生理的感情」「長期的精神系」の7か所で測定する。
4. **アルカダイアモンド**: この7か所すべてが50になる石だけを厳選して販売している。
5. **実験目的**: アルカダイアモンドを分電盤に貼ることで、その空間にいる人や物を50に安定させられるかを検証する。以下の仮説を検証中：
   - 時間経過で50に安定するか、それとも逆にぶれるか
   - 電気を通電しておくことの必要性
   - 測定者に依存しないか（再現性）

以下の新たに追加された実験データを上記の前提を踏まえて分析し、JSON形式で出力してください。

【実験データ情報】
${JSON.stringify(data, null, 2)}

【出力形式】分析結果は「50からの乖離」を軸に評価すること。
必ず以下のJSONフォーマットで回答してください。JSON以外のテキストやMarkdown記法(\`\`\`json など) を含めないでください。
{
  "summary_text": "50からの乖離度と安定性に着目した全体的な傾向と結論の要約（2-3文、専門的かつ客観的に）",
  "insights": [
    { "type": "positive", "text": "50に近い安定した結果や改善の兆し（具体的な数値を含めること）" },
    { "type": "warning", "text": "50から大きく乖離した項目や時間経過での不安定性（具体的な数値を含めること）" },
    { "type": "neutral", "text": "測定者間の再現性や通電条件の影響に関する所見" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonStart = cleanJsonText.indexOf('{');
    const jsonEnd = cleanJsonText.lastIndexOf('}');
    const analysis = JSON.parse(cleanJsonText.substring(jsonStart, jsonEnd + 1));

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Gemini Analysis Error:', err);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
