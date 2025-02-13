import createTag from '../functions/createTag.js';

function createDiv(content, className) {
  return createTag("div", content, { class: className });
}

export default createDiv;