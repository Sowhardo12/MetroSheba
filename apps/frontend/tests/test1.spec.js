import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Join Now' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Sadia Afrin');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('sadia@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('111Ab??*&');
  await page.getByRole('button', { name: 'Register' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  //taking to login page
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('sadia@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('111Ab??*&');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'View Metro Map' }).click();
  await page.getByRole('button').nth(5).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: '+ Top Up' }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('123456');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('300');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Authorize Transfer' }).click();
  await page.getByRole('heading', { name: 'Buy QR Ticket' }).click();
  await page.getByRole('combobox').first().selectOption('1');
  await page.getByRole('combobox').nth(1).selectOption('5');
  await page.getByRole('button', { name: 'Pay with Wallet' }).click();
  await page.getByRole('button', { name: 'Return to Dashboard' }).click();
  await page.getByText('Buy QR TicketInstant 1-hour').click();
  await page.getByRole('combobox').first().selectOption('2');
  await page.getByRole('combobox').nth(1).selectOption('8');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Pay with Wallet' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByText('Report or claim items').click();
  await page.getByRole('textbox', { name: 'Item Name (e.g., Wallet,' }).click();
  await page.getByRole('textbox', { name: 'Item Name (e.g., Wallet,' }).fill('Iphone12');
  await page.getByRole('textbox', { name: 'Description (Color, Brand,' }).click();
  await page.getByRole('textbox', { name: 'Description (Color, Brand,' }).fill('silver ash');
  await page.getByRole('combobox').selectOption('2');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Submit Report' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('textbox', { name: 'Ask about landmarks or' }).click();
  await page.getByRole('textbox', { name: 'Ask about landmarks or' }).fill('I want to go to Dhaka University');
  await page.locator('form').getByRole('button').click();
  await page.getByRole('button').nth(3).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});