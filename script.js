document.getElementById('detailsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const difficulty = document.getElementById('difficulty').value;

  const userDetails = {
      name,
      email,
      subject,
      difficulty,
      startTime: new Date().getTime(),
      totalQuestions: 20, // Set the number of questions you want to ask
      questionsPerPage: 10 // Set the number of questions per page
  };

  localStorage.setItem('quizUserDetails', JSON.stringify(userDetails));
  startQuiz();
});

let timerInterval;
let startTime;
let currentPage = 1;
let questionsPerPage = 10;
let selectedQuestions = [];

function startQuiz() {
  const userDetails = JSON.parse(localStorage.getItem('quizUserDetails'));
  document.getElementById('user-form').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';

  const questions = quizData[userDetails.subject];
  selectedQuestions = selectRandomQuestions(questions, userDetails.totalQuestions);

  if (!userDetails.startTime) {
      userDetails.startTime = new Date().getTime();
      localStorage.setItem('quizUserDetails', JSON.stringify(userDetails));
  }
  startTime = userDetails.startTime;

  // Set the timer duration based on the user's preference (in minutes or seconds)
  const minutes = 0;
  const seconds = 54;
  startTimer(minutes, seconds);
  displayQuestions();
  
  
  

  document.getElementById('submitQuiz').addEventListener('click', function() {
      submitQuiz();
  });

  document.getElementById('resetQuiz').addEventListener('click', function() {
      resetQuiz();
  });

  document.getElementById('nextPage').addEventListener('click', function() {
      changePage(1);
  });

  document.getElementById('prevPage').addEventListener('click', function() {
      changePage(-1);
  });
}

function selectRandomQuestions(questions, numQuestions) {
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions);
}

function displayQuestions() {
  const userDetails = JSON.parse(localStorage.getItem('quizUserDetails'));
  const quizContainer = document.getElementById('quiz');
  quizContainer.innerHTML = '';
  const start = (currentPage - 1) * questionsPerPage;
  const end = start + questionsPerPage;
  const questionsToDisplay = selectedQuestions.slice(start, end);

  questionsToDisplay.forEach((item, index) => {
    const questionIndex = start + index + 1; // Adjusted index for 1-based serial number
    const questionDiv = document.createElement('div');
    questionDiv.innerHTML = `
        <p>${questionIndex}. ${item.question}</p>
        ${item.hint ? `<p>Hint: ${item.hint}</p>` : ''}
        ${item.options.map(option => `<input type="radio" name="q${questionIndex}" value="${option}"> ${option}<br>`).join('')}
    `;
    quizContainer.appendChild(questionDiv);
  });

  document.getElementById('prevPage').style.display = currentPage === 1 ? 'none' : 'inline-block';
  document.getElementById('nextPage').style.display = end >= selectedQuestions.length ? 'none' : 'inline-block';
  document.getElementById('submitQuiz').style.display = end >= selectedQuestions.length ? 'inline-block' : 'none';
}


function changePage(direction) {
  currentPage += direction;
  displayQuestions();
}

function startTimer(minutes, seconds) {
  let totalSeconds = minutes * 60 + seconds;
  let timerInterval = setInterval(function() {
    let displayMinutes = parseInt(totalSeconds / 60, 10);
    let displaySeconds = parseInt(totalSeconds % 60, 10);

    displayMinutes = displayMinutes < 10 ? '0' + displayMinutes : displayMinutes;
    displaySeconds = displaySeconds < 10 ? '0' + displaySeconds : displaySeconds;

    document.getElementById('time').textContent = `${displayMinutes}:${displaySeconds}`;

    if (--totalSeconds < 0) {
      clearInterval(timerInterval);
      alert('Time ended!');
      submitQuiz();
    }
  }, 1000);
}


function submitQuiz() {
  clearInterval(timerInterval);
  const endTime = new Date().getTime();
  const userDetails = JSON.parse(localStorage.getItem('quizUserDetails'));
  const timeTaken = Math.round((endTime - userDetails.startTime) / 1000);

  const userAnswers = [];
  selectedQuestions.forEach((item, index) => {
      const questionIndex = index + 1;
      const selected = document.querySelector(`input[name="q${questionIndex}"]:checked`);
      userAnswers.push(selected ? selected.value : 'No Answer');
  });

  localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
  localStorage.setItem('timeTaken', timeTaken);

  showResults(userDetails, userAnswers, timeTaken);
}

