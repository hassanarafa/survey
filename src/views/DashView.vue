<template>
  <div class="app-container">
    <h1 class="title">📊 Store Reports Filter</h1>

    <!-- Filter Section -->
    <form @submit.prevent="fetchData" class="filter-section">
      <h2 class="filter-title">Filter Criteria</h2>
      <div class="filters-grid">
        <div v-for="(label, key) in filterLabels" :key="key" class="filter-item">
          <label :for="key" class="filter-label">{{ label }}</label>

          <select
              v-if="key === 'zone_id'"
              v-model="filters.zone_id"
              :id="key"
              class="filter-input"
          >
            <option value="">Select Zone</option>
            <option v-for="zone in zones" :key="zone.id" :value="zone.id">{{ zone.id }}</option>
          </select>

          <select
              v-else-if="key === 'region_id'"
              v-model="filters.region_id"
              :id="key"
              class="filter-input"
          >
            <option value="">Select Region</option>
            <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.id }}</option>
          </select>

          <select
              v-else-if="key === 'storeId'"
              v-model="filters.storeId"
              :id="key"
              class="filter-input"
          >
            <option value="">Select Store</option>
            <option v-for="storeItem in store" :key="storeItem.id" :value="storeItem.id">{{ storeItem.id }}</option>
          </select>

          <select
              v-else-if="key === 'am'"
              v-model="filters.am"
              :id="key"
              class="filter-input"
          >
            <option value="">Select AM</option>
            <option v-for="user in am" :key="user.id" :value="user.id">{{ user.id }}</option>
          </select>

          <select
              v-else-if="key === 'tm'"
              v-model="filters.tm"
              :id="key"
              class="filter-input"
          >
            <option value="">Select TM</option>
            <option v-for="user in tm" :key="user.id" :value="user.id">{{ user.id }}</option>
          </select>

          <select
              v-else-if="key === 'rm'"
              v-model="filters.rm"
              :id="key"
              class="filter-input"
          >
            <option value="">Select RM</option>
            <option v-for="user in rm" :key="user.id" :value="user.id">{{ user.id }}</option>
          </select>

          <input
              v-else
              :type="['from', 'to'].includes(key) ? 'date' : 'text'"
              :id="key"
              v-model="filters[key]"
              class="filter-input"
              :placeholder="label"
          />
        </div>
      </div>

      <button type="submit" class="apply-btn">Apply Filters</button>
    </form>

    <!-- Results Section -->
    <section class="results-section">
      <h2 class="results-title">Net Performance Store</h2>

      <div v-if="loading" class="loading">Loading data...</div>

      <div v-else-if="stores.length" class="stores-grid">
        <article v-for="store in stores" :key="store.storeId" class="store-card">
          <header class="store-header">
            <h3 class="store-name">{{ store.store_name }}</h3>
            <span class="store-code">Code: {{ store.store_code }}</span>
          </header>
          <div class="store-details">
            <p><strong>Submissions:</strong> {{ store.submission_count }}</p>
            <p><strong>Recommendation Score:</strong> {{ store.recommendation_score }}</p>
          </div>
        </article>
      </div>

      <div v-else class="no-results">
        <p>No data available. Try adjusting your filters.</p>
      </div>
    </section>

    <!-- Top 5 Stores -->
    <section class="results-section" v-if="top5.length">
      <h2 class="results-title">Top 5 Stores (NPS)</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
          <tr>
            <th rowspan="2">Store Name</th>
            <th rowspan="2">Store Code</th>
            <th rowspan="2">Submission Count</th>
            <th rowspan="2">Created At</th>
            <th colspan="6">NPS Categories</th>
            <th rowspan="2">Recommendation Score</th>
          </tr>
          <tr>
            <th>Staff Behaviour</th>
            <th>Speed Of Service</th>
            <th>Cleanliness</th>
            <th>Order Accuracy</th>
            <th>Value For Money</th>
            <th>Product Quality</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="store in top5" :key="store.storeId">
            <td>{{ store.store_name }}</td>
            <td>{{ store.store_code }}</td>
            <td>{{ store.submission_count }}</td>
            <td>{{ formatDate(store.created_at) }}</td>
            <td>{{ store.nps_staff_behaviour }}</td>
            <td>{{ store.nps_speed_of_service }}</td>
            <td>{{ store.nps_cleanliness }}</td>
            <td>{{ store.nps_order_accuracy }}</td>
            <td>{{ store.nps_value_for_money }}</td>
            <td>{{ store.nps_product_quality }}</td>
            <td>{{ store.recommendation_score }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Bottom 5 Stores -->
    <section class="results-section" v-if="bottom5.length">
      <h2 class="results-title">Bottom 5 Stores (NPS)</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
          <tr>
            <th rowspan="2">Store Name</th>
            <th rowspan="2">Store Code</th>
            <th rowspan="2">Submission Count</th>
            <th rowspan="2">Created At</th>
            <th colspan="6">NPS Categories</th>
            <th rowspan="2">Recommendation Score</th>
          </tr>
          <tr>
            <th>Staff Behaviour</th>
            <th>Speed Of Service</th>
            <th>Cleanliness</th>
            <th>Order Accuracy</th>
            <th>Value For Money</th>
            <th>Product Quality</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="store in bottom5" :key="store.storeId">
            <td>{{ store.store_name }}</td>
            <td>{{ store.store_code }}</td>
            <td>{{ store.submission_count }}</td>
            <td>{{ formatDate(store.created_at) }}</td>
            <td>{{ store.nps_staff_behaviour }}</td>
            <td>{{ store.nps_speed_of_service }}</td>
            <td>{{ store.nps_cleanliness }}</td>
            <td>{{ store.nps_order_accuracy }}</td>
            <td>{{ store.nps_value_for_money }}</td>
            <td>{{ store.nps_product_quality }}</td>
            <td>{{ store.recommendation_score }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Add this wrapper div -->
    <div class="charts-row">
      <div class="card chart-card">
        <h3 class="section-title">Visit Frequency</h3>
        <Pie v-if="visitFreq" :data="visitFreq" :options="chartOptions" />
      </div>

      <div class="card chart-card">
        <h3 class="section-title">Gender Stats</h3>
        <Pie v-if="genderStats" :data="genderStats" :options="chartOptions" />
      </div>

      <div class="card chart-card">
        <h3 class="section-title">Age Stats</h3>
        <Pie v-if="ageStats" :data="ageStats" :options="chartOptions" />
      </div>
    </div>


    <!-- New Section: Top Non-Recommended Reasons -->
    <section class="results-section" v-if="recommendationReasons.length">
      <h2 class="results-title">Top Non-Recommended Reasons</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
          <tr>
            <th>Answer Text</th>
            <th>Created At</th>
            <th>Store ID</th>
            <th>Store Name</th>
            <th>Store Code</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="reason in recommendationReasons" :key="reason.created_at + reason.store_id">
            <td>{{ reason.answer_text }}</td>
            <td>{{ reason.created_at_formatted }}</td>
            <td>{{ reason.store_id }}</td>
            <td>{{ reason.store_name }}</td>
            <td>{{ reason.store_code }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: ''
    },
    datalabels: {
      color: '#fff',
      formatter: (value) => value,
      font: {
        weight: 'bold',
        size: 14
      }
    }
  }
}


