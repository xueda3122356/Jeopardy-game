class TriviaGameShow {
   constructor(element, all_categories) {
      this.useCategoryIds = all_categories
      this.categories = [];
      this.the_question = {};
      this.current_the_question = null;
      this.score = 0;
      this.boardElement = element.querySelector(".board");
      this.scoreCountElement = element.querySelector(".score-count");
      this.formElement = element.querySelector("form");
      this.inputElement = element.querySelector("input[name=user-answer]");
      this.modalElement = element.querySelector(".card-modal");
      this.the_question_TextElement = element.querySelector(".clue-text");
      this.resultElement = element.querySelector(".result");
      this.resultTextElement = element.querySelector(".result_correct-answer-text");
      this.successTextElement = element.querySelector(".result_success");
      this.failTextElement = element.querySelector(".result_fail");
   }
   initGame() {
      this.boardElement.addEventListener("click", event => {
         if (event.target.dataset.clueId) {
            this.handleClueClick(event);
         }
      });
      this.formElement.addEventListener("submit", event => {
         this.handleFormSubmit(event);
      });
      this.updateScore(0);
      this.fetchCategories().then(() => {
         this.shuffle_questions();
      });
    }
   fetchCategories() {
      const categoryPromises = this.useCategoryIds.map(categoryId => {
         return fetch(`/static/categories/${categoryId}.json`)
      .then(response => response.json())
      .then(categoryData => {
         return {
            title: categoryData.title,
            the_question: categoryData.the_question.map((clueData, index) => {
            const clueId = `${categoryId}-${index}`;
            this.the_question[clueId] = {
               question: clueData.question,
               answer: clueData.answer,
               value: clueData.value,
               possibleAnswer1: clueData.possibleAnswer1,
               possibleAnswer2: clueData.possibleAnswer2,
               possibleAnswer3: clueData.possibleAnswer3,
            };
            return clueId;}),};});});
      return Promise.all(categoryPromises)
         .then(categories => {
            this.categories = categories;
            this.categories.forEach(category => {
               this.renderCategory(category);});
            })
         .catch(error => {
            console.error('Error fetching categories:', error);
         });
  }
   renderCategory(category) {      
      let column = document.createElement("div");
      column.classList.add("column");
      column.innerHTML = (
         `<header>${category.title.toUpperCase()}</header>
          <ul>
         </ul>`
      ).trim();
      var ul = column.querySelector("ul");
      category.the_question.forEach(questions => {
         var clue = this.the_question[questions];
         ul.innerHTML += `<li><button data-clue-id=${questions}>${"$"+clue.value}</button></li>`
      })
      this.boardElement.appendChild(column);
   }
   updateScore(change) {
      this.score += change;
      this.scoreCountElement.textContent = this.score;
   }
   handleClueClick(event) {
      var clue = this.the_question[event.target.dataset.clueId];
      event.target.classList.add("used");
      this.current_the_question = clue;
      this.the_question_TextElement.textContent = this.current_the_question.question;
      this.resultTextElement.textContent = this.current_the_question.answer;
      this.successTextElement.style.display = "none";
      this.failTextElement.style.display = "none";
      this.modalElement.classList.remove("showing-result");
      var categoryQuestions = this.categories.find(category => {
        return category.the_question.includes(event.target.dataset.clueId);
      }).the_question;
      var answers = [this.current_the_question.answer];
      while (answers.length < 4) {
         answers.push(this.the_question[event.target.dataset.clueId].possibleAnswer1);
         answers.push(this.the_question[event.target.dataset.clueId].possibleAnswer2);
         answers.push(this.the_question[event.target.dataset.clueId].possibleAnswer3);
       
      }
      shuffle(answers);
      var answerButtonsElement = this.modalElement.querySelector(".answer-buttons");
      if (answerButtonsElement) {
        answerButtonsElement.remove();
      }
    
      // Add buttons for each possible answer
      var answerButtons = document.createElement("div");
      answerButtons.classList.add("answer-buttons");
      for (var i = 0; i < answers.length; i++) {
        var answerButton = document.createElement("button");
        answerButton.textContent = answers[i];
        answerButton.classList.add("my-button-class");
        answerButton.addEventListener("click", event => {
          this.handleAnswerClick(event);
        });
        answerButtons.appendChild(answerButton);
      }
      this.modalElement.querySelector(".card-modal-inner").appendChild(answerButtons);
    
      this.inputElement.style.display = "none";
      this.modalElement.classList.add("visible");
    }
    
  
  
   handleAnswerClick(event) {
      var isCorrect = event.target.textContent.toUpperCase() === this.current_the_question.answer.toUpperCase();
      if (isCorrect) {
          this.updateScore(this.current_the_question.value);
          var audio = new Audio("/static/Sounds/CorrectSound.mp3");
          audio.play();
      }
      else{
         var audio = new Audio("/static/Sounds/WrongSound.mp3");
         audio.play();
      }
      this.revealAnswer(isCorrect);
      
  }
  
   handleFormSubmit(event) {
      event.preventDefault();
      var isCorrect = this.inputElement.value.toUpperCase() === this.current_the_question.answer.toUpperCase()
      if(isCorrect) {
         audio.play();
      }
      this.revealAnswer(isCorrect);
   }
   revealAnswer(isCorrect) {
      this.successTextElement.style.display = isCorrect ? "block" : "none";
      this.failTextElement.style.display = !isCorrect ? "block" : "none";
      this.modalElement.classList.add("showing-result");
      setTimeout(() => {
         this.modalElement.classList.remove("visible");
      }, 3000);
   }
   shuffle_questions() {
      this.useCategoryIds = shuffle(this.useCategoryIds);
   } 
}
function shuffle(a) {
   for (let i = a.length - 1; i > 0; i--) {
     const randomIndex = Math.floor(Math.random() * (i + 1));
     const temp = a[i];
     a[i] = a[randomIndex];
     a[randomIndex] = temp;
   }
   return a;
}

 
function start(){
   fetch('/categories')
          .then(response => {
              return response.json();
          })
          .then(category => {
            const filteredCategory = category.filter(item => item !== '');
            const game = new TriviaGameShow( document.querySelector(".app"),filteredCategory.slice(0, 6));
            game.initGame();
          }) }