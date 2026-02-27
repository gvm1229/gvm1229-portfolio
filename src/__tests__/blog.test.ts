import { describe, it, expect } from "vitest";
import {
    getFirstImageFromContent,
    getFirstThreeSentences,
    formatPubDateKST,
} from "@/lib/blog";

describe("블로그 유틸리티 (Blog Utilities)", () => {
    describe("getFirstImageFromContent", () => {
        it("마크다운 본문에서 첫 번째 이미지 URL을 올바르게 추출", () => {
            const markdown = `
Here is some introductory text.
![Test Alt Text](https://example.com/test-image.webp)
More text below.
            `;
            const result = getFirstImageFromContent(markdown);
            expect(result).toBe("https://example.com/test-image.webp");
        });

        it("이미지가 존재하지 않으면 null을 반환", () => {
            const markdown = `Just some text with a [Link](https://google.com)`;
            const result = getFirstImageFromContent(markdown);
            expect(result).toBeNull();
        });

        it("여러 이미지가 존재하더라도 첫 번째 이미지의 URL만 추출", () => {
            const markdown = `
![First Image](https://example.com/first.png)
![Second Image](https://example.com/second.png)
            `;
            const result = getFirstImageFromContent(markdown);
            expect(result).toBe("https://example.com/first.png");
        });
    });

    describe("getFirstThreeSentences", () => {
        it("마크다운 문법을 제거하고 본문의 첫 세 문장만 추출", () => {
            const markdown = `
# Hello World
This is **bold** text. This is a [link](https://example.com).
Here is the third sentence! And this is the fourth sentence that should be ignored.
            `;
            const result = getFirstThreeSentences(markdown);
            expect(result).toBe(
                "Hello World This is bold text. This is a link. Here is the third sentence!"
            );
        });

        it("텍스트가 매우 짧은 경우에도 에러 없이 전체 텍스트를 반환", () => {
            const markdown = `Just one simple sentence.`;
            const result = getFirstThreeSentences(markdown);
            expect(result).toBe("Just one simple sentence.");
        });

        it("코드 블록을 완전히 제거하고 남은 텍스트에서 문장을 이어붙임", () => {
            const markdown = "Hello. `var x = 1;` This is next. Wow.";
            const result = getFirstThreeSentences(markdown);
            expect(result).toBe("Hello. This is next. Wow.");
        });
    });

    describe("formatPubDateKST", () => {
        it("Javascript Date 객체를 한국(KST) 표기법에 맞게 포맷팅", () => {
            // "2024-05-15T10:30:00Z"
            const date = new Date(Date.UTC(2024, 4, 15, 10, 30, 0));
            const formatted = formatPubDateKST(date);

            // Should display the local representation
            expect(formatted).toContain("2024");
            expect(formatted).toContain("5");
            expect(formatted).toContain("15");
        });
    });
});
