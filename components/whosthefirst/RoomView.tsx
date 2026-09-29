"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { getDb, serverNow } from "@/lib/whosthefirst/firebase";
import {
  COUNTDOWN_MS,
  finalizeRound,
  joinRoom,
  leaveRoom,
  markStarted,
  maybeStart,
  MIN_PLAYERS,
  NO_TAP_TIMEOUT_MS,
  removeOnDisconnect,
  RoomError,
  setReady,
  submitTap,
  TAP_WINDOW_MS,
  type RoomErrorCode,
} from "@/lib/whosthefirst/room";
import { readResults } from "@/lib/whosthefirst/ranking";
import type { Room, Session } from "@/lib/whosthefirst/types";
import { errorText } from "./Lobby";
import RoomHeader from "./RoomHeader";
import PlayerList from "./PlayerList";
import ReadyBar from "./ReadyBar";
import TapPad from "./TapPad";
import Results from "./Results";
import History from "./History";
import styles from "./WhosTheFirst.module.css";

type Props = { session: Session; uid: string; onExit: () => void };

/** Re-renders every `ms` while `on`, for countdowns. */
function useTick(on: boolean, ms = 100) {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [on, ms]);
}

export default function RoomView({ session, uid, onExit }: Props) {
  const { key, code, passcode, name } = session;
  const [room, setRoom] = useState<Room | null>(null);
  const [gone, setGone] = useState(false);
  const [joinError, setJoinError] = useState<RoomErrorCode | null>(null);
  const [goRound, setGoRound] = useState(0);
  const [myTap, setMyTap] = useState<{ round: number; ms: number } | null>(null);
  const [tapFailed, setTapFailed] = useState(false);

  const joining = useRef(false);
  const leaving = useRef(false);
  const started = useRef<Promise<unknown>>(Promise.resolve());
  const goAt = useRef<number | null>(null);

  const game = room?.game;
  const phase = game?.phase;
  const round = game?.round ?? 0;
  const players = game?.players ?? {};
  const me = players[uid];
  const live = phase === "ready" || phase === "started";
  const isGo = live && goRound === round;
  const roundTaps = room?.taps?.[round] ?? {};

  // Live room state.
  useEffect(
    () =>
      onValue(
        ref(getDb(), `rooms/${key}`),
        (s) => (s.exists() ? setRoom(s.val() as Room) : setGone(true)),
        () => setGone(true),
      ),
    [key],
  );

  // (Re)join: after a reload, a dropped connection, or a round we sat out.
  useEffect(() => {
    if (!room || me || joining.current || leaving.current || joinError || live) return;
    joining.current = true;
    joinRoom(code, passcode, uid, name)
      .catch((e) => setJoinError(e instanceof RoomError ? e.code : "not-found"))
      .finally(() => {
        joining.current = false;
      });
  }, [room, me, joinError, live, code, passcode, uid, name]);

  // Closing the tab or losing the connection removes the player.
  const isMember = Boolean(me);
  useEffect(() => {
    if (isMember) removeOnDisconnect(key, uid).catch(() => {});
  }, [isMember, key, uid]);

  // Everyone ready → start. Every client tries; the transaction lets one win.
  const allReady = Object.values(players).every((p) => p.ready);
  const count = Object.keys(players).length;
  useEffect(() => {
    if ((phase === "idle" || phase === "result") && count >= MIN_PLAYERS && allReady) {
      maybeStart(key).catch(() => {});
    }
  }, [phase, count, allReady, key]);

  // GO at the shared start moment. Taps wait on markStarted so the database
  // is in `started` before they arrive.
  const startAt = game?.startAt;
  useEffect(() => {
    if (!live || !startAt) return;
    const r = round;
    const t = setTimeout(() => {
      started.current = markStarted(key, r).catch(() => {});
      setGoRound(r);
    }, Math.max(0, startAt - serverNow()));
    return () => clearTimeout(t);
  }, [live, round, startAt, key]);

  // The reference point for the reaction time: the frame GO is painted in.
  // Pointer event timestamps share this clock (performance.now()).
  useLayoutEffect(() => {
    goAt.current = null;
    if (!goRound) return;
    const id = requestAnimationFrame((t) => {
      goAt.current = t;
    });
    return () => cancelAnimationFrame(id);
  }, [goRound]);

  // End the round: 3s after the first tap, as soon as everyone has tapped,
  // or after a timeout if nobody taps at all.
  const firstTapAt = game?.firstTapAt;
  const everyoneTapped = count > 0 && Object.keys(players).every((id) => roundTaps[id]);
  useEffect(() => {
    if (phase !== "started" || !startAt) return;
    const deadline = everyoneTapped
      ? serverNow()
      : firstTapAt
        ? firstTapAt + TAP_WINDOW_MS
        : startAt + NO_TAP_TIMEOUT_MS;
    // A little grace for taps still on the wire.
    const t = setTimeout(
      () => finalizeRound(key, code, round).catch(() => {}),
      Math.max(0, deadline - serverNow()) + 250,
    );
    return () => clearTimeout(t);
  }, [phase, startAt, firstTapAt, everyoneTapped, key, code, round]);

  const tapped = myTap?.round === round || Boolean(roundTaps[uid]);
  const canTap = isGo && Boolean(me) && !tapped;

  const onTap = (stamp: number) => {
    if (!canTap || goAt.current === null) return;
    const ms = Math.round(Math.max(0, stamp - goAt.current) * 1000) / 1000;
    const r = round;
    setMyTap({ round: r, ms });
    setTapFailed(false);
    started.current
      .then(() => submitTap(key, r, uid, me!.name, ms))
      .catch(() => setTapFailed(true));
  };

  const leave = async () => {
    leaving.current = true;
    try {
      await leaveRoom(key, code, uid);
    } catch {
      /* the room may already be gone */
    }
    onExit();
  };

  useTick(live || phase === "result");

  if (gone || joinError) {
    return (
      <div className={styles.ended}>
        <p className={styles.notice}>{joinError ? errorText[joinError] : "This room has ended or expired."}</p>
        <button className={styles.secondary} onClick={onExit}>
          Back to lobby
        </button>
      </div>
    );
  }

  if (!room || !game) return <p className={`monoLabel ${styles.loading}`}>Opening room…</p>;

  const history = Object.entries(room.history ?? {})
    .map(([n, h]) => ({ round: Number(n), endedAt: h.endedAt, results: readResults(h.results) }))
    .sort((a, b) => b.round - a.round);
  const current = phase === "result" ? history.find((h) => h.round === round) : undefined;

  let stage: React.ReactNode = null;
  if (live) {
    const now = serverNow();
    const countdownLeft = (game.readyAt ?? now) + COUNTDOWN_MS - now;
    const windowLeft = firstTapAt ? firstTapAt + TAP_WINDOW_MS - now : null;
    let label: string;
    let sub: string | null = null;
    if (!me) {
      label = "Round in progress";
      sub = "You'll join when it ends.";
    } else if (tapped) {
      label = myTap?.round === round ? `${myTap.ms.toFixed(3)} ms` : "Tapped";
      sub = tapFailed
        ? "Your tap didn't reach the room in time."
        : windowLeft !== null
          ? `Waiting for others… ${Math.max(0, windowLeft / 1000).toFixed(1)}s`
          : "Waiting for others…";
    } else if (isGo) {
      label = "TAP!";
    } else if (countdownLeft > 0) {
      label = String(Math.ceil(countdownLeft / 1000));
    } else {
      label = "Wait for it…";
    }
    stage = <TapPad go={isGo && !tapped} enabled={canTap} label={label} sub={sub} onTap={onTap} />;
  }

  return (
    <div className={styles.room}>
      <RoomHeader code={code} passcode={passcode} count={count} onLeave={leave} />

      {stage}

      {phase === "result" && (
        <section className={styles.block} aria-labelledby="result-heading">
          <h2 id="result-heading" className={`monoLabel ${styles.blockTitle}`}>
            Round {round} result
          </h2>
          {current ? <Results results={current.results} uid={uid} /> : <p className={styles.muted}>Tallying…</p>}
        </section>
      )}

      {!live && (
        <>
          {me && (
            <ReadyBar
              ready={me.ready}
              phase={phase!}
              count={count}
              waiting={Object.values(players).filter((p) => !p.ready).length}
              onToggle={() => setReady(key, code, uid, !me.ready).catch(() => {})}
            />
          )}
          <PlayerList players={players} uid={uid} />
          <History rounds={history.filter((h) => h !== current)} uid={uid} />
        </>
      )}
    </div>
  );
}
