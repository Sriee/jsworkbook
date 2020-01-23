const fs = require("fs");
const tasks = [];
const wordCount = {};
let taskCount = 0;

function checkCompleted() {
  taskCount++;
  if (taskCount === tasks.length) {
    for (let key in wordCount) console.log(`${key}: ${wordCount[key]}`);
  }
}

function addWord(w) {
  wordCount[w] = wordCount[w] ? wordCount[w] + 1 : 1;
}

function countWords(texts) {
  const text = texts
    .toString()
    .toLowerCase()
    .split(/\W+/)
    .sort();

  text.forEach(txt => addWord(txt));
}

fs.readdir("./models", (err, files) => {
  if (err) throw err;
  file.forEach(file => {
    const task = (fl => {
      return () => {
        fs.readFile(fl, (err, contents) => {
          if (err) throw err;

          countWords(contents);
          checkCompleted();
        });
      };
    })(`./models/${file}`);

    taks.push(task);
  });
});

tasks.forEach(task => task());
