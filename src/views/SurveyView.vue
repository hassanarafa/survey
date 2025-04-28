<template>
  <div class="survey">
    <h2>Surveys</h2>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- List of surveys -->
    <div v-if="!isSurveySelected && surveys.length">
      <div v-for="survey in surveys" :key="survey.id" class="survey-item" @click="fetchSurveyQuestions(survey.id)">
        <h3>{{ survey.title }}</h3>
        <p v-if="survey.description">{{ survey.description }}</p>

        <!-- History Button -->
        <button @click.stop="viewHistory(survey.id)" class="history-btn">View History</button>
      </div>
    </div>

    <!-- Survey Questions -->
    <div v-if="isSurveySelected && survey.pages && Object.keys(survey.pages).length" class="survey-form">
      <h2>{{ survey.title }}</h2>

      <!-- Display Current Page -->
      <div class="survey-page">
        <h3 class="pagNum">Page {{ currentPage }}</h3>
        <div v-for="question in survey.pages[currentPage]" :key="question.id" class="question" :class="{ completed: isQuestionCompleted(question.id) }">
          <label :for="'question-' + question.id">{{ question.question_text }}</label>

          <!-- Text Input -->
          <input
              v-if="question.question_type === 'text'"
              v-model="answers[question.id]"
              :id="'question-' + question.id"
              type="text"
              placeholder="Your answer"
              :class="{ 'has-data': answers[question.id], 'default-border': !answers[question.id] }"
          />

          <!-- Rating Input -->
          <div v-else-if="question.question_type === 'rating'" class="rating-scale">
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

          <!-- Multiple Choice -->
          <div v-else-if="question.question_type === 'multiple_choice' && question.answers && question.answers.length">
            <div class="options horizontal">
              <div
                  v-for="option in question.answers"
                  :key="option.id"
                  :class="['option', { selected: answers[question.id] === option.label }]"
                  @click="toggleOption(question.id, option.label)"
              >
                <span>{{ option.label }}</span>
              </div>
            </div>
          </div>

          <!-- Dropdown -->
          <div v-else-if="(question.question_type === 'dropdown'||question.question_type === 'store_dropdown') && question.answers && question.answers.length">
            <multiselect
                v-model="answers[question.id]"
                :options="question.answers.map((question.question_type === 'store_dropdown')?option => (option.store_code +' - '+option.label):option =>option.label)"
                :searchable="true"
                :placeholder="'Select an option'"
                track-by="label"
                :allow-empty="true"
            />
          </div>

          <!-- Fallback if no options -->
          <div v-if="(question.question_type === 'multiple_choice' || question.question_type === 'dropdown') && (!question.answers || !question.answers.length)" class="no-options">

            <em>No options available for this question.</em>
          </div>
        </div>
      </div>

      <div class="button-row">
        <button v-if="currentPage > 1" class="nav-btn" @click="goToPreviousPage">Back</button>
        <button v-if="currentPage < totalPages" class="nav-btn" @click="goToNextPage">Next</button>
        <button v-if="currentPage === totalPages" class="nav-btn submit-btn" @click="submitSurvey">Submit Survey</button>
      </div>


    </div>
  </div>
</template>

<script>
import axios from "axios";
import Multiselect from "vue-multiselect"; // Import vue-multiselect

