import { OpenRouterClient } from './OpenRouterClient';
import { OpenRouterError } from './OpenRouterClient';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
  OpenRouterImageModelId,
  CEFRLevel,
  StoryGenre
} from '../../types/openrouter';

export class ImageGenerator {
  private client: OpenRouterClient;
  private readonly primaryModel: OpenRouterImageModelId;
  private readonly secondaryModel: OpenRouterImageModelId;
  private readonly timeout: number;
  private readonly placeholderUrl: string;
  private readonly maxRetries: number = 2;

  constructor(client?: OpenRouterClient) {
    this.client = client || new OpenRouterClient();
    this.primaryModel = (import.meta.env.OPENROUTER_IMAGE_MODEL as OpenRouterImageModelId) || 'google/gemini-2.5-flash-image-preview:free';
    this.secondaryModel = (import.meta.env.OPENROUTER_IMAGE_MODEL_SECONDARY as OpenRouterImageModelId) || 'google/gemini-2.5-flash-image-preview';
    this.timeout = parseInt(import.meta.env.IMAGE_GENERATION_TIMEOUT_MS || '30000', 10);
    this.placeholderUrl = import.meta.env.PLACEHOLDER_IMAGE_URL || 'https://picsum.photos/800/600';
  }

  /**
   * Generate an image for a story based on the content and parameters
   */
  async generateStoryImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    // Validate the request
    this.validateRequest(request);

    // Build the prompt for image generation
    const prompt = this.buildPrompt(request);

