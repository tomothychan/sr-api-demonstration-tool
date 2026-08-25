/**
 * Asynchronous Storage Service using native Browser IndexedDB for scenarios 
 * and LocalStorage for showcase panel ID management & active editing session state.
 */

import { ScenarioModel } from './ScenarioModels';

const DB_NAME = 'SR_Scenario_DB';
const DB_VERSION = 1;
const STORE_NAME = 'scenarios';
const SHOWCASE_STORAGE_KEY = 'sr_showcase_scenario_ids_v1';
const ACTIVE_EDITING_KEY = 'sr_active_editing_scenario_id_v1';
const ACTIVE_SIMULATING_KEY = 'sr_active_simulating_scenario_id_v1';

/**
 * Helper to open or initialize the IndexedDB instance.
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
};

export const storageService = {
  // =========================================================================
  // IndexedDB Scenario Persistence
  // =========================================================================

  /**
   * Save or update a scenario in IndexedDB.
   */
  async saveScenario(scenarioData) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(scenarioData);

        request.onsuccess = () => {
          resolve({ success: true, scenario: scenarioData });
        };

        request.onerror = (event) => {
          console.error('IndexedDB Error [saveScenario]:', event.target.error);
          reject({ success: false, error: event.target.error });
        };
      });
    } catch (error) {
      console.error('Storage Service Error [saveScenario]:', error);
      return { success: false, error };
    }
  },

  /**
   * Load a single scenario by ID.
   */
  async loadScenario(scenarioId) {
    if (!scenarioId) return null;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(scenarioId);

        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };

        request.onerror = (event) => {
          console.error('IndexedDB Error [loadScenario]:', event.target.error);
          reject(null);
        };
      });
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
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };

        request.onerror = (event) => {
          console.error('IndexedDB Error [getAllScenarios]:', event.target.error);
          reject([]);
        };
      });
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
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(scenarioId);

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = (event) => {
          console.error('IndexedDB Error [deleteScenario]:', event.target.error);
          reject({ success: false, error: event.target.error });
        };
      });
    } catch (error) {
      console.error('Storage Service Error [deleteScenario]:', error);
      return { success: false, error };
    }
  },

  // =========================================================================
  // LocalStorage Active Editing State
  // =========================================================================

  /**
   * Get the ID of the scenario currently selected for editing.
   */
  async getActiveEditingScenarioId() {
    try {
      return localStorage.getItem(ACTIVE_EDITING_KEY) || null;
    } catch (error) {
      console.error('Storage Service Error [getActiveEditingScenarioId]:', error);
      return null;
    }
  },

  /**
   * Set the ID of the scenario currently selected for editing.
   */
  async setActiveEditingScenarioId(scenarioId) {
    try {
      if (scenarioId) {
        localStorage.setItem(ACTIVE_EDITING_KEY, scenarioId);
      } else {
        localStorage.removeItem(ACTIVE_EDITING_KEY);
      }
      return { success: true };
    } catch (error) {
      console.error('Storage Service Error [setActiveEditingScenarioId]:', error);
      return { success: false, error };
    }
  },

  /**
   * Get the ID of the scenario currently selected for simulating.
   */
  async getActiveSimulatingScenarioId() {
    try {
      return localStorage.getItem(ACTIVE_SIMULATING_KEY) || null;
    } catch (error) {
      console.error('Storage Service Error [getActiveSimulatingScenarioId]:', error);
      return null;
    }
  },

  /**
   * Set the ID of the scenario currently selected for simulating.
   */
  async setActiveSimulatingScenarioId(scenarioId) {
    try {
      if (scenarioId) {
        localStorage.setItem(ACTIVE_SIMULATING_KEY, scenarioId);
      } else {
        localStorage.removeItem(ACTIVE_SIMULATING_KEY);
      }
      return { success: true };
    } catch (error) {
      console.error('Storage Service Error [setActiveSimulatingScenarioId]:', error);
      return { success: false, error };
    }
  },

  // =========================================================================
  // LocalStorage Showcase Panel ID Management
  // =========================================================================

  /**
   * Fetch array of scenario IDs included in the showcase panel.
   */
  async getShowcasePanelScenarios() {
    try {
      const stored = localStorage.getItem(SHOWCASE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Storage Service Error [getShowcasePanelScenarios]:', error);
      return [];
    }
  },

  /**
   * Overwrite the showcase scenario ID array in LocalStorage.
   */
  async updateShowcasePanelScenarios(scenarioIds) {
    try {
      localStorage.setItem(SHOWCASE_STORAGE_KEY, JSON.stringify(scenarioIds));
      return { success: true, scenarioIds };
    } catch (error) {
      console.error('Storage Service Error [updateShowcasePanelScenarios]:', error);
      return { success: false, error };
    }
  },

  /**
   * Add a scenario ID to the showcase list if not already present.
   */
  async addShowcasePanelScenario(scenarioId) {
    try {
      const currentIds = await this.getShowcasePanelScenarios();
      if (!currentIds.includes(scenarioId)) {
        const updatedIds = [...currentIds, scenarioId];
        await this.updateShowcasePanelScenarios(updatedIds);
        return { success: true, scenarioIds: updatedIds };
      }
      return { success: true, scenarioIds: currentIds };
    } catch (error) {
      console.error('Storage Service Error [addShowcasePanelScenario]:', error);
      return { success: false, error };
    }
  },

  /**
   * Remove a scenario ID from the showcase list.
   */
  async removeShowcasePanelScenario(scenarioId) {
    try {
      const currentIds = await this.getShowcasePanelScenarios();
      const updatedIds = currentIds.filter((id) => id !== scenarioId);
      await this.updateShowcasePanelScenarios(updatedIds);
      return { success: true, scenarioIds: updatedIds };
    } catch (error) {
      console.error('Storage Service Error [removeShowcasePanelScenario]:', error);
      return { success: false, error };
    }
  },

  async handleCreateNewScenario() {
    const newScenario = new ScenarioModel({
      id: `custom_scenario_${Date.now()}`,
      name: 'New Custom Scenario',
      description: 'Custom integration scenario created in browser editor.',
      inspectorPanelEnabled: true
    });
    const json = newScenario.toJSON();

    await this.saveScenario(json);
    await this.addShowcasePanelScenario(json.id);
    await this.setActiveEditingScenarioId(json.id);
    return newScenario;
  }
};