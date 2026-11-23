import { expect, type Locator, type Page } from "@playwright/test";

/** Page object: city map (/map) and home dashboard (/). */
export class MapPage {
  readonly page: Page;
  readonly mapContainer: Locator;
  readonly count: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapContainer = page.getByTestId("map-container");
    this.count = page.getByTestId("map-count");
  }

  async goto() {
    await this.page.goto("/map");
    await expect(this.page.getByRole("heading", { name: "City map" })).toBeVisible();
    await expect(this.mapContainer).toBeVisible();
  }

  async filterBy(category: string) {
    await this.page.getByTestId(`filter-${category}`).click();
  }
}

/** Page object: sign in / register (/login). */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-submit");
    this.error = page.getByTestId("login-error");
  }

  async goto() {
    await this.page.goto("/login");
    await expect(this.page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
