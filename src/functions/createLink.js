import createTag from '../functions/createTag.js';

function createLink(href, text) {
  return createTag("a", text, { href: href });
}

export default createLink;