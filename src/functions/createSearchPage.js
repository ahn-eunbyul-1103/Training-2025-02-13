import createInput from '../functions/createInput.js';
import createTag from '../functions/createTag.js';
import createHTML from '../functions/createHtml.js';
import createDiv from '../functions/createDiv.js';

function createSearchPage() {
  const form = `
        <form action="/search" method="GET">
            ${createInput("text", "name", "이름으로 검색")}
            ${createInput("text", "food", "음식으로 검색")}
            ${createTag("button", "검색", { type: "submit" })}
        </form>
    `;

  return createHTML(createTag("h1", "학생 검색") + createDiv(form, "search-form"));
}

export default createSearchPage;