type WindowControlsProps = {
  onMinimize: () => void;
  onClose: () => void;
};

export function WindowControls({ onMinimize, onClose }: WindowControlsProps) {
  return (
    <div className="controls" aria-label="Window controls">
      <button className="control minimize" aria-label="Minimize" type="button" onClick={onMinimize}><span /></button>
      <button className="control close" aria-label="Close" type="button" onClick={onClose}><span /></button>
    </div>
  );
}
