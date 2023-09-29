// Define the API URL for fetching quiz questions
const apiUrl = "https://opentdb.com/api.php?amount=15";

// Define variables for quiz management
let questions = []; // Array to store quiz questions
let currentQuestionIndex = 0; // Index of the current question
let quizCompleted = false; // Indicates if the quiz is completed
let readOnlyMode = false; // Indicates if the quiz is in read-only mode
const userAnswers = new Array(15).fill(undefined); // Array to store user's answers (15 questions)
const questionTableBody = document.getElementById("question-table-body"); // HTML element for the question table
const resultContainer = document.getElementById("result-container"); // HTML element for the result container
const resultList = document.getElementById("result-list"); // HTML element for the result list
const resultTable = document.querySelector(".result-table"); // HTML element for the result table
const resultDetails = document.querySelector(".result-details"); // HTML element for result details
const timerElement = document.getElementById("timer"); // HTML element for the timer
let timeLeft = 1800; // 30 minutes in seconds
let timerInterval;

// Function to fetch questions from the API
async function fetchQuestions() {
try {
const response = await fetch(apiUrl);
const data = await response.json();
questions = data.results;
return questions;
} catch (error) {
console.error("Error fetching questions:", error);
return [];
}
}

// Function to submit the quiz and display the results
function submitQuiz() {
if (quizCompleted || readOnlyMode) {
return; // Don't allow resubmission or changes after submission
}

clearInterval(timerInterval);
quizCompleted = true;
updateNavigationButtons();

// Hide unnecessary elements
const questionContainer = document.getElementById("question-container");
const answerContainer = document.getElementById("answer-container");
const statusContainer = document.getElementById("status-container");

questionContainer.style.display = "none";
answerContainer.style.display = "none";
statusContainer.style.display = "none";

// Show the result section
showResult();
}

// Function to display the results of the quiz
function showResult() {
const totalQuestions = questions.length;
let totalMarksObtained = 0;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;

resultList.innerHTML = ""; // Clear existing results

// Loop through the questions (excluding the last reader question)
questions.slice(0, -1).forEach((question, index) => {
const listItem = document.createElement("li");

// Display the question number and question
listItem.innerHTML = `<strong>Question ${index + 1}:</strong> ${
question.question
}<br>`;

const answers = [
question.correct_answer,
...question.incorrect_answers
].sort();
const userAnswerIndex = userAnswers[index];
const correctAnswerIndex = 0; // Correct answer is always at index 0

// Display options
answers.forEach((answer, idx) => {
listItem.innerHTML += `<span class="option">${
idx + 1
}. ${answer}</span><br>`;
});

// Display selected option
if (userAnswerIndex !== undefined) {
const selectedOption = answers[userAnswerIndex];
listItem.innerHTML += `<strong>Your Answer:</strong> ${selectedOption}<br>`;
}

// Display correct option
const correctOption = answers[correctAnswerIndex];
listItem.innerHTML += `<strong>Correct Answer:</strong> ${correctOption}<br>`;

// Determine marks obtained
if (userAnswerIndex === correctAnswerIndex) {
totalMarksObtained += 2; // 2 points for the correct answer
correctAnswersCount++;
} else {
wrongAnswersCount++;
}

resultList.appendChild(listItem);
});

// Update elements with quiz statistics
const totalQuestionsElement = document.getElementById("total-questions");
const totalMarksObtainedElement = document.getElementById(
"total-marks-obtained"
);
const correctAnswersElement = document.getElementById("correct-answers");
const wrongAnswersElement = document.getElementById("wrong-answers");

totalQuestionsElement.textContent = totalQuestions - 1; // Exclude the last reader question
totalMarksObtainedElement.textContent = totalMarksObtained;
correctAnswersElement.textContent = correctAnswersCount;
wrongAnswersElement.textContent = wrongAnswersCount;

// Display the result sections and enable read-only mode
resultTable.style.display = "block";
resultDetails.style.display = "block";
resultContainer.style.display = "block";
readOnlyMode = true; // Enable read-only mode after showing the result

// Hide navigation buttons
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const submitButton = document.getElementById("submit-button");

previousButton.style.display = "none";
nextButton.style.display = "none";
submitButton.style.display = "none";
}

// Function to display a question by its index
function displayQuestion(index) {
const questionContainer = document.getElementById("question-container");
const answerContainer = document.getElementById("answer-container");
const statusContainer = document.getElementById("status-container");

const { question, correct_answer, incorrect_answers } = questions[index];
const answers = [correct_answer, ...incorrect_answers].sort();

// Display the question number and question
questionContainer.innerHTML = `<p><strong>Question ${
index + 1
}:</strong> ${question}</p>`;
answerContainer.innerHTML = ` `;

// Create and display radio buttons for options
answers.forEach((answer, idx) => {
const input = document.createElement("input");
const label = document.createElement("label");
const radioId = `radio-${idx}`;
input.type = "radio";
input.id = radioId;
input.name = "answer";
input.value = idx;
input.addEventListener("change", () => handleAnswerChange(idx));
label.htmlFor = radioId;
label.textContent = answer;
answerContainer.appendChild(input);
answerContainer.appendChild(label);
answerContainer.appendChild(document.createElement("br"));
});

// Display the current question's status
statusContainer.innerHTML = `Question ${index + 1} of ${questions.length}`;

// Check the radio button if an answer has been selected
if (userAnswers[index] !== undefined) {
document.getElementById(`radio-${userAnswers[index]}`).checked = true;
}

// Update the question table to reflect the question's status
updateQuestionTable(index);
}

