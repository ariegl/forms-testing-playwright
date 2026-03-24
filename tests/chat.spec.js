import { test, expect } from '@playwright/test';

test.describe('Chat Realtime', () => {
  test('debe enviar y recibir mensajes entre dos usuarios', async ({ browser }) => {
    const timestamp = Date.now();
    const userA_name = `userA_${timestamp}`;
    const userB_name = `userB_${timestamp}`;
    const password = 'password123';

    // 1. Crear Usuario A y loguear
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await registerAndLogin(pageA, userA_name, password);

    // 2. Crear Usuario B y loguear
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await registerAndLogin(pageB, userB_name, password);

    // 3. Usuario A solicita amistad a Usuario B
    await pageA.fill('input[placeholder="User..."]', userB_name);
    await pageA.click('button.btn-primary.btn-xs:has-text("+")');
    
    // 4. Usuario B acepta la solicitud
    await pageB.reload(); 
    const requestPanel = pageB.locator('.card', { hasText: 'Solicitudes' });
    await expect(requestPanel).toBeVisible();
    await requestPanel.locator('button.btn-success').click();
    await expect(requestPanel.locator(`text=${userA_name}`)).not.toBeVisible();

    // 5. Usuario A abre chat y envía mensaje
    await pageA.reload(); 
    const friendItemA = pageA.locator(`[data-testid="friend-item-${userB_name}"]`);
    await expect(friendItemA).toBeVisible();
    await friendItemA.click();
    
    const chatWindowA = pageA.locator(`[data-testid="chat-window-${userB_name}"]`);
    await expect(chatWindowA).toBeVisible();
    
    const inputA = chatWindowA.locator('input[placeholder="Escribe un mensaje..."]');
    await inputA.fill('Hola Usuario B');
    await chatWindowA.locator('button:has-text("🚀")').click();

    // 6. Usuario B verifica que recibe el mensaje
    const friendItemB = pageB.locator(`[data-testid="friend-item-${userA_name}"]`);
    await expect(friendItemB).toBeVisible();
    await friendItemB.click();
    
    const chatWindowB = pageB.locator(`[data-testid="chat-window-${userA_name}"]`);
    await expect(chatWindowB).toBeVisible();
    await expect(chatWindowB.locator('.chat-bubble', { hasText: 'Hola Usuario B' })).toBeVisible();

    // 7. Usuario B responde
    const inputB = chatWindowB.locator('input[placeholder="Escribe un mensaje..."]');
    await inputB.fill('Hola Usuario A, te recibo fuerte y claro');
    await chatWindowB.locator('button:has-text("🚀")').click();

    // 8. Usuario A verifica la respuesta
    await expect(chatWindowA.locator('.chat-bubble', { hasText: 'Hola Usuario A, te recibo fuerte y claro' })).toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});

async function registerAndLogin(page, username, password) {
  await page.goto('http://localhost:5173/signup');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="age"]', '25');
  await page.selectOption('select[name="gender"]', 'male');
  await page.fill('input[name="password"]', password);
  page.once('dialog', dialog => dialog.accept());
  await page.click('button[type="submit"]');
  await page.waitForURL('**/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/home');
}
