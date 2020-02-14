import request from 'request';
import { DirectusService } from '../src/directus-service';

// Check wether we are in CI or at home
// const host = process.env.GITHUB_ACTIONS ? 'directus' : 'localhost';
const host = 'localhost';
const port = 8080;

export function serverURL(): string {
  return `http://${host}:${port}`;
}

export const testDirectusService = new DirectusService({
  url: serverURL(),
  auth: {
    email: 'admin@example.com',
    password: 'password',
  },
  project: '_',
});

describe('Server', () => {
  it('should reponse on a ping request', async done => {
    request(`${serverURL()}/server/ping`, (err, res, body) => {
      expect(err).toBeNull();
      expect(body).toMatch(/.*pong.*/);
      done();
    });
    done();
  });
});
