
interface SheetRow {
  [key: string]: string | number;
}

interface BookingSheetRow {
  id: string;
  name: string;
  mobile: string;
  email: string;
  seatNumber: string;
  duration: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  paymentMode?: string;
  paymentDate?: string;
  validTill?: string;
  startDate?: string;
  fromTime?: string;
  toTime?: string;
}

interface UserSheetRow {
  id: string;
  name: string;
  email: string;
  mobile: string;
  seatNumber?: string;
  lastPayment: string;
  expiry: string;
  remainingDays: number;
  isActive: boolean;
  planDetails?: string;
  fromTime?: string;
  toTime?: string;
}

class GoogleSheetsService {
  private apiKey: string = '';
  private spreadsheetId: string = '';
  
  setCredentials(apiKey: string, spreadsheetId: string) {
    this.apiKey = apiKey;
    this.spreadsheetId = spreadsheetId;
  }

  private async makeRequest(endpoint: string) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/${endpoint}?key=${this.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async updateSheet(range: string, values: any[][]) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async appendToSheet(range: string, values: any[][]) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Booking Requests Sheet Methods
  async getBookingRequests(): Promise<BookingSheetRow[]> {
    try {
      const data = await this.makeRequest('values/BookingRequests!A:P');
      const rows = data.values || [];
      
      if (rows.length <= 1) return []; // No data or only headers
      
      return rows.slice(1).map((row: any[], index: number) => ({
        id: row[0] || `req_${index + 1}`,
        name: row[1] || '',
        mobile: row[2] || '',
        email: row[3] || '',
        seatNumber: row[4] || '',
        duration: row[5] || '',
        amount: Number(row[6]) || 0,
        status: row[7] || 'pending',
        submittedAt: row[8] || '',
        paymentMode: row[9] || '',
        paymentDate: row[10] || '',
        validTill: row[11] || '',
        startDate: row[12] || '',
        fromTime: row[13] || '',
        toTime: row[14] || '',
      }));
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      return [];
    }
  }

  async addBookingRequest(booking: Omit<BookingSheetRow, 'id'>): Promise<void> {
    const id = `req_${Date.now()}`;
    const values = [[
      id,
      booking.name,
      booking.mobile,
      booking.email,
      booking.seatNumber,
      booking.duration,
      booking.amount,
      booking.status,
      booking.submittedAt,
      booking.paymentMode || '',
      booking.paymentDate || '',
      booking.validTill || '',
      booking.startDate || '',
      booking.fromTime || '',
      booking.toTime || '',
    ]];
    
    await this.appendToSheet('BookingRequests!A:P', values);
  }

  async updateBookingRequest(id: string, updates: Partial<BookingSheetRow>): Promise<void> {
    const requests = await this.getBookingRequests();
    const index = requests.findIndex(req => req.id === id);
    
    if (index === -1) {
      throw new Error('Booking request not found');
    }
    
    const updated = { ...requests[index], ...updates };
    const values = [[
      updated.id,
      updated.name,
      updated.mobile,
      updated.email,
      updated.seatNumber,
      updated.duration,
      updated.amount,
      updated.status,
      updated.submittedAt,
      updated.paymentMode || '',
      updated.paymentDate || '',
      updated.validTill || '',
      updated.startDate || '',
      updated.fromTime || '',
      updated.toTime || '',
    ]];
    
    await this.updateSheet(`BookingRequests!A${index + 2}:P${index + 2}`, values);
  }

  // Users Sheet Methods
  async getUsers(): Promise<UserSheetRow[]> {
    try {
      const data = await this.makeRequest('values/Users!A:M');
      const rows = data.values || [];
      
      if (rows.length <= 1) return []; // No data or only headers
      
      return rows.slice(1).map((row: any[], index: number) => ({
        id: row[0] || `user_${index + 1}`,
        name: row[1] || '',
        email: row[2] || '',
        mobile: row[3] || '',
        seatNumber: row[4] || '',
        lastPayment: row[5] || '',
        expiry: row[6] || '',
        remainingDays: Number(row[7]) || 0,
        isActive: row[8] === 'true',
        planDetails: row[9] || '',
        fromTime: row[10] || '',
        toTime: row[11] || '',
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async addUser(user: Omit<UserSheetRow, 'id'>): Promise<void> {
    const id = `user_${Date.now()}`;
    const values = [[
      id,
      user.name,
      user.email,
      user.mobile,
      user.seatNumber || '',
      user.lastPayment,
      user.expiry,
      user.remainingDays,
      user.isActive.toString(),
      user.planDetails || '',
      user.fromTime || '',
      user.toTime || '',
    ]];
    
    await this.appendToSheet('Users!A:M', values);
  }

  async updateUser(id: string, updates: Partial<UserSheetRow>): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const updated = { ...users[index], ...updates };
    const values = [[
      updated.id,
      updated.name,
      updated.email,
      updated.mobile,
      updated.seatNumber || '',
      updated.lastPayment,
      updated.expiry,
      updated.remainingDays,
      updated.isActive.toString(),
      updated.planDetails || '',
      updated.fromTime || '',
      updated.toTime || '',
    ]];
    
    await this.updateSheet(`Users!A${index + 2}:M${index + 2}`, values);
  }

  // Setup method to create headers if needed
  async setupSheets(): Promise<void> {
    try {
      // Setup BookingRequests sheet headers
      const bookingHeaders = [
        ['ID', 'Name', 'Mobile', 'Email', 'Seat Number', 'Duration', 'Amount', 'Status', 'Submitted At', 'Payment Mode', 'Payment Date', 'Valid Till', 'Start Date', 'From Time', 'To Time']
      ];
      await this.updateSheet('BookingRequests!A1:P1', bookingHeaders);
      
      // Setup Users sheet headers
      const userHeaders = [
        ['ID', 'Name', 'Email', 'Mobile', 'Seat Number', 'Last Payment', 'Expiry', 'Remaining Days', 'Is Active', 'Plan Details', 'From Time', 'To Time']
      ];
      await this.updateSheet('Users!A1:M1', userHeaders);
      
      console.log('Google Sheets setup completed successfully');
    } catch (error) {
      console.error('Error setting up sheets:', error);
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { BookingSheetRow, UserSheetRow };
