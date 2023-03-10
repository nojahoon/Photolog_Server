import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';

interface JwtPayload {
  id: number;
}
@Injectable()
export class UserInjectMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}
  // 요청에 토큰이 있을 경우 req.user에 id, 없거나 유효하지 않으면 null 심어져서 다음으로 넘어감.

  public async use(req: Request, res: Response, next: () => void) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const payload = jwt.verify(
          token,
          process.env.ACCESS_SECRET,
        ) as JwtPayload;

        req.user = await this.usersService.findById(payload.id);
        return next();
      } catch {
        // 만료된 토큰이 요청되었을 때
        req.user = null;
        return next();
      }
    }
    req.user = null;
    return next();
  }
}
