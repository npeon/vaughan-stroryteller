<template>
  <q-page class="stories-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <div class="page-header">
            <div>
              <h4 class="text-h4 q-my-none">
                <q-icon name="auto_stories" class="q-mr-sm" />
                Stories
              </h4>
              <p class="text-subtitle1 text-grey-7 q-mb-none">
                AI-generated stories tailored to your English level
              </p>
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Generate New Story"
              unelevated
              size="lg"
              @click="showGenerateDialog = true"
            />
          </div>
        </div>

        <!-- Stories Grid -->
        <div class="col-12">
          <div v-if="stories.length === 0" class="text-center q-pa-xl">
            <q-icon name="menu_book" size="120px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">
              No stories yet
            </div>
            <div class="text-body2 text-grey-5 q-mb-lg">
              Generate your first AI-powered English story
            </div>
            <q-btn
              color="primary"
              icon="auto_stories"
              label="Create Your First Story"
              unelevated
              size="lg"
              @click="showGenerateDialog = true"
            />
          </div>

          <div v-else class="row q-col-gutter-md">
            <div 
              v-for="story in stories" 
              :key="story.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card class="story-card cursor-pointer" @click="openStory(story)">
                <q-img
                  :src="story.cover_image || '/placeholder-story.jpg'"
                  :alt="story.title"
                  height="200px"
                  class="story-cover"
                >
                  <div class="absolute-bottom story-overlay">
                    <div class="story-level-badge">
                      {{ story.cefr_level }}
                    </div>
                  </div>
                </q-img>
                
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium story-title">
                    {{ story.title }}
                  </div>
                  <div class="text-body2 text-grey-6 q-mt-sm story-description">
                    {{ story.description || 'No description available' }}
                  </div>
                  
                  <div class="row items-center q-mt-md">
                    <q-chip
                      :icon="genreIcon(story.genre)"
                      :label="story.genre"
                      size="sm"
                      color="primary"
                      outline
                    />
                    <q-space />
                    <div class="text-caption text-grey-5">
                      {{ formatDate(story.created_at) }}
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-actions align="right">
                  <q-btn 
                    flat 
                    color="primary" 
                    label="Read"
                    @click.stop="openStory(story)"
                  />
                  <q-btn 
                    flat 
                    color="grey" 
                    icon="more_vert"
                    @click.stop="showStoryMenu(story)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Story Dialog -->
    <q-dialog v-model="showGenerateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Generate New Story</div>
          <div class="text-body2 text-grey-6">
            Create a personalized story for your English level
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="generateForm.genre"
            :options="genreOptions"
            label="Genre"
            outlined
            emit-value
            map-options
          />
          
          <q-select
            v-model="generateForm.theme"
            :options="themeOptions"
            label="Theme"
            outlined
            emit-value
            map-options
          />
          
          <q-input
            v-model="generateForm.custom_prompt"
            label="Custom Request (optional)"
            outlined
            type="textarea"
            rows="3"
            hint="e.g., 'Include a dog named Max' or 'Set in medieval times'"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showGenerateDialog = false"
          />
          <q-btn 
            color="primary" 
            label="Generate Story"
            :loading="generating"
            @click="generateStory"
          />
        </q-card-actions>
      </q-card>
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
        cover_image: '/images/forest-adventure.jpg',
        cefr_level: 'B1'
      },
      {
        id: '2', 
        title: 'Mystery of the Lost Library',
        description: 'Emma finds an ancient library that appears only at midnight, holding secrets from the past.',
        genre: 'mystery',
        created_at: new Date().toISOString(),
        cover_image: '/images/lost-library.jpg',
        cefr_level: 'B2'
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
.stories-page {
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

.story-card {
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
}

.story-cover {
  position: relative;
}

.story-overlay {
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 1rem;
}

.story-level-badge {
  background: rgba(255, 255, 255, 0.9);
  color: $primary;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.story-title {
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.story-description {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>