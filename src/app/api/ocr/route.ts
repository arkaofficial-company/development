import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 画像アップロードのため、ボディサイズ上限を拡大
export const maxDuration = 60; // Vercel serverless timeout

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません。環境変数 GEMINI_API_KEY を確認してください。' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    
    const prompt = `この画像は「EAV測定記録表」です。以下の構造で数値を正確に読み取ってJSONとして返してください。

【EAV測定記録表の構造】
- 各行の左端には測定時刻（例: 16:25, 16:28(07) など）が記載されていることがあります。
- ヘッダー列は左から: 「時刻」「カット(CBKG等)」「測定対象名」「基本値」「1 抵抗力」「2 短期的精神系」「3 感情系」「4 こだわり性」「5 体内エネルギー」「6 生理的感情」「7 長期的精神系」
- 表の最初に「基準値」という特別な行があります。これは全体の基準となる数値です。
- その後に各測定対象（ダイヤモンド名や素材名）ごとの行が続きます。
- 各行には「時刻」「カット(cut_type)」「基本値」列（1列）と「7列の測定値」があります。
- 「CBKG」等はカット種別なので cut_type として記録してください。測定対象名 (target_name) はその右の名前です。
- 時刻が書かれていない行は measurement_time を空文字にしてください。
- 空欄や読み取れない箇所は null にしてください。

【出力形式】
JSON以外のテキストやMarkdown記法(\`\`\`json など)を含めず、純粋なJSON文字列のみを返してください。
{
  "reference_values": {
    "baseline": 89,
    "values": [50, 53, 52, 54, 58, 52, 52]
  },
  "rows": [
    { "measurement_time": "", "cut_type": "CBKG", "target_name": "天使 黄色大", "baseline_value": null, "values": [50, 51, 44, 47, 48, 44, 48] },
    { "measurement_time": "16:25", "cut_type": "CBKG", "target_name": "天使 黄色大", "baseline_value": null, "values": [50, 51, 52, 56, 50, 31, 50] }
  ]
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || "image/jpeg"
        }
      }
    ]);
    
    const responseText = result.response.text();
    
    // JSON部分を抽出（コードブロックやテキスト混入に対応）
    let cleanJsonText = responseText;
    // ```json ... ``` を除去
    cleanJsonText = cleanJsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    // 先頭・末尾の空白除去
    cleanJsonText = cleanJsonText.trim();
    // JSONオブジェクトの開始・終了位置を見つける
    const jsonStart = cleanJsonText.indexOf('{');
    const jsonEnd = cleanJsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanJsonText = cleanJsonText.substring(jsonStart, jsonEnd + 1);
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJsonText);
    } catch (parseErr) {
      console.error('JSON Parse Error. Raw text:', responseText.substring(0, 500));
      return NextResponse.json({ 
        error: 'AIの応答をパースできませんでした。画像を再度アップロードしてください。',
        raw_text: responseText.substring(0, 300)
      }, { status: 422 });
    }

    // フロントエンドのUI仕様（7列）に合わせたフォーマット処理
    const formattedRows = (parsedData.rows || []).map((row: any) => {
      const values = Array(7).fill(null);
      if (Array.isArray(row.values)) {
        row.values.forEach((v: any, i: number) => {
          if (i < 7) values[i] = v === "" ? null : typeof v === 'string' ? parseFloat(v) : v;
        });
      }
      return {
        id: crypto.randomUUID(),
        measurement_time: row.measurement_time || "",
        cut_type: row.cut_type || "",
        target_name: row.target_name || '名称不明',
        baseline_value: row.baseline_value ?? null,
        values
      };
    });

    // 基準値の処理
    const refValues = parsedData.reference_values || { baseline: null, values: Array(7).fill(null) };
    if (Array.isArray(refValues.values)) {
      while (refValues.values.length < 7) refValues.values.push(null);
      refValues.values = refValues.values.slice(0, 7);
    }

    return NextResponse.json({
      success: true,
      data: {
        raw_text: responseText,
        reference_values: refValues,
        rows: formattedRows
      }
    });

  } catch (error: any) {
    console.error('Gemini OCR Error:', error?.message || error);
    
    const errorMsg = error?.message || '';
    if (errorMsg.includes('API_KEY') || errorMsg.includes('401') || errorMsg.includes('403')) {
      return NextResponse.json({ error: 'APIキーが無効です。Gemini APIキーを確認してください。' }, { status: 401 });
    }
    if (errorMsg.includes('not found') || errorMsg.includes('404')) {
      return NextResponse.json({ error: 'AIモデルが見つかりません。しばらく経ってから再試行してください。' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: `OCR処理に失敗しました: ${errorMsg.substring(0, 100) || '不明なエラー'}` 
    }, { status: 500 });
  }
}
