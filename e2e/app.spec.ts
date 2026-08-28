import { test, expect } from '@playwright/test';

test.describe('AI Resume Screener Full Suite E2E', () => {
  test('Landing page loads with hero, stats, and navigation CTA', async ({ page }) => {
    await page.goto('/');

    // Check header logo
    await expect(page.locator('text=RESUME_SCREENER')).toBeVisible();

    // Check hero headline
    await expect(page.locator('h1')).toContainText('Know your fit score before you hit apply');

    // Check stats badges
    await expect(page.locator('text=20/20')).toBeVisible();
    await expect(page.locator('text=6x')).toBeVisible();

    // Click CTA button to navigate to /app
    const ctaButton = page.locator('a:has-text("Score a resume")').first();
    await ctaButton.click();
    await expect(page).toHaveURL(/\/app/);
  });

  test('Job Seeker Flow with 1-Click Role Presets and Superpowers', async ({ page }) => {
    await page.goto('/app');

    // Verify 1-Click Presets banner exists
    await expect(page.locator('text=Instant 1-Click Demo Presets').first()).toBeVisible();

    // Click the "Senior Frontend Engineer" preset
    const frontendPreset = page.locator('button:has-text("Senior Frontend Engineer")').first();
    await expect(frontendPreset).toBeVisible();
    await frontendPreset.click();

    // Verify preset is loaded and text is populated
    await expect(page.locator('text=alex_chen_frontend_resume.pdf')).toBeVisible();

    // Wait for fit score calculation
    await expect(page.locator('text=Overall Fit')).toBeVisible({ timeout: 15000 });

    // Verify AI Copilot Suite appears
    await expect(page.locator('text=AI Application Copilot Suite')).toBeVisible();

    // Test 1: ATS Audit Tab
    const atsTab = page.locator('button[role="tab"]:has-text("ATS Audit")');
    await expect(atsTab).toBeVisible();
    await atsTab.click();
    await expect(page.locator('text=ATS Readiness')).toBeVisible();
    await expect(page.locator('text=Contact & Profile Links')).toBeVisible();
    await expect(page.locator('text=Standard ATS Headings')).toBeVisible();

    // Test 2: Skill Simulator Tab
    const simulatorTab = page.locator('button[role="tab"]:has-text("Skill Simulator")');
    await expect(simulatorTab).toBeVisible();
    await simulatorTab.click();
    await expect(page.locator('text=What-If Skill Simulator').first()).toBeVisible();
    await expect(page.locator('text=Simulated Fit')).toBeVisible();

    // Test 3: Bullet Optimizer Tab
    const bulletTab = page.locator('button[role="tab"]:has-text("Bullet Optimizer")');
    await expect(bulletTab).toBeVisible();
    await bulletTab.click();
    await expect(page.locator('text=AI Bullet Point Optimizer').first()).toBeVisible();
    await expect(page.locator('text=XYZ Formula').first()).toBeVisible();

    // Test 4: Interview Prep Tab
    const interviewTab = page.locator('button[role="tab"]:has-text("Interview Prep")');
    await expect(interviewTab).toBeVisible();
    await interviewTab.click();
    await expect(page.locator('text=Interview Question Predictor').first()).toBeVisible();

    // Test 5: Outreach / DM Tab
    const outreachTab = page.locator('button[role="tab"]:has-text("Outreach / DM")');
    await expect(outreachTab).toBeVisible();
    await outreachTab.click();
    await expect(page.locator('text=1-Click Cover Letter & Recruiter Outreach').first()).toBeVisible();

    // Test 6: Shareable Report Card
    await expect(page.locator('text=Shareable Fit Score Card')).toBeVisible();
  });

  test('Recruiter Mode toggle loads multi-resume candidate interface', async ({ page }) => {
    await page.goto('/app');

    // Switch to Recruiter mode
    const recruiterModeBtn = page.locator('button[role="tab"]:has-text("Recruiter")');
    await recruiterModeBtn.click();

    await expect(page.locator('h1')).toContainText('Rank candidates against one job');
    await expect(page.locator('text=Drop resumes here or click to browse')).toBeVisible();
    await expect(page.locator('text=up to 20 files')).toBeVisible();
  });

  test('Dedicated /guide page and header navigation', async ({ page }) => {
    await page.goto('/app');

    // Click Guide button in top header
    const guideBtn = page.locator('a[href="/guide"]').first();
    await expect(guideBtn).toBeVisible();
    await guideBtn.click();

    // Verify URL is /guide
    await expect(page).toHaveURL(/\/guide/);

    // Verify Guide page headline and components
    await expect(page.locator('h1')).toContainText('User Guide & Feature Masterclass');
    await expect(page.locator('text=Complete User Guide & Feature Masterclass')).toBeVisible();
    await expect(page.locator('text=10 Feature Guides')).toBeVisible();

    // Filter by AI Superpowers
    const superpowersFilter = page.locator('button:has-text("AI Superpowers")');
    await superpowersFilter.click();

    // Verify AI Bullet Point Optimizer guide card is visible
    await expect(page.locator('text=AI Bullet Point Optimizer (XYZ Formula)')).toBeVisible();

    // Expand the guide card
    const optimizerCard = page.locator('text=AI Bullet Point Optimizer (XYZ Formula)');
    await optimizerCard.click();

    // Verify UI screenshot preview is displayed
    await expect(page.locator('text=Formula: Accomplished [X], measured by [Y], by doing [Z]').first()).toBeVisible();

    // Click Launch App CTA in header to navigate back to /app
    const launchAppBtn = page.locator('a:has-text("Launch App")').first();
    await launchAppBtn.click();
    await expect(page).toHaveURL(/\/app/);
  });

  test('Mobile viewport (375x667) responsiveness, preset loading and copilot interaction', async ({ page }) => {
    // Emulate mobile screen size (e.g. iPhone SE / Android)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/app');

    // Verify header and mobile branding
    await expect(page.locator('text=RESUME_SCREENER')).toBeVisible();

    // Verify 1-Click preset button works on mobile
    const frontendPreset = page.locator('button:has-text("Senior Frontend Engineer")').first();
    await expect(frontendPreset).toBeVisible();
    await frontendPreset.click();

    // Wait for score calculation
    await expect(page.locator('text=Overall Fit')).toBeVisible({ timeout: 15000 });

    // Verify mobile copilot tabs can be tapped and content toggles
    const atsTab = page.locator('button[role="tab"]:has-text("ATS Audit")');
    await expect(atsTab).toBeVisible();
    await atsTab.click();
    await expect(page.locator('text=ATS Readiness').first()).toBeVisible();

    const bulletTab = page.locator('button[role="tab"]:has-text("Bullet Optimizer")');
    await expect(bulletTab).toBeVisible();
    await bulletTab.click();
    await expect(page.locator('text=AI Bullet Point Optimizer').first()).toBeVisible();
  });
});
