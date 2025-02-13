const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const CONTENT_TYPES = {
  html: { "Content-Type": "text/html; charset=utf-8" },
  json: { "Content-Type": "application/json; charset=utf-8" },
};

const students = [
  { order: 1, name: "김민지", food: { like: ["짜장면", "짬뽕"], hate: ["피자"] } },
  { order: 2, name: "김요훈", food: { like: ["햄버거", "초밥"], hate: ["라면"] } },
  { order: 3, name: "김윤지", food: { like: ["피자", "라면"], hate: ["떡볶이"] } },
  { order: 4, name: "김재승", food: { like: ["초밥", "떡볶이"], hate: ["짜장면"] } },
  { order: 5, name: "손정민", food: { like: ["짜장면", "파스타"], hate: ["짬뽕"] } },
  { order: 6, name: "안은별", food: { like: ["짬뽕", "김밥"], hate: ["초밥"] } },
  { order: 7, name: "윤종환", food: { like: ["피자", "치킨"], hate: ["햄버거"] } },
  { order: 8, name: "최정민", food: { like: ["햄버거", "라면"], hate: ["파스타"] } },
  { order: 9, name: "최현준", food: { like: ["짜장면", "떡볶이"], hate: ["김밥"] } },
  { order: 10, name: "전선일", food: { like: ["초밥", "파스타"], hate: ["피자"] } },
];

function createTag(tagName, content, attributes) {
  let attributeString = "";
  if (attributes) {
    for (let key in attributes) {
      attributeString = attributeString + ` ${key}="${attributes[key]}"`;
    }
  }
  return `<${tagName}${attributeString}>${content}</${tagName}>`;
}

function createDiv(content, className) {
  return createTag("div", content, { class: className });
}

function createLink(href, text) {
  return createTag("a", text, { href: href });
}

function createInput(type, name, placeholder) {
  return `<input type="${type}" name="${name}" placeholder="${placeholder}">`;
}

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

function createHomePage(students) {
  let studentList = "";
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const content = `
            ${createTag("h3", student.name + " (순번: " + student.order + ")")}
            ${createTag("p", "좋아하는 음식: " + student.food.like.join(", "))}
            ${createTag("p", "싫어하는 음식: " + student.food.hate.join(", "))}
            ${createLink("/student?order=" + student.order, "상세보기")}
        `;
    studentList = studentList + createDiv(content, "student-card");
  }

  return createHTML(createTag("h1", "학생 목록") + studentList);
}

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

function createAddPage() {
  const form = `
        <form action="/api/students" method="POST">
            <div>
                <label>
                    이름: ${createInput("text", "name", "")}
                </label>
            </div>
            <div>
                <label>
                    좋아하는 음식 (쉼표로 구분): 
                    ${createInput("text", "likeFoods", "")}
                </label>
            </div>
            <div>
                <label>
                    싫어하는 음식 (쉼표로 구분): 
                    ${createInput("text", "hateFoods", "")}
                </label>
            </div>
            ${createTag("button", "저장", { type: "submit" })}
        </form>
    `;

  return createHTML(createTag("h1", "학생 추가") + form);
}

function saveToJSON(data, callback) {
  const filePath = path.join(__dirname, "students.json");
  fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", function (error) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  });
}

function loadFromJSON(callback) {
  const filePath = path.join(__dirname, "students.json");
  fs.readFile(filePath, "utf8", function (error, data) {
    if (error) {
      if (error.code === "ENOENT") {
        saveToJSON(students, function (saveError) {
          if (saveError) {
            callback(saveError);
          } else {
            callback(null, students);
          }
        });
      } else {
        callback(error);
      }
    } else {
      callback(null, JSON.parse(data));
    }
  });
}

