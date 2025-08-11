import sanitizeHtml from "sanitize-html";

/**
 * Sanitize email HTML with a strict whitelist for safe rendering.
 * @param html Raw HTML string
 * @returns Sanitized HTML string
 *
 * Example:
 *   const safe = sanitizeEmailHtml('<b>Hello</b> <script>alert(1)</script>');
 *   // safe === '<b>Hello</b> '
 */
export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "a", "b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "pre", "code", "blockquote",
      "span", "img", "table", "tr", "td", "th", "tbody", "thead", "tfoot"
    ],
    allowedAttributes: {
      a: ["href"],
      span: ["style"],
      img: ["src", "alt", "title", "width", "height"],
      '*': []
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {},
    allowProtocolRelative: true,
    selfClosing: ["img", "br"],
    enforceHtmlBoundary: true,
  });
}
