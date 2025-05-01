<template>
  <div class="user-answers">
    <h2>Your Submitted Answers</h2>

    <div v-if="loading" class="spinner-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="userAnswers?.length">
      <table class="submission-table">
        <thead>
        <tr>
          <th>Date & Time</th>
          <th>Store</th>
          <th>Customer Name</th>
          <th>Customer Number</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="submission in userAnswers" :key="submission.submission_id">
          <td>{{ formatDateTime(submission.submission_date) }}</td>
          <td>{{ getStoreName(submission) }} ({{ getStoreCode(submission) }})</td>
          <td>{{ getGuestName(submission) }}</td>
          <td>{{ getGuestContact(submission) }}</td>

          <td>
            <router-link
                :to="{
                  name: 'SubmissionDetails',
                  params: { id: submission.submission_id },
                  state: { submission }
                }"
                @click="saveSubmissionId(surveyId)"
            >
              <button>View Answers</button>
            </router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

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
        console.log(this.userId);
        console.log(this.surveyId);
        const res = await axios.post("https://survey.dd-ops.com/api/get_UserAnswers", {
          user_id: this.userId,
          survey_id: this.surveyId,
        });
        console.log(res.data);
        this.userAnswers = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching submission history:", error);
        this.userAnswers = [];
      } finally {
        this.loading = false;
      }
    },

    formatDateTime(dateStr) {
      const dateObj = new Date(dateStr);
      return isNaN(dateObj) ? 'Invalid Date' : dateObj.toLocaleString(undefined, {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    getStoreAnswer(sub) {
      return sub?.answers?.find(ans => ans.question.trim() === "Store Code and Store Name");
    },

    getStoreCode(sub) {
      const answer = this.getStoreAnswer(sub)?.answer_text;
      return answer ? answer.split(" - ")[0]?.trim() || 'N/A' : 'N/A';
    },

    getStoreName(sub) {
      const answer = this.getStoreAnswer(sub)?.answer_text;
      return answer ? answer.split(" - ")[1]?.trim() || 'N/A' : 'N/A';
    },

    getGuestName(sub) {
      return sub?.answers?.find(a => a.question.trim() === "Guest Name")?.answer_text?.trim() || "N/A";
    },

    getGuestContact(sub) {
      return sub?.answers?.find(a =>
          a.question.trim().toLowerCase().startsWith("guest contact")
      )?.answer_text?.trim() || "N/A";
    },

    saveSubmissionId(id) {
      localStorage.setItem('survey_id', id);
    }
  }
};
</script>

<style scoped>
.user-answers {
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
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

.submission-table {
  width: 100%;
  border-collapse: collapse;
}

.submission-table th,
.submission-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

.submission-table th {
  background-color: #f26822;
  color: white;
}

button {
  padding: 0.5rem 1rem;
  background-color: #f26822;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #d9581a;
}

.no-submissions {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .submission-table th,
  .submission-table td {
    font-size: 0.9rem;
  }
}
</style>
