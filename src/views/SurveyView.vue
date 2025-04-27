<template>
  <div class="survey">
    <h2>Surveys</h2>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- List of surveys -->
    <div v-if="!isSurveySelected && surveys.length">
      <div
          v-for="survey in surveys"
          :key="survey.id"
          class="survey-item"
          @click="fetchSurveyQuestions(survey.id)"
      >
        <h3>{{ survey.title }}</h3>
        <p>{{ survey.description }}</p>

        <!-- History Button -->
        <button @click="viewHistory(survey.id)" class="history-btn">View History</button>
      </div>
    </div>

    <!-- Survey Questions -->
    <div v-if="isSurveySelected && survey.questions.length" class="survey-form">
      <h2>{{ survey.title }}</h2>

      <div
          v-for="question in survey.questions"
          :key="question.id"
          class="question"
          :class="{ submitted: submittedQuestions.includes(question.id) }"
      >
        <label :for="'question-' + question.id">{{ question.question_text }}</label>

        <!-- Text Input -->
        <div v-if="question.question_type === 'text'">
          <input
              v-model="answers[question.id]"
              :id="'question-' + question.id"
              type="text"
              placeholder="Your answer"
          />
        </div>

        <!-- Rating Input -->
        <div v-if="question.question_type === 'rating'">
          <div class="rating-scale">
            <button
                v-for="n in 10"
                :key="n"
                :class="['rating-button', { active: answers[question.id] === n }]"
                @click="toggleRating(question.id, n)"
                type="button"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Multiple Choice Input -->
        <div v-if="question.question_type === 'multiple_choice' && question.answers.length">
          <div class="options horizontal">
            <div
                v-for="option in question.answers"
                :key="option.id"
                :class="['option', { selected: answers[question.id] === (option.answer === 'Yes' ? 4 : option.answer === 'No' ? 5 : option.answer) }]"
                @click="selectChoice(question.id, option.answer)"
            >
              <span>{{ option.answer }}</span>
            </div>
          </div>
        </div>

        <!-- Dropdown Input -->
        <div v-if="question.question_type === 'dropdown' && question.answers.length">
          <select v-model="answers[question.id]" :id="'question-' + question.id">
            <option
                v-for="option in question.answers"
                :key="option.id"
                :value="option.answer === 'Yes' ? 4 : option.answer === 'No' ? 5 : option.answer"
            >
              {{ option.answer }}
            </option>
          </select>
        </div>

        <!-- Fallback if no options -->
        <div
            v-if="(question.question_type === 'multiple_choice' || question.question_type === 'dropdown') && !question.answers.length"
            class="no-options"
        >
          <em>No options available for this question.</em>
        </div>
      </div>

      <button class="full-width-btn" type="submit" @click="submitSurvey">Submit Survey</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      surveys: [],
      survey: {
        id: null,
        title: "",
        description: "",
        questions: [],
      },
      answers: {},
      submittedQuestions: [],
      isSurveySelected: false,
      successMessage: "",
      user_id: 5,
      store_id: 1,
      customer_name: "John Doe",
      customer_phone: "0123456789",
      userAnswers: {}, // Store user answers history
    };
  },
  mounted() {
    // Check if there is a success message in sessionStorage and show it
    const successMessage = sessionStorage.getItem("surveySuccessMessage");

    if (successMessage) {
      this.successMessage = successMessage;

      // Show the success message at the top-right corner
      this.$nextTick(() => {
        const successMessageElement = document.querySelector('.success-message');
        successMessageElement.classList.add('show'); // Add the class to show it

        // Remove the success message after 3 seconds
        setTimeout(() => {
          successMessageElement.classList.remove('show');
          sessionStorage.removeItem("surveySuccessMessage"); // Remove the success message from sessionStorage
        }, 3000); // Message stays visible for 3 seconds
      });
    }

    this.fetchSurveys();
  },
  methods: {
    async fetchSurveys() {
      try {
        const response = await fetch("https://survey.dd-ops.com/api/get_surveys");
        const data = await response.json();
        this.surveys = data;
      } catch (error) {
        console.error("Error fetching surveys:", error);
      }
    },
    async fetchSurveyQuestions(surveyId) {
      try {
        const response = await fetch(`https://survey.dd-ops.com/api/survey/${surveyId}`);
        const data = await response.json();
        this.survey = data;
        this.answers = {};
        this.submittedQuestions = [];
        this.isSurveySelected = true;
      } catch (error) {
        console.error("Error fetching survey questions:", error);
      }
    },
    viewHistory() {
      const userId = 5;
      const surveyId = 1;

      this.$router.push({ name: 'userAnswer', params: { userId, surveyId } });
    },
    toggleRating(questionId, rating) {
      this.answers[questionId] = this.answers[questionId] === rating ? null : rating;
    },
    selectChoice(questionId, choice) {
      if (choice === "Yes") {
        this.answers[questionId] = 4;
      } else if (choice === "No") {
        this.answers[questionId] = 5;
      } else if (choice === "daily ") {
        this.answers[questionId] = 12;
      } else if (choice === "weekly") {
        this.answers[questionId] = 13;
      } else if (choice === "monthly") {
        this.answers[questionId] = 14;
      } else if (choice === "randomly") {
        this.answers[questionId] = 15;
      } else if (choice === "Under 25") {
        this.answers[questionId] = 8;
      } else if (choice === "25-34") {
        this.answers[questionId] = 9;
      } else if (choice === "35-44") {
        this.answers[questionId] = 10;
      } else if (choice === "45-54") {
        this.answers[questionId] = 11;
      } else {
        this.answers[questionId] = choice;
      }
    },
    async submitSurvey() {
      console.log("Survey submit method triggered");

      const answersArray = Object.keys(this.answers).map((id) => ({
        question_id: Number(id),
        answer: this.answers[id],
      }));

      const requestBody = {
        survey_id: 1,
        user_id: 5,
        store_id: this.store_id,
        customer_name: this.customer_name,
        customer_phone: this.customer_phone,
        answers: answersArray,
      };

      console.log(requestBody);

      try {
        const response = await axios.post(
            "https://survey.dd-ops.com/api/store_submissions",
            requestBody,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
        );

        if (response.status === 200) {
          // Store the success message in sessionStorage before refreshing
          sessionStorage.setItem("surveySuccessMessage", "Survey submitted successfully!");

          // Refresh the page
           window.location.reload();
        } else {
          console.error("Error submitting survey:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting survey:", error);
      }
    }
  },
};
</script>

