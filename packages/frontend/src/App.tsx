import type { CharacterStatus } from "@ganesya/stats-engine";
import { useEffect, useState } from "react";
import { ApiError, fetchStatus } from "./api/client.js";
import styles from "./App.module.css";
import { LevelUpModal } from "./components/LevelUpModal/LevelUpModal.js";
import { PixelWindow } from "./components/PixelWindow/PixelWindow.js";
import { SpaceBackground } from "./components/SpaceBackground/SpaceBackground.js";
import { StatusPanel } from "./components/StatusPanel/StatusPanel.js";
import { useLevelUpDetection } from "./hooks/useLevelUpDetection.js";

const ENV_WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined;

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; status: CharacterStatus };

export interface AppProps {
  /** Defaults to VITE_WORKER_URL; overridable for tests/Storybook. */
  workerUrl?: string;
}

export function App({ workerUrl = ENV_WORKER_URL }: AppProps = {}) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    if (!workerUrl) {
      setState({
        kind: "error",
        message: "VITE_WORKER_URL が設定されていません。デプロイ設定を確認してください。",
      });
      return;
    }

    let cancelled = false;
    fetchStatus(workerUrl)
      .then((status) => {
        if (!cancelled) setState({ kind: "ready", status });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? `ステータスの取得に失敗しました（${err.status}）。`
            : "ステータスの取得に失敗しました。時間をおいて再読み込みしてください。";
        setState({ kind: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [workerUrl]);

  const currentLevel = state.kind === "ready" ? state.status.level : null;
  const [levelUpEvent, dismissLevelUp] = useLevelUpDetection(currentLevel);

  return (
    <main className={styles.page}>
      <SpaceBackground />
      <h1 className={styles.title}>life-management RPG</h1>
      <div className={styles.content}>
        {state.kind === "loading" && <PixelWindow>よみこみちゅう...</PixelWindow>}
        {state.kind === "error" && <PixelWindow title="エラー">{state.message}</PixelWindow>}
        {state.kind === "ready" && <StatusPanel status={state.status} />}
      </div>
      {levelUpEvent && (
        <LevelUpModal
          previousLevel={levelUpEvent.previousLevel}
          newLevel={levelUpEvent.newLevel}
          onClose={dismissLevelUp}
        />
      )}
    </main>
  );
}
