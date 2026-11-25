#!/usr/bin/env python3
"""Assemble toolbox sources into one self-contained HTML file (../lean-six-sigma-toolbox.html)."""
import pathlib
d = pathlib.Path(__file__).parent
html = (d / 'app.html').read_text()
for key, f in [('/*FONTS*/', 'fonts.css'), ('/*DATA*/', 'data.js'), ('/*WIDGETS*/', 'widgets.js'), ('/*APP*/', 'app.js')]:
    html = html.replace(key, (d / f).read_text(), 1)
out = d.parent / 'lean-six-sigma-toolbox.html'
out.write_text(html)
print(out, len(html))
