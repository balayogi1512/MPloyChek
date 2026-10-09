import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordsApiResponse } from '../models/record.model';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetches verification records from backend.
   * @param role User's active role ('Admin' or 'General User') to filter records
   * @param delayMs Optional latency delay in milliseconds to demonstrate asynchronous processing
   */
  getRecords(role?: string, delayMs: number = 0): Observable<RecordsApiResponse> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    if (delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }

    return this.http.get<RecordsApiResponse>(`${this.API_URL}/records`, { params });
  }

  /**
   * Updates an existing verification record's status, risk score, or notes
   */
  updateRecord(
    id: string,
    updates: {
      status?: string;
      riskScore?: number;
      notes?: string;
      verifiedBy?: string;
    }
  ): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.API_URL}/records/${id}`,
      updates
    );
  }
}
