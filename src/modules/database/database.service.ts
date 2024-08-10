import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.logger.log('Initializing database connection...');
    if (this.connection.readyState === 1) {
      this.logger.log('Database connection established successfully (already open).');
    } else {
      this.connection.once('open', () => {
        this.logger.log('Database connection established successfully');
      });
    }

    this.connection.on('error', (error) => {
      this.logger.error('Database connection error', error);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('Database connection lost');
    });
  }
}
