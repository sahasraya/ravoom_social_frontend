import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MainfeedSelectedStateService {
  private state: { [key: string]: any } = {};

  /**
   * Save state data for a given key.
   * @param key - The unique key to identify the cached data.
   * @param data - The data to be cached.
   */
  saveState(key: string, data: any): void {
    this.state[key] = data;
  }

  /**
   * Retrieve state data for a given key.
   * @param key - The unique key to retrieve cached data.
   * @returns The cached data if it exists, otherwise null.
   */
  getState(key: string): any | null {
    return this.state[key] || null;
  }

  /**
   * Clear state data for a given key.
   * @param key - The unique key to clear cached data.
   */
  clearState(key: string): void {
    delete this.state[key];
  }

  /**
   * Clear all stored states.
   */
  clearAllStates(): void {
    this.state = {};
  }

  /**
   * Check if a specific key exists in the state.
   * @param key - The unique key to check.
   * @returns True if the key exists, otherwise false.
   */
  hasState(key: string): boolean {
    return key in this.state;
  }
}
