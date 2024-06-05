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
      startTime: new Date().getTime()
  };

  localStorage.setItem('quizUserDetails', JSON.stringify(userDetails));
  startQuiz();
});


let timerInterval;
let startTime;

const quizData = {
  hindi: [
      {
          question: "प्रश्न 1: भारत का राष्ट्रीय पशु कौन सा है?",
          options: ["शेर", "हाथी", "बाघ"],
          answer: "बाघ"
      },
      {
          question: "प्रश्न 2: महात्मा गांधी का पूरा नाम क्या था?",
          options: ["मोहनदास करमचंद गांधी", "जवाहरलाल नेहरू", "सुभाष चंद्र बोस"],
          answer: "मोहनदास करमचंद गांधी"
      }
  ],
  english: [
      {
          question: "Question 1: What is the capital of France?",
          options: ["Berlin", "Madrid", "Paris"],
          answer: "Paris"
      },
      {
          question: "Question 2: What is 2 + 2?",
          options: ["3", "4", "5"],
          answer: "4"
      }
  ]
};

function startQuiz() {
  const userDetails = JSON.parse(localStorage.getItem('quizUserDetails'));
  document.getElementById('user-form').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';

  const quizContainer = document.getElementById('quiz');
  quizContainer.innerHTML = '';

  quizData[userDetails.subject].forEach((item, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.innerHTML = `
          <p>${item.question}</p>
          ${item.options.map(option => `<input type="radio" name="q${index}" value="${option}"> ${option}<br>`).join('')}
      `;
      quizContainer.appendChild(questionDiv);
  });

  if (!userDetails.startTime) {
      userDetails.startTime = new Date().getTime();
      localStorage.setItem('quizUserDetails', JSON.stringify(userDetails));
  }
  startTime = userDetails.startTime;
  startTimer(60);

  document.getElementById('submitQuiz').addEventListener('click', function() {
      submitQuiz();
  });

  document.getElementById('resetQuiz').addEventListener('click', function() {
      resetQuiz();
  });
}

function startTimer(duration) {
  let timer = duration, minutes, seconds;
  timerInterval = setInterval(function() {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      document.getElementById('time').textContent = minutes + ':' + seconds;

      if (--timer < 0) {
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
  quizData[userDetails.subject].forEach((item, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
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
  const answersHTML = quizData[userDetails.subject].map((item, index) => {
      const correct = userAnswers[index] === item.answer;
      if (correct) score++;
      return `<p>${index + 1}. ${item.question}<br>
              Your Answer: ${userAnswers[index]}<br>
              Correct Answer: ${item.answer}</p>`;
  }).join('');

  resultDiv.innerHTML = `<p>Your score: ${score}/${quizData[userDetails.subject].length}</p>`;
  document.getElementById('answers').innerHTML = answersHTML;

  // Hide answers section initially
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
  quizData[userDetails.subject].forEach((item, index) => {
      const input = document.querySelector(`input[name="q${index}"]:checked`);
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
      const ampm = hours >= 12 ? 'PM' :
      'AM';
      const hours12 = hours % 12 || 12;

      const formattedTime = `${hours12}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} ${ampm}`;
      currentTimeContainer.textContent = `Current Time: ${formattedTime}, Date: ${now.toDateString()}`;
  }, 1000);
}

function checkStoredState() {
  const userDetails = JSON.parse(localStorage.getItem('quizUserDetails'));
  if (userDetails) {
      if (localStorage.getItem('userAnswers') && localStorage.getItem('timeTaken')) {
          const userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
          const timeTaken = parseInt(localStorage.getItem('timeTaken'));
          showResults(userDetails, userAnswers, timeTaken);
      } else {
          startQuiz();
      }
  }
}

updateTime();
checkStoredState();
