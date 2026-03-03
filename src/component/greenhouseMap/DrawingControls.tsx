import React from 'react';
import { BiPencil, BiCheck, BiX, BiPlus } from 'react-icons/bi';
import { Point } from '../../services/ConstrolService';

interface DrawingControlsProps {
  isDrawing: boolean;
  isEditing: boolean;
  shape: Point[];
  drawingPoints: Point[];
  onStartDrawing: () => void;
  onStartEditing: () => void;
  onFinishDrawing: () => void;
  onCancelDrawing: () => void;
  onAddPoint: () => void;
  onStopEditing: () => void;
}

const DrawingControls: React.FC<DrawingControlsProps> = ({
  isDrawing,
  isEditing,
  shape,
  drawingPoints,
  onStartDrawing,
  onStartEditing,
  onFinishDrawing,
  onCancelDrawing,
  onAddPoint,
  onStopEditing
}) => {
  return (
    <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
      <h2>Konfiguracja Obszaru</h2>
      
      {!isDrawing && !isEditing ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <button
            onClick={onStartDrawing}
            className="map-btn-primary"
          >
            <BiPencil size={18} />
            {shape.length > 0 ? 'Przerysuj Obszar' : 'Rysuj Obszar'}
          </button>
          
          {shape.length > 0 && (
              <button
                onClick={onStartEditing}
                className="map-btn-secondary"
              >
                <BiPencil size={18} />
                Edytuj Kształt
              </button>
          )}

          {shape.length > 0 && (
            <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center'}}>
              Zdefiniowano: {shape.length} punktów
            </div>
          )}
        </div>
      ) : isEditing ? (
         <div className="drawing-controls">
            <div className="drawing-hint">
                Przeciągaj punkty, aby zmienić kształt. Kliknij dwukrotnie na punkt, aby go usunąć.
            </div>
            <div className="drawing-actions" style={{flexDirection: 'column'}}>
                <button onClick={onAddPoint} className="map-btn-secondary">
                    <BiPlus size={18} /> Dodaj Punkt
                </button>
                <button onClick={onStopEditing} className="map-btn-primary">
                    <BiCheck size={18} /> Zakończ Edycję
                </button>
            </div>
         </div>
      ) : (
        <div className="drawing-controls">
          <div className="drawing-hint">
            Klikaj na mapie, aby dodać punkty. Kliknij blisko punktu startowego, aby zamknąć kształt.
          </div>
          <div className="drawing-actions">
            <button
              onClick={onFinishDrawing}
              disabled={drawingPoints.length < 3}
              className="map-btn-primary"
              style={{backgroundColor: 'var(--success)'}}
            >
              <BiCheck size={18} /> Gotowe
            </button>
            <button
              onClick={onCancelDrawing}
              className="map-btn-secondary"
            >
              <BiX size={18} /> Anuluj
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingControls;
