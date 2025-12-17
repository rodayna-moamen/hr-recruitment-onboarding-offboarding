import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
async function bootstrap() {
  console.log("BACKEND DB URI =>", process.env.MONGO_URI);

  const app = await NestFactory.create(AppModule);

  // Allow the frontend (Next.js) to call the API from localhost
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ---- SWAGGER SETUP ----
  const config = new DocumentBuilder()
    .setTitle('Employee Profile API')
    .setDescription('API documentation for Employee Profile, Change Requests, Disputes, and Manager Views')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
   // ---- START APPLICATION ----
  await app.listen(process.env.PORT || 3000);

  console.log("USING DB URI:", process.env.MONGO_URI);
 console.log(`Swagger running at http://localhost:${process.env.PORT || 3000}/api ✅`);
  dotenv.config();
}

bootstrap();
