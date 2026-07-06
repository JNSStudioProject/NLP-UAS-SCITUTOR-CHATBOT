import { defineStore } from 'pinia'

const STORAGE_KEY = 'scitutor_flashcards'

export const useFlashcardStore = defineStore('flashcard', {
  state: () => {
    let saved = []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        saved = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error reading flashcards from localStorage', e)
    }
    
    return {
      cards: saved,
    }
  },
  
  getters: {
    cardCount: (state) => state.cards.length,
    hasCard: (state) => (id) => state.cards.some(c => c.id === id),
    hasCardByInput: (state) => (input) => state.cards.some(c => c.input === input),
    
    // SRS Getters
    cardsToReview: (state) => {
      const now = new Date();
      return state.cards
        .filter(c => !c.nextReviewDate || new Date(c.nextReviewDate) <= now)
        .sort((a, b) => {
          const dateA = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : 0;
          const dateB = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : 0;
          return dateA - dateB;
        });
    },
    masteredCardsCount: (state) => {
      // Arbitrary definition of mastered: repetition > 3
      return state.cards.filter(c => c.repetition > 3).length
    }
  },
  
  actions: {
    addCard(questionData) {
      // Don't add if already exists based on input question
      if (this.cards.some(c => c.input === questionData.input)) {
        return false;
      }
      
      const newCard = {
        id: questionData.id || Date.now().toString(),
        input: questionData.input,
        output: questionData.output,
        subject: questionData.subject || 'General',
        addedAt: new Date().toISOString(),
        
        // SRS fields
        easeFactor: 2.5,
        interval: 0,
        repetition: 0,
        nextReviewDate: new Date().toISOString()
      }
      
      this.cards.unshift(newCard)
      this.saveToStorage()
      return true;
    },
    
    removeCard(id) {
      this.cards = this.cards.filter(c => c.id !== id)
      this.saveToStorage()
    },
    
    reviewCard(id, quality) {
      // quality: 0 (Forgot), 3 (Hard), 4 (Good), 5 (Easy)
      const cardIndex = this.cards.findIndex(c => c.id === id);
      if (cardIndex === -1) return;
      
      let card = this.cards[cardIndex];
      
      // Initialize SRS fields if they don't exist (backward compatibility)
      if (card.easeFactor === undefined) card.easeFactor = 2.5;
      if (card.interval === undefined) card.interval = 0;
      if (card.repetition === undefined) card.repetition = 0;
      
      // Update easeFactor
      card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (card.easeFactor < 1.3) card.easeFactor = 1.3;
      
      if (quality < 3) {
        // Failed
        card.repetition = 0;
        card.interval = 0; // review again today
      } else {
        // Success
        card.repetition += 1;
        if (card.repetition === 1) {
          card.interval = 1;
        } else if (card.repetition === 2) {
          card.interval = 6;
        } else {
          card.interval = Math.round(card.interval * card.easeFactor);
        }
      }
      
      // Update next review date
      const nextDate = new Date();
      if (card.interval > 0) {
        nextDate.setDate(nextDate.getDate() + card.interval);
      }
      card.nextReviewDate = nextDate.toISOString();
      
      this.saveToStorage();
    },
    
    clearAll() {
      this.cards = []
      this.saveToStorage()
    },
    
    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards))
      } catch (err) {
        console.error('Failed to save flashcards', err)
      }
    }
  }
})
