import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, VerificationRecord } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');
const RECORDS_FILE = path.join(__dirname, '../data/records.json');

export class DbService {
  static async getUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data) as User[];
    } catch (error) {
      console.error('Error reading users.json:', error);
      return [];
    }
  }

  static async saveUsers(users: User[]): Promise<void> {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  static async getRecords(): Promise<VerificationRecord[]> {
    try {
      const data = await fs.readFile(RECORDS_FILE, 'utf-8');
      return JSON.parse(data) as VerificationRecord[];
    } catch (error) {
      console.error('Error reading records.json:', error);
      return [];
    }
  }

  static async saveRecords(records: VerificationRecord[]): Promise<void> {
    await fs.writeFile(RECORDS_FILE, JSON.stringify(records, null, 2), 'utf-8');
  }

  static async updateRecord(id: string, updates: Partial<VerificationRecord>): Promise<VerificationRecord | null> {
    const records = await this.getRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...updates,
      id: records[index].id,
    };
    await this.saveRecords(records);
    return records[index];
  }

  static async findUserByUserId(identifier: string): Promise<User | undefined> {
    const users = await this.getUsers();
    const term = identifier.trim().toLowerCase();
    return users.find(
      (u) =>
        u.userId.toLowerCase() === term ||
        (u.username && u.username.toLowerCase() === term) ||
        u.email.toLowerCase() === term ||
        u.name.toLowerCase() === term ||
        u.name.toLowerCase().startsWith(term)
    );
  }

  static async addUser(newUser: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = await this.getUsers();
    const id = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const user: User = {
      ...newUser,
      id,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await this.saveUsers(users);
    return user;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      id: users[index].id,
    };
    await this.saveUsers(users);
    return users[index];
  }

  static async deleteUser(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;

    await this.saveUsers(filtered);
    return true;
  }
}
