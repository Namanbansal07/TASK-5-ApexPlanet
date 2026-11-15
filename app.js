"use strict";

const STORAGE_KEYS = {
  theme: "skillspring-theme-v1",
  courses: "skillspring-completed-courses-v1",
  tasks: "skillspring-tasks-v1",
  bestScore: "skillspring-best-score-v1"
};

const courses = [
  {
    id: "html-foundations", title: "HTML foundations", category: "Development", level: "Beginner", minutes: 12,
    description: "Give every page a strong, meaningful structure with the building blocks of the web.",
    image: "assets/course-html.svg", alt: "Abstract green illustration of a web page outline",
    topics: ["How semantic HTML organizes a page", "Headings, links, lists, and images", "A simple accessibility checklist"]
  },
  {
    id: "css-playground", title: "The CSS playground", category: "Design", level: "Beginner", minutes: 18,
    description: "Bring ideas to life with color, type, spacing, and layouts that adapt beautifully.",
    image: "assets/course-css.svg", alt: "Abstract coral and lavender illustration of a color palette",
    topics: ["Color and type that work together", "Flexible layouts with Grid and Flexbox", "Responsive design basics"]
  },
  {
    id: "javascript-starters", title: "JavaScript starters", category: "Development", level: "Beginner", minutes: 20,
    description: "Make the web interactive by connecting user actions to useful, thoughtful responses.",
    image: "assets/course-js.svg", alt: "Abstract yellow illustration of code symbols",
    topics: ["Variables and simple data", "Events and interactive controls", "Rendering helpful feedback"]
  },
  {
    id: "design-thinking", title: "Everyday design thinking", category: "Design", level: "All levels", minutes: 15,
    description: "Turn a fuzzy problem into a clear idea, then sketch a solution people can use.",
    image: "assets/course-design.svg", alt: "Abstract blue-green illustration of a notebook and spark",
    topics: ["Start with the person using your design", "Sketch and compare a few directions", "Test an idea and learn from feedback"]
  },
  {
    id: "focus-habits", title: "Focus, one step at a time", category: "Productivity", level: "All levels", minutes: 8,
    description: "Build a gentle routine for turning big intentions into small, achievable actions.",
    image: "assets/course-focus.svg", alt: "Abstract peach illustration of a sun rising over a hill",
    topics: ["Choose one priority that matters", "Break it into a first small action", "Make a routine you can return to"]
  },
  {
    id: "accessible-web", title: "A more accessible web", category: "Development", level: "Beginner", minutes: 16,
    description: "Make digital experiences easier to navigate, understand, and enjoy for everyone.",
    image: "assets/course-accessible.svg", alt: "Abstract purple illustration of inclusive connected shapes",
    topics: ["Use landmarks and clear labels", "Make keyboard focus easy to see", "Respect motion and contrast preferences"]
  }
];

const questions = [
  {
    question: "Which language gives a web page its structure?",
    options: ["HTML", "CSS", "JavaScript", "SQL"],
    answer: 0,
    explanation: "HTML describes the content and structure of a web page."
  },
  {
    question: "What does CSS help you control?",
    options: ["Page appearance and layout", "The server's password", "The browser history", "A website's domain name"],
    answer: 0,
    explanation: "CSS styles elements, including their colors, spacing, and layout."
  },
  {
    question: "Which HTML element is best for a link to another page?",
    options: ["<a>", "<p>", "<section>", "<strong>"],
    answer: 0,
    explanation: "The anchor element (<a>) creates a link to another destination."
  },
  {
    question: "What is a good reason to use a button element?",
    options: ["To trigger an action", "To make a heading larger", "To add a background image", "To create a new browser tab automatically"],
    answer: 0,
    explanation: "Buttons are designed for actions, such as submitting a form or opening a menu."
  },
  {
    question: "What does responsive design help a site do?",
    options: ["Adapt to different screen sizes", "Load without HTML", "Change a user's device", "Remove all page content"],
    answer: 0,
    explanation: "Responsive layouts adjust to different viewport sizes and device orientations."
  }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const completedCourses = new Set();
let tasks = [];
let currentCategory = "All";
let taskFilter = "all";
let selectedCourse = null;
let storageWarningShown = false;

function readStorage(key, fallback, validate) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (validate(value)) return value;
    console.warn(`SkillSpring ignored invalid saved data for "${key}".`);
    return fallback;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`SkillSpring could not parse saved data for "${key}".`, error);
    } else {
      showStorageWarning(error);
    }
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showStorageWarning(error);
    return false;
  }
}

