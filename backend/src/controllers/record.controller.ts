import { Request, Response } from 'express';
import { DbService } from '../services/db.service.js';

export class RecordController {
  static async getRecords(req: Request, res: Response): Promise<void> {
    const delayParam = req.query['delay'] as string | undefined;
    const roleParam = req.query['role'] as string | undefined;

    if (delayParam) {
      const delayMs = parseInt(delayParam, 10);
      if (!isNaN(delayMs) && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const allRecords = await DbService.getRecords();

    let filteredRecords = allRecords;
    if (roleParam === 'General User') {
      filteredRecords = allRecords.filter((rec) => rec.accessLevel === 'General');
    }

    res.status(200).json({
      success: true,
      totalCount: filteredRecords.length,
      data: filteredRecords,
      appliedDelayMs: delayParam ? parseInt(delayParam, 10) : 0,
      userRoleFilter: roleParam || 'All',
    });
  }

  static async updateRecord(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, riskScore, notes, verifiedBy } = req.body;

    const allRecords = await DbService.getRecords();
    const existing = allRecords.find((r) => r.id === id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: `Record '${id}' not found.`,
      });
      return;
    }

    const updates: Record<string, any> = {};
    if (status) updates['status'] = status;
    if (typeof riskScore === 'number') updates['riskScore'] = riskScore;
    if (notes !== undefined) updates['notes'] = notes;

    const editorName = verifiedBy || 'Compliance Officer';
    const timestamp = new Date().toISOString();

    if (status === 'Verified' || status === 'Flagged') {
      updates['verifiedBy'] = editorName;
    } else if (status === 'Pending Review') {
      updates['verifiedBy'] = 'Pending';
    }

    updates['lastModifiedBy'] = editorName;
    updates['lastModifiedAt'] = timestamp;

    const previousStatus = existing.status;
    const newStatus = status || existing.status;
    const auditEntry = {
      timestamp,
      editorName,
      action:
        previousStatus !== newStatus
          ? `Status updated from "${previousStatus}" to "${newStatus}"`
          : `Risk index and notes updated`,
      previousStatus,
      newStatus,
      notes: notes !== undefined ? notes : existing.notes,
    };

    updates['auditLog'] = [...(existing.auditLog || []), auditEntry];

    const updated = await DbService.updateRecord(id, updates);

    res.status(200).json({
      success: true,
      message: `Record '${id}' updated successfully.`,
      data: updated,
    });
  }
}
