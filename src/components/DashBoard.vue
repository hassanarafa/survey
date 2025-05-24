<template>
  <div class="dashboard">
    <h1 class="title">Survey Dashboard</h1>

    <!-- Zone Insights Table -->
    <div class="table-section">
      <h3 class="table-title">Zone Insights</h3>
      <table class="survey-table">
        <thead>
        <tr>
          <th>Zone Name</th>
          <th>Submission Count</th>
          <th>Average Per Store</th>
          <th>Value For Money</th>
          <th>Overall Experience</th>
          <th>Recommendation Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="zone in zoneInsights" :key="zone.zone_name">
          <td>{{ zone.zone_name }}</td>
          <td>{{ zone.submission_count }}</td>
          <td>{{ zone.average_per_store }}</td>
          <td>{{ zone.value_for_money }}</td>
          <td>{{ zone.overall_experience }}</td>
          <td>{{ zone.recommendation_score }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart">
        <h3>Top Stores Report</h3>
        <Bar v-if="topStoresChartData" :data="topStoresChartData" :options="chartOptions" />
      </div>

      <div class="chart">
        <h3>Top 5 AM</h3>
        <Bar v-if="topAmsChartData" :data="topAmsChartData" :options="chartOptions" />
      </div>

      <div class="chart">
        <h3>Top 5 TM</h3>
        <Bar v-if="topTmsChartData" :data="topTmsChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from "@/services/axios.js";
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
)

const topStoresChartData = ref(null)
const topAmsChartData = ref(null)
const topTmsChartData = ref(null)
const zoneInsights = ref([])

const chartOptions = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Scores / Count'
      }
    }
  }
}

const fetchZoneInsights = async () => {
  try {
    const res = await api.get('reports/zone-insights')
    if (res.data.status) {
      zoneInsights.value = res.data.data
    }
  } catch (err) {
    console.error('Error fetching zone insights:', err)
  }
}

const fetchTopStores = async () => {
  try {
    const res = await api.get('reports/top-stores')
    const data = res.data

    const labels = data.map(item => item.store_name ?? 'Unknown Store')
    const submissionCounts = data.map(item => parseInt(item.submission_count ?? 0))
    const overallExperience = data.map(item => parseFloat(item.overall_experience ?? 0))
    const valueForMoney = data.map(item => parseFloat(item.value_for_money ?? 0))
    const recommendationScore = data.map(item => parseFloat(item.recommendation_score ?? 0))

    topStoresChartData.value = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Submission Count',
          backgroundColor: '#42a5f5',
          data: submissionCounts,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Overall Experience',
          borderColor: '#66bb6a',
          backgroundColor: '#66bb6a40',
          data: overallExperience,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Value For Money',
          borderColor: '#ffa726',
          backgroundColor: '#ffa72640',
          data: valueForMoney,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Recommendation Score',
          borderColor: '#ab47bc',
          backgroundColor: '#ab47bc40',
          data: recommendationScore,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        }
      ]
    }
  } catch (err) {
    console.error('Error fetching top stores:', err)
  }
}

const fetchTopAms = async () => {
  try {
    const res = await api.get('reports/top-areas')
    const data = res.data

    const labels = data.map(item => item.employee_id ?? 'Unknown')
    const submissionCounts = data.map(item => parseInt(item.submission_count ?? 0))
    const overallExperience = data.map(item => parseFloat(item.overall_experience ?? 0))
    const valueForMoney = data.map(item => parseFloat(item.value_for_money ?? 0))
    const recommendationScore = data.map(item => parseFloat(item.recommendation_score ?? 0))

    topAmsChartData.value = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Submission Count',
          backgroundColor: '#42a5f5',
          data: submissionCounts,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Overall Experience',
          borderColor: '#66bb6a',
          backgroundColor: '#66bb6a40',
          data: overallExperience,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Value For Money',
          borderColor: '#ffa726',
          backgroundColor: '#ffa72640',
          data: valueForMoney,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Recommendation Score',
          borderColor: '#ab47bc',
          backgroundColor: '#ab47bc40',
          data: recommendationScore,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        }
      ]
    }
  } catch (err) {
    console.error('Error fetching top AMs:', err)
  }
}

const fetchTopTms = async () => {
  try {
    const res = await api.get('reports/top-territories')
    const data = res.data

    const labels = data.map(item => item.employee_id ?? 'Unknown')
    const submissionCounts = data.map(item => parseInt(item.submission_count ?? 0))
    const overallExperience = data.map(item => parseFloat(item.overall_experience ?? 0))
    const valueForMoney = data.map(item => parseFloat(item.value_for_money ?? 0))
    const recommendationScore = data.map(item => parseFloat(item.recommendation_score ?? 0))

    topTmsChartData.value = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Submission Count',
          backgroundColor: '#42a5f5',
          data: submissionCounts,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Overall Experience',
          borderColor: '#66bb6a',
          backgroundColor: '#66bb6a40',
          data: overallExperience,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Value For Money',
          borderColor: '#ffa726',
          backgroundColor: '#ffa72640',
          data: valueForMoney,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Recommendation Score',
          borderColor: '#ab47bc',
          backgroundColor: '#ab47bc40',
          data: recommendationScore,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          yAxisID: 'y'
        }
      ]
    }
  } catch (err) {
    console.error('Error fetching top TMs:', err)
  }
}

onMounted(async () => {
  await fetchZoneInsights()
  await fetchTopStores()
  await fetchTopAms()
  await fetchTopTms()
})
</script>

<style scoped>
.dashboard {
  padding: 1rem;
  font-family: 'Segoe UI', sans-serif;
  background: #f8f9fa;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  color: #f26822;
  margin-bottom: 1.5rem;
}

h3 {
  text-align: center;
  color: #f26822;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.table-section {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.survey-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 600px;
}

.survey-table th,
.survey-table td {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  text-align: center;
  font-size: 0.9rem;
}

.survey-table th {
  background-color: #f26822;
  color: white;
  font-weight: 500;
}

.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.chart {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 500px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
  }

  .survey-table {
    font-size: 0.85rem;
  }

  .survey-table th,
  .survey-table td {
    padding: 0.5rem;
  }

  .chart {
    max-width: 100%;
  }
}
</style>