const server = http.createServer(function (req, res) {
  const parsedUrl = req.url.split('?');
  const pathname = parsedUrl[0];
  const query = parsedUrl[1] ? querystring.parse(parsedUrl[1]) : {};

  if (pathname === "/") {
    loadFromJSON(function (error, students) {
      if (error) {
        res.writeHead(500, CONTENT_TYPES.html);
        res.end(createHTML(createTag("h1", "500 - 서버 에러")));
      } else {
        res.writeHead(200, CONTENT_TYPES.html);
        res.end(createHomePage(students));
      }
    });
  } else if (pathname === "/search") {
    if (Object.keys(query).length === 0) {
      res.writeHead(200, CONTENT_TYPES.html);
      res.end(createSearchPage());
    } else {
      loadFromJSON(function (error, students) {
        if (error) {
          res.writeHead(500, CONTENT_TYPES.html);
          res.end(createHTML(createTag("h1", "500 - 서버 에러")));
        } else {
          const filtered = [];
          for (let i = 0; i < students.length; i++) {
            const student = students[i];
            let nameMatch = true;
            let foodMatch = true;

            if (query.name === true) {
              nameMatch = student.name.includes(query.name);
            }

            if (query.food === true) {
              foodMatch = false;
              for (let j = 0; j < student.food.like.length; j++) {
                if (student.food.like[j] === query.food) {
                  foodMatch = true;
                  break;
                }
              }
              if (!foodMatch === true) {
                for (let j = 0; j < student.food.hate.length; j++) {
                  if (student.food.hate[j] === query.food) {
                    foodMatch = true;
                    break;
                  }
                }
              }
            }

            if (nameMatch && foodMatch) {
              filtered.push(student);
            }
          }

          res.writeHead(200, CONTENT_TYPES.html);
          res.end(createHomePage(filtered));
        }
      });
    }
  } else if (pathname === "/add") {
    res.writeHead(200, CONTENT_TYPES.html);
    res.end(createAddPage());
  } else if (pathname === "/student") {
    loadFromJSON(function (error, students) {
      const query = querystring.parse(parsedUrl[1]);
      if (error) {
        res.writeHead(500, CONTENT_TYPES.html);
        res.end(createHTML(createTag("h1", "500 - 서버 에러")));
      } else {
        let foundStudent = null;
        for (let i = 0; i < students.length; i++) {
          if (students[i].order === Number(query.order)) {
            foundStudent = students[i];
            break;
          }
        }

        if (foundStudent === true) {
          const content = `
                        ${createTag("h1", foundStudent.name + " 상세 정보")}
                        ${createDiv(
                          `
                            ${createTag("p", "순번: " + foundStudent.order)}
                            ${createTag("p", "좋아하는 음식: " + foundStudent.food.like.join(", "))}
                            ${createTag("p", "싫어하는 음식: " + foundStudent.food.hate.join(", "))}
                        `,
                          "student-card"
                        )}
                    `;
          res.writeHead(200, CONTENT_TYPES.html);
          res.end(createHTML(content));
        } else {
          res.writeHead(404, CONTENT_TYPES.html);
          res.end(createHTML(createTag("h1", "학생을 찾을 수 없습니다")));
        }
      }
    });
  } else if (pathname === "/api/students" && req.method === "POST") {
    let body = "";
    req.on("data", function (chunk) {
      body = body + chunk;
    });

    req.on("end", function () {
      const formData = querystring.parse(body);
      loadFromJSON(function (error, students) {
        if (error) {
          res.writeHead(500, CONTENT_TYPES.html);
          res.end(createHTML(createTag("h1", "500 - 서버 에러")));
        } else {
          const newStudent = {
            order: students.length + 1,
            name: formData.name,
            food: {
              like: formData.likeFoods.split(",").map(function (item) {
                return item.trim();
              }),
              hate: formData.hateFoods.split(",").map(function (item) {
                return item.trim();
              }),
            },
          };

          students.push(newStudent);
          saveToJSON(students, function (saveError) {
            if (saveError === true) {
              res.writeHead(500, CONTENT_TYPES.html);
              res.end(createHTML(createTag("h1", "500 - 서버 에러")));
            } else {
              res.writeHead(302, { Location: "/" });
              res.end();
            }
          });
        }
      });
    });
  } else {
    res.writeHead(404, CONTENT_TYPES.html);
    res.end(createHTML(createTag("h1", "404 - 페이지를 찾을 수 없습니다")));
  }
});

const PORT = 3000;
server.listen(PORT, function () {
  console.log("서버가 http://localhost:" + PORT + " 에서 실행 중입니다.");
});