<style scoped>
/* Responsive Design Adjustments */
.survey {
  padding: 1rem;
  max-width: 700px;
  margin: 0 auto;
  background-color: #fdfdfd;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h2 {
  color: #f26822;
  margin: 13px;
  text-align: center;
  font-size: 1.8rem;
}

.survey-item {
  position: relative;
  padding: 1.2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: #fff;
}

.survey-item:hover {
  background-color: #f8f8f8;
}

.question {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.4rem;
  color: #f26822;
}

input[type="text"],
select {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.rating-scale {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  background-color: #4caf50;
  color: white;
  border-radius: 8px;
  z-index: 1000;
  display: none;
  transition: opacity 0.3s ease;
}

.success-message.show {
  display: block;
  opacity: 1;
}

.rating-button {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #f0f0f0;
  color: #f26822;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.rating-button.active {
  background-color: #f26822;
  color: white;
}

.options.horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.option {
  flex: 1 1 auto;
  min-width: 100px;
  padding: 0.6rem;
  border-radius: 8px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  text-align: center;
}

.option span {
  font-size: 1rem;
  display: block;
}

.option.selected {
  background-color: #f26822;
  color: white;
}

.option:hover {
  background-color: #f26822;
  transform: scale(1.05);
  color: white;
}

.full-width-btn {
  width: 80%;
  height: 50px;
  padding: 1rem;
  background-color: #f26822;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}


.history-btn {
  margin-top: 2rem;
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f26822;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* Media Queries for Mobile and Tablet */
@media (max-width: 768px) {
  h2 {
    font-size: 1.4rem;
  }

  .survey-item h3 {
    font-size: 1.4rem;
  }

  .survey-form {
    padding: 1rem;
  }

  .question {
    padding: 1rem;
  }
}
@media (max-width: 768px) {
  .rating-button {
    width: 30px; /* Adjust width for smaller screens */
    height: 30px; /* Adjust height for smaller screens */
    font-size: 0.9rem; /* Reduce font size on smaller screens */
  }
}

@media (max-width: 480px) {
  .rating-button {
    width: 28px; /* Even smaller for mobile screens */
    height: 28px; /* Even smaller for mobile screens */
    font-size: 0.8rem; /* Reduce font size further */
  }
}
</style>
