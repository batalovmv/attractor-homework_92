import { Action } from "routing-controllers";
import { UserRepository } from "../repositories/user.repository";

export const currentUserChecker = async (action: Action) => {
  const header = action.request.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer') return null;
  const user = await UserRepository.findOne({ where: { token: token } });
  return user || null;
};