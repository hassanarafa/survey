<template>
  <div class="submission-detail">
    <h2>📝 Submission Details</h2>

    <div v-if="loading" class="spinner-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="submissionData">
      <div class="meta-info">
        <div class="badge">
          <strong>Store:</strong>
          {{ storeData?.store_name || 'N/A' }} ({{ storeData?.store_code || 'N/A' }})
        </div>
        <div class="badge">
          <strong>Guest:</strong> {{ guestName }} - {{ guestContact }}
        </div>
        <div class="badge">
          <strong>Date:</strong> {{ submissionData.submitted_at }}
        </div>
      </div>

      <div class="answers-grid">
        <div
            v-for="(answer, index) in submissionData.answers"
            :key="index"
            class="answer-card"
        >
          <div class="question">{{ answer.question.trim() }}</div>
          <div class="answer">
            <template v-if="Array.isArray(answer.answers)">
              <div
                  v-for="(a, i) in answer.answers"
                  :key="i"
              >
                <span v-if="a.answer_text">{{ a.answer_text }}</span>
                <span v-else-if="a.store_name">
                  {{ a.store_name }} ({{ a.store_code }})
                </span>
                <span v-else>No Answer</span>
              </div>
            </template>
            <template v-else>
              {{ answer.answers?.answer_text || "No Answer" }}
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="error-msg">⚠️ No data found. Please go back and try again.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      submissionData: null,
      loading: true,
    };
  },
  computed: {
    guestName() {
      return this.getAnswerText('Guest Name');
    },
    guestContact() {
      return this.getAnswerText('Guest Contact no');
    },
    storeData() {
      const answer = this.submissionData?.answers.find(a =>
          a.question.trim().startsWith('Store Code and Store Name')
      );
      return answer && Array.isArray(answer.answers) ? answer.answers[0] : null;
    },
  },
  methods: {
    async fetchSubmissionDetails() {
      const surveyId = localStorage.getItem('survey_id');
      const userId = localStorage.getItem('userId');
      const submissionId = localStorage.getItem('submission_id');

      if (!surveyId || !userId || !submissionId) {
        console.error('Missing required data in localStorage');
        this.loading = false;
        return;
      }

      console.log(userId);
      console.log(surveyId);
      console.log(submissionId);
      try {
        const res = await axios.post(
            "https://survey.dd-ops.com/api/submission-details",
            {
              user_id: userId,
              survey_id: surveyId,
              submission_id: submissionId,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
        );

        const data = res.data;

        if (data && Array.isArray(data)) {
          this.submissionData = data[0] || null;
        } else if (data && typeof data === 'object') {
          this.submissionData = data;
        } else {
          console.error('Unexpected response structure:', data);
          this.submissionData = null;
        }

      } catch (error) {
        console.error("Error fetching submission:", error);
        this.submissionData = null;
      } finally {
        this.loading = false;
      }

    },
    getAnswerText(questionPrefix) {
      if (!this.submissionData) return '';
      const answer = this.submissionData.answers.find(q =>
          q.question.trim().startsWith(questionPrefix)
      );
      return answer && answer.answers?.[0]?.answer_text
          ? answer.answers[0].answer_text.trim()
          : '';
    },
  },
  created() {
    this.fetchSubmissionDetails();
  },
};
</script>

<style scoped>
.submission-detail {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 900px;
  margin: auto;
}

h2 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.badge {
  background-color: #f26822;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
}

.answer-card {
  background: #ffffff;
  border-left: 5px solid #f26822;
  padding: 1rem 1.2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.answer-card:hover {
  transform: translateY(-4px);
}

.question {
  font-weight: bold;
  color: #444;
  margin-bottom: 0.5rem;
}

.answer {
  color: #555;
  white-space: pre-wrap;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-msg {
  color: #c0392b;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 2rem;
}
</style>
