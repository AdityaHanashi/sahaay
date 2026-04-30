const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('iconify-icon')) {
    content = content.replace(/<iconify-icon/g, '<Icon');
    content = content.replace(/<\/iconify-icon>/g, '</Icon>');
    content = content.replace(/class=/g, 'className=');
    if (!content.includes('import { Icon }')) {
      if (content.includes('"use client";')) {
        content = content.replace('"use client";', '"use client";\nimport { Icon } from "@iconify/react";');
      } else {
        content = 'import { Icon } from "@iconify/react";\n' + content;
      }
    }
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
