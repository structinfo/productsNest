import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { getDatabaseConfig } from './config/database.config';
import { validateEnv } from './config/env.validation';
import { ProductsModule } from './products/products.module';
import { Product } from './products/models/product.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = getDatabaseConfig(configService);
        const shouldSynchronize = configService.get<string>('DB_SYNCHRONIZE') === 'true';

        return {
          ...db,
          models: [Product], // list models explicitly
          autoLoadModels: false,
          synchronize: shouldSynchronize, // used by e2e tests
          logging: false,
        };
      },
    }),
    ProductsModule,
  ],
})
export class AppModule {}
