<template>
  <div class="dashboard">
    <h1 class="title">Survey Dashboard</h1>

    <div class="card table-section">
      <h3 class="section-title">Zone Insights</h3>
      <div class="table-wrapper">
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
    </div>

    <!-- Charts -->
    <div class="chart-cards">
      <div class="card chart-card">
        <h3 class="section-title">Top Stores Report</h3>
        <Bar v-if="topStoresChartData" :data="topStoresChartData" :options="chartOptions" />
      </div>
      <div class="card chart-card">
        <h3 class="section-title">Top 5 AM</h3>
        <Bar v-if="topAmsChartData" :data="topAmsChartData" :options="chartOptions" />
      </div>
      <div class="card chart-card">
        <h3 class="section-title">Top 5 TM</h3>
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
  LinearScale,
  LineController,
  BarController
} from 'chart.js'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LineController,
    BarController
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

const createChartData = (data, labelKey) => {
  const labels = data.map(item => item[labelKey] ?? 'Unknown')
  const submissionCounts = data.map(item => parseInt(item.submission_count ?? 0))
  const overallExperience = data.map(item => parseFloat(item.overall_experience ?? 0))
  const valueForMoney = data.map(item => parseFloat(item.value_for_money ?? 0))
  const recommendationScore = data.map(item => parseFloat(item.recommendation_score ?? 0))

  return {
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
}

const fetchTopStores = async () => {
  try {
    const res = await api.get('reports/top-stores')
    topStoresChartData.value = createChartData(res.data, 'store_name')
  } catch (err) {
    console.error('Error fetching top stores:', err)
  }
}

const fetchTopAms = async () => {
  try {
    const res = await api.get('reports/top-areas')
    topAmsChartData.value = createChartData(res.data, 'employee_id')
  } catch (err) {
    console.error('Error fetching top AMs:', err)
  }
}

const fetchTopTms = async () => {
  try {
    const res = await api.get('reports/top-territories')
    topTmsChartData.value = createChartData(res.data, 'employee_id')
  } catch (err) {
    console.error('Error fetching top TMs:', err)
  }
}

onMounted(() => {
  fetchZoneInsights()
  fetchTopStores()
  fetchTopAms()
  fetchTopTms()
})
</script>

<style scoped>

.dashboard {
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: #f26822;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f26822;
  text-align: center;
  margin-bottom: 1rem;
}

.card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.survey-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  border-radius: 8px;
  overflow: hidden;
}

.survey-table th,
.survey-table td {
  padding: 1rem;
  border: 1px solid #dee2e6;
  text-align: center;
  font-size: 0.95rem;
}

.survey-table th {
  background-color: #f26822;
  color: white;
  font-weight: 600;
}

.survey-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.survey-table tbody tr:hover {
  background-color: #fff3e6;
}

.chart-cards {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.chart-card {
  flex-shrink: 0;
  width: 100%;
  max-width: 480px;
  min-width: 300px;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .survey-table {
    font-size: 0.85rem;
  }

  .chart-card {
    max-width: 100%;
  }
}

</style>
