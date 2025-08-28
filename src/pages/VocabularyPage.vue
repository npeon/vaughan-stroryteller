<template>
  <q-page class="prime-vocabulary-page">
    <div class="prime-container q-pa-lg">
      <!-- Page Header -->
      <div class="prime-page-header q-mb-xl">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="translate" />
          </div>
          <div>
            <h1 class="page-title">Vocabulary</h1>
            <p class="page-subtitle">
              Your personal English vocabulary collection
            </p>
          </div>
        </div>
        <q-btn
          class="prime-btn prime-btn--primary"
          icon="add"
          label="Add Word"
          unelevated
          size="lg"
          @click="showAddDialog = true"
        />
      </div>

      <!-- Statistics Cards -->
      <div class="prime-grid prime-grid--4 q-mb-xl">
        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="library_books" />
          </div>
          <div class="stats-number">{{ stats.total }}</div>
          <div class="stats-label">Total Words</div>
          <div class="stats-caption">In your collection</div>
        </div>

        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="verified" />
          </div>
          <div class="stats-number">{{ stats.mastered }}</div>
          <div class="stats-label">Mastered</div>
          <div class="stats-caption">Well learned</div>
        </div>

        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="school" />
          </div>
          <div class="stats-number">{{ stats.learning }}</div>
          <div class="stats-label">Learning</div>
          <div class="stats-caption">In progress</div>
        </div>

        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="schedule" />
          </div>
          <div class="stats-number">{{ stats.due }}</div>
          <div class="stats-label">Due Review</div>
          <div class="stats-caption">Ready to practice</div>
        </div>
      </div>

      <!-- Practice Actions -->
      <div class="q-mb-xl">
        <h2 class="section-title q-mb-lg">Practice</h2>
        <div class="prime-action-grid">
          <div 
            class="prime-action-card"
            :class="{ 'disabled': stats.due === 0 }"
            @click="stats.due > 0 && startReview()"
          >
            <div class="action-icon action-icon--primary">
              <q-icon name="quiz" />
            </div>
            <div class="action-title">Review Due Words</div>
            <div class="action-description">
              Practice words that are ready for review using spaced repetition
            </div>
          </div>

          <div 
            class="prime-action-card"
            :class="{ 'disabled': stats.total === 0 }"
            @click="stats.total > 0 && startRandomPractice()"
          >
            <div class="action-icon action-icon--secondary">
              <q-icon name="shuffle" />
            </div>
            <div class="action-title">Random Practice</div>
            <div class="action-description">
              Test yourself with a random selection from your vocabulary
            </div>
          </div>

          <div 
            class="prime-action-card"
            :class="{ 'disabled': stats.total === 0 }"
            @click="stats.total > 0 && practiceDifficult()"
          >
            <div class="action-icon action-icon--accent">
              <q-icon name="trending_up" />
            </div>
            <div class="action-title">Difficult Words</div>
            <div class="action-description">
              Focus on words you find most challenging to master
            </div>
          </div>
        </div>
      </div>

      <!-- Vocabulary List -->
      <div class="q-mb-xl">
        <div class="vocab-list-header q-mb-lg">
          <h2 class="section-title">Your Vocabulary</h2>
          <q-input
            v-model="searchQuery"
            placeholder="Search words..."
            outlined
            dense
            clearable
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div v-if="filteredWords.length === 0 && searchQuery === ''" class="prime-empty-state">
          <div class="empty-icon">
            <q-icon name="library_books" />
          </div>
          <div class="empty-title">No vocabulary yet</div>
          <div class="empty-description">
            Start building your English vocabulary by adding words you encounter in stories, 
            conversations, or daily life. Each word will help expand your language skills.
          </div>
          <q-btn
            class="prime-btn prime-btn--primary q-mt-lg"
            icon="add"
            label="Add Your First Word"
            unelevated
            @click="showAddDialog = true"
          />
        </div>

        <div v-else-if="filteredWords.length === 0" class="prime-empty-state">
          <div class="empty-icon">
            <q-icon name="search_off" />
          </div>
          <div class="empty-title">No words found</div>
          <div class="empty-description">
            No words match your search "{{ searchQuery }}". Try a different search term.
          </div>
        </div>

        <div v-else class="prime-card">
          <div class="vocab-list">
            <div
              v-for="word in paginatedWords"
              :key="word.id"
              class="vocab-word-item"
            >
              <div class="word-mastery">
                <div 
                  class="mastery-badge"
                  :class="`mastery-${getMasteryLevel(word.mastery_level)}`"
                >
                  {{ word.mastery_level }}
                </div>
              </div>

              <div class="word-content">
                <div class="word-header">
                  <h4 class="word-title">{{ word.word }}</h4>
                  <div 
                    class="difficulty-badge"
                    :class="`difficulty-${word.difficulty_level}`"
                  >
                    {{ word.difficulty_level }}
                  </div>
                </div>
                
                <p class="word-definition">
                  {{ word.definition || 'No definition available' }}
                </p>
                
                <div class="word-meta">
                  <span class="word-date">Added {{ formatDate(word.created_at) }}</span>
                </div>
              </div>

              <div class="word-actions">
                <q-btn
                  flat
                  round
                  icon="volume_up"
                  size="sm"
                  class="action-btn"
                  @click="playPronunciation(word)"
                  :loading="playingAudio === word.id"
                />
                <q-btn
                  flat
                  round
                  icon="edit"
                  size="sm"
                  class="action-btn"
                  @click="editWord(word)"
                />
                <q-btn
                  flat
                  round
                  icon="delete"
                  size="sm"
                  class="action-btn action-btn--danger"
                  @click="deleteWord(word)"
                />
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-container" v-if="totalPages > 1">
            <q-pagination
              v-model="currentPage"
              :max="totalPages"
              :max-pages="5"
              boundary-numbers
              direction-links
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add Word Dialog -->
    <q-dialog v-model="showAddDialog" class="prime-dialog">
      <div class="prime-card prime-dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon">
            <q-icon name="add" />
          </div>
          <div>
            <h3 class="dialog-title">Add New Word</h3>
            <p class="dialog-subtitle">
              Expand your vocabulary collection
            </p>
          </div>
        </div>

        <div class="dialog-content">
          <div class="form-group">
            <label class="form-label">Word *</label>
            <q-input
              v-model="addForm.word"
              outlined
              placeholder="Enter the word"
              class="prime-input"
              @blur="lookupWord"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Definition</label>
            <q-input
              v-model="addForm.definition"
              outlined
              type="textarea"
              rows="3"
              placeholder="What does this word mean?"
              class="prime-textarea"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Example Sentence</label>
            <q-input
              v-model="addForm.example_sentence"
              outlined
              type="textarea"
              rows="2"
              placeholder="Use the word in a sentence"
              class="prime-textarea"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Difficulty Level</label>
            <q-select
              v-model="addForm.difficulty_level"
              :options="difficultyOptions"
              outlined
              emit-value
              map-options
              class="prime-select"
            />
          </div>
        </div>

        <div class="dialog-actions">
          <q-btn 
            flat
            label="Cancel"
            class="prime-btn prime-btn--secondary"
            @click="showAddDialog = false"
          />
          <q-btn 
            label="Add Word"
            class="prime-btn prime-btn--primary"
            :loading="addingWord"
            @click="addWord"
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAuthGuard } from '../composables/useAuthGuard'

