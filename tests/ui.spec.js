import { test, expect } from '@playwright/test';

test.describe('Interfaz y Configuración', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('debe cambiar entre modo claro y oscuro', async ({ page }) => {
    const html = page.locator('html');
    
    // El tema por defecto es light
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Hacer click en el botón de tema
    await page.click('button[aria-label="Toggle Theme"]');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Volver a light
    await page.click('button[aria-label="Toggle Theme"]');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('debe cambiar el idioma de la interfaz', async ({ page }) => {
    const languageSelector = page.locator('select.select-bordered');
    const loginTitle = page.locator('h2');

    // Por defecto en Español (o según el navegador, pero asumimos el selector)
    await languageSelector.selectOption('es');
    await expect(loginTitle).toHaveText('Iniciar Sesión');

    // Cambiar a Inglés
    await languageSelector.selectOption('en');
    await expect(loginTitle).toHaveText('Login');

    // Verificar que otros textos cambien (ej. botón de registro)
    await expect(page.locator('.btn-secondary:has-text("Register")')).toBeVisible();
  });
});
