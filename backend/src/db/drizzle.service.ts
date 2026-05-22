import { Injectable } from '@nestjs/common';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService {
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle(this.pool);
}