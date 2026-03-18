import { test, expect } from '@playwright/test';

test('debe registrar un usuario correctamente', async ({ page }) => {
  await page.goto('/');

  // Rellenar el nombre completo
  await page.fill('#nombreCompleto', 'Juan Pérez');

  // Rellenar la edad
  await page.fill('#edad', '25');

  // Seleccionar el sexo
  await page.selectOption('#sexo', 'masculino');

  // Marcar los términos y condiciones
  await page.check('#terminos');

  // Capturar el log de consola para verificar el envío
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(msg.text()));

  // Enviar el formulario
  await page.click('.submit-button');

  // Verificar que el log contiene los datos correctos
  expect(consoleMessages.some(msg => msg.includes('Juan Pérez'))).toBeTruthy();
  expect(consoleMessages.some(msg => msg.includes('25'))).toBeTruthy();
  expect(consoleMessages.some(msg => msg.includes('masculino'))).toBeTruthy();
});
