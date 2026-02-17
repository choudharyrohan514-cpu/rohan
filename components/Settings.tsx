import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Save, Link, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';

interface SettingsProps {
  config: AppConfig;
  onUpdateConfig: (c: AppConfig) => void;
  onTestConnection: () => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig, onTestConnection }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    // Auto-fix URL if user pastes the editor link instead of the web app link
    let cleanUrl = localConfig.googleScriptUrl.trim();
    if (cleanUrl.includes('/edit')) {
      cleanUrl = cleanUrl.split('/edit')[0] + '/exec';
    }
    
    const newConfig = { ...localConfig, googleScriptUrl: cleanUrl };
    setLocalConfig(newConfig); // Update local state
    onUpdateConfig(newConfig); // Update app state
    alert('Configuration saved! URL auto-corrected to /exec version.');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Configure your store connection and preferences.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="bg-green-100 p-2 rounded-lg">
            <Link className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Google Sheets Integration</h3>
            <p className="text-sm text-slate-500">Connect your inventory to the cloud.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
             <div>
                <label className="font-medium text-slate-800">Enable Google Sheets Sync</label>
                <p className="text-xs text-slate-500 mt-1">When enabled, use Load/Save buttons in Inventory.</p>
             </div>
             <div 
               className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${localConfig.useGoogleSheets ? 'bg-primary' : 'bg-slate-300'}`}
               onClick={() => setLocalConfig({...localConfig, useGoogleSheets: !localConfig.useGoogleSheets})}
             >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.useGoogleSheets ? 'translate-x-6' : ''}`} />
             </div>
          </div>

          <div className={`space-y-4 transition-all duration-300 ${localConfig.useGoogleSheets ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Google Apps Script Web App URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localConfig.googleScriptUrl}
                  onChange={(e) => setLocalConfig({...localConfig, googleScriptUrl: e.target.value})}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                />
                <button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Paste the URL generated after clicking "Deploy" in Google Scripts.</p>
            </div>

            {localConfig.googleScriptUrl && (
              <div className="flex gap-4">
                 <button 
                   onClick={onTestConnection}
                   className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                 >
                   <ExternalLink className="w-3 h-3" />
                   Test Connection (Load Data)
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Instructions Section */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          How to Setup Google Sheets (Critical for GitHub)
        </h3>
        
        <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-6">
          <li>Create a new <strong>Google Sheet</strong>.</li>
          <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
          <li>Delete everything and paste the code below.</li>
          <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
          <li>Select type: <strong>Web App</strong>.</li>
          <li><strong>CRITICAL STEP:</strong> Set "Who has access" to: <strong>Anyone</strong> (Not "Anyone with Google Account").</li>
          <li>Click Deploy, copy the URL, and paste it above.</li>
        </ol>

        <div className="relative">
          <div className="absolute right-4 top-4">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/20"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed border border-slate-800">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};

const APPS_SCRIPT_CODE = `
// PASTE THIS IN GOOGLE APPS SCRIPT EDITOR
// SETUP: 
// 1. Extensions > Apps Script
// 2. Paste this code
// 3. Deploy > New Deployment > Web App > Who has access: Anyone

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Products');
  
  // Auto-create Products Sheet if missing
  if (!sheet) {
    sheet = ss.insertSheet('Products');
    sheet.appendRow(['ID', 'Name', 'Category', 'Wholesale', 'Retail', 'Stock', 'MinStock']);
    return jsonResponse([]);
  }
  
  // Auto-create Headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Name', 'Category', 'Wholesale', 'Retail', 'Stock', 'MinStock']);
    return jsonResponse([]);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  
  if (data.length === 0) return jsonResponse([]);

  const products = data.map(row => ({
    id: String(row[0]),
    name: String(row[1]),
    category: String(row[2]),
    wholesalePrice: Number(row[3]),
    retailPrice: Number(row[4]),
    stock: Number(row[5]),
    minStockLevel: Number(row[6])
  }));
  
  return jsonResponse(products);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  // Wait for up to 30 seconds for other processes to finish.
  lock.tryLock(30000);

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure Products Sheet Exists
    let productSheet = ss.getSheetByName('Products');
    if (!productSheet) {
      productSheet = ss.insertSheet('Products');
      productSheet.appendRow(['ID', 'Name', 'Category', 'Wholesale', 'Retail', 'Stock', 'MinStock']);
    }

    // Ensure Sales Sheet Exists
    let salesSheet = ss.getSheetByName('Sales');
    if (!salesSheet) {
      salesSheet = ss.insertSheet('Sales');
      salesSheet.appendRow(['ID', 'Date', 'Total', 'ItemsJson']);
    }

    if (data.action === 'UPDATE_INVENTORY') {
      // Clear old data but keep headers
      if (productSheet.getLastRow() > 1) {
        productSheet.getRange(2, 1, productSheet.getLastRow() - 1, 7).clearContent();
      }
      
      if (data.inventory && data.inventory.length > 0) {
        const rows = data.inventory.map(p => [
          p.id, 
          p.name, 
          p.category, 
          p.wholesalePrice, 
          p.retailPrice, 
          p.stock, 
          p.minStockLevel
        ]);
        productSheet.getRange(2, 1, rows.length, 7).setValues(rows);
      }
      return jsonResponse({status: 'success', message: 'Inventory synced'});
    } 
    
    if (data.action === 'RECORD_SALE') {
      salesSheet.appendRow([
        data.sale.id, 
        data.sale.date, 
        data.sale.totalAmount, 
        JSON.stringify(data.sale.items)
      ]);
      
      // Update inventory as well to keep stock in sync
      if (data.inventory && data.inventory.length > 0) {
        // Clear old data but keep headers
        if (productSheet.getLastRow() > 1) {
          productSheet.getRange(2, 1, productSheet.getLastRow() - 1, 7).clearContent();
        }
        
        const rows = data.inventory.map(p => [
          p.id, 
          p.name, 
          p.category, 
          p.wholesalePrice, 
          p.retailPrice, 
          p.stock, 
          p.minStockLevel
        ]);
        productSheet.getRange(2, 1, rows.length, 7).setValues(rows);
      }
      return jsonResponse({status: 'success', message: 'Sale recorded'});
    }
    
    return jsonResponse({status: 'error', message: 'Unknown action'});

  } catch (error) {
    return jsonResponse({status: 'error', message: error.toString()});
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export default Settings;