import { describe, it, expect } from "vitest";
import { extractTocFromHtml } from "@/lib/toc";

describe("목차(TOC) 추출기 (Table of Contents Extractor)", () => {
    it("H2 및 H3 요소를 추출하여 중첩 트리 구조를 구축", () => {
        const html = `
            <div>
                <h2 id="section-1">Section 1</h2>
                <p>Some text</p>
                <h3 id="subsection-1-1"><a href="#subsection-1-1">Subsection 1.1</a></h3>
                <h2 id="section-2">Section 2</h2>
            </div>
        `;

        const toc = extractTocFromHtml(html);

        expect(toc).toHaveLength(2); // Two h2 roots

        // Assert Section 1
        expect(toc[0].level).toBe(2);
        expect(toc[0].text).toBe("Section 1");
        expect(toc[0].slug).toBe("section-1");
        expect(toc[0].children).toHaveLength(1);

        // Assert Subsection 1.1 under Section 1
        expect(toc[0].children[0].level).toBe(3);
        expect(toc[0].children[0].text).toBe("Subsection 1.1");
        expect(toc[0].children[0].slug).toBe("subsection-1-1");

        // Assert Section 2
        expect(toc[1].level).toBe(2);
        expect(toc[1].text).toBe("Section 2");
        expect(toc[1].slug).toBe("section-2");
        expect(toc[1].children).toHaveLength(0);
    });

    it("연결이 끊긴 계층 구조를 안전하게 처리 (예: 부모 H2가 없는 H3)", () => {
        const html = `
            <h3 id="orphan-h3">Orphan H3</h3>
            <h2 id="valid-h2">Valid H2</h2>
        `;

        const toc = extractTocFromHtml(html);

        expect(toc).toHaveLength(2); // In a completely disjointed hierarchy without h2, the build algorithm pushes them both to root level.
        expect(toc[0].text).toBe("Orphan H3");
        expect(toc[0].level).toBe(3);

        expect(toc[1].text).toBe("Valid H2");
        expect(toc[1].level).toBe(2);
    });

    it("ID가 없는 잘못된 형식의 DOM 요소는 안전하게 무시", () => {
        const html = `
            <h2>Missing ID but valid HTML</h2>
            <h2 id="has-id">Has ID</h2>
            <h1 id="ignored-h1">H1s are ignored</h1>
        `;

        const toc = extractTocFromHtml(html);

        expect(toc).toHaveLength(1);
        expect(toc[0].text).toBe("Has ID");
    });
});
