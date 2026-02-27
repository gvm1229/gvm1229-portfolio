/**
 * 클라이언트용 마크다운 미리보기 (Admin 에디터 등)
 * marked로 렌더링. Markdoc 커스텀 태그는 플레이스홀더로 대체.
 */
import { marked } from "marked";

// marked 옵션: GitHub Flavored Markdown
marked.setOptions({
    gfm: true,
    breaks: true,
});

/** Markdoc {% folium-table ... /%} → 플레이스홀더 */
function replaceFoliumTable(text: string): string {
    return text.replace(
        /\{%\s*folium-table[\s\S]*?\/%\}/g,
        '<div class="preview-placeholder preview-folium-table">📋 Folium Table</div>'
    );
}

/** Markdoc {% youtube id="..." /%} → 플레이스홀더 */
function replaceYoutube(text: string): string {
    return text.replace(
        /\{%\s*youtube\s+id="([^"]+)"[\s\S]*?\/%\}/g,
        (_, id) =>
            `<div class="preview-placeholder preview-youtube">▶ YouTube: ${escapeHtml(id)}</div>`
    );
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Markdoc 원문을 HTML로 변환 (미리보기용, Shiki 없음)
 */
export function renderMarkdownPreview(content: string): string {
    if (!content?.trim()) return "";
    let text = content;
    text = replaceFoliumTable(text);
    text = replaceYoutube(text);
    const result = marked.parse(text, { async: false } as marked.MarkedOptions);
    return typeof result === "string" ? result : "";
}
