import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Save, Link, ExternalLink } from 'lucide-react';

interface SettingsProps {
  config: AppConfig;
  onUpdateConfig: (c: AppConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onUpdateConfig(localConfig);
    alert('Configuration saved!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <p className="text-xs text-slate-500 mt-1">When enabled, data is fetched from your deployed Script.</p>
             </div>
             <div 
               className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${localConfig.useGoogleSheets ? 'bg-primary' : 'bg-slate-300'}`}
               onClick={() => setLocalConfig({...localConfig, useGoogleSheets: !localConfig.useGoogleSheets})}
             >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.useGoogleSheets ? 'translate-x-6' : ''}`} />
             </div>
          </div>

          <div className={`space-y-2 transition-opacity ${localConfig.useGoogleSheets ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <label className="block text-sm font-medium text-slate-700">Google Apps Script Web App URL</label>
            <input
              type="text"
              value={localConfig.googleScriptUrl}
              onChange={(e) => setLocalConfig({...localConfig, googleScriptUrl: e.target.value})}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              <span>Deploy your Google Sheet as a Web App to get this URL.</span>
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
            <button 
                onClick={handleSave}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium shadow-sm shadow-primary/30 flex items-center gap-2 transition-all active:scale-95"
            >
                <Save className="w-4 h-4" />
                Save Settings
            </button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>Note:</strong> In this demo version, data is stored in your browser's local storage. Entering a URL above mimics the setup for a backend connection but assumes a specific JSON response structure from your Google Script.
      </div>
    </div>
  );
};

export default Settings;