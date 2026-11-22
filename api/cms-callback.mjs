import authenticate from './cms-auth.mjs';

export default function handler(req, res) {
  return authenticate(req, res, true);
}
