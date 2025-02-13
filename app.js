import CONTENT_TYPES from './src/constants/contentTypeConstants.js';
import loadFromJSON from './src/functions/loadFromJson.js';
import createHTML from './src/functions/createHtml.js';
import createTag from './src/functions/createTag.js';
import createDiv from './src/functions/createDiv.js';
import createHomePage from './src/functions/createHomePage.js';
import createSearchPage from './src/functions/createSearchPage.js';
import saveToJSON from './src/functions/saveToJson.js';
import createAddPage from './src/functions/createAddPage.js';

import dotenv from "dotenv";
import http from 'http';
import querystring from 'querystring';

dotenv.config();

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

            if (query.name) {
              nameMatch = student.name.includes(query.name);
            }

            if (query.food) {
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
        if (foundStudent) {
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

const PORT = process.env.PORT;
server.listen(PORT, function () {
  console.log("서버가 http://localhost:" + PORT + " 에서 실행 중입니다.");
});
