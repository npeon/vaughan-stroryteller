<template>
  <q-page class="prime-stories-page">
    <div class="prime-container q-pa-lg">
      <!-- Page Header -->
      <div class="prime-page-header q-mb-xl">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="auto_stories" />
          </div>
          <div>
            <h1 class="page-title">Stories</h1>
            <p class="page-subtitle">
              AI-generated stories tailored to your English level
            </p>
          </div>
        </div>
        <q-btn
          class="prime-btn prime-btn--primary"
          icon="add"
          label="Generate New Story"
          unelevated
          size="lg"
          @click="showGenerateDialog = true"
        />
      </div>

      <!-- Stories Content -->
      <div v-if="stories.length === 0" class="prime-empty-state">
        <div class="empty-icon">
          <q-icon name="auto_stories" />
        </div>
        <div class="empty-title">No stories yet</div>
        <div class="empty-description">
          Generate your first AI-powered English story tailored to your learning level. 
          Each story is crafted to help you improve your vocabulary and comprehension.
        </div>
        <q-btn
          class="prime-btn prime-btn--primary q-mt-lg"
          icon="auto_stories"
          label="Create Your First Story"
          unelevated
          size="lg"
          @click="showGenerateDialog = true"
        />
      </div>

      <div v-else class="prime-grid prime-grid--3">
        <div 
          v-for="story in stories" 
          :key="story.id"
          class="prime-story-card"
          @click="openStory(story)"
        >
          <div class="story-image-container">
            <img
              :src="story.cover_image || ''"
              :alt="story.title"
              class="story-image"
            />
            <div class="story-level-badge">
              {{ story.cefr_level }}
            </div>
          </div>
          
          <div class="story-content">
            <div class="story-genre">
              <q-icon :name="genreIcon(story.genre)" class="q-mr-xs" />
              {{ story.genre }}
            </div>
            
            <h3 class="story-title">{{ story.title }}</h3>
            
            <p class="story-description">
              {{ story.description || 'No description available' }}
            </p>
            
            <div class="story-footer">
              <span class="story-date">{{ formatDate(story.created_at) }}</span>
              <q-btn
                flat
                dense
                round
                icon="more_vert"
                class="story-menu-btn"
                @click.stop="showStoryMenu(story)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Story Dialog -->
    <q-dialog v-model="showGenerateDialog" class="prime-dialog">
      <div class="prime-card prime-dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon">
            <q-icon name="auto_stories" />
          </div>
          <div>
            <h3 class="dialog-title">Generate New Story</h3>
            <p class="dialog-subtitle">
              Create a personalized story for your English level
            </p>
          </div>
        </div>

        <div class="dialog-content">
          <div class="form-group">
            <label class="form-label">Genre</label>
            <q-select
              v-model="generateForm.genre"
              :options="genreOptions"
              outlined
              emit-value
              map-options
              class="prime-select"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Theme</label>
            <q-select
              v-model="generateForm.theme"
              :options="themeOptions"
              outlined
              emit-value
              map-options
              class="prime-select"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Custom Request (optional)</label>
            <q-input
              v-model="generateForm.custom_prompt"
              outlined
              type="textarea"
              rows="3"
              placeholder="e.g., 'Include a dog named Max' or 'Set in medieval times'"
              class="prime-textarea"
            />
          </div>
        </div>

        <div class="dialog-actions">
          <q-btn 
            flat 
            label="Cancel"
            class="prime-btn prime-btn--secondary"
            @click="showGenerateDialog = false"
          />
          <q-btn 
            label="Generate Story"
            class="prime-btn prime-btn--primary"
            :loading="generating"
            @click="generateStory"
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAuthGuard } from '../composables/useAuthGuard'

// Types
interface Story {
  id: string
  title: string
  description: string
  genre: string
  created_at: string
  content?: string
  audio_url?: string
  cover_image?: string
  cefr_level: string
}

const { profile } = useAuth()
const { requireAuth } = useAuthGuard()

// Requiere autenticación
requireAuth()

// State
const stories = ref<Story[]>([])
const showGenerateDialog = ref(false)
const generating = ref(false)

const generateForm = ref({
  genre: 'adventure',
  theme: 'friendship',
  custom_prompt: ''
})

