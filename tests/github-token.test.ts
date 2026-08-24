import { expect, it } from "vitest";

it("validates the scoped GitHub token can write to the Mavet Target repository", async () => {
  const token = process.env.GH_TOKEN;
  expect(token).toBeTruthy();
  const response = await fetch("https://api.github.com/repos/drvetmalek-bit/mavet-target.", {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
  });
  expect(response.status).toBe(200);
  const repository = await response.json() as { permissions?: { push?: boolean } };
  expect(repository.permissions?.push).toBe(true);
});
