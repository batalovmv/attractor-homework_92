import { Action } from 'routing-controllers';
import { UserRepository } from '../repositories/user.repository';

export const authorizationChecker = async (action: Action, roles: string[]) => {
  const header = action.request.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer') return false;

  const user = await UserRepository.findOne({ where: { token: token } });
  return !!user;
};