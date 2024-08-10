// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { DatabaseService } from './database.service';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import mongoose from 'mongoose';
// mongoose.set('debug', true);
//
// @Module({
//   imports: [
//     MongooseModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => {
//         const uri = configService.get<string>('DB_CONNECTION_STRING');
//         console.log(`Connecting to MongoDB with URI: ${uri}`); // 打印连接字符串
//         mongoose.set('debug', true);
//         try {
//           return { uri };
//         } catch (error) {
//           console.error('Mongoose connection error:', error);
//           throw error; // 重新抛出错误，确保应用程序可以捕捉到
//         }
//       },
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [DatabaseService],
//   exports: [DatabaseService],
// })
// export class DatabaseModule {}


import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CONNECTION_STRING'),
        console: configService.get<boolean>('DB_DEBUG'),
        // console: configService.get<boolean>('DB_DEBUG', true),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