// Function to handle changes in selected answers
function handleAnswerChange(selectedIndex) {
if (readOnlyMode) {
return; // Don't allow answers to be changed in read-only mode
}

userAnswers[currentQuestionIndex] = selectedIndex;
updateNavigationButtons();
updateQuestionTable(currentQuestionIndex);
}

// Function to show the current status of the quiz
function showStatus() {
const statusContainer = document.getElementById("status-container");
const attemptedQuestions = userAnswers.filter(
(answer) => answer !== undefined
).length;
statusContainer.innerHTML = `Attempted: ${attemptedQuestions}/${questions.length}`;
}

// Function to update navigation buttons based on the current state
function updateNavigationButtons() {
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const submitButton = document.getElementById("submit-button");

if (!quizCompleted) {
previousButton.disabled = currentQuestionIndex === 0 || readOnlyMode;
nextButton.disabled =
currentQuestionIndex === questions.length - 1 || readOnlyMode;
submitButton.disabled =
userAnswers.every((answer) => answer !== undefined) || readOnlyMode;
} else {
previousButton.style.display = "none";
nextButton.style.display = "none";
submitButton.style.display = "none";
}
}

// Function to update the question table to reflect the status of each question
function updateQuestionTable(currentIndex) {
questionTableBody.innerHTML = "";

questions.forEach((_, index) => {
const row = document.createElement("tr");
const cell = document.createElement("td");

if (userAnswers[index] !== undefined) {
if (index === currentIndex) {
row.classList.add("selected");
} else {
row.classList.add("visited");
}
} else {
if (index === currentIndex) {
row.classList.add("initial");
} else {
row.classList.add("not-visited");
}
}

cell.textContent = index + 1;
cell.addEventListener("click", () => navigateToQuestion(index));
row.appendChild(cell);

questionTableBody.appendChild(row);
});
}

// Function to navigate to a specific question
function navigateToQuestion(index) {
if (readOnlyMode) {
return; // Don't allow navigation in read-only mode
}

currentQuestionIndex = index;
displayQuestion(currentQuestionIndex);
updateNavigationButtons();
}

// Function to start the timer
function startTimer() {
timerInterval = setInterval(() => {
if (timeLeft <= 0) {
clearInterval(timerInterval);
submitQuiz();
} else {
const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;
timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
seconds
).padStart(2, "0")}`;

if (timeLeft <= 30) {
timerElement.classList.add("red-timer");
}

timeLeft--;
}
}, 1000);
}

// Function to initialize the quiz
async function initializeQuiz() {
await fetchQuestions(); // Fetch questions from the API
displayQuestion(currentQuestionIndex); // Display the first question
showStatus(); // Display the status of the quiz
updateNavigationButtons(); // Update navigation buttons based on the current state
startTimer(); // Start the timer

// Add event listeners for navigation buttons
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const submitButton = document.getElementById("submit-button");
const retakeButton = document.getElementById("retake-button");

previousButton.addEventListener("click", () =>
navigateToQuestion(currentQuestionIndex - 1)
);
nextButton.addEventListener("click", () =>
navigateToQuestion(currentQuestionIndex + 1)
);
submitButton.addEventListener("click", () => {
submitQuiz();
});
retakeButton.addEventListener("click", () => {
resetQuiz();
});
}

// Function to reset the quiz
function resetQuiz() {
if (quizCompleted) {
return; // Don't allow resetting after submission
}

userAnswers.fill(undefined); // Reset user answers
currentQuestionIndex = 0;
resultTable.style.display = "none"; // Hide result table
resultDetails.style.display = "none"; // Hide result details
resultContainer.style.display = "none"; // Hide result container
document.getElementById("retake-button").style.display = "none"; // Hide retake button
timeLeft = 60; // Reset timer to 1 minute
timerElement.classList.remove("red-timer"); // Remove red timer class
readOnlyMode = false; // Disable read-only mode when resetting
initializeQuiz(); // Initialize the quiz again
}
// Function to show a preview of the user's answers
function showPreview() {
// Display a message indicating that the user is in preview mode
const statusContainer = document.getElementById("status-container");
statusContainer.innerHTML = `Previewing your answers`;

// Display a preview section with the selected answers
const previewContainer = document.getElementById("preview-container");
previewContainer.innerHTML = ""; // Clear previous content

questions.forEach((question, index) => {
const previewItem = document.createElement("div");

// Display the question number and question
previewItem.innerHTML = `<p><strong>Question ${index + 1}:</strong> ${
question.question
}</p>`;

const answers = [
question.correct_answer,
...question.incorrect_answers
].sort();
const userAnswerIndex = userAnswers[index];

// Display selected option
if (userAnswerIndex !== undefined) {
const selectedOption = answers[userAnswerIndex];
previewItem.innerHTML += `<strong>Your Answer:</strong> ${selectedOption}<br>`;
}

previewContainer.appendChild(previewItem);
});

// Display a button to finalize the submission
const finalizeButton = document.createElement("button");
finalizeButton.textContent = "Submit Quiz";
finalizeButton.addEventListener("click", finalizeSubmission);
previewContainer.appendChild(finalizeButton);

// Hide navigation buttons
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const submitButton = document.getElementById("submit-button");

previousButton.style.display = "none";
nextButton.style.display = "none";
submitButton.style.display = "none";
}

// Initialize the quiz when the page loads
initializeQuiz();
