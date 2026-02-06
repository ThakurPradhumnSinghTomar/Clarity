Tailwind Typography Quick Notes
1. leading-* → Line Height

Controls vertical space between lines.

Headings: leading-[1.1] → leading-[1.3]

Hero text sweet spot: leading-[1.25]

Paragraphs: leading-[1.5] → leading-relaxed

leading-[1.25]  /* line-height: 1.25 */

2. tracking-* → Letter Spacing

Controls space between characters.

Large headings: use negative tracking

Poppins looks best tightened

tracking-[-0.02em]  /* modern SaaS look */
tracking-tight
tracking-wide       /* for CAPS / logos */

3. text-neutral-* → Color Scale

Softer alternative to pure black/white.

text-neutral-900 → headings

text-neutral-700 → normal text

text-neutral-500 → muted text

text-neutral-400 → placeholders

Avoid text-black unless necessary.

4. Hero Text Rule of Thumb

For big headings:

Font: Poppins
Weight: 500–600
Line-height: ~1.25
Letter-spacing: -0.02em
Max width: limit text width

5. Common Mistakes ❌

Using font-bold with Poppins

No leading control

No tracking

Full-width hero text

Pure black/white text

6. Minimal Hero Example
<h1 className="
  font-poppins
  font-semibold
  text-[56px]
  leading-[1.25]
  tracking-[-0.02em]
  text-neutral-900
">
