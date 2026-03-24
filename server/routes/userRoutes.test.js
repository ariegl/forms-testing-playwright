import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import prisma from '../config/db';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('User Profile Image API Integration', () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user in the actual DB (or test DB if configured)
    testUser = await prisma.user.create({
      data: {
        username: 'testuser_integration',
        age: 30,
        gender: 'other',
        password: 'password123',
        roleId: 5 // Assuming role 5 exists from seed
      }
    });
  });

  afterAll(async () => {
    // Cleanup: Delete the test user and its messages/posts if any
    if (testUser) {
      // First find if there's an image to delete from disk
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { profileImagePath: true }
      });

      if (user?.profileImagePath) {
         const fullPath = path.join(__dirname, '../../', user.profileImagePath);
         if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }

      await prisma.user.delete({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  });

  it('should upload a profile image successfully', async () => {
    const filePath = path.join(__dirname, '../../src/assets/hero.png'); // Using an existing png file as dummy
    
    const response = await request(app)
      .post(`/api/usuarios/${testUser.id}/profile-image`)
      .attach('image', filePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Profile image updated');
    expect(response.body).toHaveProperty('path');
    
    // Verify in Database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    expect(updatedUser.profileImagePath).not.toBeNull();

    // Verify File exists on disk
    const diskPath = path.join(__dirname, '../../', response.body.path);
    expect(fs.existsSync(diskPath)).toBe(true);
  });

  it('should return 400 if no image is attached', async () => {
    const response = await request(app)
      .post(`/api/usuarios/${testUser.id}/profile-image`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No image uploaded');
  });

  it('should return 404 for non-existent user', async () => {
    const filePath = path.join(__dirname, '../../src/assets/hero.png');
    const response = await request(app)
      .post('/api/usuarios/999999/profile-image')
      .attach('image', filePath);

    expect(response.status).toBe(404);
  });
});
