import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommentPostStateService {
  private state: { [key: string]: { data: any; timestamp: number } } = {};
  private cacheTTL = 5 * 60 * 1000; // Cache Time-To-Live: 5 minutes

  /**
   * Saves the state with a timestamp.
   * @param groupid Key to identify the cached data.
   * @param data Data to cache.
   */
  saveState(groupid: string, data: any): void {
    this.state[groupid] = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Retrieves the state if not expired.
   * @param groupid Key to identify the cached data.
   * @returns Cached data or null if expired or not found.
   */
  getState(groupid: string): any | null {
    const cacheEntry = this.state[groupid];
    if (!cacheEntry) {
      return null; // No data cached
    }

    // Check if the cached data has expired
    const isExpired = Date.now() - cacheEntry.timestamp > this.cacheTTL;
    if (isExpired) {
      this.clearState(groupid); // Clear expired cache
      return null;
    }

    return cacheEntry.data; // Return valid cache data
  }

  /**
   * Clears the cached state for a specific groupid.
   * @param groupid Key to identify the cached data.
   */
  clearState(groupid: string): void {
    delete this.state[groupid];
  }

  /**
   * Clears all cached states.
   */
  clearAll(): void {
    this.state = {};
  }
}
