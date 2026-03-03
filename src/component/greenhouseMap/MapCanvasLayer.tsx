import React from 'react';
import { Layer, Line, Circle, Group, Rect, Label, Tag, Text } from 'react-konva';
import { Point, PlacedDevice, Device } from '../../services/ConstrolService';
import Konva from 'konva';

interface MapCanvasLayerProps {
  scale: number;
  offset: Point;
  isDrawing: boolean;
  isEditing: boolean;
  shape: Point[];
  drawingPoints: Point[];
  mousePos: Point | null;
  placedDevices: PlacedDevice[];
  availableDevices: Device[];
  selectedPlacedId: string | null;
  onOffsetChange: (offset: Point) => void;
  onDeviceDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onDeviceSelect: (id: string) => void;
  onPointDragMove: (e: Konva.KonvaEventObject<DragEvent>, index: number) => void;
  onPointRemove: (index: number) => void;
}

const GRID_SIZE = 1;

const getSensorColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('temp')) return '#ef4444';
  if (t.includes('hum') || t.includes('wilg')) return '#3b82f6';
  if (t.includes('light') || t.includes('świat')) return '#eab308';
  if (t.includes('soil') || t.includes('gleb')) return '#10b981';
  return '#9ca3af';
};

const MapCanvasLayer: React.FC<MapCanvasLayerProps> = ({
  scale,
  offset,
  isDrawing,
  isEditing,
  shape,
  drawingPoints,
  mousePos,
  placedDevices,
  availableDevices,
  selectedPlacedId,
  onOffsetChange,
  onDeviceDragEnd,
  onDeviceSelect,
  onPointDragMove,
  onPointRemove
}) => {
  
  const renderGrid = () => {
    const width = 100;
    const height = 100;
    const lines = [];
    for (let i = -width; i <= width; i += GRID_SIZE) {
      lines.push(<Line key={`v-${i}`} points={[i, -height, i, height]} stroke="#e5e7eb" strokeWidth={1 / scale} />);
      lines.push(<Line key={`h-${i}`} points={[-width, i, width, i]} stroke="#e5e7eb" strokeWidth={1 / scale} />);
    }
    return lines;
  };

  return (
    <Layer>
      <Group
        x={offset.x}
        y={offset.y}
        scaleX={scale}
        scaleY={scale}
        draggable={!isDrawing}
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          if (!isDrawing) onOffsetChange({ x: e.target.x(), y: e.target.y() });
        }}
      >
        {renderGrid()}

        {/* Completed Shape */}
        {shape.length > 0 && (
          <>
              <Line
              points={shape.flatMap(p => [p.x, p.y])}
              closed
              stroke="#3b82f6"
              strokeWidth={2 / scale}
              fill="rgba(59, 130, 246, 0.05)"
              lineCap="round"
              lineJoin="round"
              />
              
              {/* Editable Points */}
              {isEditing && shape.map((p, i) => (
                  <Circle
                      key={`point-${i}`}
                      x={p.x}
                      y={p.y}
                      radius={6 / scale}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2 / scale}
                      draggable
                      onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onPointDragMove(e, i)}
                      onMouseEnter={(e: Konva.KonvaEventObject<MouseEvent>) => {
                          const container = e.target.getStage()?.container();
                          if (container) container.style.cursor = 'move';
                      }}
                      onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
                          const container = e.target.getStage()?.container();
                          if (container) container.style.cursor = 'default';
                      }}
                      onDblClick={() => onPointRemove(i)}
                  />
              ))}
          </>
        )}

        {/* Drawing Preview */}
        {isDrawing && (
          <>
            <Line
              points={drawingPoints.flatMap(p => [p.x, p.y])}
              stroke="#3b82f6"
              strokeWidth={2 / scale}
              dash={[4 / scale, 4 / scale]}
            />
            {drawingPoints.length > 0 && mousePos && (
              <>
                <Line
                  points={[
                    drawingPoints[drawingPoints.length - 1].x,
                    drawingPoints[drawingPoints.length - 1].y,
                    mousePos.x,
                    mousePos.y
                  ]}
                  stroke="#9ca3af"
                  strokeWidth={1 / scale}
                  dash={[2 / scale, 2 / scale]}
                />
                <Label
                  x={mousePos.x + 10 / scale}
                  y={mousePos.y + 10 / scale}
                >
                  <Tag
                    fill="rgba(0,0,0,0.7)"
                    cornerRadius={4 / scale}
                  />
                  <Text
                    text={`${Math.sqrt(
                      Math.pow(mousePos.x - drawingPoints[drawingPoints.length - 1].x, 2) + 
                      Math.pow(mousePos.y - drawingPoints[drawingPoints.length - 1].y, 2)
                    ).toFixed(2)}m`}
                    fontSize={12 / scale}
                    padding={4 / scale}
                    fill="white"
                  />
                </Label>
              </>
            )}
            {drawingPoints.map((p, i) => (
              <Circle
                key={i}
                x={p.x}
                y={p.y}
                radius={4 / scale}
                fill="#3b82f6"
              />
            ))}
          </>
        )}

        {/* Placed Devices */}
        {placedDevices.map((placed) => {
          const device = availableDevices.find(d => d.deviceId === placed.deviceId);
          if (!device) return null;
          const isSelected = selectedPlacedId === placed.id;

          return (
            <Group
              key={placed.id}
              x={placed.x}
              y={placed.y}
              draggable={!isDrawing}
              onDblClick={() => onDeviceSelect(placed.id)}
              onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => onDeviceDragEnd(e, placed.id)}
            >
              {/* Device Box */}
              <Rect
                width={0.8}
                height={0.8}
                offsetX={0.4}
                offsetY={0.4}
                fill={isSelected ? '#eff6ff' : 'white'}
                stroke={isSelected ? '#3b82f6' : '#9ca3af'}
                strokeWidth={isSelected ? 0.05 : 0.02}
                cornerRadius={0.1}
                shadowColor="black"
                shadowBlur={0.1}
                shadowOpacity={0.1}
                shadowOffset={{ x: 0.02, y: 0.02 }}
              />
              
              {/* Device Icon (Chip representation) */}
              <Rect
                x={-0.15}
                y={-0.15}
                width={0.3}
                height={0.3}
                fill="#1e293b"
                cornerRadius={0.05}
              />
              
              {/* Sensor Indicators (Colored Dots) */}
              {device.sensors?.map((sensor, i) => (
                <Circle
                  key={sensor}
                  x={-0.3 + (i * 0.15)}
                  y={0.3}
                  radius={0.04}
                  fill={getSensorColor(sensor)}
                />
              ))}

              {/* Label */}
              <Text
                text={device.name}
                y={-0.6}
                fontSize={0.2}
                fontFamily="Inter, sans-serif"
                fill="#374151"
                align="center"
                width={2}
                offsetX={1}
              />
            </Group>
          );
        })}
      </Group>
    </Layer>
  );
};

export default MapCanvasLayer;