<template>
  <div class="survey">
    <h2>Survey Details</h2>

    <div v-if="isSurveySelected && survey.pages && Object.keys(survey.pages).length" class="survey-form">
      <h2>{{ survey.title }}</h2>

      <div class="survey-page">
        <h3 class="pagNum">Page {{ currentPage }}</h3>

        <div
            v-for="question in filteredQuestions"
            :key="question.id"
            class="question"
            :class="{ completed: isQuestionCompleted(question.id) }"
        >
          <label :for="'question-' + question.id">
            {{ question.question_text }}
            <span v-if="question.is_required" class="required-star">★</span>
          </label>

          <!-- Auto-fill for Manager Name -->
          <input
              v-if="question.question_text === 'Manager Name'"
              :id="'question-' + question.id"
              type="text"
              :value="managerName"
              readonly
              class="has-data"
          />

          <input
              v-else-if="question.question_type === 'text'"
              v-model="answers[question.id]"
              :id="'question-' + question.id"
              type="text"
              placeholder="Your answer"
              :class="{ 'has-data': answers[question.id] }"
          />

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

          <div v-else-if="question.question_type === 'multiple_choice' && question.answers?.length">
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

          <div
              v-else-if="(question.question_type === 'dropdown' || question.question_type === 'store_dropdown') && question.answers?.length"
          >
            <multiselect
                v-model="answers[question.id]"
                :options="question.answers.map(
                question.question_type === 'store_dropdown'
                  ? option => `${option.store_code} - ${option.label}`
                  : option => option.label
              )"
                :searchable="true"
                placeholder="Select an option"
                track-by="label"
                :allow-empty="true"
            />
          </div>

          <div
              v-if="(question.question_type === 'multiple_choice' || question.question_type === 'dropdown') && (!question.answers?.length)"
              class="no-options"
          >
            <em>No options available for this question.</em>
          </div>
        </div>
      </div>

      <div class="button-row">
        <button v-if="currentPage > 1" class="nav-btn" @click="goToPreviousPage">Back</button>
        <button v-if="currentPage < totalPages" class="nav-btn" @click="goToNextPage" :disabled="!isPageValid()">
          Next
        </button>
        <button v-if="currentPage === totalPages" class="nav-btn submit-btn" @click="submitSurvey" :disabled="!isFormValid()">
          Submit Survey
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Multiselect from "vue-multiselect";

