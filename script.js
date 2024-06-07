        // Function to open the rules popup
        function openRulesPopup() {
            document.getElementById('rulesPopup').style.display = 'block';
        }

        // Function to close the rules popup
        function closeRulesPopup() {
            document.getElementById('rulesPopup').style.display = 'none';
        }

        // Function to handle form submission
        document.getElementById('detailsForm').addEventListener('submit', function(event) {
            event.preventDefault();
            if (!document.getElementById('rulesCheckbox').checked) {
                document.getElementById('hintMessage').style.display = 'block';
                return;
            }
            // Start quiz logic goes here
            // You can call a function like startQuiz() to begin the quiz
        });

        // Function to enable the "Start Quiz" button when the checkbox is checked
        document.getElementById('rulesCheckbox').addEventListener('change', function() {
            const checkbox = document.getElementById('rulesCheckbox');
            const startButton = document.getElementById('startButton');
            startButton.disabled = !checkbox.checked;
            // Hide the hint message when the checkbox is checked
            document.getElementById('hintMessage').style.display = checkbox.checked ? 'none' : 'block';
        });

let quizData; // Define a global variable to store the fetched questions
let selectedQuestions = [];
let currentPage = 1;
const questionsPerPage = 10;

// Fetch the questions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
        })
        .catch(error => console.error('Error fetching questions:', error));

    updateTime();
    checkStoredState();
});

// Form submission event listener
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
        totalQuestions: 20 // Set the number of questions you want to ask
    };

    localStorage.setItem('quizUserDetails', JSON.stringify(userDetails));
    startQuiz();
});

// Start quiz function
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

    startTimer(40, 54);
    displayQuestions();

    document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
    document.getElementById('resetQuiz').addEventListener('click', resetQuiz);
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
}

// Select random questions
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
    let questionsToDisplay = [];

    // Filter questions based on the selected difficulty
    if (userDetails.difficulty === 'hard') {
        questionsToDisplay = selectedQuestions.filter(question => question.difficulty === 'hard' || !question.difficulty);
    } else if (userDetails.difficulty === 'medium') {
        questionsToDisplay = selectedQuestions.filter(question => question.difficulty === 'medium' || !question.difficulty);
    } else if (userDetails.difficulty === 'easy') {
        questionsToDisplay = selectedQuestions.filter(question => question.difficulty === 'easy' || !question.difficulty);
    }

    questionsToDisplay = questionsToDisplay.slice(start, end);

    questionsToDisplay.forEach((item, index) => {
        const questionIndex = start + index + 1;
        const questionDiv = document.createElement('div');
        questionDiv.className = `custom-question-class question-container`;
        questionDiv.innerHTML = `
            <p class="question-text">${questionIndex}. ${item.question}</p>
            ${item.hint ? `<p class="hint-text">Hint: ${item.hint}</p>` : ''}
            ${item.image ? `<img src="${item.image}" alt="Question Image" class="question-image">` : ''}
            <div class="options-container">
                ${item.options.map(option => `
                    <label class="option-label">
                        <input class="option-input" type="radio" name="q${questionIndex}" value="${option}">
                        ${option}
                    </label><br>`).join('')}
            </div>
        `;
        quizContainer.appendChild(questionDiv);
    });

    document.getElementById('prevPage').style.display = currentPage === 1 ? 'none' : 'inline-block';
    document.getElementById('nextPage').style.display = end >= selectedQuestions.length ? 'none' : 'inline-block';
    document.getElementById('submitQuiz').style.display = end >= selectedQuestions.length ? 'inline-block' : 'none';
}


// Change page
function changePage(direction) {
    currentPage += direction;
    displayQuestions();
}

// Start timer
function startTimer(minutes, seconds) {
    let totalSeconds = minutes * 60 + seconds;
    const timerInterval = setInterval(() => {
        const displayMinutes = parseInt(totalSeconds / 60, 10);
        const displaySeconds = parseInt(totalSeconds % 60, 10);

        document.getElementById('time').textContent = `${displayMinutes < 10 ? '0' : ''}${displayMinutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;

        if (--totalSeconds < 0) {
            clearInterval(timerInterval);
            alert('Time ended!');
            submitQuiz();
        }
    }, 1000);
}

// Submit quiz
function submitQuiz() {
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

    // Automatically show answers upon submitting the quiz
    toggleAnswers();
}
// Show results
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

    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('showAnswers').style.display = 'inline-block';
    document.getElementById('showAnswers').textContent = 'Show Answers';
    document.getElementById('showAnswers').addEventListener('click', toggleAnswers);
    document.getElementById('homeButton').addEventListener('click', goHome);
    document.getElementById('resetQuiz').addEventListener('click', resetQuiz);
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

document.getElementById('quitQuiz').addEventListener('click', quitQuiz);

function quitQuiz() {
    if (confirm("Are you sure you want to quit the quiz?")) {
        localStorage.removeItem('quizUserDetails');
        localStorage.removeItem('userAnswers');
        localStorage.removeItem('timeTaken');
        location.reload();
    }
}

function resetQuiz() {
    const quizContainer = document.getElementById('quiz');
    selectedQuestions.forEach((item, index) => {
        const questionIndex = index + 1;
        const input = document.querySelector(`input[name="q${questionIndex}"]:checked`);
        if (input) {
            input.checked = false;
        }
    });
    document.getElementById('answers').style.display = 'none';
}

function goHome() {
    localStorage.removeItem('quizUserDetails');
    localStorage.removeItem('userAnswers');
    localStorage.removeItem('timeTaken');
    location.reload();
}

let answersShown = false;

function toggleAnswers() {
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
