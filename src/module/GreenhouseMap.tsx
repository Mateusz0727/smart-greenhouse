import React, { useState, useRef, useEffect } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useNavigate } from 'react-router-dom';
import { 
  Device, 
  getDevices, 
  getRelayStates, 
  toggleRelayState, 
  RelayState, 
  getMaps, 
  saveMap, 
  deleteMap, 
  MapSchema, 
  Point, 
  PlacedDevice 
} from '../services/ConstrolService';

// Importy wyodrębnionych komponentów
import MapSidebarHeader from '../component/greenhouseMap/MapSidebarHeader';
import DrawingControls from '../component/greenhouseMap/DrawingControls';
import DeviceList from '../component/greenhouseMap/DeviceList';
import MapToolbar from '../component/greenhouseMap/MapToolbar';
import MapCanvasLayer from '../component/greenhouseMap/MapCanvasLayer';
import DevicePopup from '../component/DevicePopup';

import '../styles/greenhouse-map.css';

// Configuration
const INITIAL_SCALE = 40; // pixels per meter
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

// Workaround for React 18/19 / react-konva type mismatch
const StageAny = Stage as any;

const GreenhouseMap: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  
  // --- State ---
  const [scale, setScale] = useState<number>(INITIAL_SCALE);
  const [offset, setOffset] = useState<Point>({ x: 50, y: 50 });
  
  // Maps / Schemas
  const [maps, setMaps] = useState<MapSchema[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [mapName, setMapName] = useState<string>("Nowa Mapa");

  // Shape & Drawing
  const [shape, setShape] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  // Devices
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Popup State
  const [relayStates, setRelayStates] = useState<RelayState[]>([]);
  const [loadingRelays, setLoadingRelays] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: STAGE_WIDTH, height: STAGE_HEIGHT });

  // --- Helpers ---
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Effects ---
  
  // Load Maps from API
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const fetchedMaps = await getMaps(userId);
        setMaps(fetchedMaps);
        if (fetchedMaps.length > 0) {
          loadMap(fetchedMaps[0]);
        } else {
          createNewMap();
        }
      } catch (e) {
        console.error("Failed to fetch maps", e);
        createNewMap();
      }
    };
    fetchMaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Fetch Devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const devices = await getDevices(userId);
        // Mock sensors if missing
        const devicesWithSensors = devices.map(d => ({
            ...d,
            sensors: d.sensors || ['temperature', 'humidity'] 
        }));
        setAvailableDevices(devicesWithSensors);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [userId]);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Relay States when device selected
  useEffect(() => {
    if (!selectedPlacedId) {
      setRelayStates([]);
      return;
    }

    const placed = placedDevices.find(d => d.id === selectedPlacedId);
    if (!placed) return;

    const fetchRelays = async () => {
      setLoadingRelays(true);
      try {
        const { states } = await getRelayStates(placed.deviceId);
        setRelayStates(states);
      } catch (e) {
        console.error("Failed to fetch relays", e);
      } finally {
        setLoadingRelays(false);
      }
    };
    fetchRelays();
  }, [selectedPlacedId, placedDevices]);

  // --- Map Management ---

  const createNewMap = () => {
    const newMap: MapSchema = {
      id: generateId(),
      name: `Mapa ${maps.length + 1}`,
      shape: [],
      placedDevices: []
    };
    setMaps(prev => [...prev, newMap]);
    loadMap(newMap);
  };

  const loadMap = (map: MapSchema) => {
    setCurrentMapId(map.id);
    setMapName(map.name);
    setShape(map.shape);
    setPlacedDevices(map.placedDevices);
    setSelectedPlacedId(null);
    setIsDrawing(false);
    setIsEditing(false);
    setDrawingPoints([]);
  };

  const saveCurrentMap = async () => {
    if (!currentMapId) return;
    
    const currentMap = maps.find(m => m.id === currentMapId);
    if (!currentMap) return;

    // Save to API
    const saved = await saveMap(userId, currentMap);
    if (saved) {
        alert("Mapa zapisana!");
    } else {
        alert("Błąd zapisu mapy.");
    }
  };

  const handleDeleteClick = () => {
    if (maps.length <= 1) {
      alert("Nie można usunąć jedynej mapy.");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMap = async () => {
    if (!currentMapId) return;

    const success = await deleteMap(currentMapId);
    if (success) {
        const updatedMaps = maps.filter(m => m.id !== currentMapId);
        setMaps(updatedMaps);
        if (updatedMaps.length > 0) {
            loadMap(updatedMaps[0]);
        } else {
            createNewMap();
        }
    } else {
        alert("Nie udało się usunąć mapy.");
    }
    setShowDeleteConfirm(false);
  };

  // --- Logic ---

  const isDeviceUsedGlobally = (deviceId: string) => {
    return maps.some(map => 
      map.placedDevices.some(pd => pd.deviceId === deviceId)
    );
  };
  
  const isDeviceUsedInCurrentMap = (deviceId: string) => {
      return placedDevices.some(pd => pd.deviceId === deviceId);
  }

  // --- Event Handlers ---

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedPlacedId(null);
      return;
    }

    const stage = e.target.getStage();
    if (!stage) return;

    const layer = stage.getLayers()[0];
    const group = layer.getChildren()[0] as Konva.Group;
    
    const transform = group.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(stage.getPointerPosition() || { x: 0, y: 0 });

    const newPoint = { x: pos.x, y: pos.y };
    
    if (drawingPoints.length > 2) {
      const first = drawingPoints[0];
      const dist = Math.sqrt(Math.pow(newPoint.x - first.x, 2) + Math.pow(newPoint.y - first.y, 2));
      if (dist < 0.5) {
        finishDrawing();
        return;
      }
    }

    setDrawingPoints([...drawingPoints, newPoint]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    if (!stage) return;
    
    const layer = stage.getLayers()[0];
    const group = layer.getChildren()[0] as Konva.Group;

    const transform = group.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(stage.getPointerPosition() || { x: 0, y: 0 });
    
    setMousePos({ x: pos.x, y: pos.y });
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setShape([]);
    setPlacedDevices([]);
  };

  const startEditing = () => {
    setIsEditing(true);
    setIsDrawing(false);
    setSelectedPlacedId(null);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  const handlePointDragMove = (e: Konva.KonvaEventObject<DragEvent>, index: number) => {
    const node = e.target;
    const newPoints = [...shape];
    newPoints[index] = { x: node.x(), y: node.y() };
    setShape(newPoints);
    
    setMaps(currentMaps => currentMaps.map(m => 
      m.id === currentMapId ? { ...m, shape: newPoints } : m
    ));
  };

  const addPointToShape = () => {
      if (shape.length < 3) return;
      
      const p1 = shape[0];
      const p2 = shape[1];
      const midPoint = { x: (p1.x + p2.x) / 2 + 1, y: (p1.y + p2.y) / 2 + 1 };
      
      const newShape = [...shape];
      newShape.splice(1, 0, midPoint);
      setShape(newShape);
      setMaps(currentMaps => currentMaps.map(m => 
        m.id === currentMapId ? { ...m, shape: newShape } : m
      ));
  };

  const removePointFromShape = (index: number) => {
      if (shape.length <= 3) {
          alert("Obszar musi mieć co najmniej 3 punkty.");
          return;
      }
      const newShape = shape.filter((_, i) => i !== index);
      setShape(newShape);
      setMaps(currentMaps => currentMaps.map(m => 
        m.id === currentMapId ? { ...m, shape: newShape } : m
      ));
  };

  const finishDrawing = () => {
    if (drawingPoints.length < 3) {
      alert("Obszar musi mieć co najmniej 3 punkty.");
      return;
    }
    setShape(drawingPoints);
    setMaps(currentMaps => currentMaps.map(m => 
      m.id === currentMapId ? { ...m, shape: drawingPoints } : m
    ));
    setIsDrawing(false);
    setDrawingPoints([]);
    setMousePos(null);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
    setMousePos(null);
  };

  const placeDevice = (device: Device) => {
    if (shape.length === 0) {
      alert("Najpierw narysuj obszar szklarni.");
      return;
    }

    if (isDeviceUsedGlobally(device.deviceId)) {
       if (isDeviceUsedInCurrentMap(device.deviceId)) {
           alert("To urządzenie jest już umieszczone na tej mapie.");
       } else {
           alert("To urządzenie jest już użyte na innej mapie.");
       }
       return;
    }

    const minX = Math.min(...shape.map(p => p.x));
    const maxX = Math.max(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxY = Math.max(...shape.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newDevice: PlacedDevice = {
      id: generateId(),
      deviceId: device.deviceId,
      x: centerX,
      y: centerY,
    };

    setPlacedDevices(prev => {
      const updated = [...prev, newDevice];
      setMaps(currentMaps => currentMaps.map(m => 
        m.id === currentMapId ? { ...m, placedDevices: updated } : m
      ));
      return updated;
    });
    setSelectedPlacedId(newDevice.id);
  };

  const handleDeviceDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();

    setPlacedDevices(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, x: newX, y: newY } : d);
      
      setMaps(currentMaps => currentMaps.map(m => 
        m.id === currentMapId ? { ...m, placedDevices: updated } : m
      ));
      
      return updated;
    });
    setSelectedPlacedId(id);
  };

  const removeSelectedDevice = () => {
    if (selectedPlacedId) {
      setPlacedDevices(prev => {
        const updated = prev.filter(d => d.id !== selectedPlacedId);
        setMaps(currentMaps => currentMaps.map(m => 
          m.id === currentMapId ? { ...m, placedDevices: updated } : m
        ));
        return updated;
      });
      setSelectedPlacedId(null);
    }
  };

  const handleRelayToggle = async (relayName: string, currentState: boolean) => {
    const placed = placedDevices.find(d => d.id === selectedPlacedId);
    if (!placed) return;

    // Optimistic update
    setRelayStates(prev => prev.map(r => r.relay === relayName ? { ...r, state: !currentState } : r));

    const success = await toggleRelayState(placed.deviceId, relayName, !currentState);
    if (!success) {
      // Revert
      setRelayStates(prev => prev.map(r => r.relay === relayName ? { ...r, state: currentState } : r));
      alert("Nie udało się przełączyć przekaźnika.");
    }
  };

  const selectedDeviceData = selectedPlacedId 
    ? availableDevices.find(d => d.deviceId === placedDevices.find(pd => pd.id === selectedPlacedId)?.deviceId)
    : null;

  return (
    <div className="greenhouse-map-container">
      {/* Sidebar */}
      <aside className="map-sidebar">
        
        <MapSidebarHeader 
            maps={maps}
            currentMapId={currentMapId}
            mapName={mapName}
            onMapChange={(id) => {
                const m = maps.find(m => m.id === id);
                if(m) loadMap(m);
            }}
            onCreateMap={createNewMap}
            onMapNameChange={(newName) => {
                setMapName(newName);
                setMaps(currentMaps => currentMaps.map(m => 
                    m.id === currentMapId ? { ...m, name: newName } : m
                ));
            }}
            onSaveMap={saveCurrentMap}
            onDeleteMap={handleDeleteClick}
        />

        <DrawingControls 
            isDrawing={isDrawing}
            isEditing={isEditing}
            shape={shape}
            drawingPoints={drawingPoints}
            onStartDrawing={startDrawing}
            onStartEditing={startEditing}
            onFinishDrawing={finishDrawing}
            onCancelDrawing={cancelDrawing}
            onAddPoint={addPointToShape}
            onStopEditing={stopEditing}
        />

        <DeviceList 
            loading={loading}
            availableDevices={availableDevices}
            placedDevices={placedDevices}
            isDeviceUsedGlobally={isDeviceUsedGlobally}
            onPlaceDevice={placeDevice}
        />
        
        <div style={{padding: '1rem', fontSize: '0.75rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)'}}>
            <p>Kliknij dwukrotnie na urządzenie na mapie, aby zobaczyć szczegóły.</p>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="map-canvas-area" ref={containerRef}>
        
        <MapToolbar 
            onZoomIn={() => setScale(s => Math.min(s * 1.2, 200))}
            onZoomOut={() => setScale(s => Math.max(s / 1.2, 10))}
            onReset={() => { setScale(INITIAL_SCALE); setOffset({x: 50, y: 50}); }}
        />
        
        {/* Device Popup */}
        {selectedDeviceData && (
            <DevicePopup 
                device={selectedDeviceData}
                onClose={() => setSelectedPlacedId(null)}
                onRemove={removeSelectedDevice}
                onOpenControlPanel={() => navigate('/dashboard/connect')}
                relayStates={relayStates}
                loadingRelays={loadingRelays}
                onToggleRelay={handleRelayToggle}
            />
        )}

        {/* Scale Indicator */}
        <div className="map-scale-indicator">
          1 metr = {Math.round(scale)} pikseli
        </div>

        {/* Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{marginTop: 0, marginBottom: '0.5rem', color: '#1f2937'}}>Usuń mapę</h3>
              <p style={{color: '#4b5563', marginBottom: '1.5rem'}}>
                Czy na pewno chcesz usunąć mapę "{mapName}"? Tej operacji nie można cofnąć.
              </p>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'}}>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontWeight: 500
                  }}
                >
                  Anuluj
                </button>
                <button 
                  onClick={confirmDeleteMap}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontWeight: 500
                  }}
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        )}

        {/* @ts-ignore */}
        <StageAny
          width={stageSize.width}
          height={stageSize.height}
          onWheel={(e: Konva.KonvaEventObject<WheelEvent>) => {
            e.evt.preventDefault();
            const scaleBy = 1.1;
            const newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
            if (newScale >= 10 && newScale <= 200) setScale(newScale);
          }}
          onClick={handleStageClick}
          onMouseMove={handleMouseMove}
          ref={stageRef}
          className={isDrawing ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}
          style={{ background: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          <MapCanvasLayer 
              scale={scale}
              offset={offset}
              isDrawing={isDrawing}
              isEditing={isEditing}
              shape={shape}
              drawingPoints={drawingPoints}
              mousePos={mousePos}
              placedDevices={placedDevices}
              availableDevices={availableDevices}
              selectedPlacedId={selectedPlacedId}
              onOffsetChange={setOffset}
              onDeviceDragEnd={handleDeviceDragEnd}
              onDeviceSelect={setSelectedPlacedId}
              onPointDragMove={handlePointDragMove}
              onPointRemove={removePointFromShape}
          />
        </StageAny>
      </main>
    </div>
  );
};

export default GreenhouseMap;