const filters = ref({
  from: '',
  to: '',
  am: '',
  tm: '',
  rm: '',
  region_id: '',
  zone_id: '',
  storeId: ''
})

const filterLabels = {
  from: 'From Date',
  to: 'To Date',
  am: 'AM',
  tm: 'TM',
  rm: 'RM',
  region_id: 'Region',
  zone_id: 'Zone',
  storeId: 'Store'
}

const stores = ref([])
const top5 = ref([])
const bottom5 = ref([])
const recommendationReasons = ref([])
const ageStats = ref(null)

const visitFreq = ref(null)
const genderStats = ref(null)

const zones = ref([])
const regions = ref([])
const store = ref([])
const am = ref([])
const tm = ref([])
const rm = ref([])

const loading = ref(false)

const generateColors = (count) => {
  const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6', '#10B981']
  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}

const formatDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0]; // Split by 'T' and take the date part only
};

const fetchData = async () => {
  loading.value = true
  try {
    // Overall stores data
    const overallResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/Overall',
        { ...filters.value }
    )
    stores.value = overallResponse.data.stores || []

    // Top and bottom 5 stores NPS data
    const topStoresResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/top-stores-nps',
        { ...filters.value }
    )
    top5.value = topStoresResponse.data.top_5 || []
    bottom5.value = topStoresResponse.data.bottom_5 || []

    // Fetch top non-recommendation reasons
    const nonRecResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/top_non_rec',
        { ...filters.value }
    )
    recommendationReasons.value = nonRecResponse.data.recommendation_reasons || []

    const res = await axios.post('https://survey.dd-ops.com/api/reports/Gender_stats', { ...filters.value })
    const genderArray = res.data.gender_stats || res.data

    if (Array.isArray(genderArray)) {
      const genderCountMap = {}
      genderArray.forEach(item => {
        const gender = item.answer_text || 'Unknown'
        genderCountMap[gender] = (genderCountMap[gender] || 0) + 1
      })

      const labels = Object.keys(genderCountMap)
      const data = Object.values(genderCountMap)

      genderStats.value = {
        labels,
        datasets: [{
          label: 'Gender Distribution',
          data,
          backgroundColor: generateColors(labels.length)
        }]
      }
    }

    const res2 = await axios.post('https://survey.dd-ops.com/api/reports/Visit_freq', { ...filters.value })
    const visitArray = res2.data.visit_frequency_stats || res2.data

    if (Array.isArray(visitArray)) {
      console.log("*/*/*/")
      const visitCountMap = {}
      visitArray.forEach(item => {
        const freq = item.answer_text || 'Unknown'
        visitCountMap[freq] = (visitCountMap[freq] || 0) + 1
      })

      const labels = Object.keys(visitCountMap)
      const data = Object.values(visitCountMap)

      visitFreq.value = {
        labels,
        datasets: [{
          label: 'Visit Frequency',
          data,
          backgroundColor: generateColors(labels.length)
        }]
      }
    }

    const res3 = await axios.post('https://survey.dd-ops.com/api/reports/Age_stats', { ...filters.value })
    const ageArray = res3.data.customer_age_stats || res3.data

    if (Array.isArray(ageArray)) {
      const ageCountMap = {}
      ageArray.forEach(item => {
        const ageGroup = item.answer_text || 'Unknown'
        ageCountMap[ageGroup] = (ageCountMap[ageGroup] || 0) + 1
      })

      const labels = Object.keys(ageCountMap)
      const data = Object.values(ageCountMap)

      console.log(labels)
      console.log(data)

      ageStats.value = {
        labels,
        datasets: [{
          label: 'Age Distribution',
          data,
          backgroundColor: generateColors(labels.length)
        }]
      }
    }

  } catch (error) {
    console.error('Error fetching data:', error)
    stores.value = []
    top5.value = []
    bottom5.value = []
    recommendationReasons.value = []
    ageStats.value = []
  } finally {
    loading.value = false
  }
}


