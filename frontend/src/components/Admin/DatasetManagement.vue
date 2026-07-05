<template>
  <div class="dataset-management-container">
    <!-- Page Header -->
    <header class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dataset Management</h1>
        <p class="text-gray-500">Manage and explore all 18,784 records</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="fetchData(currentPage)">
          <span class="icon">↻</span> Refresh
        </button>
        <button class="btn btn-primary">
          <span class="icon">+</span> Upload Dataset
        </button>
      </div>
    </header>

    <!-- Dataset Summary Cards -->
    <section class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">📚</div>
        <div class="card-content">
          <h3>18,784</h3>
          <p>Total Records</p>
          <span class="subtext">Across all datasets</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">🗂️</div>
        <div class="card-content">
          <h3>2</h3>
          <p>Active Datasets</p>
          <span class="subtext">SciQ + ScienceQA</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">🕒</div>
        <div class="card-content">
          <h3>Dec 1</h3>
          <p>Last Updated</p>
          <span class="subtext">System sync</span>
        </div>
      </div>
    </section>

    <!-- Dataset Table Section -->
    <section class="table-section">
      <div class="section-header">
        <h2 class="section-title">DATASET RECORDS</h2>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-16">#</th>
              <th>ID</th>
              <th>User Email</th>
              <th>Role</th>
              <th>Subject</th>
              <th>Question Preview</th>
              <th>Date</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-8 text-gray-500">
                <div class="spinner inline-block"></div>
                <p class="mt-2">Loading dataset records...</p>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="8" class="text-center py-8 text-red-500">
                {{ error }}
              </td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td colspan="8" class="text-center py-8 text-gray-500">
                No records found.
              </td>
            </tr>
            <tr v-for="(record, index) in records" :key="record.id || index" v-else>
              <td>{{ (currentPage - 1) * limit + index + 1 }}</td>
              <td class="font-mono text-xs text-gray-500 truncate-id">{{ record.id }}</td>
              <td>{{ record.userEmail }}</td>
              <td>
                <span class="role-badge" :class="record.userRole?.toLowerCase()">
                  {{ record.userRole }}
                </span>
              </td>
              <td>
                <span class="subject-badge">
                  {{ record.subject }}
                </span>
              </td>
              <td class="truncate-preview" :title="record.inputPreview || record.input">
                {{ record.inputPreview || record.input }}
              </td>
              <td class="text-sm text-gray-500">{{ formatDate(record.createdAt) }}</td>
              <td class="text-right actions-cell">
                <button class="btn-action" @click="viewRecord(record)">View</button>
                <button class="btn-action text-red-600" @click="deleteRecord(record.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination-footer">
        <div class="pagination-info">
          Showing {{ pageStartIndex }}–{{ pageEndIndex }} of {{ formatNumber(totalRecords) }} records
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-page" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            &larr; Prev
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in paginationWindow" 
              :key="page"
              class="btn-page-number"
              :class="{ 'active': page === currentPage, 'dots': page === '...' }"
              :disabled="page === '...'"
              @click="page !== '...' && changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button 
            class="btn-page" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </section>

    <!-- Expanded Record Detail -->
    <div v-if="selectedRecord" class="detail-panel">
      <div class="panel-overlay" @click="selectedRecord = null"></div>
      <div class="panel-content shadow-lg">
        <div class="panel-header-inner flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Record Details</h3>
          <button class="text-gray-500 hover:text-gray-800" @click="selectedRecord = null">✕</button>
        </div>
        <div class="record-detail-grid">
          <div class="detail-row">
            <span class="detail-label">Record ID</span>
            <span class="detail-value font-mono">{{ selectedRecord.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Subject</span>
            <span class="detail-value">{{ selectedRecord.subject }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">User Email</span>
            <span class="detail-value">{{ selectedRecord.userEmail }}</span>
          </div>
          <div class="detail-row mt-4 flex-col items-start">
            <span class="detail-label mb-2">Question Input</span>
            <div class="code-block w-full">{{ selectedRecord.input || selectedRecord.inputPreview }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const records = ref([])
const totalRecords = ref(18784)
const currentPage = ref(1)
const limit = ref(20)
const loading = ref(false)
const error = ref(null)
const selectedRecord = ref(null)

const totalPages = computed(() => Math.ceil(totalRecords.value / limit.value))
const pageStartIndex = computed(() => (currentPage.value - 1) * limit.value + 1)
const pageEndIndex = computed(() => Math.min(currentPage.value * limit.value, totalRecords.value))

const paginationWindow = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const maxVisible = 7

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const fetchData = async (page) => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('admin_token') || ''
    const response = await fetch(`/api/admin/questions?page=${page}&limit=${limit.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      records.value = data.data || data.rows || []
      if (data.totalRecords) {
        totalRecords.value = data.totalRecords
      }
      currentPage.value = page
    } else {
      records.value = generateMockData(limit.value)
      currentPage.value = page
    }
  } catch (err) {
    console.error('Fetch error:', err)
    records.value = generateMockData(limit.value)
    currentPage.value = page
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    fetchData(page)
  }
}

const viewRecord = (record) => {
  selectedRecord.value = record
}

const deleteRecord = async (id) => {
  if (confirm(`Are you sure you want to delete record ${id}?`)) {
    alert('Delete simulated')
  }
}

const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num)

const formatDate = (isoStr) => {
  if (!isoStr) return 'N/A'
  const date = new Date(isoStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}

const generateMockData = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `req-${Math.random().toString(36).substr(2, 8)}`,
    userEmail: `user${i}@example.com`,
    userRole: i % 5 === 0 ? 'tutor' : 'student',
    subject: ['physics', 'chemistry', 'biology', 'mathematics'][i % 4],
    inputPreview: 'Sample generated question for the scitutor model to process...',
    createdAt: new Date(Date.now() - Math.random() * 100000000).toISOString()
  }))
}

onMounted(() => {
  fetchData(currentPage.value)
})
</script>

<style scoped>
.dataset-management-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f1f5f9;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn-primary {
  background-color: #1e293b;
  color: white;
  border: none;
}

.btn-outline {
  background-color: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card-icon {
  width: 3rem;
  height: 3rem;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.card-content p {
  font-size: 0.875rem;
  color: #475569;
  margin: 0.25rem 0;
  font-weight: 500;
}

.card-content .subtext {
  font-size: 0.75rem;
  color: #94a3b8;
}

.table-section {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}

.data-table th {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.data-table td {
  font-size: 0.875rem;
  color: #334155;
}

.truncate-id {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.truncate-preview {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge, .subject-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.tutor { background-color: #e0e7ff; color: #4338ca; }
.role-badge.student { background-color: #f1f5f9; color: #475569; }

.subject-badge { background-color: #f3f4f6; color: #374151; }

.btn-action {
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.btn-action:hover {
  text-decoration: underline;
}

.pagination-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page-number {
  background: white;
  border: 1px solid #cbd5e1;
  min-width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-page-number.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-page-number.dots {
  border: none;
  background: none;
  cursor: default;
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #cbd5e1;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

/* Detail Panel Styles */
.detail-panel {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.panel-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.5);
}

.panel-content {
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.record-detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.detail-value {
  font-size: 0.875rem;
  color: #0f172a;
}

.code-block {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
}

.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.flex-col { flex-direction: column; }
.items-start { align-items: flex-start; }
.w-full { width: 100%; }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
</style>
