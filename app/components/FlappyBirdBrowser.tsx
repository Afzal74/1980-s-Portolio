import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

type FlappyBirdBrowserProps = {
  onClose: () => void;
};

type Pipe = { x: number; gapY: number; passed: boolean };

const WIDTH = 520;
const HEIGHT = 300;

export function FlappyBirdBrowser({ onClose }: FlappyBirdBrowserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdImageRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const gameRef = useRef({ birdY: 140, velocity: 0, pipes: [] as Pipe[], score: 0, running: false, over: false });
  const [player, setPlayer] = useState("");
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [birdY, setBirdY] = useState(140);

  useEffect(() => {
    const saved = Number.parseInt(localStorage.getItem("flappyHighScore") ?? "0", 10);
    setHighScore(Number.isNaN(saved) ? 0 : saved);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const game = gameRef.current;
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#b4e5f2";
    for (let x = 0; x < WIDTH; x += 36) ctx.fillRect(x, 35 + (x % 4) * 6, 22, 3);
    ctx.fillStyle = "#58a64b";
    ctx.fillRect(0, HEIGHT - 24, WIDTH, 24);
    ctx.fillStyle = "#2f7f35";
    for (let x = 0; x < WIDTH; x += 18) ctx.fillRect(x, HEIGHT - 24, 10, 4);
    ctx.fillStyle = "#35a84c";
    game.pipes.forEach((pipe) => {
      ctx.fillRect(pipe.x, 0, 42, pipe.gapY - 55);
      ctx.fillRect(pipe.x, pipe.gapY + 55, 42, HEIGHT - 24 - pipe.gapY - 55);
      ctx.fillStyle = "#237734";
      ctx.fillRect(pipe.x - 4, pipe.gapY - 61, 50, 7);
      ctx.fillRect(pipe.x - 4, pipe.gapY + 54, 50, 7);
      ctx.fillStyle = "#35a84c";
    });
    ctx.fillStyle = "#11115e";
    ctx.font = 'bold 22px "Courier New"';
    ctx.fillText(String(game.score), WIDTH / 2 - 6, 34);
  }, []);

  useEffect(() => {
    const image = birdImageRef.current;
    if (!image) return;
    const drawWhenLoaded = () => draw();
    image.addEventListener("load", drawWhenLoaded);
    draw();
    return () => image.removeEventListener("load", drawWhenLoaded);
  }, [draw]);

  const finish = useCallback(() => {
    const game = gameRef.current;
    game.running = false;
    game.over = true;
    setGameOver(true);
    setHighScore((current) => {
      const next = Math.max(current, game.score);
      localStorage.setItem("flappyHighScore", String(next));
      return next;
    });
  }, []);

  const loop = useCallback((timestamp: number) => {
    const game = gameRef.current;
    if (!game.running) {
      draw();
      return;
    }
    game.velocity += 0.38;
    game.birdY += game.velocity;
    setBirdY(game.birdY);
    if (game.pipes.length === 0 || game.pipes[game.pipes.length - 1].x < WIDTH - 190) {
      game.pipes.push({ x: WIDTH + 20, gapY: 75 + Math.random() * 120, passed: false });
    }
    game.pipes.forEach((pipe) => {
      pipe.x -= 2.6;
      if (!pipe.passed && pipe.x + 42 < 60) {
        pipe.passed = true;
        game.score += 1;
        setScore(game.score);
      }
    });
    game.pipes = game.pipes.filter((pipe) => pipe.x > -60);
    const hitPipe = game.pipes.some((pipe) => 60 + 30 > pipe.x && 60 < pipe.x + 42 && (game.birdY < pipe.gapY - 55 || game.birdY + 26 > pipe.gapY + 55));
    if (game.birdY < 0 || game.birdY + 30 > HEIGHT - 24 || hitPipe) {
      finish();
      return;
    }
    draw();
    frameRef.current = requestAnimationFrame(loop);
  }, [draw, finish]);

  useEffect(() => {
    if (!started) return;
    draw();
    if (gameRef.current.running) {
      frameRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [started, draw, loop]);

  const flap = () => {
    if (gameRef.current.running) {
      gameRef.current.velocity = -6.4;
      return;
    }
    if (gameOver) {
      gameRef.current = { birdY: 140, velocity: -6.4, pipes: [], score: 0, running: true, over: false };
      setBirdY(140);
      setScore(0);
      setGameOver(false);
      frameRef.current = requestAnimationFrame(loop);
    }
  };

  const start = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!player.trim()) return;
    setStarted(true);
    gameRef.current = { birdY: 140, velocity: -6.4, pipes: [], score: 0, running: true, over: false };
    setBirdY(140);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (started) flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [started]);

  useEffect(() => () => {
    if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="flappy-browser">
      <img ref={birdImageRef} src="/assets/Bird.gif" alt="" className="flappy-bird-preload" />
      {!started ? (
        <div className="flappy-start">
          <h2>FLAPPY BIRD</h2>
          <p>Enter your name to start</p>
          <input value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="PLAYER" maxLength={14} autoFocus />
          <button type="button" onClick={start}>START GAME</button>
        </div>
      ) : (
        <>
          <div className="flappy-canvas-wrap" onClick={flap}>
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Flappy Bird game" />
            <img
              src="/assets/Bird.gif"
              alt="Flappy Bird"
              className="flappy-bird-sprite"
              style={{ left: 60, top: birdY }}
            />
          </div>
          <div className="flappy-info">PLAYER: {player} &nbsp; SCORE: {score} &nbsp; BEST: {highScore}</div>
          {gameOver && <button className="flappy-retry" type="button" onClick={flap}>GAME OVER - CLICK TO RETRY</button>}
          {!gameOver && <p className="flappy-help">SPACE or CLICK to flap</p>}
        </>
      )}
      <button className="flappy-close" type="button" onClick={onClose}>EXIT GAME</button>
    </div>
  );
}
