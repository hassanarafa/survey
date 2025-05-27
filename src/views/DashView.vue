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
      <table class="store-table">
        <thead>
        <tr>
          <th>Store Name</th>
          <th>Store Code</th>
          <th>Recommendation Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="store in top5" :key="store.storeId">
          <td>{{ store.store_name }}</td>
          <td>{{ store.store_code }}</td>
          <td>{{ store.recommendation_score }}</td>
        </tr>
        </tbody>
      </table>
    </section>

    <!-- Bottom 5 Stores -->
    <section class="results-section" v-if="bottom5.length">
      <h2 class="results-title">Bottom 5 Stores (NPS)</h2>
      <table class="store-table">
        <thead>
        <tr>
          <th>Store Name</th>
          <th>Store Code</th>
          <th>Recommendation Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="store in bottom5" :key="store.storeId">
          <td>{{ store.store_name }}</td>
          <td>{{ store.store_code }}</td>
          <td>{{ store.recommendation_score }}</td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

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
    const overallResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/Overall',
        { ...filters.value }
    )
    stores.value = overallResponse.data.stores || []

    const topStoresResponse = await axios.post(
        'https://survey.dd-ops.com/api/reports/top-stores-nps',
        { ...filters.value }
    )
    top5.value = topStoresResponse.data.top_5 || []
    bottom5.value = topStoresResponse.data.bottom_5 || []
  } catch (error) {
    console.error('Error fetching data:', error)
    stores.value = []
    top5.value = []
    bottom5.value = []
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

.store-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.store-table th, .store-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
</style>
