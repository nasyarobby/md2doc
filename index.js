#!/usr/bin/env node
const MarkdownIt = require('markdown-it');
const yamljs = require('yamljs');
const tableify = require('tableify');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('node-html-parser');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { argv } = yargs(hideBin(process.argv));

const styleFile = 'style.css';

const outputFile = argv.output || 'output.html';

const prismCss = {
  css: '<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.css" rel="stylesheet" />',
  js: `<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js"></script>`,
};

if (argv.input) {
  const md = new MarkdownIt();
  const inputFilePath = path.resolve(`./${argv.input}`);
  Promise.all([fs.readFile(inputFilePath), fs.readFile(path.resolve(`${__dirname}/${styleFile}`))])
    .then(([data, style]) => {
      const html = md.render(data.toString());
      const root = parse(html, {
        blockTextElements: {
          code: true,
        },
      });
      root.querySelectorAll('h1').forEach((el) => el.classList.add('heading1'));
      root.querySelectorAll('h2').forEach((el) => el.classList.add('heading2'));
      root.querySelectorAll('h3').forEach((el) => el.classList.add('heading3'));
      root.querySelectorAll('h4').forEach((el) => el.classList.add('heading4'));

      root.querySelectorAll('p').forEach((el) => {
        if (el.innerHTML === '--- page break') {
          el.replaceWith('<br class="page-break" />');
        }
      });

      root.querySelectorAll('pre code').forEach((el) => {
        if (
          el.attributes &&
          el.attributes.class &&
          el.attributes.class.split(' ').includes('language-YAMLTABLE')
        ) {
          const obj = yamljs.parse(el.innerHTML);
          el.parentNode.replaceWith(tableify(obj));
        }
      });

      const prepend = `
<html>
<head>
<style>
${style.toString()}
</style>${argv.prism ? prismCss.css : ''}
</head>
<body>${argv.prism ? prismCss.js : ''}
    `;

      const append = `</body></html>`;
      fs.writeFile(outputFile, prepend + root.toString() + append).then(() =>
        // eslint-disable-next-line
        console.log('Output as %s', outputFile)
      );
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // eslint-disable-next-line
        console.error('File not found: %s', err.path);
      } else {
        // eslint-disable-next-line
        console.error(err);
      }
    });
} else {
  // eslint-disable-next-line
  console.error('Missing input file.');
}
