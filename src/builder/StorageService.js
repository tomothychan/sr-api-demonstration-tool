/**
 * Storage Service Wrapper.
 * Currently uses LocalStorage with an asynchronous interface to allow smooth 
 * future migration to IndexedDB.
 */

const LOCAL_STORAGE_KEY = 'sr_custom_scenarios_v1';

export const storageService = {
  /**
   * Save or update a scenario in storage.
   */
  async saveScenario(scenarioData) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let list = stored ? JSON.parse(stored) : [];
      
      const existingIdx = list.findIndex((s) => s.id === scenarioData.id);
      if (existingIdx >= 0) {
        list[existingIdx] = scenarioData;
      } else {
        list.push(scenarioData);
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return { success: true, scenario: scenarioData };
    } catch (error) {
      console.error('Storage Service Error [saveScenario]:', error);
      return { success: false, error };
    }
  },

  /**
   * Load a single scenario by ID.
   */
  async loadScenario(scenarioId) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return null;
      const list = JSON.parse(stored);
      return list.find((s) => s.id === scenarioId) || null;
    } catch (error) {
      console.error('Storage Service Error [loadScenario]:', error);
      return null;
    }
  },

  /**
   * Fetch all saved scenarios.
   */
  async getAllScenarios() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Storage Service Error [getAllScenarios]:', error);
      return [];
    }
  },

  /**
   * Delete a scenario by ID.
   */
  async deleteScenario(scenarioId) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return { success: true };
      let list = JSON.parse(stored);
      list = list.filter((s) => s.id !== scenarioId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return { success: true };
    } catch (error) {
      console.error('Storage Service Error [deleteScenario]:', error);
      return { success: false, error };
    }
  }
};