export default {
  components: { Multiselect },
  data() {
    return {
      survey: { id: null, title: "", description: "", pages_count: 0, pages: {} },
      answers: {},
      isSurveySelected: false,
      successMessage: "",
      currentPage: 1,
      totalPages: 0,
      user_id: 5,
      store_id: 1,
      customer_name: "John Doe",
      customer_phone: "0123456789",
      isSubmitting: false,
      managerName: localStorage.getItem("userName") || "",
    };
  },
  computed: {
    filteredQuestions() {
      return this.survey.pages[this.currentPage].filter(question => this.shouldShowQuestion(question));
    },
  },
  mounted() {
    console.log(this.managerName)
    const surveyId = this.$route.params.id;
    this.fetchSurveyQuestions(surveyId);
  },
  methods: {
    async fetchSurveyQuestions(surveyId) {
      try {
        const response = await fetch(`https://survey.dd-ops.com/api/survey/${surveyId}`);
        const data = await response.json();
        this.survey = data;
        this.answers = {};
        this.isSurveySelected = true;
        this.currentPage = 1;
        this.totalPages = Object.keys(data.pages).length;
      } catch (error) {
        console.error("Error fetching survey questions:", error);
      }
    },

    toggleRating(questionId, rating) {
      this.answers[questionId] = this.answers[questionId] === rating ? null : rating;
    },

    toggleOption(questionId, selectedOption) {
      this.answers[questionId] = this.answers[questionId] === selectedOption ? null : selectedOption;
    },

    goToPreviousPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    goToNextPage() {
      if (this.isPageValid()) this.currentPage++;
    },

    isQuestionCompleted(questionId) {
      return this.answers[questionId] !== null && this.answers[questionId] !== undefined && this.answers[questionId] !== "";
    },

    isPageValid() {
      return this.survey.pages[this.currentPage].every((question) => {
        if (question.question_text === 'Manager Name') return true;
        return !question.is_required || this.isQuestionCompleted(question.id);
      });
    },

    isFormValid() {
      return Object.values(this.survey.pages).every((questions) => {
        return questions.every((question) => {
          if (question.question_text === 'Manager Name') return true;
          return !question.is_required || this.isQuestionCompleted(question.id);
        });
      });
    },

    async submitSurvey() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      const answersArray = Object.entries(this.answers).map(([id, value]) => {
        let mappedAnswer;
        switch (value) {
          case "yes": mappedAnswer = 25; break;
          case "no": mappedAnswer = 26; break;
          case "Under 25": mappedAnswer = 29; break;
          case "25-34": mappedAnswer = 30; break;
          case "35-44": mappedAnswer = 31; break;
          case "45-54": mappedAnswer = 32; break;
          case "daily ": mappedAnswer = 33; break;
          case "weekly": mappedAnswer = 34; break;
          case "monthly": mappedAnswer = 35; break;
          case "frequently": mappedAnswer = 37; break;
          case "male\r\n": mappedAnswer = 27; break;
          case "female\r\n": mappedAnswer = 28; break;
          default: mappedAnswer = value;
        }

        return {
          question_id: Number(id),
          answer: mappedAnswer,
        };
      });

      const requestBody = {
        survey_id: this.survey.id,
        user_id: this.user_id,
        store_id: this.store_id,
        customer_name: this.customer_name,
        customer_phone: this.customer_phone,
        answers: answersArray,
      };

      try {
        const response = await axios.post("https://survey.dd-ops.com/api/store_submissions", requestBody, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 200 || response.status === 201) {
          this.successMessage = "Survey submitted successfully!";
          sessionStorage.setItem("surveySuccessMessage", "Survey submitted successfully!");
          this.answers = {};
          this.isSurveySelected = false;
          this.$router.push({ name: "SurveyList" });
        }
      } catch (error) {
        console.error("Error submitting survey:", error);
        this.isSubmitting = false;
      }
    },

    shouldShowQuestion(question) {
      if (question.question_text === 'If "No", reason for not recommending') {
        const relatedQuestion = Object.values(this.survey.pages).flat().find(
            q => q.question_text?.trim().toLowerCase() === "recommend promotion or award?".toLowerCase()
        );
        if (!relatedQuestion || !this.answers[relatedQuestion.id]) return false;
        return String(this.answers[relatedQuestion.id]).trim().toLowerCase() === "no";
      }

      if (question.question_text === "if no What's is the main reason you don't want to recommend us?") {
        const relatedQuestion = Object.values(this.survey.pages).flat().find(
            q => q.question_text?.trim().toLowerCase() === "would you recommend this to your friends/family? ( yes or no)".toLowerCase()
        );
        if (!relatedQuestion || !this.answers[relatedQuestion.id]) return false;
        return String(this.answers[relatedQuestion.id]).trim().toLowerCase() === "no";
      }

      return true;
    }

  },
};
</script>

<style scoped>
@import "~vue-multiselect/dist/vue-multiselect.min.css";

.question {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.question input,
.question .option {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.required-star {
  color: #e74c3c;
  margin-left: 5px;
  font-weight: bold;
}

.nav-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  width: 93%;
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
  flex: 1;
  margin-left: 0.5rem;
  padding: 14px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  max-width: 94%;
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
  min-width: 50px;
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
    height: 30px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .rating-button {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}

h2 {
  text-align: center;
  color: #f26822;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.question {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  h2 {
    font-size: 1.4rem;
  }
}
</style>
