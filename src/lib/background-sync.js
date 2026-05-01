'use client';

/**
 * Utility for handling Background Sync to ensure critical operations complete
 * even when the user goes offline temporarily
 */

const SYNC_TAGS = {
  ORDERS: 'sync-orders',
  MESSAGES: 'sync-messages',
  PRODUCTS: 'sync-products'
};

/**
 * Request a background sync for the given tag
 * @param {string} tag - The sync tag to register
 * @returns {Promise<void>}
 */
export async function requestBackgroundSync(tag) {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported, background sync unavailable');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
  } catch (error) {
    console.error(`Failed to register background sync for ${tag}:`, error);
  }
}

/**
 * Check if background sync is supported
 * @returns {boolean}
 */
export function isBackgroundSyncSupported() {
  return ('serviceWorker' in navigator) && 
         ('SyncManager' in window);
}

/**
 * Store data locally for later synchronization
 * This would typically use IndexedDB, but for simplicity we'll use localStorage
 * with a queue mechanism. In production, use a proper IDB wrapper like idb.
 */
class SyncQueue {
  constructor(storeName) {
    this.storeName = storeName;
    this.queue = this.loadQueue();
  }

  loadQueue() {
    try {
      const saved = localStorage.getItem(this.storeName);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn(`Failed to load sync queue for ${this.storeName}:`, error);
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem(this.storeName, JSON.stringify(this.queue));
    } catch (error) {
      console.error(`Failed to save sync queue for ${this.storeName}:`, error);
    }
  }

  addItem(item) {
    this.queue.push({
      ...item,
      id: Date.now() + Math.random(), // Simple unique ID
      timestamp: Date.now()
    });
    this.saveQueue();
    return this.queue.length;
  }

  getAndClearQueue() {
    const items = [...this.queue];
    this.queue = [];
    this.saveQueue();
    return items;
  }

  getQueueLength() {
    return this.queue.length;
  }
}

// Create specific queues for different types of data
export const orderSyncQueue = new SyncQueue('oda-orders-sync');
export const messageSyncQueue = new SyncQueue('oda-messages-sync');
export const productSyncQueue = new SyncQueue('oda-products-sync');

/**
 * Process the sync queue for orders (called by service worker)
 * This function would be called from your service worker's sync handler
 */
export async function processOrderSyncQueue() {
  if (!isBackgroundSyncSupported()) return;

  const items = orderSyncQueue.getAndClearQueue();
  if (items.length === 0) return 0;

  const supabase = await import('@/lib/supabase').then(m => m.getSupabase());
  const { user } = await import('@/contexts/AuthContext').then(m => m.useAuth());
  
  let successful = 0;
  
  for (const item of items) {
    try {
      // Example: saving a pending order
      const { error } = await supabase.from('commandes').insert({
        user_id: user.id,
        ...item.data
      });
      
      if (!error) {
        successful++;
      } else {
        // Put back in queue for retry
        orderSyncQueue.addItem(item);
        console.warn(`Failed to sync order, will retry:`, error);
      }
    } catch (error) {
      // Network error, put back in queue
      orderSyncQueue.addItem(item);
      console.warn(`Network error syncing order, will retry:`, error);
    }
  }
  
  return successful;
}

/**
 * Process the sync queue for messages (called by service worker)
 */
export async function processMessageSyncQueue() {
  if (!isBackgroundSyncSupported()) return;

  const items = messageSyncQueue.getAndClearQueue();
  if (items.length === 0) return 0;

  const supabase = await import('@/lib/supabase').then(m => m.getSupabase());
  const { user } = await import('@/contexts/AuthContext').then(m => m.useAuth());
  
  let successful = 0;
  
  for (const item of items) {
    try {
      // Example: saving a pending message
      const { error } = await supabase.from('conversations').insert({
        user_id: user.id,
        ...item.data
      });
      
      if (!error) {
        successful++;
      } else {
        // Put back in queue for retry
        messageSyncQueue.addItem(item);
        console.warn(`Failed to sync message, will retry:`, error);
      }
    } catch (error) {
      // Network error, put back in queue
      messageSyncQueue.addItem(item);
      console.warn(`Network error syncing message, will retry:`, error);
    }
  }
  
  return successful;
}

/**
 * Process the sync queue for products (called by service worker)
 */
export async function processProductSyncQueue() {
  if (!isBackgroundSyncSupported()) return;

  const items = productSyncQueue.getAndClearQueue();
  if (items.length === 0) return 0;

  const supabase = await import('@/lib/supabase').then(m => m.getSupabase());
  const { user } = await import('@/contexts/AuthContext').then(m => m.useAuth());
  
  let successful = 0;
  
  for (const item of items) {
    try {
      // Example: saving a pending product
      const { error } = await supabase.from('produits').insert({
        user_id: user.id,
        ...item.data
      });
      
      if (!error) {
        successful++;
      } else {
        // Put back in queue for retry
        productSyncQueue.addItem(item);
        console.warn(`Failed to sync product, will retry:`, error);
      }
    } catch (error) {
      // Network error, put back in queue
      productSyncQueue.addItem(item);
      console.warn(`Network error syncing product, will retry:`, error);
    }
  }
  
  return successful;
}

export default {
  requestBackgroundSync,
  isBackgroundSyncSupported,
  SYNC_TAGS,
  orderSyncQueue,
  messageSyncQueue,
  productSyncQueue,
  processOrderSyncQueue,
  processMessageSyncQueue,
  processProductSyncQueue
};