export default {
  components: {
    Multiselect // Register the component
  },
  data() {
    return {
      surveys: [],
      survey: {
        id: null,
        title: "",
        description: "",
        pages_count: 0,
        pages: {},
      },
      answers: {},
      submittedQuestions: [],
      isSurveySelected: false,
      successMessage: "",
      currentPage: 1, // Track the current page
      totalPages: 0, // Total number of pages
      user_id: 5,
      store_id: 1,
      customer_name: "John Doe",
      customer_phone: "0123456789",
    };
  },
  mounted() {
    const successMessage = sessionStorage.getItem("surveySuccessMessage");

    if (successMessage) {
      this.successMessage = successMessage;

      this.$nextTick(() => {
        const successMessageElement = document.querySelector('.success-message');
        successMessageElement.classList.add('show');

        setTimeout(() => {
          successMessageElement.classList.remove('show');
          sessionStorage.removeItem("surveySuccessMessage");
        }, 3000);
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
        this.currentPage = 1; // Reset to first page
        this.totalPages = Object.keys(data.pages).length; // Set total pages
      } catch (error) {
        console.error("Error fetching survey questions:", error);
      }
    },
    viewHistory() {
      const userId = 5;
      const surveyId = 1;

      this.$router.push({name: 'userAnswer', params: {userId, surveyId}});
    },
    toggleRating(questionId, rating) {
      this.answers[questionId] = this.answers[questionId] === rating ? null : rating;
    },

    toggleOption(questionId, selectedOption) {
      if (this.answers[questionId] === selectedOption) {
        this.answers[questionId] = null; // Unselect the option
      } else {
        this.answers[questionId] = selectedOption; // Select the option
      }
    },

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    // Check if question is completed
    isQuestionCompleted(questionId) {
      return Object.prototype.hasOwnProperty.call(this.answers, questionId) && this.answers[questionId] !== null && this.answers[questionId] !== "";
    },

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    async submitSurvey() {
      console.log("Survey submit method triggered");

      const answersArray = Object.keys(this.answers).map((id) => {
        const answerValue = this.answers[id];

        let mappedAnswer;
        switch (answerValue) {
          case "yes":
            mappedAnswer = 4;
            break;
          case "no":
            mappedAnswer = 5;
            break;
          case "Under 25":
            mappedAnswer = 8;
            break;
          case "25-34":
            mappedAnswer = 9;
            break;
          case "35-44":
            mappedAnswer = 10;
            break;
          case "45-54":
            mappedAnswer = 11;
            break;
          case "daily":
            mappedAnswer = 12;
            break;
          case "weekly":
            mappedAnswer = 13;
            break;
          case "monthly":
            mappedAnswer = 14;
            break;
          case "randomly":
            mappedAnswer = 15;
            break;
          case "male\r\n":
            mappedAnswer = 6;
            break;
          case "female\r\n":
            mappedAnswer = 7;
            break;
          default:
            mappedAnswer = answerValue;
        }

        return {
          question_id: Number(id),
          answer: mappedAnswer,
        };
      });

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

        console.log(response.status);

        if (response.status === 201 || response.status === 200) {
          sessionStorage.setItem("surveySuccessMessage", "Survey submitted successfully!");
          this.successMessage = "Survey submitted successfully!";
          this.$nextTick(() => {
            const successMessageElement = document.querySelector('.success-message');
            successMessageElement.classList.add('show');

            setTimeout(() => {
              successMessageElement.classList.remove('show');
            }, 3000);
          });
          this.isSurveySelected = false;
          this.survey = {};
        }
      } catch (error) {
        console.error("Error submitting survey:", error);
      }
    },
  },
};
</script>

<style scoped>
@import "~vue-multiselect/dist/vue-multiselect.min.css";

/* Green line for completed question */
.question {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.question.completed {
  border-left: 5px solid green;
  background-color: #f0fdf4;
}

.question label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.4rem;
  color: #f26822;
}

.survey {
  padding: 3rem 1rem;
  max-width: 700px;
  margin: 15px auto;
  background-color: #fdfdfd;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.pagNum{
  color: #f26822;
  margin-left: 20px;
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

.multiselect .multiselect__single {
  background-color: #f26822;
  color: white;
}

.multiselect .multiselect__content .multiselect__option--highlight {
  background-color: #f26822;
  color: white;
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
  color: #333;
}

input[type="text"]:focus,
select:focus {
  border-color: #f26822;
  outline: none;
}

input[type="text"].has-data {
  border-color: green;
}

input[type="text"].default-border {
  border-color: #f26822;
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

.nav-btn {
  flex: 1; /* Make all buttons take equal width */
  padding: 14px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background: #f26822;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.25s ease;
}

.nav-btn:hover {
  background: #f26822;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(53, 122, 189, 0.4);
}

.nav-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.5);
}

.nav-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.submit-btn {
  flex: 1; /* Make all buttons take equal width */
  padding: 14px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background: #f26822;
}

.submit-btn:hover {
  background: #d4571b;
}

.submit-btn:focus {
  box-shadow: 0 0 0 3px rgba(242, 104, 34, 0.5);
}



.button-row {
  display: flex;
  justify-content: space-between; /* Ensures buttons are spaced apart */
  gap: 10px; /* Optional: Adds space between the buttons */
  margin-top: 20px; /* Optional: Adds space above the buttons */
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
    width: 30px;
    /* Adjust width for smaller screens */
    height: 30px;
    /* Adjust height for smaller screens */
    font-size: 0.9rem;
    /* Reduce font size on smaller screens */
  }
}

@media (max-width: 480px) {
  .rating-button {
    width: 28px;
    /* Even smaller for mobile screens */
    height: 28px;
    /* Even smaller for mobile screens */
    font-size: 0.8rem;
    /* Reduce font size further */
  }
}
</style>