// Types
interface VocabularyWord {
  id: string
  word: string
  definition: string
  example_sentence?: string
  difficulty_level: string
  mastery_level: number
  created_at: string
  next_review?: string
}

const { profile } = useAuth()
const { requireAuth } = useAuthGuard()

// Requiere autenticación
requireAuth()

// State
const words = ref<VocabularyWord[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showAddDialog = ref(false)
const addingWord = ref(false)
const playingAudio = ref<string | null>(null)

const addForm = ref({
  word: '',
  definition: '',
  example_sentence: '',
  difficulty_level: 'intermediate'
})

const stats = ref({
  total: 0,
  mastered: 0,
  learning: 0,
  due: 0
})

// Options
const difficultyOptions = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

// Computed
const filteredWords = computed(() => {
  if (!searchQuery.value) return words.value
  return words.value.filter(word => 
    word.word.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    word.definition?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredWords.value.length / itemsPerPage)
})

const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredWords.value.slice(start, end)
})

// Methods
const getMasteryLevel = (level: number) => {
  if (level >= 5) return 'high'
  if (level >= 3) return 'medium'
  return 'low'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const lookupWord = () => {
  if (!addForm.value.word) return
  
  try {
    // TODO: Implement WordsAPI lookup
    console.log('Looking up word:', addForm.value.word)
  } catch (error) {
    console.error('Error looking up word:', error)
  }
}

const addWord = () => {
  addingWord.value = true
  try {
    // TODO: Add word to Supabase
    console.log('Adding word:', addForm.value)
    
    // Reset form
    addForm.value = {
      word: '',
      definition: '',
      example_sentence: '',
      difficulty_level: 'intermediate'
    }
    
    showAddDialog.value = false
    loadVocabulary()
  } catch (error) {
    console.error('Error adding word:', error)
  } finally {
    addingWord.value = false
  }
}

const editWord = (word: VocabularyWord) => {
  // TODO: Implement word editing
  console.log('Editing word:', word.word)
}

const deleteWord = (word: VocabularyWord) => {
  // TODO: Implement word deletion with confirmation
  console.log('Deleting word:', word.word)
}

const playPronunciation = async (word: VocabularyWord) => {
  playingAudio.value = word.id
  try {
    // TODO: Implement text-to-speech or audio pronunciation
    console.log('Playing pronunciation for:', word.word)
    
    // Simulate audio loading
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error playing pronunciation:', error)
  } finally {
    playingAudio.value = null
  }
}

const startReview = () => {
  // TODO: Navigate to spaced repetition review
  console.log('Starting vocabulary review')
}

const startRandomPractice = () => {
  // TODO: Start random practice session
  console.log('Starting random practice')
}

const practiceDifficult = () => {
  // TODO: Practice difficult words
  console.log('Practicing difficult words')
}

const loadVocabulary = () => {
  try {
    // TODO: Load vocabulary from Supabase
    console.log('Loading vocabulary for user:', profile.value?.id)
    
    // Mock data with proper types
    // Mock data with expanded vocabulary
    words.value = [
      {
        id: '1',
        word: 'adventure',
        definition: 'An exciting or unusual experience',
        difficulty_level: 'intermediate',
        mastery_level: 4,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        word: 'mysterious',
        definition: 'Difficult to understand or explain',
        difficulty_level: 'advanced',
        mastery_level: 2,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        word: 'curious',
        definition: 'Eager to know or learn something',
        difficulty_level: 'beginner',
        mastery_level: 5,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        word: 'magnificent',
        definition: 'Extremely beautiful, elaborate, or impressive',
        difficulty_level: 'advanced',
        mastery_level: 1,
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        word: 'perseverance',
        definition: 'Persistence in doing something despite difficulty',
        difficulty_level: 'advanced',
        mastery_level: 3,
        created_at: new Date().toISOString()
      }
    ]
    
    stats.value = {
      total: words.value.length,
      mastered: words.value.filter(w => w.mastery_level >= 5).length,
      learning: words.value.filter(w => w.mastery_level >= 2 && w.mastery_level < 5).length,
      due: words.value.filter(w => w.mastery_level < 3).length
    }
  } catch (error) {
    console.error('Error loading vocabulary:', error)
  }
}

onMounted(() => {
  void loadVocabulary()
})
</script>

<style lang="scss" scoped>
// ===== PRIME VOCABULARY PAGE STYLES =====
@import '../css/quasar.variables.scss';

.prime-vocabulary-page {
  background: var(--prime-grey-50);
  min-height: calc(100vh - 64px);
}

// ===== PAGE HEADER =====
.prime-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: $prime-space-lg;
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: $prime-space-md;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--prime-info) 0%, var(--prime-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--prime-grey-600);
  margin: $prime-space-xs 0 0 0;
  font-weight: 400;
}

