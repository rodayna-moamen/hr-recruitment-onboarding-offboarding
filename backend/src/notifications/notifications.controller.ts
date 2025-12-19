import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Get('history/:recipientId')
  @ApiOperation({ summary: 'Get notification history for a recipient' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved' })
  async getNotificationHistory(
    @Param('recipientId') recipientId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getNotificationHistory(recipientId, limit || 50);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved' })
  async getNotification(@Param('id') id: string) {
    return this.notificationsService.getNotificationById(id);
  }
}

