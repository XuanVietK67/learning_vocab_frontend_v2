@AGENTS.md

## LaTeX report rule

**Whenever you write or edit the graduation thesis / đồ án report in LaTeX, you MUST follow [docs/report/latex_report_guide.md](docs/report/latex_report_guide.md) exactly.** It is the markdown transcription of the official `manual.pptx` ("Hướng dẫn viết đồ án bằng LaTeX") and is the authoritative format. Non-negotiable points from it:

- Use the provided **Overleaf template** matching the thesis direction (Research vs Application). Do not restructure it; keep `main.tex`, `Chuong/` (one `.tex` per chapter), the images folder, the cover-page `.tex`, the abbreviations file, and `references.bib`.
- **Images** via `graphicx`; **tables** via `tabular`; **math** via `amsmath` (inline `\(\)`/`$$` vs display `equation`/`\[\]`); **lists** via `itemize`/`enumerate`.
- Every figure, table, and numbered equation gets a **caption + `\label`**, referenced with **`\ref`**. **Never hardcode a number** — always `\label` + `\ref`.
- **References:** each source as a BibTeX entry in `references.bib`, cited with `\cite{ID}`. ❌ No Wikipedia, no unverified or ordinary web pages. Match the correct one of the **5 required reference-type formats** (book, conference paper, thesis, Internet source, …).

If anything in this rule conflicts with [docs/report/latex_report_guide.md](docs/report/latex_report_guide.md), the guide wins — read it before writing.