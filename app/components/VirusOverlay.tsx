import type { CSSProperties } from "react";

const virusPath = [
  [78, 78], [72, 68], [66, 58], [60, 48], [54, 38], [48, 28],
  [42, 18], [36, 12], [48, 12], [60, 12], [72, 12], [84, 18],
  [88, 30], [88, 42], [88, 54], [88, 66], [84, 78], [72, 84],
  [60, 84], [48, 84], [36, 84], [24, 84], [16, 74], [16, 62],
  [16, 50], [16, 38], [16, 26], [22, 16], [30, 12], [18, 12],
  [10, 22], [10, 36], [10, 50], [10, 64], [16, 78], [28, 84]
];

type VirusOverlayProps = {
  errorCount: number;
  onAction: () => void;
};

export function VirusOverlay({ errorCount, onAction }: VirusOverlayProps) {
  return (
    <div className="virus-overlay" role="dialog" aria-modal="true" aria-label="System error">
      {Array.from({ length: errorCount }, (_, index) => (
        <div className="virus-dialog" key={index} style={{
          left: `${virusPath[index % virusPath.length][0]}%`,
          top: `${virusPath[index % virusPath.length][1]}%`
        } as CSSProperties}>
          <img className="virus-error-image" src="/assets/sytem error.png" alt={index === errorCount - 1 ? "System error" : ""} aria-hidden={index !== errorCount - 1} />
          <div className="virus-actions">
            <button type="button" aria-label="OK" onClick={onAction}><img src="/assets/ok button.png" alt="OK" /></button>
            <button type="button" aria-label="Cancel" onClick={onAction}><img src="/assets/cancel button.png" alt="Cancel" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
