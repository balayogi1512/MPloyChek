import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { RecordService } from '../core/services/record.service';
import { VerificationRecord, RecordStatus } from '../core/models/record.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  public authService = inject(AuthService);
  private recordService = inject(RecordService);
  private router = inject(Router);

  // State management using Angular Signals
  records = signal<VerificationRecord[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Record Inspector / Status Editor Modal
  selectedRecord = signal<VerificationRecord | null>(null);
  isDetailModalOpen = signal<boolean>(false);
  isUpdatingRecord = signal<boolean>(false);
  editStatus = signal<RecordStatus>('Verified');
  editRiskScore = signal<number>(0);
  editNotes = signal<string>('');
  feedbackToast = signal<string | null>(null);

  // Search & Filter state
  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  // Simulated Delay Control (Parameter mechanism per challenge specification)
  selectedDelayMs = signal<number>(1000); // Default to 1000ms to demonstrate async processing immediately
  elapsedLoadTime = signal<number>(0);
  private timerInterval: any = null;

  // Active user signal from AuthService
  get currentUser() {
    return this.authService.currentUser;
  }

  // Computed signal to filter records dynamically based on search term & status
  filteredRecords = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filter = this.statusFilter();
    
    return this.records().filter((record) => {
      const matchesSearch =
        !term ||
        record.candidateName.toLowerCase().includes(term) ||
        record.position.toLowerCase().includes(term) ||
        record.checkType.toLowerCase().includes(term) ||
        record.id.toLowerCase().includes(term);

      const matchesStatus =
        filter === 'ALL' || record.status.toUpperCase() === filter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  });

  constructor() {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.elapsedLoadTime.set(0);

    const startTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedLoadTime.set(Math.round(Date.now() - startTime));
    }, 50);

    this.recordService.getRecords(user.role, this.selectedDelayMs()).subscribe({
      next: (response) => {
        clearInterval(this.timerInterval);
        this.elapsedLoadTime.set(Date.now() - startTime);
        this.isLoading.set(false);

        if (response.success) {
          this.records.set(response.data);
        } else {
          this.errorMessage.set('Failed to retrieve verification records.');
        }
      },
      error: (err) => {
        clearInterval(this.timerInterval);
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Server error while fetching records. Ensure backend is running.'
        );
      },
    });
  }

  onDelayChange(newDelay: number): void {
    this.selectedDelayMs.set(newDelay);
    this.loadRecords();
  }

  openRecordModal(record: VerificationRecord): void {
    this.selectedRecord.set(record);
    this.editStatus.set(record.status);
    this.editRiskScore.set(record.riskScore);
    this.editNotes.set(record.notes);
    this.isDetailModalOpen.set(true);
  }

  closeRecordModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedRecord.set(null);
    this.isUpdatingRecord.set(false);
  }

  setStatusPreset(status: RecordStatus): void {
    this.editStatus.set(status);
    if (status === 'Verified' && this.editRiskScore() > 15) {
      this.editRiskScore.set(2);
    } else if (status === 'Flagged' && this.editRiskScore() < 60) {
      this.editRiskScore.set(80);
    } else if (status === 'Pending Review' && this.editRiskScore() < 10) {
      this.editRiskScore.set(18);
    }
  }

  saveRecordUpdate(): void {
    const record = this.selectedRecord();
    if (!record) return;

    this.isUpdatingRecord.set(true);
    const verifierName = this.currentUser()?.name || 'Verified Admin';

    this.recordService
      .updateRecord(record.id, {
        status: this.editStatus(),
        riskScore: Number(this.editRiskScore()),
        notes: this.editNotes(),
        verifiedBy: verifierName,
      })
      .subscribe({
        next: (res) => {
          this.isUpdatingRecord.set(false);
          if (res.success && res.data) {
            const updatedList = this.records().map((r) =>
              r.id === record.id ? res.data : r
            );
            this.records.set(updatedList);
            this.closeRecordModal();
            this.showToast(`Updated verification for ${record.candidateName} to "${this.editStatus()}".`);
          }
        },
        error: (err) => {
          this.isUpdatingRecord.set(false);
          alert(err.error?.message || 'Failed to update record.');
        },
      });
  }

  private showToast(msg: string): void {
    this.feedbackToast.set(msg);
    setTimeout(() => {
      this.feedbackToast.set(null);
    }, 4500);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
