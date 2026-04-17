import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Join Now' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Rumman');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('rumman14@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('1234aA//*');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Register' }).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('rumman14@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('1234aA//*');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: '+ Top Up' }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('123456');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('56');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Authorize Transfer' }).click();
  await page.getByText('Buy QR TicketInstant 1-hour').click();
  await page.getByRole('combobox').first().selectOption('1');
  await page.getByRole('combobox').nth(1).selectOption('5');
  await page.getByRole('button', { name: 'Pay with Wallet' }).click();
  await page.getByRole('button', { name: 'Return to Dashboard' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('rumman14@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('1234aA//*');
  await page.getByText('EmailPasswordLogin').click();
  await page.getByRole('button', { name: 'Login' }).click();
});