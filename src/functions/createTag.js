function createTag(tagName, content, attributes) {
  let attributeString = "";
  if (attributes) {
    for (let key in attributes) {
      attributeString = attributeString + ` ${key}="${attributes[key]}"`;
    }
  }
  return `<${tagName}${attributeString}>${content}</${tagName}>`;
}

export default createTag;