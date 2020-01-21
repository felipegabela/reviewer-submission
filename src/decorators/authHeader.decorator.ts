import { createParamDecorator } from '@nestjs/common';

export const AuthHeader = createParamDecorator(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (data, [root, args, ctx, info]) => ctx.req.get('authorization'),
);
