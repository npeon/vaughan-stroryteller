<template>
  <q-page class="vocabulary-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <div class="page-header">
            <div>
              <h4 class="text-h4 q-my-none">
                <q-icon name="book" class="q-mr-sm" />
                Vocabulary
              </h4>
              <p class="text-subtitle1 text-grey-7 q-mb-none">
                Your personal English vocabulary collection
              </p>
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Add Word"
              unelevated
              size="lg"
              @click="showAddDialog = true"
            />
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-primary">{{ stats.total }}</div>
              <div class="text-body2 text-grey-6">Total Words</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-positive">{{ stats.mastered }}</div>
              <div class="text-body2 text-grey-6">Mastered</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-orange">{{ stats.learning }}</div>
              <div class="text-body2 text-grey-6">Learning</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-info">{{ stats.due }}</div>
              <div class="text-body2 text-grey-6">Due for Review</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Practice</div>
              <div class="row q-gutter-md">
                <q-btn
                  color="primary"
                  icon="quiz"
                  label="Review Due Words"
                  unelevated
                  :disable="stats.due === 0"
                  @click="startReview"
                />
                <q-btn
                  color="secondary"
                  icon="shuffle"
                  label="Random Practice"
                  unelevated
                  :disable="stats.total === 0"
                  @click="startRandomPractice"
                />
                <q-btn
                  color="accent"
                  icon="trending_up"
                  label="Difficult Words"
                  unelevated
                  :disable="stats.total === 0"
                  @click="practiceDifficult"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Vocabulary List -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="text-h6">Your Vocabulary</div>
                <q-space />
                <q-input
                  v-model="searchQuery"
                  placeholder="Search words..."
                  outlined
                  dense
                  clearable
                  style="min-width: 200px"
                >
                  <template #prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <div v-if="filteredWords.length === 0 && searchQuery === ''" class="text-center q-pa-xl">
                <q-icon name="library_books" size="120px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">
                  No vocabulary yet
                </div>
                <div class="text-body2 text-grey-5 q-mb-lg">
                  Start adding words to build your vocabulary
                </div>
                <q-btn
                  color="primary"
                  icon="add"
                  label="Add Your First Word"
                  unelevated
                  @click="showAddDialog = true"
                />
              </div>

              <div v-else-if="filteredWords.length === 0" class="text-center q-pa-lg">
                <q-icon name="search_off" size="64px" color="grey-4" />
                <div class="text-subtitle1 text-grey-6 q-mt-md">
                  No words found for "{{ searchQuery }}"
                </div>
              </div>

              <div v-else>
                <q-list separator>
                  <q-item
                    v-for="word in paginatedWords"
                    :key="word.id"
                    class="vocabulary-item"
                  >
                    <q-item-section avatar>
                      <q-avatar :color="getMasteryColor(word.mastery_level)" text-color="white">
                        {{ word.mastery_level }}
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ word.word }}
                        <q-badge 
                          v-if="word.difficulty_level"
                          :color="getDifficultyColor(word.difficulty_level)"
                          :label="word.difficulty_level"
                          class="q-ml-sm"
                        />
                      </q-item-label>
                      <q-item-label caption>
                        {{ word.definition || 'No definition available' }}
                      </q-item-label>
                      <q-item-label caption class="text-grey-5">
                        Added {{ formatDate(word.created_at) }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div class="row q-gutter-xs">
                        <q-btn
                          flat
                          round
                          icon="volume_up"
                          size="sm"
                          @click="playPronunciation(word)"
                          :loading="playingAudio === word.id"
                        />
                        <q-btn
                          flat
                          round
                          icon="edit"
                          size="sm"
                          @click="editWord(word)"
                        />
                        <q-btn
                          flat
                          round
                          icon="delete"
                          size="sm"
                          color="negative"
                          @click="deleteWord(word)"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>

                <!-- Pagination -->
                <div class="row justify-center q-mt-md" v-if="totalPages > 1">
                  <q-pagination
                    v-model="currentPage"
                    :max="totalPages"
                    :max-pages="5"
                    boundary-numbers
                    direction-links
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Add Word Dialog -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Word</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="addForm.word"
            label="Word"
            outlined
            :rules="[val => !!val || 'Word is required']"
            @blur="lookupWord"
          />
          
          <q-input
            v-model="addForm.definition"
            label="Definition"
            outlined
            type="textarea"
            rows="2"
          />
          
          <q-input
            v-model="addForm.example_sentence"
            label="Example Sentence"
            outlined
            type="textarea"
            rows="2"
          />
          
          <q-select
            v-model="addForm.difficulty_level"
            :options="difficultyOptions"
            label="Difficulty Level"
            outlined
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showAddDialog = false"
          />
          <q-btn 
            color="primary" 
            label="Add Word"
            :loading="addingWord"
            @click="addWord"
          />
        </q-card-actions>
      </q-card>
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
const getMasteryColor = (level: number) => {
  if (level >= 5) return 'positive'
  if (level >= 3) return 'warning'
  return 'negative'
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'positive'
    case 'intermediate': return 'warning'  
    case 'advanced': return 'negative'
    default: return 'grey'
  }
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
    words.value = [
      {
        id: '1',
        word: 'adventure',
        definition: 'An exciting or unusual experience',
        difficulty_level: 'intermediate',
        mastery_level: 3,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        word: 'mysterious',
        definition: 'Difficult to understand or explain',
        difficulty_level: 'advanced',
        mastery_level: 2,
        created_at: new Date().toISOString()
      }
    ]
    stats.value = {
      total: words.value.length,
      mastered: 0,
      learning: 0,
      due: 0
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
.vocabulary-page {
  background: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.stats-card {
  .text-h4 {
    font-weight: 600;
  }
}

.vocabulary-item {
  &:hover {
    background: rgba(0,0,0,0.02);
  }
}
</style>