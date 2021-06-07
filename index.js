#!/usr/bin/env node
const MarkdownIt = require('markdown-it');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('node-html-parser');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { argv } = yargs(hideBin(process.argv));

if (argv.input) {
  const md = new MarkdownIt();
  const inputFilePath = path.resolve(`${__dirname}/${argv.input}`);
  fs.readFile(inputFilePath)
    .then((data) => {
      const html = md.render(data);
      const root = parse(html);
      root.querySelectorAll('h1').forEach((el) => el.classList.add('heading1'));
      root.querySelectorAll('h2').forEach((el) => el.classList.add('heading2'));

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
    `;

      const append = `</body></html>`;
      fs.writeFile('test.html', prepend + root.toString() + append);
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
