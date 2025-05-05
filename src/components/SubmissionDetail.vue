<template>
  <div class="submission-detail">
    <h2>📝 Submission Details</h2>

    <div v-if="loading" class="spinner-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="submission">
      <div class="meta-info">
        <div class="badge">
          <strong>Store:</strong> {{ getStoreName(submission) }} ({{ getStoreCode(submission) }})
        </div>
        <div class="badge">
          <strong>Guest:</strong> {{ getGuestName(submission) }} - {{ getGuestContact(submission) }}
        </div>
      </div>

      <div class="answers-grid">
        <div
            v-for="(answerGroup, index) in submission.answers"
            :key="index"
            class="answer-card"
        >
          <div class="question">{{ answerGroup.question }}</div>
          <div class="answer">
            <div
                v-for="(a, i) in answerGroup.answers"
                :key="i"
            >
              <span v-if="a.answer_text">{{ a.answer_text }}</span>
              <span v-else-if="a.store_name">
                {{ a.store_name }} ({{ a.store_code }})
              </span>
              <span v-else>No Answer</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="error-msg">⚠️ No submission data available.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      submission: null,
      loading: true,
    };
  },
  created() {
    this.loadSubmission();
  },
  methods: {
    loadSubmission() {
      try {
        const storedData = localStorage.getItem("submission_data");
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed.submission_id == this.$route.params.id) {
            this.submission = parsed;
          }
        }
      } catch (e) {
        console.error("Error loading submission from storage:", e);
      } finally {
        this.loading = false;
      }
    },

    getStoreAnswer(sub) {
      return sub?.answers?.find(
          (ans) => ans.question.trim() === "Store Code and Store Name"
      );
    },
    getStoreCode(sub) {
      const answer = this.getStoreAnswer(sub)?.answers[0]?.store_code;
      return answer ? answer.split(" - ")[0]?.trim() || "N/A" : "N/A";
    },
    getStoreName(sub) {
      const answer = this.getStoreAnswer(sub)?.answers[0]?.store_name;
      return answer ? answer.split(" - ")[1]?.trim() || "N/A" : "N/A";
    },
    getGuestName(sub) {
      return (
          sub?.answers?.find((a) => a.question.trim() === "Guest Name")?.answers[0]
              ?.answer_text?.trim() || "N/A"
      );
    },
    getGuestContact(sub) {
      return (
          sub?.answers?.find((a) =>
              a.question.trim().toLowerCase().startsWith("guest contact")
          )?.answers[0]?.answer_text?.trim() || "N/A"
      );
    },
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
