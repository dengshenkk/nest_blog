import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Column } from 'typeorm';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import { ColumnWithWidthOptions } from 'typeorm/decorator/options/ColumnWithWidthOptions';

// export function Timestamp() {
//   console.trace('msg: ');
// }

/**
 *
 Unable to resolve signature of property decorator when called as an expression.   This expression is not callable.     Type 'void' has no call signatures
 */

export const Timestamp1 = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Timestamp = (
  options?: ColumnCommonOptions & ColumnWithWidthOptions,
) => {
  console.log('options: ', options);

  function now() {
    console.log('Date.now(): ', Date.now());
  }

  return applyDecorators(Column(), now);
};
