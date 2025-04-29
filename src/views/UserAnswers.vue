
<template>
  <div class="user-answers">
    <h2>Your Submitted Answers</h2>

    <!-- Loading Spinner -->
    <div v-if="loading" class="spinner-container">
      <div class="spinner"></div>
    </div>

    <!-- Submissions -->
    <div v-else-if="userAnswers.length">
      <div
          v-for="submission in userAnswers"
          :key="submission.submission_id"
          class="submission-card"
      >
        <h3>Submission #{{ submission.submission_id }}</h3>
        <p class="submission-date">Submitted on: {{ formatDate(submission.submission_date) }}</p>

        <div class="answers">
          <div
              v-for="(answer, index) in submission.answers"
              :key="index"
              class="answer-item"
          >
            <div class="question">
              <strong>Question:</strong>
              {{ answer.question || "No Question Text" }}
            </div>
            <div class="answer">
              <strong>Answer:</strong>
              {{ answer.answer_text || answer.answer_choice || "No Answer Provided" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Submissions -->
    <div v-else class="no-submissions">
      <p>No submissions found yet.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ['userId', 'surveyId'],
  data() {
    return {
      userAnswers: [],
      loading: true,
    };
  },
  created() {
    this.fetchUserHistory();
  },
  methods: {
    async fetchUserHistory() {
      try {
        const response = await axios.post("https://survey.dd-ops.com/api/get_UserAnswers", {
          user_id: this.userId,
          survey_id: this.surveyId
        });
        if (response.status === 200) {
          this.userAnswers = response.data;
        }
      } catch (error) {
        console.error("Error fetching submission history:", error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      const [date, time] = dateStr.split(' ');
      const [year, month, day] = date.split('-');
      const [hour, minute, second] = time.split(':');

      const formattedDate = new Date(year, month - 1, day, hour, minute, second);

      if (isNaN(formattedDate)) {
        return "Invalid date";
      }

      const options = { year: "numeric", month: "long", day: "numeric" };
      return formattedDate.toLocaleDateString(undefined, options);
    }
  },
};
</script>

<style scoped>
.user-answers {
  padding: 2rem;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  margin: 0 auto;
  box-sizing: border-box;
}

h2 {
  text-align: center;
  color: #f26822;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #f26822;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.submission-card {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #eee;
  border-radius: 10px;
  background-color: #fafafa;
  transition: box-shadow 0.3s;
}

.submission-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.submission-date {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1rem;
}

.answers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answer-item {
  background: #fff;
  border-left: 4px solid #f26822;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.answer {
  color: #555;
}

.no-submissions {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

/* Media Queries for Mobile and Tablet */
@media (max-width: 768px) {
  h2 {
    font-size: 1.4rem;
  }

  .submission-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .submission-date {
    font-size: 0.8rem;
  }

  .answer-item {
    padding: 0.5rem;
  }

  .answers {
    padding: 0;
  }
}
</style>
