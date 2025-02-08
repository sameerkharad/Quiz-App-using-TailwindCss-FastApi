// API URL for fetching quiz data
const apiUrl = 'http://127.0.0.1:8000/quiz';

// DOM Elements for various sections and functionality
const usernameInput = document.getElementById('username'); // Input field for username
const submitNameButton = document.getElementById('submit-name'); // Button to submit username
const userInputSection = document.getElementById('user-input'); // Section for user input (username)
const startSection = document.getElementById('start-section'); // Section displaying the start button
const startButton = document.getElementById('start-button'); // Button to start the quiz
const loadingMessage = document.getElementById('loading'); // Loading message while fetching quiz data
const quizContent = document.getElementById('quiz-content'); // Main quiz content area (questions and options)
const questionElement = document.getElementById('question'); // Element to display the question
const optionsElement = document.getElementById('options'); // Container for displaying options
const timerElement = document.getElementById('timer'); // Timer display
const badgeDisplay = document.getElementById('badge-display'); // Section for displaying the final badge
const restartSection = document.getElementById('restart-section'); // Section for restarting the quiz

// Variables for managing quiz state
let currentQuestionIndex = 0; // Index of the current question
let score = 0; // User's score
let totalQuestions = 0; // Total number of questions in the quiz
let username = ''; // Username of the player
let timerInterval = null; // Interval ID for the timer

// Initial setup: Hide unnecessary sections at the start
quizContent.style.display = 'none';
loadingMessage.style.display = 'none';
startSection.style.display = 'none';
restartSection.style.display = 'none';
badgeDisplay.classList.add('hidden');

// Event listener for submitting the username
submitNameButton.addEventListener('click', () => {
  const enteredName = usernameInput.value.trim(); // Trim whitespace from input
  if (enteredName) {
    username = enteredName; // Save the entered username
    userInputSection.style.display = 'none'; // Hide username input section
    startSection.style.display = 'block'; // Show start button section
  } else {
    alert('Please enter your name to proceed.'); // Alert user if no name is entered
  }
});

// Event listener for starting the quiz
startButton.addEventListener('click', () => {
  startSection.style.display = 'none'; // Hide start button section
  loadingMessage.style.display = 'flex'; // Show loading message

  // Fetch quiz data from the API
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch quiz data'); // Handle fetch errors
      return response.json(); // Parse response JSON
    })
    .then(data => {
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions found in quiz data'); // Handle empty quiz data
      }

      loadingMessage.style.display = 'none'; // Hide loading message
      quizContent.style.display = 'block'; // Show quiz content

      totalQuestions = data.questions.length; // Set the total number of questions
      displayQuestion(data.questions, currentQuestionIndex); // Display the first question
    })
    .catch(error => {
      console.error('Error fetching quiz data:', error); // Log errors
      loadingMessage.textContent = 'Failed to load quiz. Please try again later.'; // Display error message
    });
});

// Function to display a question
function displayQuestion(questions, index) {
  const question = questions[index]; // Get the current question
  questionElement.textContent = question.description; // Display question text

  // Clear previous options and timer
  optionsElement.innerHTML = '';
  timerElement.textContent = '';

  // Create and display options
  question.options.forEach((option, i) => {
    const li = document.createElement('li');
    li.classList.add(
      'option',
      'p-2',
      'bg-gray-100',
      'rounded-md',
      'cursor-pointer',
      'hover:bg-gray-200',
      'transition-colors',
      'duration-200'
    );
    li.textContent = option.description; // Set option text
    li.style.animationDelay = `${i * 0.2}s`; // Add animation delay for a staggered effect

    // Add click event listener for selecting the option
    li.addEventListener('click', () => selectOption(i, question.options, li, questions));
    optionsElement.appendChild(li);
  });

  startTimer(15, questions); // Start timer for the question
}

