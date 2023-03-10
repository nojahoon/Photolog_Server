import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/httpException.filter';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { setupSwagger } from './middlewares/swagger';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true }); // TODO: prod 환경일때 변경
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new SuccessInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  setupSwagger(app);
  app.use(cookieParser());
  await app.listen(process.env.PORT);
}
bootstrap();