    try {
      // Try to generate with fallback strategy
      return await this.generateWithFallback(prompt);
    } catch (error) {
      console.error('Image generation failed after all attempts:', error);
      
      // Return placeholder image as final fallback
      return this.getPlaceholderImage();
    }
  }

  /**
   * Build an educational prompt for image generation based on story parameters
   */
  private buildPrompt(request: ImageGenerationRequest): string {
    const { storyContent, level, genre, style = 'educational', aspectRatio = '16:9' } = request;

    // Extract key narrative elements from story content
    const keyElements = this.extractKeyElements(storyContent);
    const levelDescriptions = this.getLevelDescriptions();
    const genreStyles = this.getGenreStyles();
    
    const basePrompt = `Create a high-quality, educational illustration for an English learning story.

STORY CONTEXT:
${keyElements.setting ? `Setting: ${keyElements.setting}` : ''}
${keyElements.characters ? `Characters: ${keyElements.characters}` : ''}
${keyElements.mainAction ? `Main scene: ${keyElements.mainAction}` : ''}
${keyElements.mood ? `Mood: ${keyElements.mood}` : ''}

EDUCATIONAL REQUIREMENTS:
- CEFR Level: ${level} (${levelDescriptions[level]})
- Target audience: ${this.getTargetAge(level)} learners
- Style: ${this.getStyleDescription(style)}
- Educational purpose: Support vocabulary comprehension and story understanding

VISUAL SPECIFICATIONS:
- Genre: ${genre} (${genreStyles[genre] || 'narrative illustration'})
- Aspect ratio: ${aspectRatio}
- Quality: High-resolution, professional illustration
- Complexity: ${this.getComplexityLevel(level)}
- Color palette: ${this.getColorPalette(level, style)}

TECHNICAL GUIDELINES:
- Clear visual storytelling that supports text comprehension
- Age-appropriate content for language learners
- Avoid complex backgrounds that distract from main elements
- Include visual cues that reinforce vocabulary from the story
- Cultural sensitivity and inclusivity
${level === 'A1' || level === 'A2' ? '- Simple, bold imagery with clear focal points' : ''}
${level === 'C1' || level === 'C2' ? '- Sophisticated artistic interpretation with cultural references' : ''}

Focus on creating an image that enhances the educational value of the story and helps learners better understand and remember the content.`;

    return basePrompt;
  }

  /**
   * Attempt image generation with fallback strategy
   */
  private async generateWithFallback(prompt: string): Promise<ImageGenerationResult> {
    const models = [this.primaryModel, this.secondaryModel];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        console.log(`Attempting image generation with model: ${model}`);
        const result = await this.attemptImageGeneration(prompt, model);
        
        if (result.success) {
          return result;
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Image generation failed with model ${model}:`, error);
        
        // If it's an auth error, don't retry with other models
        if (error instanceof OpenRouterError && error.isAuthError) {
          throw error;
        }
      }
    }

    throw new Error(
      `Failed to generate image after trying ${models.length} models. Last error: ${lastError?.message}`
    );
  }

  /**
   * Attempt image generation with a specific model
   */
  private async attemptImageGeneration(
    prompt: string,
    model: OpenRouterImageModelId
  ): Promise<ImageGenerationResult> {
    try {
      const result = await this.client.generateImage(prompt, model, {
        maxTokens: 1000, // For text response about the image
        temperature: 0.7
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during image generation'
      };
    }
  }

  /**
   * Validate image generation request parameters
   */
  private validateRequest(request: ImageGenerationRequest): void {
    if (!request.storyContent || request.storyContent.trim().length < 10) {
      throw new Error('Story content must be at least 10 characters long');
    }

    const validLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validLevels.includes(request.level)) {
      throw new Error(`Invalid CEFR level: ${request.level}`);
    }

    const validGenres: StoryGenre[] = [
      'adventure', 'mystery', 'romance', 'science_fiction', 'fantasy',
      'thriller', 'comedy', 'drama', 'historical', 'biography'
    ];
    if (!validGenres.includes(request.genre)) {
      throw new Error(`Invalid genre: ${request.genre}`);
    }
  }

  /**
   * Extract key narrative elements from story content
   */
  private extractKeyElements(storyContent: string): {
    setting?: string;
    characters?: string;
    mainAction?: string;
    mood?: string;
  } {
    // Simple keyword extraction for main elements
    const text = storyContent.toLowerCase();
    
    // Extract potential settings
    const settingKeywords = ['house', 'garden', 'school', 'forest', 'city', 'beach', 'mountain', 'room', 'kitchen', 'library'];
    const setting = settingKeywords.find(keyword => text.includes(keyword));
    
    // Extract character mentions
    const characterKeywords = ['tom', 'sara', 'anna', 'ben', 'maria', 'john', 'emma', 'alex'];
    const characters = characterKeywords.filter(keyword => text.includes(keyword)).join(', ');
    
    // Extract main actions
    const actionKeywords = ['finds', 'discovers', 'meets', 'travels', 'learns', 'helps', 'solves'];
    const mainAction = actionKeywords.find(keyword => text.includes(keyword));
    
    // Determine mood
    let mood = 'neutral';
    if (text.includes('happy') || text.includes('joy') || text.includes('love')) mood = 'positive';
    if (text.includes('sad') || text.includes('worried') || text.includes('afraid')) mood = 'concerned';
    if (text.includes('exciting') || text.includes('adventure') || text.includes('mystery')) mood = 'adventurous';
    
    return {
      ...(setting && { setting }),
      ...(characters && { characters }),
      ...(mainAction && { mainAction }),
      mood
    };
  }

  /**
   * Get level-appropriate descriptions for prompts
   */
  private getLevelDescriptions(): Record<CEFRLevel, string> {
    return {
      A1: 'basic everyday expressions and very basic phrases',
      A2: 'sentences and frequently used expressions for simple, routine tasks',  
      B1: 'clear standard input on familiar matters and concrete topics',
      B2: 'complex texts on concrete and abstract topics, including technical discussions',
      C1: 'sophisticated texts with implicit meaning and various registers',
      C2: 'virtually everything heard or read with ease and sophisticated expression'
    };
  }

  /**
   * Get genre-specific visual styling cues
   */
  private getGenreStyles(): Record<StoryGenre, string> {
    return {
      adventure: 'dynamic action scene with movement and exploration elements',
      mystery: 'intriguing atmosphere with shadows and curious elements',
      romance: 'warm, emotional scene with soft lighting and connection',
      science_fiction: 'futuristic elements with technology and innovation',
      fantasy: 'magical elements with wonder and imagination',
      thriller: 'tense atmosphere with dramatic lighting',
      comedy: 'lighthearted, colorful scene with humorous elements',
      drama: 'emotional depth with realistic human situations',
      historical: 'period-appropriate setting with historical accuracy',
      biography: 'realistic portrayal focusing on human achievement'
    };
  }

  /**
   * Get target age range for CEFR levels
   */
  private getTargetAge(level: CEFRLevel): string {
    const ageRanges = {
      A1: 'young children and beginner adult',
      A2: 'elementary school and basic adult',
      B1: 'middle school and intermediate adult',
      B2: 'high school and upper-intermediate adult',
      C1: 'university and advanced adult',
      C2: 'professional and native-level adult'
    };
    return ageRanges[level];
  }

  /**
   * Get style description for different image styles
   */
  private getStyleDescription(style: string): string {
    const styles = {
      educational: 'clear, pedagogical illustration optimized for learning',
      children: 'colorful, friendly illustration suitable for young learners',
      realistic: 'photorealistic style with accurate details',
      illustration: 'artistic illustration with creative interpretation'
    };
    return styles[style as keyof typeof styles] || styles.educational;
  }

  /**
   * Get complexity level for CEFR level
   */
  private getComplexityLevel(level: CEFRLevel): string {
    if (level === 'A1' || level === 'A2') return 'Simple and clear with minimal details';
    if (level === 'B1' || level === 'B2') return 'Moderate complexity with contextual elements';
    return 'Rich detail with sophisticated visual elements';
  }

  /**
   * Get color palette suggestions for level and style
   */
  private getColorPalette(level: CEFRLevel, style: string): string {
    if (style === 'children' || level === 'A1' || level === 'A2') {
      return 'bright, primary colors with high contrast';
    }
    if (level === 'C1' || level === 'C2') {
      return 'sophisticated, nuanced color scheme with artistic balance';
    }
    return 'balanced, educational-friendly color palette';
  }

  /**
   * Get a placeholder image when generation fails
   */
  private getPlaceholderImage(): ImageGenerationResult {
    return {
      success: true,
      imageUrl: this.placeholderUrl,
      prompt: 'Placeholder image for story illustration',
      model: this.primaryModel,
      generatedAt: new Date().toISOString(),
      isPlaceholder: true
    };
  }

  /**
   * Get health status of the image generation service
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    availableModels: number;
    lastChecked: string;
  }> {
    try {
      const isConnected = await this.client.testConnection();
      const availableModels = isConnected ? 2 : 0; // Primary and secondary models
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        availableModels,
        lastChecked: new Date().toISOString()
      };
    } catch {
      return {
        status: 'unhealthy',
        availableModels: 0,
        lastChecked: new Date().toISOString()
      };
    }
  }
}