function showStorageWarning(error) {
  if (!storageWarningShown) {
    console.warn("SkillSpring could not save your changes in this browser.", error);
    storageWarningShown = true;
  }
  const notice = $("#storage-notice");
  if (notice) {
    notice.hidden = false;
    notice.textContent = "Your changes are available for this visit, but this browser could not save them.";
  }
}

function loadTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  } catch (error) {
    showStorageWarning(error);
  }
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemPrefersDark ? "dark" : "light");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = $("#theme-toggle");
  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  $(".theme-label", toggle).textContent = isDark ? "Light mode" : "Dark mode";
  $("span:first-child", toggle).textContent = isDark ? "☀" : "☾";
}

function initTheme() {
  loadTheme();
  $("#theme-toggle").addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    } catch (error) {
      showStorageWarning(error);
    }
  });
}

function initNavigation() {
  const toggle = $(".menu-toggle");
  const navigation = $("#primary-navigation");
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", open);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu();
  });
}

function renderCourses() {
  const search = $("#course-search").value.trim().toLocaleLowerCase();
  const sortBy = $("#course-sort").value;
  let visibleCourses = courses.filter((course) => {
    const matchesCategory = currentCategory === "All" || course.category === currentCategory;
    const matchesSearch = `${course.title} ${course.description} ${course.category} ${course.level}`.toLocaleLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
  if (sortBy === "shortest") visibleCourses.sort((a, b) => a.minutes - b.minutes);
  if (sortBy === "title") visibleCourses.sort((a, b) => a.title.localeCompare(b.title));

  const grid = $("#course-grid");
  grid.replaceChildren();
  visibleCourses.forEach((course) => {
    const card = document.createElement("article");
    card.className = "course-card";

    const art = document.createElement("div");
    art.className = "course-art";
    const image = document.createElement("img");
    image.src = course.image;
    image.alt = course.alt;
    image.width = 520;
    image.height = 286;
    image.loading = "lazy";
    image.decoding = "async";
    const duration = document.createElement("span");
    duration.className = "course-duration";
    duration.textContent = `${course.minutes} min`;
    art.append(image, duration);

    const content = document.createElement("div");
    content.className = "course-content";
    const meta = document.createElement("div");
    meta.className = "course-meta";
    const category = document.createElement("span");
    category.className = "course-category";
    category.textContent = course.category;
    const level = document.createElement("span");
    level.className = "course-level";
    level.textContent = course.level;
    meta.append(category, level);

    const title = document.createElement("h3");
    title.textContent = course.title;
    const description = document.createElement("p");
    description.textContent = course.description;
    const action = document.createElement("button");
    const isComplete = completedCourses.has(course.id);
    action.className = `button course-action ${isComplete ? "button-secondary is-complete" : "button-primary"}`;
    action.type = "button";
    action.dataset.courseId = course.id;
    action.setAttribute("aria-label", `${isComplete ? "Review completed" : "Explore"} ${course.title}`);
    action.innerHTML = isComplete ? "Completed <span aria-hidden=\"true\">✓</span>" : "Explore path <span aria-hidden=\"true\">→</span>";
    content.append(meta, title, description, action);
    card.append(art, content);
    grid.append(card);
  });

  const count = visibleCourses.length;
  $("#course-result-count").textContent = `Showing ${count} ${count === 1 ? "path" : "paths"}`;
  $("#course-empty").hidden = count !== 0;
  grid.hidden = count === 0;
}

function updateCourseProgress() {
  const total = courses.length;
  const done = completedCourses.size;
  const progress = $("#course-progress");
  progress.setAttribute("aria-valuemax", String(total));
  progress.setAttribute("aria-valuenow", String(done));
  $("#course-progress-label").textContent = `${done} of ${total}`;
  $("#course-progress-fill").style.width = `${(done / total) * 100}%`;
}

function openCourse(course) {
  selectedCourse = course;
  $("#dialog-category").textContent = course.category.toUpperCase();
  $("#dialog-title").textContent = course.title;
  $("#dialog-description").textContent = course.description;
  $("#dialog-duration").textContent = `${course.minutes} minute learning path · ${course.level}`;
  const topics = $("#dialog-topics");
  topics.replaceChildren();
  course.topics.forEach((topic) => {
    const item = document.createElement("li");
    item.textContent = topic;
    topics.append(item);
  });
  const completeButton = $("#complete-course");
  completeButton.disabled = completedCourses.has(course.id);
  completeButton.innerHTML = completeButton.disabled
    ? "Path completed <span aria-hidden=\"true\">✓</span>"
    : "Mark path complete <span aria-hidden=\"true\">✓</span>";
  $("#dialog-status").textContent = "";
  const dialog = $("#course-dialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else {
    dialog.classList.add("dialog-fallback");
    document.body.classList.add("dialog-fallback-open");
    dialog.setAttribute("open", "");
  }
}

function initCourses() {
  const validIds = new Set(courses.map((course) => course.id));
  readStorage(STORAGE_KEYS.courses, [], (value) => Array.isArray(value) && value.every((id) => typeof id === "string"))
    .filter((id) => validIds.has(id))
    .forEach((id) => completedCourses.add(id));

  $("#course-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-course-id]");
    if (button) openCourse(courses.find((course) => course.id === button.dataset.courseId));
  });
  $$(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.category;
      $$(".filter-chip").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      renderCourses();
    });
  });
  $("#course-search").addEventListener("input", renderCourses);
  $("#course-sort").addEventListener("change", renderCourses);
  $("#clear-course-filters").addEventListener("click", () => {
    currentCategory = "All";
    $("#course-search").value = "";
    $$(".filter-chip").forEach((chip) => {
      const active = chip.dataset.category === "All";
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderCourses();
  });
  $("#complete-course").addEventListener("click", () => {
    if (!selectedCourse || completedCourses.has(selectedCourse.id)) return;
    completedCourses.add(selectedCourse.id);
    writeStorage(STORAGE_KEYS.courses, [...completedCourses]);
    updateCourseProgress();
    renderCourses();
    $("#complete-course").disabled = true;
    $("#complete-course").innerHTML = "Path completed <span aria-hidden=\"true\">✓</span>";
    $("#dialog-status").textContent = "Nice work. Your learning progress has been updated.";
  });
  $("#course-dialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  $("#course-dialog form").addEventListener("submit", (event) => {
    const dialog = $("#course-dialog");
    if (dialog.classList.contains("dialog-fallback")) {
      event.preventDefault();
      dialog.removeAttribute("open");
      dialog.classList.remove("dialog-fallback");
      document.body.classList.remove("dialog-fallback-open");
    }
  });
  document.addEventListener("keydown", (event) => {
    const dialog = $("#course-dialog");
    if (event.key === "Escape" && dialog.classList.contains("dialog-fallback")) {
      dialog.removeAttribute("open");
      dialog.classList.remove("dialog-fallback");
      document.body.classList.remove("dialog-fallback-open");
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#course-search").focus();
    }
  });
  renderCourses();
  updateCourseProgress();
}

