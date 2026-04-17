"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, FileImage } from "lucide-react";
import { toast } from "sonner";

interface OcrUploadProps {
  onDataParsed: (data: any) => void;
}

// 画像をリサイズして軽量化（大きすぎるとAPIが遅くなる/タイムアウトする）
function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // 1MB以下ならそのまま返す
    if (file.size <= 1024 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("画像の圧縮に失敗しました"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = url;
  });
}

export function OcrUpload({ onDataParsed }: OcrUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      const file = acceptedFiles[0];
      
      // 大きい画像は圧縮
      let uploadFile: Blob = file;
      try {
        uploadFile = await compressImage(file);
      } catch {
        // 圧縮失敗時はオリジナルを使用
      }

      const formData = new FormData();
      formData.append("file", uploadFile, file.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒タイムアウト

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok || !result.success) {
        const msg = result.error || "OCR処理に失敗しました";
        toast.error(msg);
        return;
      }

      toast.success("手書きデータの読み取りが完了しました");
      onDataParsed(result.data);
    } catch (error: any) {
      if (error?.name === "AbortError") {
        toast.error("処理がタイムアウトしました。画像を小さくして再試行してください。");
      } else {
        toast.error("エラーが発生しました。画像を選び直して再試行してください。");
        console.error("OCR Upload Error:", error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onDataParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { "image/*": [] },
    maxFiles: 1 
  });

  return (
    <div className={`rounded-xl border-2 border-dashed transition-all ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"}`}>
      <div 
        {...getRootProps()} 
        className="flex flex-col items-center justify-center py-8 md:py-10 px-4 md:px-6 text-center cursor-pointer min-h-[160px]"
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div className="space-y-1.5">
              <p className="font-bold text-base text-slate-800">Gemini AI 解析中...</p>
              <p className="text-sm text-slate-500 font-medium tracking-wide">画像から数値を識別し、データグリッドに変換しています</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-5 transition-colors ${isDragActive ? "bg-blue-200/50 text-blue-700" : "bg-white border border-slate-200 text-slate-500 shadow-sm"}`}>
              {isDragActive ? <UploadCloud className="w-7 h-7" /> : <FileImage className="w-6 h-6 md:w-7 md:h-7" />}
            </div>
            <p className="font-bold mb-2 text-slate-800 text-sm md:text-base">
              {isDragActive ? "ここに画像をドロップして解析" : "手書きメモや表の画像をアップロード"}
            </p>
            <p className="text-xs md:text-sm text-slate-500 max-w-[340px] mx-auto font-medium leading-relaxed">
              タップして選択するか、ファイルをドラッグ＆ドロップ<br/>
              <span className="text-blue-600 font-semibold">Gemini 3.1 Flash Lite</span> が表を自動で読み取ります
            </p>
          </>
        )}
      </div>
    </div>
  );
}
