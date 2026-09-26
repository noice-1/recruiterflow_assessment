import { test, expect } from '@playwright/test';

const BASE_API_URL = 'https://reqres.in';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface UsersListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

interface CreateUserPayload {
  name: string;
  job: string;
}

interface CreateUserResponse {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

test.describe('ReqRes - Users API Tests', () => {
  test(
    'Scenario 6: GET /api/users?page=2 returns 200, data array, and required user fields',
    async ({ request }) => {
      const response = await request.get(BASE_API_URL + '/api/users?page=2', {
        headers: { Accept: 'application/json' },
      });

      // 1. Status 200
      expect(response.status()).toBe(200);

      const body: UsersListResponse = await response.json();

      // 2. data is a non-empty array
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // 3. Each user object carries the required fields with correct types
      for (const user of body.data) {
        expect(typeof user.id).toBe('number');
        expect(typeof user.email).toBe('string');
        expect(user.email).toContain('@');
        expect(user.first_name.trim().length).toBeGreaterThan(0);
        expect(user.last_name.trim().length).toBeGreaterThan(0);
      }
    }
  );

  test(
    'Scenario 7: POST /api/users returns 201 and echoes payload with id and createdAt',
    async ({ request }) => {
      const payload: CreateUserPayload = { name: 'morpheus', job: 'leader' };

      const response = await request.post(BASE_API_URL + '/api/users', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: payload,
      });

      // 1. Status 201 Created
      expect(response.status()).toBe(201);

      const body: CreateUserResponse = await response.json();

      // 2. Response echoes the sent payload
      expect(body.name).toBe(payload.name);
      expect(body.job).toBe(payload.job);

      // 3. Server-generated id and createdAt are present and valid
      expect(body.id).toBeTruthy();
      expect(new Date(body.createdAt).getTime()).not.toBeNaN();
    }
  );

  test(
    'Scenario 8 (Bonus): Demonstrate a create-then-verify flow',
    async ({ request }) => {
      const payload: CreateUserPayload = { name: 'neo', job: 'the-one' };

      // Step 1: Create a user and capture the returned resource data.
      const createResponse = await request.post(BASE_API_URL + '/api/users', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: payload,
      });

      expect(createResponse.status()).toBe(201);

      const created: CreateUserResponse = await createResponse.json();

      // Verify the create response is well-formed before chaining.
      expect(created.name).toBe(payload.name);
      expect(created.job).toBe(payload.job);
      expect(created.id).toBeTruthy();
      expect(new Date(created.createdAt).getTime()).not.toBeNaN();

      // Step 2: Chain - verify the created resource can be read back.
      //
      // ReqRes is a stateless mock: it does not persist POST data, so a
      // real GET on the returned id will 404. In production you would do:
      //
      //   const getResponse = await request.get(BASE_API_URL + '/api/users/' + created.id);
      //   expect(getResponse.status()).toBe(200);
      //   const fetched = await getResponse.json();
      //   expect(fetched.data.id).toBe(Number(created.id));
      //
      // Instead, we verify against a known-good user (id=2) to demonstrate
      // the assertion pattern without relying on ephemeral data.
      const knownUserResponse = await request.get(BASE_API_URL + '/api/users/2');
      expect(knownUserResponse.status()).toBe(200);

      const knownUser = await knownUserResponse.json();
      expect(typeof knownUser.data.id).toBe('number');
      expect(typeof knownUser.data.email).toBe('string');
      expect(knownUser.data.email).toContain('@');
    }
  );
});