function showResults(userDetails, userAnswers, timeTaken) {
  const userDetailsDiv = document.getElementById('userDetails');
  userDetailsDiv.innerHTML = `
      <p>Name: ${userDetails.name}</p>
      <p>Email: ${userDetails.email}</p>
      <p>Subject: ${userDetails.subject}</p>
      <p>Difficulty: ${userDetails.difficulty}</p>
      <p>Time taken: ${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds</p>
  `;

  const resultDiv = document.getElementById('quizResult');
  let score = 0;
  let attempted = 0;
  const answersHTML = selectedQuestions.map((item, index) => {
      const questionIndex = index + 1;
      const correct = userAnswers[index] === item.answer;
      if (correct) score++;
      if (userAnswers[index] !== 'No Answer') attempted++;
      return `<p>${questionIndex}. ${item.question}<br>
      Your Answer: ${userAnswers[index]}<br>
      Correct Answer: ${item.answer}</p>`;
  }).join('');

  resultDiv.innerHTML = `<p>Your score: ${score}/${selectedQuestions.length}</p>
                         <p>Total questions: ${selectedQuestions.length}</p>
                         <p>Questions attempted: ${attempted}</p>
                         <p>Correct answers: ${score}</p>
                         <p>Wrong answers: ${attempted - score}</p>`;
  document.getElementById('answers').innerHTML = answersHTML;

  const answersSection = document.getElementById('answers');
  answersSection.style.display = 'none';

  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('result-container').style.display = 'block';

  document.getElementById('showAnswers').style.display = 'inline-block';
  document.getElementById('showAnswers').textContent = 'Show Answers';
  document.getElementById('showAnswers').addEventListener('click', function() {
      toggleAnswers();
  });

  document.getElementById('homeButton').addEventListener('click', function() {
      goHome();
  });

  document.getElementById('resetQuiz').addEventListener('click', function() {
      resetQuiz();
  });
}

document.getElementById('quitQuiz').addEventListener('click', function() {
  quitQuiz();
});

function quitQuiz() {
  const confirmQuit = confirm("Are you sure you want to quit the quiz?");
  if (confirmQuit) {
      localStorage.removeItem('quizUserDetails');
      localStorage.removeItem('userAnswers');
      localStorage.removeItem('timeTaken');
      location.reload(); // Reload the page to go back to the home screen
  }
}

function resetQuiz() {
  const userDetails = JSON.parse(localStorage.getItem('quizUserDetails'));
  const quizContainer = document.getElementById('quiz');

  // Clear user's answers
  selectedQuestions.forEach((item, index) => {
    const questionIndex = index + 1;
    const input = document.querySelector(`input[name="q${questionIndex}"]:checked`);
    if (input) {
      input.checked = false;
    }
  });

  // Hide the answers section again
  const answersSection = document.getElementById('answers');
  answersSection.style.display = 'none';
}

function goHome() {
  localStorage.removeItem('quizUserDetails');
  localStorage.removeItem('userAnswers');
  localStorage.removeItem('timeTaken');
  location.reload();
}

let answersShown = false;

function toggleAnswers() {
  console.log("Toggle answers function called");
  const answersSection = document.getElementById('answers');
  if (!answersShown) {
    answersSection.style.display = 'block';
    document.getElementById('showAnswers').textContent = 'Hide Answers';
    answersShown = true;
  } else {
    answersSection.style.display = 'none';
    document.getElementById('showAnswers').textContent = 'Show Answers';
    answersShown = false;
  }
}

function updateTime() {
  const currentTimeContainer = document.getElementById('current-time');
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    const formattedTime = `${hours12}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} ${ampm}`;
    currentTimeContainer.textContent = `Current Time: ${formattedTime}, Date: ${now.toDateString()}`;
  }, 1000);
}

function checkStoredState() {
  const userDetails = localStorage.getItem('quizUserDetails');
  if (userDetails) {
    const parsedDetails = JSON.parse(userDetails);
    if (parsedDetails.startTime && !localStorage.getItem('userAnswers')) {
      startQuiz();
    } else if (localStorage.getItem('userAnswers')) {
      showResults(parsedDetails, JSON.parse(localStorage.getItem('userAnswers')), localStorage.getItem('timeTaken'));
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateTime();
  checkStoredState();
});

