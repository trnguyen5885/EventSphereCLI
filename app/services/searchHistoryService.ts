import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

export class SearchHistoryService {
  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const historyData = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyData) {
        const history: SearchHistoryItem[] = JSON.parse(historyData);
        // Sort by timestamp descending (newest first)
        return history.sort((a, b) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  static async addToHistory(query: string): Promise<void> {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      const history = await this.getSearchHistory();
      
      // Remove existing entry if exists (to avoid duplicates)
      const filteredHistory = history.filter(item => 
        item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add new item at the beginning
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: trimmedQuery,
        timestamp: Date.now(),
      };

      const updatedHistory = [newItem, ...filteredHistory];

      // Keep only the most recent items
      const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  static async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  static async getRecentSearches(limit: number = 5): Promise<SearchHistoryItem[]> {
    try {
      const history = await this.getSearchHistory();
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }
}