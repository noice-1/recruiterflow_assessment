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
  test('Scenario 6: GET /api/users?page=2 returns 200, data array, and required user fields', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_API_URL}/api/users?page=2`, {
      headers: {
        Accept: 'application/json',
      },
    });

    // 1. Verify status 200
    expect(response.status()).toBe(200);

    const body: UsersListResponse = await response.json();

    // 2. Verify response includes a "data" array
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // 3. Verify each user object contains id, email, first_name, and last_name
    for (const user of body.data) {
      expect(user).toHaveProperty('id');
      expect(typeof user.id).toBe('number');

      expect(user).toHaveProperty('email');
      expect(typeof user.email).toBe('string');
      expect(user.email).toContain('@');

      expect(user).toHaveProperty('first_name');
      expect(typeof user.first_name).toBe('string');
      expect(user.first_name.trim().length).toBeGreaterThan(0);

      expect(user).toHaveProperty('last_name');
      expect(typeof user.last_name).toBe('string');
      expect(user.last_name.trim().length).toBeGreaterThan(0);
    }
  });

  test('Scenario 7: POST /api/users returns 201 and echoes payload with id & createdAt', async ({
    request,
  }) => {
    const payload: CreateUserPayload = {
      name: 'morpheus',
      job: 'leader',
    };

    const response = await request.post(`${BASE_API_URL}/api/users`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: payload,
    });

    // 1. Verify status 201 Created
    expect(response.status()).toBe(201);

    const body: CreateUserResponse = await response.json();

    // 2. Verify response echoes name and job
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);

    // 3. Verify id and createdAt timestamp are present
    expect(body).toHaveProperty('id');
    expect(body.id).toBeTruthy();

    expect(body).toHaveProperty('createdAt');
    const parsedDate = new Date(body.createdAt);
    expect(!isNaN(parsedDate.getTime())).toBe(true);
  });

  test('Scenario 8 (Bonus): Chain POST with follow-up assertion (Create-then-Verify flow)', async ({
    request,
  }) => {
    const userPayload: CreateUserPayload = {
      name: 'neo',
      job: 'the-one',
    };

    // Step 1: Create user via POST
    const createResponse = await request.post(`${BASE_API_URL}/api/users`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: userPayload,
    });

    expect(createResponse.status()).toBe(201);
    const createdUser: CreateUserResponse = await createResponse.json();

    // Verify response attributes
    expect(createdUser.name).toBe(userPayload.name);
    expect(createdUser.job).toBe(userPayload.job);
    expect(createdUser.id).toBeDefined();

    // Step 2: Demonstrate create-then-verify pattern
    // In a persistent database, we would query: GET /api/users/${createdUser.id}
    // ReqRes is a stateless mock API and does not persist created records.
    // We demonstrate the follow-up flow by querying the created user ID and asserting
    // the mock API's documented behavior (returns 404 for non-persisted user id) while
    // validating our extracted state:
    const followUpResponse = await request.get(`${BASE_API_URL}/api/users/${createdUser.id}`);
    expect(followUpResponse.status()).toBe(404);

    // Complementary verification: Fetch an existing user (e.g. ID 2) to verify contract consistency
    const existingUserResponse = await request.get(`${BASE_API_URL}/api/users/2`);
    expect(existingUserResponse.status()).toBe(200);
    const existingUserData = await existingUserResponse.json();
    expect(existingUserData.data.id).toBe(2);
  });
});
