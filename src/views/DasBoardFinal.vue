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

    <!-- Top 5 Stores -->
    <section class="results-section" v-if="top5.length">
      <h2 class="results-title">Top 5 Stores (NPS)</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
          <tr>
            <th>Manager Name</th>
            <th>Employee Id</th>
            <th>Store Count</th>
            <th>Feedback Count</th>
            <th>Avg Feedback Per Store</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="store in top5" :key="store.storeId">
            <td>{{ store.manager_name }}</td>
            <td>{{ store.employee_id }}</td>
            <td>{{ store.store_count }}</td>
            <td>{{ store.feedback_count }}</td>
            <td>{{ store.avg_feedback_per_store }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Bottom 5 Stores -->
    <section class="results-section" v-if="topTm.length">
      <h2 class="results-title">Bottom 5 Stores (NPS)</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
          <tr>
            <th>Manager Name</th>
            <th>Employee Id</th>
            <th>Store Count</th>
            <th>Feedback Count</th>
            <th>Avg Feedback Per Store</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="store in topTm" :key="store.storeId">
            <td>{{ store.manager_name }}</td>
            <td>{{ store.employee_id }}</td>
            <td>{{ store.store_count }}</td>
            <td>{{ store.feedback_count }}</td>
            <td>{{ store.avg_feedback_per_store }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>


    <!-- New Section: Top Non-Recommended Reasons -->
    <section class="results-section" v-if="recommendationReasons.length">
      <h2 class="results-title">Top Non-Recommended Reasons</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
          <tr>
            <th>Store Name</th>
            <th>Store Code</th>
            <th>Feedback Count</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="reason in recommendationReasons" :key="reason.store_id">
            <td>{{ reason.store_name }}</td>
            <td>{{ reason.store_code }}</td>
            <td>{{ reason.feedback_count }}</td>
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
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)


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

const top5 = ref([])
const topTm = ref([])
const recommendationReasons = ref([])

const zones = ref([])
const regions = ref([])
const store = ref([])
const am = ref([])
const tm = ref([])
const rm = ref([])

const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {

    // Top and bottom 5 stores NPS data
    const topStoresResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/am',
        { ...filters.value }
    )
    top5.value = topStoresResponse.data.mul_feedback_stats || []
    console.log("///////////////////////////////")
    console.log(top5.value)
    console.log("///////////////////////////////")
    // Fetch top non-recommendation reasons
    const nonRecResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/tm',
        { ...filters.value }
    )
    topTm.value = nonRecResponse.data.tm_feedback_stats || []

    const nonRcResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/stores',
        { ...filters.value }
    )
    recommendationReasons.value = [
      ...(nonRcResponse.data.top_10_stores || []),
      ...(nonRcResponse.data.bottom_10_stores || [])
    ]
  } catch (error) {
    console.error('Error fetching data:', error)
    top5.value = []
    topTm.value = []
    recommendationReasons.value = []
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
})
</script>

<style scoped>
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
  background: white;
  padding: 1.5rem 2rem;
  margin-top: 15px;
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
