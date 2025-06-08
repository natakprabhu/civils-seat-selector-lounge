
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';
import { Settings, Key, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleSheetsConfigProps {
  onConfigured: (configured: boolean) => void;
}

const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({ onConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if credentials are already stored
    const storedApiKey = localStorage.getItem('google_sheets_api_key');
    const storedSpreadsheetId = localStorage.getItem('google_sheets_spreadsheet_id');
    
    if (storedApiKey && storedSpreadsheetId) {
      setApiKey(storedApiKey);
      setSpreadsheetId(storedSpreadsheetId);
      googleSheetsService.setCredentials(storedApiKey, storedSpreadsheetId);
      setIsConfigured(true);
      onConfigured(true);
    }
  }, [onConfigured]);

  const handleSaveConfiguration = async () => {
    if (!apiKey.trim() || !spreadsheetId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both API key and Spreadsheet ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Test the configuration
      googleSheetsService.setCredentials(apiKey, spreadsheetId);
      
      // Try to setup the sheets
      await googleSheetsService.setupSheets();
      
      // Save to localStorage
      localStorage.setItem('google_sheets_api_key', apiKey);
      localStorage.setItem('google_sheets_spreadsheet_id', spreadsheetId);
      
      setIsConfigured(true);
      onConfigured(true);
      
      toast({
        title: "Configuration Saved",
        description: "Google Sheets integration is now active",
      });
    } catch (error) {
      console.error('Configuration error:', error);
      toast({
        title: "Configuration Error",
        description: "Failed to connect to Google Sheets. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_sheets_api_key');
    localStorage.removeItem('google_sheets_spreadsheet_id');
    setApiKey('');
    setSpreadsheetId('');
    setIsConfigured(false);
    onConfigured(false);
    
    toast({
      title: "Disconnected",
      description: "Google Sheets integration has been disabled",
    });
  };

  return (
    <Card className="dashboard-card max-w-2xl mx-auto">
      <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Google Sheets Configuration
          {isConfigured && <CheckCircle className="w-5 h-5 text-green-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!isConfigured ? (
          <>
            <Alert className="border-slate-600 bg-slate-800/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-slate-300">
                To use Google Sheets as your database, you need to:
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create a Google Cloud Project and enable the Sheets API</li>
                  <li>Generate an API key with Sheets API access</li>
                  <li>Create a Google Spreadsheet and copy its ID</li>
                  <li>Make sure the spreadsheet is publicly readable</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Google Sheets API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Google Sheets API key"
                    className="bg-slate-800 border-slate-600 text-white pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Spreadsheet ID
                </label>
                <div className="relative">
                  <FileSpreadsheet className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Enter your Google Spreadsheet ID"
                    className="bg-slate-800 border-slate-600 text-white pl-10"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Found in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
                </p>
              </div>

              <Button 
                onClick={handleSaveConfiguration}
                disabled={isLoading}
                className="w-full bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
              >
                {isLoading ? 'Connecting...' : 'Save Configuration'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-600 bg-green-800/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Google Sheets integration is active and ready to use.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-slate-400">Connected Spreadsheet ID:</p>
              <p className="text-white font-mono text-sm bg-slate-800 p-2 rounded border border-slate-600">
                {spreadsheetId}
              </p>
            </div>

            <Button 
              onClick={handleDisconnect}
              variant="outline"
              className="w-full border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
            >
              Disconnect Google Sheets
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsConfig;