// Options
const genreOptions = [
  { label: 'Adventure', value: 'adventure' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Science Fiction', value: 'sci-fi' },
  { label: 'Romance', value: 'romance' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Drama', value: 'drama' },
]

const themeOptions = [
  { label: 'Friendship', value: 'friendship' },
  { label: 'Family', value: 'family' },
  { label: 'Growth', value: 'growth' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Discovery', value: 'discovery' },
  { label: 'Challenge', value: 'challenge' },
]

// Methods
const genreIcon = (genre: string) => {
  const icons: Record<string, string> = {
    adventure: 'explore',
    mystery: 'search',
    fantasy: 'auto_awesome',
    'sci-fi': 'rocket_launch',
    romance: 'favorite',
    comedy: 'sentiment_very_satisfied',
    drama: 'theater_comedy'
  }
  return icons[genre] || 'book'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const generateStory = async () => {
  generating.value = true
  try {
    // TODO: Implement story generation with OpenRouter API
    console.log('Generating story with:', generateForm.value)
    
    // Placeholder - this will be implemented in future tasks
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showGenerateDialog.value = false
    generateForm.value.custom_prompt = ''
    
    // TODO: Add the generated story to the list and show success
  } catch (error) {
    console.error('Error generating story:', error)
  } finally {
    generating.value = false
  }
}

const openStory = (story: Story) => {
  // TODO: Navigate to story reading page
  console.log('Opening story:', story.title)
}

const showStoryMenu = (story: Story) => {
  // TODO: Show story options menu (delete, share, etc.)
  console.log('Story menu for:', story.title)
}

const loadStories = () => {
  try {
    // TODO: Load stories from Supabase
    console.log('Loading stories for user:', profile.value?.id)
    
    // Mock data with proper types
    stories.value = [
      {
        id: '1',
        title: 'The Magical Forest Adventure',
        description: 'A young explorer discovers a hidden forest filled with talking animals and magical creatures.',
        genre: 'fantasy',
        created_at: new Date().toISOString(),
        cover_image: 'https://picsum.photos/300/200?random=1',
        cefr_level: 'B1'
      },
      {
        id: '2', 
        title: 'Mystery of the Lost Library',
        description: 'Emma finds an ancient library that appears only at midnight, holding secrets from the past.',
        genre: 'mystery',
        created_at: new Date().toISOString(),
        cover_image: 'https://picsum.photos/300/200?random=2',
        cefr_level: 'B2'
      },
      {
        id: '3', 
        title: 'The Time Traveler\'s Dilemma',
        description: 'Sarah accidentally activates a time machine and must find her way back to the present.',
        genre: 'sci-fi',
        created_at: new Date().toISOString(),
        cover_image: 'https://picsum.photos/300/200?random=3',
        cefr_level: 'B1'
      },
      {
        id: '4', 
        title: 'The Secret Garden Club',
        description: 'Four friends discover an abandoned garden and decide to bring it back to life.',
        genre: 'adventure',
        created_at: new Date().toISOString(),
        cover_image: 'https://picsum.photos/300/200?random=4',
        cefr_level: 'A2'
      }
    ]
  } catch (error) {
    console.error('Error loading stories:', error)
  }
}

onMounted(() => {
  void loadStories()
})
</script>

<style lang="scss" scoped>
// ===== PRIME STORIES PAGE STYLES =====
@import '../css/quasar.variables.scss';

.prime-stories-page {
  background: var(--prime-grey-50);
  min-height: calc(100vh - 64px);
  padding-top: $prime-space-lg; // Añadir espacio superior entre menú y contenido
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
  background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
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

// ===== STORY CARDS =====
.prime-story-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--prime-grey-100);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    border-color: var(--prime-primary);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
}

.story-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.prime-story-card:hover .story-image {
  transform: scale(1.05);
}

.story-level-badge {
  position: absolute;
  top: $prime-space-md;
  right: $prime-space-md;
  background: rgba(255, 255, 255, 0.95);
  color: var(--prime-primary);
  padding: $prime-space-xs $prime-space-sm;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
}

.story-content {
  padding: $prime-space-lg;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.story-genre {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--prime-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: $prime-space-sm;
}

.story-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0 0 $prime-space-sm 0;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.story-description {
  font-size: 0.875rem;
  color: var(--prime-grey-600);
  line-height: 1.5;
  margin: 0 0 $prime-space-lg 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.story-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-date {
  font-size: 0.75rem;
  color: var(--prime-grey-500);
  font-weight: 500;
}

.story-menu-btn {
  color: var(--prime-grey-400);
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--prime-grey-600);
  }
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
  color: var(--prime-primary);
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
.prime-story-card {
  animation: fadeInUp 0.6s ease-out;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
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