// Timer function to count down and move to the next question when time runs out
function startTimer(duration, questions) {
  clearInterval(timerInterval); // Clear any existing timer
  let remainingTime = duration; // Set timer duration

  // Function to update the timer display
  function updateTimer() {
    const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0'); // Calculate minutes
    const seconds = String(remainingTime % 60).padStart(2, '0'); // Calculate seconds
    timerElement.textContent = `${minutes}:${seconds}`; // Update timer text
    remainingTime--; // Decrease remaining time

    if (remainingTime < 0) {
      clearInterval(timerInterval); // Clear timer when time runs out
      timerElement.textContent = '00:00'; // Display "00:00" when time is up
      alert("Time's up! Moving to the next question."); // Notify the user
      moveToNextQuestion(questions); // Move to the next question
    }
  }

  updateTimer(); // Initial timer update
  timerInterval = setInterval(updateTimer, 1000); // Update timer every second
}

// Function to handle option selection
function selectOption(selectedIndex, options, clickedElement, questions) {
  clearInterval(timerInterval); // Stop the timer

  const correctOption = options.find(option => option.is_correct); // Find the correct option
  const allOptions = document.querySelectorAll('#options li'); // Get all option elements
  allOptions.forEach(option => (option.style.pointerEvents = 'none')); // Disable further clicks

  const feedbackMessage = document.createElement('div'); // Create feedback message
  feedbackMessage.classList.add('mt-4', 'text-center', 'font-semibold', 'text-lg');

  if (options[selectedIndex].is_correct) {
    clickedElement.style.backgroundColor = 'green'; // Highlight correct option
    clickedElement.style.color = 'white';
    score++; // Increment score for correct answer
    feedbackMessage.textContent = '🎉 Correct!';
    feedbackMessage.style.color = 'green';
  } else {
    clickedElement.style.backgroundColor = 'red'; // Highlight incorrect option
    clickedElement.style.color = 'white';
    feedbackMessage.textContent = '❌ Incorrect!';
    feedbackMessage.style.color = 'red';

    // Highlight the correct option
    const correctOptionElement = [...allOptions].find(
      option => option.textContent === correctOption.description
    );
    if (correctOptionElement) {
      correctOptionElement.style.backgroundColor = 'green';
      correctOptionElement.style.color = 'white';
    }
  }

  quizContent.appendChild(feedbackMessage); // Display feedback message

  setTimeout(() => {
    feedbackMessage.remove(); // Remove feedback message
    moveToNextQuestion(questions); // Move to the next question
  }, 2000);
}

// Function to move to the next question
function moveToNextQuestion(questions) {
  currentQuestionIndex++; // Increment question index
  if (currentQuestionIndex < questions.length) {
    displayQuestion(questions, currentQuestionIndex); // Display the next question
  } else {
    displayScore(); // Show the final score if all questions are answered
  }
}

// Function to display the final score and badge
function displayScore() {
  quizContent.style.display = 'none'; // Hide quiz content
  timerElement.textContent = ''; // Clear timer

  let badgeImage = '';
  let badgeText = '';

  // Determine badge based on score
  if (score === 10) {
    badgeImage = 'perfectionist.png';
    badgeText = 'Perfectionist';
  } else if (score >= 7) {
    badgeImage = 'achiever.png';
    badgeText = 'Great Job!';
  } else {
    badgeImage = 'keep-trying.png';
    badgeText = 'Keep Trying!';
  }

  badgeDisplay.innerHTML = ''; // Clear previous badge display

  // Display final score
  const scoreDisplay = document.createElement('p');
  scoreDisplay.classList.add('text-xl', 'font-bold', 'mt-4');
  scoreDisplay.textContent = `Thank you, ${username}! Your score is: ${score} out of ${totalQuestions}`;
  badgeDisplay.appendChild(scoreDisplay);

  // Display badge if applicable
  if (badgeImage) {
    const badgeImg = document.createElement('img');
    badgeImg.src = `static/images/${badgeImage}`;
    badgeImg.alt = badgeText;
    badgeImg.classList.add('mx-auto', 'w-24', 'h-24', 'mb-4');
    badgeDisplay.appendChild(badgeImg);

    const badgeLabel = document.createElement('p');
    badgeLabel.textContent = badgeText;
    badgeLabel.classList.add('text-lg', 'font-semibold', 'text-gray-700');
    badgeDisplay.appendChild(badgeLabel);
  }

  badgeDisplay.classList.remove('hidden'); // Show badge section
  restartSection.style.display = 'block'; // Show restart section
}

// Event listener for restarting the quiz
document.getElementById('restart-button').addEventListener('click', () => window.location.reload());