const fetchZones = async () => {
  try {
    const { data } = await axios.get('https://survey.dd-ops.com/api/filters/zones')
    zones.value = data
  } catch (error) {
    console.error('Error fetching zones:', error)
  }
}

const fetchRegions = async () => {
  try {
    const { data } = await axios.get('https://survey.dd-ops.com/api/filters/regions')
    regions.value = data
  } catch (error) {
    console.error('Error fetching regions:', error)
  }
}

const fetchStores = async () => {
  try {
    const { data } = await axios.get('https://survey.dd-ops.com/api/filters/stores')
    store.value = data
  } catch (error) {
    console.error('Error fetching stores:', error)
  }
}

const fetchAm = async () => {
  try {
    const { data } = await axios.get('https://survey.dd-ops.com/api/filters/users/am')
    am.value = data
  } catch (error) {
    console.error('Error fetching AMs:', error)
  }
}

const fetchTm = async () => {
  try {
    const { data } = await axios.get('https://survey.dd-ops.com/api/filters/users/tm')
    tm.value = data
  } catch (error) {
    console.error('Error fetching TMs:', error)
  }
}

const fetchRm = async () => {
  try {
    const { data } = await axios.get('https://survey.dd-ops.com/api/filters/users/rm')
    rm.value = data
  } catch (error) {
    console.error('Error fetching RMs:', error)
  }
}

