import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './employee-profile/auth/auth.module';
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';

import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { NotificationsModule } from './notifications/notifications.module';

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      useFactory: () => {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hr_system';
        console.log('📦 Connecting to MongoDB...');
        const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'); // Hide password
        console.log('   URI:', maskedUri);
        return {
          uri: mongoUri,
          serverSelectionTimeoutMS: 10000, // 10 second timeout
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000, // 10 second connection timeout
        };
      },
    }),
    
    AuthModule,

    // Load everything else first
    TimeManagementModule,
    NotificationsModule,
    RecruitmentModule,
    LeavesModule,
    PayrollExecutionModule,
    PayrollConfigurationModule,
    PayrollTrackingModule,
    EmployeeProfileModule,
    PerformanceModule,

    // Load OrganizationStructureModule LAST
    // so that Department schema is guaranteed to be registered
    OrganizationStructureModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController],
  providers: [
    
    AppService],
})
export class AppModule {}
