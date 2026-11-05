"""
Subset Vazirmatn's Arabic-script file to what Persian needs.

Run after `npm run fonts` (needs: pip install fonttools brotli):
    python3 scripts/subset-fa.py

Keeps the Arabic block (letters, Persian digits, punctuation), ZWNJ / bidi
marks and all OpenType layout features (joining forms come from GSUB, so the
presentation-form code points are not needed). Keep the unicode-range in
src/styles/fonts.css in sync with UNICODES below.
"""
from pathlib import Path
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2"
OUT = ROOT / "public/fonts/vazirmatn/vazirmatn-arabic-wght-normal.woff2"
UNICODES = "U+0600-06FF,U+200C-200F,U+2010-2011,U+204F,U+2E41,U+FD3E-FD3F"

options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True
options.glyph_names = False

font = subset.load_font(str(SRC), options)
sub = subset.Subsetter(options)
sub.populate(unicodes=subset.parse_unicodes(UNICODES))
sub.subset(font)
subset.save_font(font, str(OUT), options)
print(f"subset: {SRC.stat().st_size // 1024} KB -> {OUT.stat().st_size // 1024} KB ({OUT.relative_to(ROOT)})")
