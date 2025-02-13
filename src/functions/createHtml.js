import createDiv from '../functions/createDiv.js';
import createLink from '../functions/createLink.js';

function createHTML(content) {
  const style = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .student-card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .search-form { margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 10px; }
    `;

  const navigation = createDiv(
    createLink("/", "전체 목록") + createLink("/search", "검색") + createLink("/add", "학생 추가"),
    "nav"
  );

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>학생 데이터 관리</title>
            <style>${style}</style>
        </head>
        <body>
            ${createDiv(navigation + content, "container")}
        </body>
        </html>
    `;
}

export default createHTML;