// ===== SECTION TITLES =====
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, var(--prime-info) 0%, var(--prime-accent) 100%);
    margin-top: $prime-space-sm;
    border-radius: 2px;
  }
}

// ===== DISABLED ACTIONS =====
.prime-action-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  
  &:hover {
    transform: none;
    box-shadow: var(--shadow-sm);
  }
}

// ===== VOCABULARY LIST =====
.vocab-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $prime-space-lg;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: $prime-space-md;
  }
}

.search-input {
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: auto;
  }
}

.vocab-list {
  padding: $prime-space-lg;
}

.vocab-word-item {
  display: flex;
  align-items: flex-start;
  gap: $prime-space-md;
  padding: $prime-space-lg 0;
  border-bottom: 1px solid var(--prime-grey-100);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--prime-grey-50);
    margin: 0 (-$prime-space-lg);
    padding-left: $prime-space-lg;
    padding-right: $prime-space-lg;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.word-mastery {
  flex-shrink: 0;
}

.mastery-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  
  &.mastery-high {
    background: linear-gradient(135deg, var(--prime-positive) 0%, #059669 100%);
  }
  
  &.mastery-medium {
    background: linear-gradient(135deg, var(--prime-warning) 0%, #d97706 100%);
  }
  
  &.mastery-low {
    background: linear-gradient(135deg, var(--prime-negative) 0%, #dc2626 100%);
  }
}

.word-content {
  flex: 1;
  min-width: 0;
}

.word-header {
  display: flex;
  align-items: center;
  gap: $prime-space-sm;
  margin-bottom: $prime-space-xs;
}

.word-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0;
  line-height: 1.3;
}

.difficulty-badge {
  padding: $prime-space-xs $prime-space-sm;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &.difficulty-beginner {
    background: var(--prime-positive);
    color: white;
  }
  
  &.difficulty-intermediate {
    background: var(--prime-warning);
    color: white;
  }
  
  &.difficulty-advanced {
    background: var(--prime-negative);
    color: white;
  }
}

.word-definition {
  font-size: 0.875rem;
  color: var(--prime-grey-700);
  line-height: 1.5;
  margin: 0 0 $prime-space-sm 0;
}

.word-meta {
  display: flex;
  align-items: center;
  gap: $prime-space-md;
}

.word-date {
  font-size: 0.75rem;
  color: var(--prime-grey-500);
  font-weight: 500;
}

.word-actions {
  display: flex;
  gap: $prime-space-xs;
  align-items: flex-start;
}

.action-btn {
  color: var(--prime-grey-400);
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--prime-grey-600);
  }
  
  &.action-btn--danger:hover {
    color: var(--prime-negative);
  }
}

