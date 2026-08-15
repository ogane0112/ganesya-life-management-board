import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";

const WORKER_URL = "https://worker.example.com/api/status";

function statusPayload(level: number) {
  return {
    level,
    xp: level * 100,
    hp: { score: 50, max: 100, details: {} },
    int: { score: 50, max: 100, details: {} },
    finance: { score: 50, max: 100, details: {} },
    equipment: { score: 50, max: 100, details: {} },
    judgement: { score: 50, max: 100, details: {} },
    bond: { score: 50, max: 100, details: {} },
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("shows a loading state, then the status panel once the fetch resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(statusPayload(5)), { status: 200 })),
    );

    render(<App workerUrl={WORKER_URL} />);
    expect(screen.getByText("よみこみちゅう...")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Lv. 5")).toBeInTheDocument());
  });

  it("shows an error panel when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 502 })));

    render(<App workerUrl={WORKER_URL} />);

    await waitFor(() =>
      expect(screen.getByText(/ステータスの取得に失敗しました/)).toBeInTheDocument(),
    );
  });

  it("shows a configuration error when no worker URL is provided", async () => {
    render(<App workerUrl={undefined} />);
    await waitFor(() =>
      expect(screen.getByText(/VITE_WORKER_URL が設定されていません/)).toBeInTheDocument(),
    );
  });

  it("shows the level-up modal when the level increased since the last visit", async () => {
    window.localStorage.setItem("life-management-rpg:last-seen-level", "4");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(statusPayload(5)), { status: 200 })),
    );

    render(<App workerUrl={WORKER_URL} />);

    await waitFor(() => expect(screen.getByText("レベルが あがった！")).toBeInTheDocument());
    expect(screen.getByText("Lv. 4 → Lv. 5")).toBeInTheDocument();
  });

  it("does not show the level-up modal when the level is unchanged", async () => {
    window.localStorage.setItem("life-management-rpg:last-seen-level", "5");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(statusPayload(5)), { status: 200 })),
    );

    render(<App workerUrl={WORKER_URL} />);

    await waitFor(() => expect(screen.getByText("Lv. 5")).toBeInTheDocument());
    expect(screen.queryByText("レベルが あがった！")).not.toBeInTheDocument();
  });
});