function createTaskId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function renderTasks() {
  const list = $("#task-list");
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "open") return !task.done;
    if (taskFilter === "done") return task.done;
    return true;
  });
  list.replaceChildren();
  filteredTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item ${task.done ? "is-done" : ""}`;
    const toggle = document.createElement("button");
    toggle.className = "task-toggle";
    toggle.type = "button";
    toggle.dataset.taskAction = "toggle";
    toggle.dataset.taskId = task.id;
    toggle.setAttribute("aria-pressed", String(task.done));
    toggle.setAttribute("aria-label", `${task.done ? "Mark as to do" : "Complete"}: ${task.title}`);
    toggle.textContent = task.done ? "✓" : "";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    const remove = document.createElement("button");
    remove.className = "task-delete";
    remove.type = "button";
    remove.dataset.taskAction = "delete";
    remove.dataset.taskId = task.id;
    remove.setAttribute("aria-label", `Delete task: ${task.title}`);
    remove.textContent = "×";
    item.append(toggle, title, remove);
    list.append(item);
  });

  const completed = tasks.filter((task) => task.done).length;
  $("#task-count").textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  $("#task-completion-label").textContent = `${completed} completed`;
  $("#task-empty").hidden = filteredTasks.length > 0;
  list.hidden = filteredTasks.length === 0;
  $("#task-summary").textContent = tasks.length === 0
    ? "Your next step is waiting"
    : tasks.length === completed
      ? "Every task is complete — lovely work!"
      : `${tasks.length - completed} ${tasks.length - completed === 1 ? "task" : "tasks"} on your list`;
}

function saveTasks() {
  writeStorage(STORAGE_KEYS.tasks, tasks);
}

function initTasks() {
  const savedTasks = readStorage(STORAGE_KEYS.tasks, [], (value) => Array.isArray(value));
  const ids = new Set();
  tasks = savedTasks.filter((task) => {
    if (!task || typeof task.id !== "string" || ids.has(task.id) || typeof task.title !== "string" || typeof task.done !== "boolean") return false;
    ids.add(task.id);
    return true;
  }).map((task) => ({ id: task.id, title: task.title.trim().slice(0, 100), done: task.done }))
    .filter((task) => task.title.length > 0);

  $("#task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#task-input");
    const title = input.value.trim();
    if (!title) {
      input.setCustomValidity("Add a task before saving.");
      input.reportValidity();
      input.setCustomValidity("");
      return;
    }
    tasks.unshift({ id: createTaskId(), title, done: false });
    input.value = "";
    taskFilter = "all";
    $$(".task-filter").forEach((button) => {
      const active = button.dataset.taskFilter === "all";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    saveTasks();
    renderTasks();
    input.focus();
  });
  $("#task-input").addEventListener("input", (event) => event.currentTarget.setCustomValidity(""));
  $("#task-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-action]");
    if (!button) return;
    const { taskAction, taskId } = button.dataset;
    if (taskAction === "toggle") {
      tasks = tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task);
    } else {
      tasks = tasks.filter((task) => task.id !== taskId);
    }
    saveTasks();
    renderTasks();
  });
  $$(".task-filter").forEach((button) => {
    button.addEventListener("click", () => {
      taskFilter = button.dataset.taskFilter;
      $$(".task-filter").forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      renderTasks();
    });
  });
  renderTasks();
}

function readBestScore() {
  let score = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.bestScore);
    if (stored === null) return null;
    const value = Number(stored);
    if (Number.isInteger(value) && value >= 0 && value <= 100) score = value;
    else console.warn("SkillSpring ignored an invalid saved quiz score.");
  } catch (error) {
    showStorageWarning(error);
  }
  return score;
}

function displayBestScore() {
  const best = readBestScore();
  $("#best-score").textContent = best === null ? "Not yet recorded" : `${best}%`;
  $("#quiz-best").textContent = best === null ? "—" : `${best}%`;
  $("#results-best").textContent = best === null ? "—" : `${best}%`;
}

function initQuiz() {
  const startPanel = $("#quiz-start");
  const playPanel = $("#quiz-play");
  const resultsPanel = $("#quiz-results");
  const submitButton = $("#submit-answer");
  const nextButton = $("#next-question");
  let quizQuestions = [];
  let currentIndex = 0;
  let selectedIndex = null;
  let score = 0;
  let submitted = false;
  const answers = [];

  function startQuiz() {
    quizQuestions = [...questions];
    for (let index = quizQuestions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [quizQuestions[index], quizQuestions[randomIndex]] = [quizQuestions[randomIndex], quizQuestions[index]];
    }
    currentIndex = 0;
    selectedIndex = null;
    score = 0;
    answers.length = 0;
    submitted = false;
    startPanel.hidden = true;
    resultsPanel.hidden = true;
    playPanel.hidden = false;
    displayBestScore();
    renderQuestion();
  }

  function renderQuestion() {
    const question = quizQuestions[currentIndex];
    selectedIndex = null;
    submitted = false;
    $("#question-counter").textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
    $("#quiz-progress").setAttribute("aria-valuemax", String(quizQuestions.length));
    $("#quiz-progress").setAttribute("aria-valuenow", String(currentIndex));
    $("#quiz-progress-fill").style.width = `${(currentIndex / quizQuestions.length) * 100}%`;
    $("#question-text").textContent = question.question;
    $("#quiz-feedback").hidden = true;
    $("#quiz-feedback").className = "quiz-feedback";
    submitButton.hidden = false;
    submitButton.disabled = true;
    nextButton.hidden = true;
    nextButton.textContent = currentIndex === quizQuestions.length - 1 ? "See results" : "Next question →";
    const options = $("#answer-options");
    $$(".answer-option", options).forEach((option) => option.remove());

    question.options.forEach((answer, index) => {
      const label = document.createElement("label");
      label.className = "answer-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "quiz-answer";
      input.value = String(index);
      input.addEventListener("change", () => {
        selectedIndex = index;
        submitButton.disabled = false;
        $$(".answer-option", options).forEach((choice, choiceIndex) => choice.classList.toggle("is-selected", choiceIndex === index));
      });
      const text = document.createElement("span");
      text.textContent = answer;
      label.append(input, text);
      options.append(label);
    });
  }

  function submitAnswer() {
    if (submitted || selectedIndex === null) return;
    submitted = true;
    const question = quizQuestions[currentIndex];
    const correct = selectedIndex === question.answer;
    if (correct) score += 1;
    answers.push({ selectedIndex, correct });
    submitButton.hidden = true;
    nextButton.hidden = false;
    const feedback = $("#quiz-feedback");
    feedback.hidden = false;
    feedback.classList.add(correct ? "is-correct" : "is-incorrect");
    feedback.textContent = `${correct ? "That's right!" : "Not quite."} ${question.explanation}`;
    $$(".answer-option", $("#answer-options")).forEach((option, index) => {
      option.classList.add("is-locked");
      const input = $("input", option);
      input.disabled = true;
      if (index === question.answer) option.classList.add("is-correct");
      else if (index === selectedIndex) option.classList.add("is-incorrect");
    });
    nextButton.textContent = currentIndex === quizQuestions.length - 1 ? "See results" : "Next question →";
  }

  function showResults() {
    playPanel.hidden = true;
    resultsPanel.hidden = false;
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const oldBest = readBestScore();
    const best = oldBest === null ? percentage : Math.max(oldBest, percentage);
    try {
      localStorage.setItem(STORAGE_KEYS.bestScore, String(best));
    } catch (error) {
      showStorageWarning(error);
    }
    $("#results-score").textContent = `${score} / ${quizQuestions.length}`;
    $("#results-percent").textContent = `${percentage}%`;
    $("#results-message").textContent = percentage === 100
      ? "Brilliant — a perfect score!"
      : percentage >= 60
        ? "Lovely work — your skills are growing."
        : "Every expert starts somewhere. Keep going!";
    displayBestScore();
    const review = $("#answer-review");
    review.replaceChildren();
    quizQuestions.forEach((question, index) => {
      const item = document.createElement("article");
      item.className = "review-item";
      const title = document.createElement("strong");
      title.textContent = `${index + 1}. ${question.question}`;
      const answer = document.createElement("p");
      answer.textContent = `Your answer: ${question.options[answers[index].selectedIndex]}`;
      const correct = document.createElement("p");
      correct.textContent = `Answer: ${question.options[question.answer]}`;
      item.append(title, answer, correct);
      review.append(item);
    });
  }

  $("#start-quiz").addEventListener("click", startQuiz);
  submitButton.addEventListener("click", submitAnswer);
  nextButton.addEventListener("click", () => {
    if (!submitted) return;
    if (currentIndex === quizQuestions.length - 1) showResults();
    else {
      currentIndex += 1;
      renderQuestion();
    }
  });
  $("#restart-quiz").addEventListener("click", startQuiz);
  displayBestScore();
}

function initContactForm() {
  const form = $("#contact-form");
  const status = $("#contact-status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#contact-name");
    const message = $("#contact-message");
    name.setCustomValidity(name.value.trim().length < 2 ? "Enter a name with at least two characters." : "");
    message.setCustomValidity(message.value.trim().length < 12 ? "Write a message with at least 12 characters." : "");
    if (!form.reportValidity()) return;
    status.textContent = `Thanks, ${name.value.trim()}! Your note is ready in this demo, but it was not sent or stored.`;
    form.reset();
    name.setCustomValidity("");
    message.setCustomValidity("");
  });
  form.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      event.target.setCustomValidity("");
      status.textContent = "";
    }
  });
}

function initFooter() {
  $("#current-year").textContent = String(new Date().getFullYear());
}

initTheme();
initNavigation();
initCourses();
initTasks();
initQuiz();
initContactForm();
initFooter();
