import { expect, type Locator, type Page } from "@playwright/test";

/** Page object: admin dashboard (/admin). */
export class AdminPage {
  readonly page: Page;
  readonly queue: Locator;
  readonly statusSelect: Locator;
  readonly remarksInput: Locator;
  readonly reasonInput: Locator;
  readonly updateButton: Locator;
  readonly message: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.queue = page.getByTestId("admin-queue");
    this.statusSelect = page.getByTestId("admin-status-select");
    this.remarksInput = page.getByTestId("admin-remarks");
    this.reasonInput = page.getByTestId("admin-reason");
    this.updateButton = page.getByTestId("admin-update-status");
    this.message = page.getByTestId("admin-message");
    this.error = page.getByTestId("admin-error");
  }

  async goto() {
    await this.page.goto("/admin");
    await expect(this.page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  }

  async openQueueItem(ticketNo: string) {
    await this.page.getByTestId(`queue-item-${ticketNo}`).click();
    await expect(this.page.getByTestId("admin-manage-panel")).toBeVisible();
  }

  async updateStatus(newStatus: string, remarks?: string, reason?: string) {
    await this.statusSelect.selectOption(newStatus);
    if (remarks !== undefined) await this.remarksInput.fill(remarks);
    if (reason !== undefined) await this.reasonInput.fill(reason);
    await this.updateButton.click();
  }
}
