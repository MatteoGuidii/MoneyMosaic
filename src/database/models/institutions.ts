import { DatabaseConnection } from '../connection';

export class InstitutionsModel {
  constructor(private db: DatabaseConnection) {}

  async saveInstitution(data: {
    institution_id: string;
    name: string;
    access_token: string;
    item_id: string;
  }): Promise<void> {
    await this.db.run(`
      INSERT OR REPLACE INTO institutions 
      (institution_id, name, access_token, item_id, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [data.institution_id, data.name, data.access_token, data.item_id]);
  }

  async getInstitutions(): Promise<any[]> {
    return this.db.all(`
      SELECT * FROM institutions 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `);
  }

  async getInstitutionByAccessToken(access_token: string): Promise<any> {
    return this.db.get(`
      SELECT * FROM institutions 
      WHERE access_token = ? AND is_active = 1
    `, [access_token]);
  }

  async getInstitutionById(id: number): Promise<any> {
    return this.db.get(`
      SELECT * FROM institutions 
      WHERE id = ? AND is_active = 1
    `, [id]);
  }

  async deactivateInstitution(id: number): Promise<void> {
    await this.db.run(`
      UPDATE institutions 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);
  }

  async deleteInstitution(id: number): Promise<void> {
    await this.db.run(`
      DELETE FROM institutions WHERE id = ?
    `, [id]);
  }
}
