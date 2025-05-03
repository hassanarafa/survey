<template>
  <div class="survey-list-wrapper" v-if="!isSurveySelected && surveys.length">
    <h2 class="title">📋 Available Surveys</h2>

    <!-- Success message -->
    <div v-if="successMessage" class="success-message">
      <p>{{ successMessage }}</p>
    </div>

    <ul class="survey-list">
      <li @click="viewSurveyQuestions(survey.id)"
          v-for="survey in surveys"
          :key="survey.id"
          class="survey-card"
      >
        <div class="survey-info">
          <h3>{{ survey.title }}</h3>
        </div>
        <div class="survey-actions">
          <button @click.stop="viewHistory(survey.id)" class="view-history-btn">
            View History
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/services/axios.js'; // Import the api service

export default {
  data() {
    return {
      surveys: [],
      isSurveySelected: false,
      successMessage: "",
      currentSurveyId: null,
      loading: false,
    };
  },
  methods: {
    async fetchSurveys() {
      this.loading = true;
      try {
        const response = await api.get('get_surveys'); // Use the Axios instance to make the GET request
        this.surveys = response.data;
      } catch (error) {
        console.error('Error fetching surveys:', error);
      } finally {
        this.loading = false;
      }
    },
    viewSurveyQuestions(surveyId) {
      this.isSurveySelected = true;
      this.currentSurveyId = surveyId;
      this.$router.push({name: 'survey', params: {id: surveyId}});
    },
    viewHistory(surveyId) {
      const userId = localStorage.getItem("userId") || 0;
      this.$router.push({name: 'userAnswer', params: {userId, surveyId}});
    },
  },
  mounted() {
    const msg = sessionStorage.getItem("surveySuccessMessage");
    if (msg) {
      this.successMessage = msg;
      sessionStorage.removeItem("surveySuccessMessage");

      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    }

    this.fetchSurveys();
  },
};
</script>

<style scoped>
.survey-list-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", sans-serif;
}

.title {
  text-align: center;
  color: #f26822;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.success-message {
  background-color: #4caf50;
  color: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  animation: fade-in-out 2s ease-in-out;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0;
  }
  10%, 90% {
    opacity: 1;
  }
}

.survey-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.survey-card {
  background: #fff;
  border: 1px solid #eee;
  border-left: 6px solid #f26822;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
}

.survey-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.survey-info h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #f26822;
}

.survey-info p {
  margin: 0.5rem 0 0;
  color: #555;
  font-size: 0.95rem;
}

.view-history-btn {
  background-color: #f26822;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.view-history-btn:hover {
  background-color: #e05b1b;
}

.survey-questions {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.submit-btn {
  background-color: #4caf50;
  color: #fff;
  padding: 10px 18px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #43a047;
}
</style>
