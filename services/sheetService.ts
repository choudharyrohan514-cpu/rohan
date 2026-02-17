import { Product, Sale } from '../types';

/**
 * Fetches the current inventory from the Google Sheet.
 * Expects the script to return a JSON list of products.
 */
export const fetchInventoryFromSheet = async (scriptUrl: string): Promise<Product[]> => {
  try {
    // Add cache buster to prevent GitHub Pages from caching the API response
    const url = `${scriptUrl}?t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow', // Important: Follow Google's redirects
    });

    if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}. Ensure permissions are set to 'Anyone' in Google Script.`);
    }
    
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        // If response is HTML (login page), it means permissions are wrong
        if (text.toLowerCase().includes('google') || text.toLowerCase().includes('signin')) {
            throw new Error("Permission Error: Please set Google Script access to 'Anyone'.");
        }
        throw new Error("Invalid JSON response from sheet.");
    }
    
    if (data.status === 'error') throw new Error(data.message);
    
    // Map and validate types
    return Array.isArray(data) ? data.map((item: any) => ({
      id: String(item.id),
      name: String(item.name),
      category: String(item.category),
      wholesalePrice: Number(item.wholesalePrice) || 0,
      retailPrice: Number(item.retailPrice) || 0,
      stock: Number(item.stock) || 0,
      minStockLevel: Number(item.minStockLevel) || 0,
    })) : [];
  } catch (error) {
    console.error("Failed to fetch from sheet", error);
    throw error;
  }
};

/**
 * Sends a sale record and updated inventory to the Google Sheet.
 * Uses 'no-cors' mode to bypass CORS restrictions on Google Apps Script POST requests.
 */
export const syncSaleToSheet = async (scriptUrl: string, sale: Sale, updatedProducts: Product[]) => {
  const payload = JSON.stringify({
    action: 'RECORD_SALE',
    sale: sale,
    inventory: updatedProducts 
  });

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Critical for sending data to GAS without CORS errors
      headers: {
        'Content-Type': 'text/plain', // Avoids preflight OPTIONS request
      },
      body: payload
    });
    // In no-cors mode, we can't check response.ok. We assume success if no network error thrown.
    return true;
  } catch (e) {
    console.error("Sync sale failed", e);
    return false;
  }
};

/**
 * Syncs the entire inventory list to the Google Sheet.
 */
export const syncInventoryToSheet = async (scriptUrl: string, products: Product[]) => {
  const payload = JSON.stringify({
    action: 'UPDATE_INVENTORY',
    inventory: products
  });

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: payload
    });
    return true;
  } catch (e) {
    console.error("Sync inventory failed", e);
    return false;
  }
};