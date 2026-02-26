/**
 * ThumbnailUploadField
 *
 * 썸네일 입력: 파일 업로드 또는 URL 입력.
 * 파일 업로드 시 image-upload.ts 로직으로 WebP 변환 후 Supabase Storage에 저장,
 * 최종적으로 DB에 저장되는 값은 Storage URL.
 */
import { useState, useRef } from "react";
import { uploadImageToSupabase } from "@/lib/image-upload";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface ThumbnailUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export default function ThumbnailUploadField({
    value,
    onChange,
    placeholder = "파일 업로드 또는 URL 입력",
}: ThumbnailUploadFieldProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setUploadError("이미지 파일만 업로드 가능합니다.");
            return;
        }
        if (file.size > MAX_SIZE) {
            setUploadError("파일 크기는 5MB 이하여야 합니다.");
            return;
        }

        setUploadError(null);
        setUploading(true);
        try {
            const url = await uploadImageToSupabase(file);
            onChange(url);
        } catch (err) {
            setUploadError(
                err instanceof Error ? err.message : "업로드에 실패했습니다."
            );
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-base font-medium text-(--color-muted)">
                썸네일
            </label>

            {/* 미리보기 */}
            {value && (
                <div className="flex items-start gap-3">
                    <img
                        src={value}
                        alt="썸네일 미리보기"
                        className="h-20 w-20 object-cover rounded-lg border border-(--color-border)"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                                "none";
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-(--color-muted) truncate">
                            {value}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                    id="thumbnail-file-input"
                />
                <label
                    htmlFor="thumbnail-file-input"
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border border-(--color-border) text-base font-medium cursor-pointer transition-colors shrink-0 ${
                        uploading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-(--color-surface-subtle) hover:border-(--color-accent)"
                    } text-(--color-foreground)`}
                >
                    {uploading ? "업로드 중..." : "파일 선택"}
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-base font-mono focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                />
            </div>

            {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
            )}
        </div>
    );
}
