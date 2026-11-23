import { expect, type Locator, type Page } from "@playwright/test";

/** Page object: citizen reporting flow (/report). */
export class ReportPage {
  readonly page: Page;
  readonly photoInput: Locator;
  readonly categorySelect: Locator;
  readonly descriptionInput: Locator;
  readonly wardSelect: Locator;
  readonly submitButton: Locator;
  readonly aiPanel: Locator;
  readonly aiConfirmButton: Locator;
  readonly duplicatePanel: Locator;
  readonly fileSeparatelyButton: Locator;
  readonly successPanel: Locator;
  readonly ticketNumber: Locator;

  constructor(page: Page) {
    this.page = page;
    this.photoInput = page.getByTestId("photo-input");
    this.categorySelect = page.getByTestId("category-select");
    this.descriptionInput = page.getByTestId("description-input");
    this.wardSelect = page.getByTestId("ward-select");
    this.submitButton = page.getByTestId("submit-report");
    this.aiPanel = page.getByTestId("ai-panel");
    this.aiConfirmButton = page.getByTestId("ai-confirm");
    this.duplicatePanel = page.getByTestId("duplicate-panel");
    this.fileSeparatelyButton = page.getByTestId("duplicate-file-separately");
    this.successPanel = page.getByTestId("success-panel");
    this.ticketNumber = page.getByTestId("ticket-number");
  }

  async goto() {
    await this.page.goto("/report");
    await expect(this.page.getByRole("heading", { name: "Report an issue" })).toBeVisible();
  }

  async useSamplePhoto(sample: "pothole" | "garbage") {
    await this.page.getByTestId(`sample-${sample}`).click();
  }

  async fillReport(options: {
    description: string;
    category?: string;
    ward?: string;
  }) {
    if (options.category) await this.categorySelect.selectOption(options.category);
    await this.descriptionInput.fill(options.description);
    if (options.ward) await this.wardSelect.selectOption(options.ward);
  }

  async submitToAi() {
    await this.submitButton.click();
    await expect(this.aiPanel).toBeVisible();
  }

  async confirmCategory() {
    await this.aiConfirmButton.click();
    await expect(this.duplicatePanel).toBeVisible();
  }

  async fileSeparately() {
    await this.fileSeparatelyButton.click();
    await expect(this.successPanel).toBeVisible();
  }

  async ticketNo(): Promise<string> {
    return (await this.ticketNumber.textContent()) ?? "";
  }
}
