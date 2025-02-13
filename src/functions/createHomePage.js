import createTag from '../functions/createTag.js';
import createLink from '../functions/createLink.js';
import createDiv from '../functions/createDiv.js';
import createHTML from '../functions/createHtml.js';

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

export default createHomePage;