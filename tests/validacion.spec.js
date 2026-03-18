import { test, expect } from '@playwright/test';

test('debe validar que los campos son requeridos', async ({ page }) => {
  await page.goto('/');

  // Intentar enviar el formulario vacío
  await page.click('.submit-button');

  // Verificar que el campo nombre tiene el atributo required y no es válido
  const nombreRequerido = await page.$eval('#nombreCompleto', el => el.validity.valueMissing);
  expect(nombreRequerido).toBeTruthy();

  // Rellenar solo el nombre e intentar enviar
  await page.fill('#nombreCompleto', 'Juan Pérez');
  await page.click('.submit-button');

  // Verificar que la edad sigue siendo requerida
  const edadRequerida = await page.$eval('#edad', el => el.validity.valueMissing);
  expect(edadRequerida).toBeTruthy();

  // Rellenar la edad e intentar enviar
  await page.fill('#edad', '30');
  await page.click('.submit-button');

  // Verificar que el sexo sigue siendo requerido
  const sexoRequerido = await page.$eval('#sexo', el => el.validity.valueMissing);
  expect(sexoRequerido).toBeTruthy();

  // Seleccionar el sexo e intentar enviar
  await page.selectOption('#sexo', 'masculino');
  await page.click('.submit-button');

  // Verificar que los términos siguen siendo requeridos
  const terminosRequeridos = await page.$eval('#terminos', el => el.validity.valueMissing);
  expect(terminosRequeridos).toBeTruthy();
});
