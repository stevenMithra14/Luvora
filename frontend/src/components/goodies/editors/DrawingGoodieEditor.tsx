import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Undo2, Redo2, Eraser, Paintbrush, Trash2, Palette, Loader2 } from 'lucide-react';
import { WizardGoodie } from '../../../context/WizardContext';
import { uploadPhotoApi } from '../../../services/giftService';

interface DrawingGoodieEditorProps {
  goodie: WizardGoodie;
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const DrawingGoodieEditor: React.FC<DrawingGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  // Title and Caption initialized to empty if not customized yet, with clear placeholders shown
  const defaultTitles = ['Handmade Doodle', 'Hand Drawing', 'Drawing'];
  const defaultCaptions = ['A little sketch created especially for you.', 'A little drawing made just for you ❤️'];

  const [title, setTitle] = useState(goodie.title && !defaultTitles.includes(goodie.title) ? goodie.title : '');
  const [caption, setCaption] = useState(
    goodie.configurationJson?.caption && !defaultCaptions.includes(goodie.configurationJson?.caption)
      ? goodie.configurationJson.caption
      : ''
  );
  const [isSaving, setIsSaving] = useState(false);

  // Drawing Tools State
  const [selectedColor, setSelectedColor] = useState('#ec4899');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Canvas Undo/Redo History Stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const presetColors = [
    '#ec4899', // Pink
    '#e11d48', // Red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#a855f7', // Purple
    '#f97316', // Orange
    '#eab308', // Yellow
    '#1e293b', // Dark Slate
  ];

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, dataUrl];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const loadCanvasFromUrl = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 360;

    // Fill initial canvas white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing drawing if editing
    if (goodie.mediaUrl || goodie.configurationJson?.drawingDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveCanvasState();
      };
      img.src = goodie.mediaUrl || goodie.configurationJson.drawingDataUrl;
    } else {
      saveCanvasState();
    }
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const point = getCanvasCoords(e);
    lastPointRef.current = point;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : selectedColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    }
    ctx.lineTo(point.x, point.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : selectedColor;
    ctx.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      saveCanvasState();
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      loadCanvasFromUrl(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      loadCanvasFromUrl(history[nextIdx]);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    const dataUrl = canvas.toDataURL('image/png');

    const finalTitle = title.trim() || 'Handmade Doodle';
    const finalCaption = caption.trim() || 'A little sketch created especially for you.';

    let mediaUrlToUse = dataUrl;

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const uploadRes = await uploadPhotoApi(blob, 'drawing.png');
        if (uploadRes?.url) {
          mediaUrlToUse = uploadRes.url;
        }
      }
    } catch (err) {
      console.warn('Canvas upload fallback to dataUrl:', err);
    }

    onSave(goodie.id, {
      title: finalTitle,
      description: finalCaption,
      mediaUrl: mediaUrlToUse,
      configurationJson: {
        ...goodie.configurationJson,
        title: finalTitle,
        caption: finalCaption,
        drawingDataUrl: dataUrl,
      },
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#faf8f5] border border-amber-900/20 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-slate-900 font-mono relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-0.5">
          <h3 className="font-mono text-sm font-extrabold tracking-widest text-[#8b2626] uppercase flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#8b2626]" />
            <span>ADD DRAWING</span>
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          {/* Title Input (Starts empty with placeholder) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Handmade Doodle"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* DRAWING TOOLBAR (Colors, Pen, Rubber/Eraser, Brush Size, Undo, Redo, Clear) */}
          <div className="p-2.5 rounded-2xl bg-white border border-slate-300 space-y-2.5 shadow-xs">
            {/* Row 1: Tools & Actions */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto">
              <div className="flex items-center gap-1">
                {/* Pen Tool */}
                <button
                  type="button"
                  onClick={() => setTool('pen')}
                  className={`p-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    tool === 'pen'
                      ? 'bg-[#8b2626] text-white border-[#8b2626]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Paintbrush className="h-3.5 w-3.5" />
                  <span>Brush</span>
                </button>

                {/* Eraser / Rubber Tool */}
                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  className={`p-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    tool === 'eraser'
                      ? 'bg-[#8b2626] text-white border-[#8b2626]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Eraser className="h-3.5 w-3.5" />
                  <span>Eraser</span>
                </button>

                {/* Brush Size Selector */}
                <div className="flex items-center gap-1 ml-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {[2, 5, 10].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBrushSize(size)}
                      className={`h-5 w-5 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer ${
                        brushSize === size ? 'bg-[#8b2626] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {size === 2 ? 'S' : size === 5 ? 'M' : 'L'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Undo, Redo, Clear */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  title="Undo"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  title="Redo"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                  title="Clear Canvas"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Row 2: Color Palette Swatches */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                <span className="text-[10px] text-slate-400 font-bold mr-1">Colors:</span>
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-5 w-5 rounded-full border border-white/60 shadow-xs cursor-pointer shrink-0 transition-transform ${
                      selectedColor === color ? 'scale-125 ring-2 ring-[#8b2626]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                {/* Custom Color Picker */}
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="h-6 w-6 rounded-full cursor-pointer bg-transparent border-0 p-0 shrink-0"
                  title="Choose custom color"
                />
              </div>
            )}
          </div>

          {/* HTML5 Touch/Mouse Drawing Canvas */}
          <div className="rounded-2xl overflow-hidden border-2 border-slate-300 bg-white flex justify-center items-center shadow-inner relative touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair touch-none"
            />
          </div>

          {/* Caption Input (Starts empty with placeholder) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A little sketch created especially for you."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#8b2626] text-white font-mono text-xs font-bold shadow-md hover:bg-[#731e1e] active:scale-95 transition-all cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Adding...</span>
              </>
            ) : (
              <span>Add to package</span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-mono text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
