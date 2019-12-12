// There's a chance things will need access to the auth module

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserIdentity } from '@libero/auth-token';

// TODO: Remove
export interface User {
    userId: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(private readonly jwtService: JwtService) {}
    // - To look up the user from here, we need to inject the UserService
    // The input to this function needs to be the jwt token object
    async validateUser(tokenObj: UserIdentity): Promise<User | null> {
        this.logger.log(`[TODO] validateUser ${tokenObj}`);
        // This needs something to look up the user id (some kind of auth service/users table etc)
        // This is a thing that's meant to get a user and return it
        return null;
    }
}
