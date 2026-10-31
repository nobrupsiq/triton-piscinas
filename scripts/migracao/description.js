import * as cheerio from 'cheerio';

// The migrated HTML is already sanitized. Only normalize its presentation here.
export function formatDescription(html) {
  const $ = cheerio.load(html || '', null, false);
  const root = $.root();
  // Keep inline elements on the same line as their bullet or paragraph.
  const output = $('<div>');
  let paragraph = $('<p>');
  function flush() {
    if (paragraph.text().trim() || paragraph.find('img').length) output.append(paragraph);
    paragraph = $('<p>');
  }
  for (const node of root.contents().toArray()) {
    if (node.type === 'text') {
      node.data.split(/\r?\n/).forEach((line, index) => {
        if (index) flush();
        if (line) paragraph.append($.parseHTML($('<span>').text(line).html()));
      });
    } else if (['strong', 'b', 'em', 'i', 'a', 'span'].includes(node.name)) {
      paragraph.append(node);
    } else {
      flush();
      output.append(node);
    }
  }
  flush();
  root.empty().append(output.contents());
  $('h2, h3, h4, p').each((_, node) => {
    const element = $(node);
    if (!element.text().trim() && !element.find('img, table').length) {
      element.remove();
      return;
    }
    if (/^\s*\*\s+/.test(element.text())) {
      // Keep inline emphasis and links when removing the printed bullet marker.
      function stripMarker(parent) {
        for (const child of parent.children || []) {
          if (child.type === 'text' && child.data.trim()) {
            child.data = child.data.replace(/^\s*\*\s+/, '');
            return true;
          }
          if (stripMarker(child)) return true;
        }
        return false;
      }
      stripMarker(node);
      element.replaceWith($('<li>').html(element.html()));
    }
  });
  // Consecutive list items may be separated by WordPress formatting whitespace.
  let list = null;
  root
    .contents()
    .toArray()
    .forEach((node) => {
      if (node.type === 'text' && !node.data.trim()) return;
      if (node.name === 'li') {
        if (!list) {
          list = $('<ul>');
          $(node).before(list);
        }
        list.append(node);
      } else {
        list = null;
      }
    });
  return root.html();
}
