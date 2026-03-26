/* ============================================================
   quiz.js — Quiz rendering and evaluation engine
   ============================================================ */

const Quiz = {

  /* Render a quiz for a given chapter ID into the target element */
  render(chapterId, targetEl) {
    const data = QUIZZES[chapterId];
    if (!data) {
      targetEl.innerHTML = '';
      return;
    }

    targetEl.innerHTML = `
      <div class="quiz-section" id="quizSection">
        <div class="quiz-section-header">
          <h2>Knowledge Check</h2>
          <p>${data.questions.length} questions &mdash; Select the best answer for each.</p>
        </div>

        <div class="quiz-score" id="quizScore">
          <span class="quiz-score-text" id="quizScoreText"></span>
          <span class="quiz-score-sub" id="quizScoreSub"></span>
        </div>

        <div class="questions-list" id="questionsList">
          ${data.questions.map((q, i) => Quiz._renderQuestion(q, i)).join('')}
        </div>

        <div class="quiz-actions">
          <button class="btn-quiz-submit" id="quizSubmit">Submit Answers</button>
          <button class="btn-quiz-retake" id="quizRetake">Retake Quiz</button>
        </div>
      </div>
    `;

    Quiz._attachEvents(chapterId);
  },

  /* Build HTML for a single question */
  _renderQuestion(q, index) {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const optionsHtml = q.options.map((opt, i) => `
      <label class="option-label" data-index="${i}">
        <input type="radio" name="q${index}" value="${i}" />
        <span class="option-letter">${letters[i]}</span>
        <span class="option-text">${opt}</span>
      </label>
    `).join('');

    return `
      <div class="question-card" id="qcard${index}" data-answer="${q.answer}">
        <div class="question-num">Question ${index + 1}</div>
        <div class="question-text">${q.q}</div>
        <div class="options-list" id="opts${index}">
          ${optionsHtml}
        </div>
        <div class="question-explanation" id="exp${index}">
          <div class="explanation-label">Explanation</div>
          ${q.explanation}
        </div>
      </div>
    `;
  },

  /* Attach click and submit events */
  _attachEvents(chapterId) {
    const data = QUIZZES[chapterId];

    /* Option selection highlight */
    document.querySelectorAll('.options-list').forEach((list, qi) => {
      list.querySelectorAll('.option-label').forEach(label => {
        label.addEventListener('click', () => {
          list.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
          label.classList.add('selected');
        });
      });
    });

    /* Submit */
    const submitBtn = document.getElementById('quizSubmit');
    const retakeBtn = document.getElementById('quizRetake');
    const scoreEl   = document.getElementById('quizScore');
    const scoreText = document.getElementById('quizScoreText');
    const scoreSub  = document.getElementById('quizScoreSub');

    submitBtn.addEventListener('click', () => {
      let correct = 0;
      let answered = 0;

      data.questions.forEach((q, i) => {
        const card    = document.getElementById(`qcard${i}`);
        const expEl   = document.getElementById(`exp${i}`);
        const optsList = document.getElementById(`opts${i}`);
        const selected = optsList.querySelector('input[type="radio"]:checked');

        if (!selected) return;
        answered++;

        const chosen = parseInt(selected.value);
        const right  = q.answer;

        /* Style all options */
        optsList.querySelectorAll('.option-label').forEach((label, li) => {
          label.style.pointerEvents = 'none';
          if (li === right) {
            label.classList.add('result-correct');
          } else if (li === chosen && chosen !== right) {
            label.classList.add('result-incorrect');
          }
        });

        if (chosen === right) {
          correct++;
          card.classList.add('correct');
        } else {
          card.classList.add('incorrect');
        }

        expEl.classList.add('show');
      });

      if (answered === 0) {
        scoreText.textContent = 'Please answer at least one question.';
        scoreEl.classList.add('show', 'fail');
        scoreEl.classList.remove('pass');
        return;
      }

      const pct = Math.round((correct / data.questions.length) * 100);
      scoreText.textContent = `Score: ${correct} / ${data.questions.length} correct (${pct}%)`;
      scoreSub.textContent  = correct === data.questions.length
        ? 'Perfect score. Well done.'
        : correct >= Math.ceil(data.questions.length / 2)
          ? 'Good work. Review any missed questions above.'
          : 'Review the chapter and try again.';

      scoreEl.classList.add('show');
      scoreEl.classList.toggle('pass', correct >= Math.ceil(data.questions.length / 2));
      scoreEl.classList.toggle('fail', correct < Math.ceil(data.questions.length / 2));

      scoreEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      submitBtn.disabled = true;
      retakeBtn.classList.add('show');
    });

    /* Retake */
    retakeBtn.addEventListener('click', () => {
      Quiz.render(chapterId, document.getElementById('quizContainer'));
    });
  }

};
