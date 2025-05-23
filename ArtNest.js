import { useRef, useState, useEffect } from "react"; import { Button } from "@/components/ui/button"; import { Slider } from "@/components/ui/slider"; import { ChromePicker } from "react-color"; import { motion } from "framer-motion";

const TOOLS = { BRUSH: "brush", RECTANGLE: "rectangle", CIRCLE: "circle", LINE: "line" };

export default function DrawingApp() { const canvasRef = useRef(null); const contextRef = useRef(null); const [isDrawing, setIsDrawing] = useState(false); const [color, setColor] = useState("#000000"); const [lineWidth, setLineWidth] = useState(5); const [history, setHistory] = useState([]); const [tool, setTool] = useState(TOOLS.BRUSH); const [startPos, setStartPos] = useState({ x: 0, y: 0 }); const [layers, setLayers] = useState([{ id: 0, visible: true }]); const [activeLayer, setActiveLayer] = useState(0);

useEffect(() => { const canvas = canvasRef.current; canvas.width = window.innerWidth * 2; canvas.height = window.innerHeight * 2; canvas.style.width = ${window.innerWidth}px; canvas.style.height = ${window.innerHeight}px;

const context = canvas.getContext("2d");
context.scale(2, 2);
context.lineCap = "round";
context.strokeStyle = color;
context.lineWidth = lineWidth;
contextRef.current = context;

}, []);

useEffect(() => { if (contextRef.current) { contextRef.current.strokeStyle = color; contextRef.current.lineWidth = lineWidth; } }, [color, lineWidth]);

const saveToHistory = () => { const canvas = canvasRef.current; const imageData = canvas.toDataURL(); setHistory(prev => [...prev, imageData]); };

const startDrawing = ({ nativeEvent }) => { const { offsetX, offsetY } = nativeEvent; setStartPos({ x: offsetX, y: offsetY }); if (tool === TOOLS.BRUSH) { contextRef.current.beginPath(); contextRef.current.moveTo(offsetX, offsetY); } setIsDrawing(true); saveToHistory(); };

const finishDrawing = ({ nativeEvent }) => { if (!isDrawing) return; setIsDrawing(false); if (tool !== TOOLS.BRUSH) { const { offsetX, offsetY } = nativeEvent; drawShape(tool, startPos.x, startPos.y, offsetX, offsetY); } contextRef.current.closePath(); };

const draw = ({ nativeEvent }) => { if (!isDrawing || tool !== TOOLS.BRUSH) return; const { offsetX, offsetY } = nativeEvent; contextRef.current.lineTo(offsetX, offsetY); contextRef.current.stroke(); };

const drawShape = (tool, x1, y1, x2, y2) => { const ctx = contextRef.current; ctx.beginPath(); switch (tool) { case TOOLS.RECTANGLE: ctx.rect(x1, y1, x2 - x1, y2 - y1); ctx.stroke(); break; case TOOLS.CIRCLE: const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); ctx.arc(x1, y1, radius, 0, 2 * Math.PI); ctx.stroke(); break; case TOOLS.LINE: ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); break; default: break; } };

const clearCanvas = () => { const canvas = canvasRef.current; contextRef.current.clearRect(0, 0, canvas.width, canvas.height); };

const undo = () => { if (history.length === 0) return; const img = new Image(); const prev = [...history]; const last = prev.pop(); setHistory(prev); img.onload = () => { clearCanvas(); contextRef.current.drawImage(img, 0, 0); }; img.src = last; };

const saveImage = () => { const canvas = canvasRef.current; const link = document.createElement('a'); link.download = 'drawing.png'; link.href = canvas.toDataURL(); link.click(); };

return ( <div className="w-screen h-screen bg-gradient-to-br from-purple-500 to-indigo-700 flex flex-col items-center justify-center"> <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="text-white text-4xl font-bold mb-4"> Modern Drawing App </motion.h1> <canvas
ref={canvasRef}
onMouseDown={startDrawing}
onMouseUp={finishDrawing}
onMouseMove={draw}
onMouseLeave={finishDrawing}
className="border-4 border-white rounded-2xl shadow-lg touch-none"
/> <div className="mt-6 flex flex-wrap gap-4 justify-center items-center bg-white/20 p-4 rounded-xl shadow-lg backdrop-blur"> <ChromePicker color={color} onChange={(updatedColor) => setColor(updatedColor.hex)} disableAlpha /> <div className="w-48"> <label className="text-white">Line Width</label> <Slider min={1} max={50} step={1} value={[lineWidth]} onValueChange={(val) => setLineWidth(val[0])} /> </div> <select onChange={(e) => setTool(e.target.value)} value={tool} className="bg-white text-purple-700 px-3 py-2 rounded-xl shadow" > <option value={TOOLS.BRUSH}>Brush</option> <option value={TOOLS.RECTANGLE}>Rectangle</option> <option value={TOOLS.CIRCLE}>Circle</option> <option value={TOOLS.LINE}>Line</option> </select> <Button onClick={clearCanvas} className="bg-white text-purple-700 hover:bg-purple-100"> Clear </Button> <Button onClick={undo} className="bg-white text-purple-700 hover:bg-purple-100"> Undo </Button> <Button onClick={saveImage} className="bg-white text-purple-700 hover:bg-purple-100"> Save </Button> </div> </div> ); }