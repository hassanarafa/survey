<template>
  <div class="app-container">
    <h1 class="title">📊 Store Reports Filter</h1>

    <form @submit.prevent="fetchData" class="filter-section">
      <h2 class="filter-title">Filter Criteria</h2>
      <div class="filters-grid">
        <div v-for="(label, key) in filterLabels" :key="key" class="filter-item">
          <label :for="key" class="filter-label">{{ label }}</label>

          <select v-if="key === 'zone_id'" v-model="filters.zone_id" :id="key" class="filter-input">
            <option value="">Select Zone</option>
            <option v-for="zone in zones" :key="zone.id" :value="zone.id">{{ zone.id }}</option>
          </select>

          <select v-else-if="key === 'region_id'" v-model="filters.region_id" :id="key" class="filter-input">
            <option value="">Select Region</option>
            <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.id }}</option>
          </select>

          <select v-else-if="key === 'storeId'" v-model="filters.storeId" :id="key" class="filter-input">
            <option value="">Select Store</option>
            <option v-for="storeItem in store" :key="storeItem.id" :value="storeItem.id">{{ storeItem.id }}</option>
          </select>

          <select v-else-if="key === 'am'" v-model="filters.am" :id="key" class="filter-input">
            <option value="">Select AM</option>
            <option v-for="user in am" :key="user.id" :value="user.id">{{ user.id }}</option>
          </select>

          <select v-else-if="key === 'tm'" v-model="filters.tm" :id="key" class="filter-input">
            <option value="">Select TM</option>
            <option v-for="user in tm" :key="user.id" :value="user.id">{{ user.id }}</option>
          </select>

          <select v-else-if="key === 'rm'" v-model="filters.rm" :id="key" class="filter-input">
            <option value="">Select RM</option>
            <option v-for="user in rm" :key="user.id" :value="user.id">{{ user.id }}</option>
          </select>

          <input v-else :type="['from', 'to'].includes(key) ? 'date' : 'text'" :id="key" v-model="filters[key]"
            class="filter-input" :placeholder="label" />
        </div>
      </div>

      <button type="submit" class="apply-btn">Apply Filters</button>
    </form>

    <section class="results-section" v-if="top5.length">
      <h2 class="results-title">List Of Am</h2>
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

    <section class="results-section" v-if="topTm.length">
      <h2 class="results-title">List Of Tm</h2>
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


    <section class="results-section" v-if="recommendationReasons.length">
      <h2 class="results-title">Top Non-Recommended Reasons</h2>
      <div class="responsive-table">
        <table class="store-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Store Code</th>
              <th>Feedback Count</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reason in recommendationReasons" :key="reason.store_id">
              <td>{{ reason.store_name }}</td>
              <td>{{ reason.store_code }}</td>
              <td>{{ reason.feedback_count }}</td>
              <td>
                <span :class="{
                  'badge-top': reason.type === 'Top',
                  'badge-bottom': reason.type === 'Bottom'
                }">
                  {{ reason.type }}
                </span>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

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

    const topStoresResponse = await axios.post(
      'https://survey.dd-ops.com/api/reports/am',
      { ...filters.value }
    )
    top5.value = topStoresResponse.data.mul_feedback_stats || []
    console.log(top5.value)
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
      ...nonRcResponse.data.top_10_stores.map(item => ({
        ...item,
        type: 'Top'
      })),
      ...nonRcResponse.data.bottom_10_stores.map(item => ({
        ...item,
        type: 'Bottom'
      }))
    ];
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
  color: #1f2937;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #f26822;
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
  color: #f26822;
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
  color: #374151;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1.8px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.25s ease-in-out;
  color: #f26822;
  background-color: white;
}

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

.store-table {
  font-size: 12px;
  border-collapse: collapse;
  width: 100%;
  max-width: 1050px;
  margin: 0 auto;
  color: #1f2937;
}

.store-table th,
.store-table td {
  padding: 6px 8px;
  border: 1px solid #f26822;
  text-align: center;
}

.store-table thead th {
  background-color: #f26822;
  color: white;
  font-weight: 600;
}

.store-table tbody tr:nth-child(even) {
  background-color: #f4e4de;
}

.responsive-table {
  overflow-x: auto;
  max-width: 100%;
}

.results-section {
  padding: 12px 16px;
}

.badge-top {
  background-color: #e0f7e9;
  color: #1a7f37;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge-bottom {
  background-color: #fdecea;
  color: #b91c1c;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
}

</style>
