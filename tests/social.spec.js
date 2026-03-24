import { test, expect } from '@playwright/test';

test.describe('Social Features', () => {
  const timestamp = Date.now();
  const username = `user_${timestamp}`;
  const password = 'password123';

  test.beforeEach(async ({ page }) => {
    // 1. Registro
    await page.goto('/signup');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="password"]', password);
    
    // Escuchar el alert de éxito
    page.once('dialog', dialog => dialog.accept());
    await page.click('button[type="submit"]');

    // 2. Login
    await page.waitForURL('**/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home');
  });

  test('debe crear una publicación con texto y emojis', async ({ page }) => {
    // Abrir el editor
    await page.click('button:has-text("+ Nueva Publicación")');
    
    const postText = `Hola a todos! Este es mi primer post ${timestamp}`;
    await page.fill('textarea[placeholder="¿Qué tienes en mente?"]', postText);
    
    // Abrir selector de emojis y elegir uno
    await page.click('button[title="Añadir emoji"]');
    await page.click('button:has-text("🔥")');
    
    await page.click('button:has-text("Publicar")');

    // Verificar que aparece en el feed
    const postCard = page.locator('.card', { hasText: postText });
    await expect(postCard).toBeVisible();
    await expect(postCard).toContainText('🔥');
  });

  test('debe permitir dar y quitar like a una publicación', async ({ page }) => {
    // Primero crear una publicación
    await page.click('button:has-text("+ Nueva Publicación")');
    await page.fill('textarea[placeholder="¿Qué tienes en mente?"]', 'Post para likes');
    await page.click('button:has-text("Publicar")');

    const postCard = page.locator('.card', { hasText: 'Post para likes' }).first();
    const likeButton = postCard.locator('button:has-text("❤")');
    
    // Verificar estado inicial (0 likes)
    await expect(likeButton).toContainText('0');

    // Dar like
    await likeButton.click();
    await expect(likeButton).toContainText('1');

    // Intentar dar like de nuevo (quitar like)
    await likeButton.click();
    await expect(likeButton).toContainText('0');
  });

  test('debe permitir realizar comentarios en una publicación', async ({ page }) => {
    // Primero crear una publicación
    const postContent = `Post para comentar ${timestamp}`;
    await page.click('button:has-text("+ Nueva Publicación")');
    await page.fill('textarea[placeholder="¿Qué tienes en mente?"]', postContent);
    await page.click('button:has-text("Publicar")');

    const postCard = page.locator('.card', { hasText: postContent }).first();
    
    const commentText = `Comentario ${timestamp}`;
    await postCard.locator('input[placeholder="Comentar..."]').fill(commentText);
    await postCard.locator('button:has-text("Enviar")').click();

    // Verificar que el comentario aparece
    const commentList = postCard.locator('div.bg-base-200\\/40');
    await expect(commentList).toBeVisible();
    await expect(commentList.locator('span', { hasText: commentText })).toBeVisible();
  });
});
