const MarkdownIt = require("markdown-it")
const fs = require("fs").promises;
const { parse } = require('node-html-parser');

md = new MarkdownIt();

// TODO ngebaca file
const src = `# Ini judul

Test paragraph

---

test paragraph

## Test Heading 2
`

const html = md.render(src);
const root = parse(html)
root.querySelectorAll('h1').forEach(el => el.classList.add('heading1'));
root.querySelectorAll('h2').forEach(el => el.classList.add('heading2'));

const prepend = `
<html>
<head>
<style>
.heading1 {
    font-size: 32pt;
    color: #004080;
}

.heading2 {
    font-size: 24pt;
    color: #004080;
}
</style>
</head>
<body>
`

const append = `</body></html>`
fs.writeFile("test.html", prepend + root.toString() + append)