.pagination-container {
  padding: $prime-space-lg;
  border-top: 1px solid var(--prime-grey-100);
  display: flex;
  justify-content: center;
}

// ===== DIALOG STYLES =====
.prime-dialog {
  .q-dialog__inner {
    padding: $prime-space-md;
  }
}

.prime-dialog-card {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: $prime-space-md;
  padding: $prime-space-xl $prime-space-xl $prime-space-lg;
}

.dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--prime-grey-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--prime-info);
  font-size: 24px;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0;
  line-height: 1.2;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: var(--prime-grey-600);
  margin: $prime-space-xs 0 0 0;
}

.dialog-content {
  padding: 0 $prime-space-xl $prime-space-lg;
}

.form-group {
  margin-bottom: $prime-space-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--prime-grey-700);
  margin-bottom: $prime-space-sm;
}

.dialog-actions {
  padding: $prime-space-lg $prime-space-xl $prime-space-xl;
  display: flex;
  gap: $prime-space-md;
  justify-content: flex-end;
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .vocab-word-item {
    flex-direction: column;
    align-items: flex-start;
    
    .word-actions {
      align-self: flex-end;
    }
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding-left: $prime-space-lg;
    padding-right: $prime-space-lg;
  }
  
  .dialog-actions {
    flex-direction: column;
    
    .prime-btn {
      width: 100%;
    }
  }
}

// ===== ANIMATIONS =====
.prime-stats-card,
.prime-action-card,
.vocab-word-item {
  animation: fadeInUp 0.6s ease-out;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>