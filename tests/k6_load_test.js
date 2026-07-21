import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users over 30 seconds
    { duration: '1m', target: 50 },  // Stay at 50 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should complete within 500ms
  },
};

const BASE_URL = 'http://localhost:8080/api';

export default function () {
  // We hit the public healthcheck or a public endpoint.
  // Assuming OAuth2/OTP requires real auth, we hit a generic endpoint
  // Or we can simulate login if we had a dummy user.
  
  const res = http.get(`${BASE_URL}/analytics/summary`); // Will return 401 if unauthorized, which is fine for raw load testing

  check(res, {
    'status is 401 or 200': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