onMounted(() => {
  fetchData()
  fetchZones()
  fetchRegions()
  fetchStores()
  fetchAm()
  fetchTm()
  fetchRm()
  formatDate()
})
</script>

<style scoped>
.charts-row {
  display: flex;
  justify-content: space-between; /* space between charts */
  gap: 20px; /* optional, to add space between the charts */
  flex-wrap: nowrap; /* prevent wrapping if you want them all on one line */
  margin-top: 20px; /* some vertical spacing */
}

/* Optional: make each chart card take equal width */
.charts-row .chart-card {
  flex: 1 1 0; /* grow and shrink equally */
  min-width: 0; /* prevent overflow */
}

/* Optional: you can limit max-width per chart */
.charts-row .chart-card {
  max-width: 33%; /* or some fixed pixel width like 300px */
}

.chart-card {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin: 2rem 0;
  max-width: 600px;
  width: 100%;
  transition: transform 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-5px);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
  text-align: center;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .chart-card {
    margin-left: auto;
    margin-right: auto;
  }
}

.app-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  color: #1f2937; /* cool gray 800 */
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #f26822; /* blue-600 */
  text-align: center;
}

.filter-section {
  background: white;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.15);
  margin-bottom: 2.5rem;
}

.filter-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: #f26822; /* blue-900 */
  border-bottom: 2px solid #f26822;
  padding-bottom: 0.25rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #374151; /* gray-700 */
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1.8px solid #d1d5db; /* gray-300 */
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.25s ease-in-out;
  color: #f26822; /* gray-900 */
  background-color: white;
}

/* Ensure options text color is visible */
.filter-input option {
  color: #f26822;
  background-color: white;
}

.filter-input:focus {
  border-color: #f26822;
  outline: none;
  box-shadow: 0 0 4px #f26822;
}

.apply-btn {
  margin-top: 1.8rem;
  background: #f26822;
  color: white;
  font-weight: 700;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  border-color: #f26822;
  cursor: pointer;
  font-size: 1.125rem;
  width: 100%;
  max-width: 300px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: background-color 0.3s ease;
}

.apply-btn:hover {
  background: #d9581a;
}

.results-section {
  margin-top: 15px;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.12);
}

.results-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #f26822;
  border-bottom: 2px solid #f26822;
  padding-bottom: 0.5rem;
}

.loading {
  font-style: italic;
  text-align: center;
  color: #6b7280;
  padding: 1rem 0;
}

.no-results {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem 0;
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.store-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 3px 8px rgba(45, 55, 72, 0.1);
  transition: transform 0.2s ease;
}

.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.25);
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3rem;
}

.store-name {
  font-weight: 700;
  font-size: 1.125rem;
  color: #111827;
}

.store-code {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  background: #d1d5db;
  padding: 2px 8px;
  border-radius: 6px;
}

.store-details p {
  margin: 0.3rem 0;
  font-weight: 600;
  color: #374151;
}

.responsive-table {
  overflow-x: auto;
}

/* Smaller table font size and padding */
.store-table {
  font-size: 12px;          /* Smaller font size */
  border-collapse: collapse;
  width: 100%;
  max-width: 1050px;         /* Limit max width */
  margin: 0 auto;           /* Center horizontally */
  color: #1f2937;           /* Dark text for readability */
}

/* Smaller padding in table cells */
.store-table th,
.store-table td {
  padding: 6px 8px;         /* Less padding */
  border: 1px solid #f26822; /* Use main color for border */
  text-align: center;
}

/* Table header background in main color */
.store-table thead th {
  background-color: #f26822; /* Main color background */
  color: white;              /* White text on colored background */
  font-weight: 600;
}

/* Optional: alternate row color for readability */
.store-table tbody tr:nth-child(even) {
  background-color: #f4e4de; /* very light blue for even rows */
}

/* Responsive wrapper adjustment */
.responsive-table {
  overflow-x: auto;
  max-width: 100%;
}

/* You can also reduce overall section padding/margin if needed */
.results-section {
  padding: 12px 16px;
}


</style>
