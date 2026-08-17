import { useState, useRef, useEffect } from 'react'
import { Camera, AlertTriangle, Truck, Upload, Activity, CheckCircle, Database } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('camera')
  const [junctionId, setJunctionId] = useState('6a81f8984acc293cfa1d78e7')
  const [deviceId, setDeviceId] = useState('CAM-001')
  const [status, setStatus] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const [videoFile, setVideoFile] = useState(null)
  const xhrRef = useRef(null)

  const [backendEvents, setBackendEvents] = useState([])
  const wsRef = useRef(null)

  const [aggregateStats, setAggregateStats] = useState({
    totalFrames: 0,
    maxCars: 0,
    maxTrucks: 0,
    maxBuses: 0,
    maxBikes: 0,
    anomaliesDetected: 0,
    avgProcessingTime: 0,
    latestCongestion: 'NORMAL',
    maxCongestionScore: 0
  })

  useEffect(() => {
    if (!junctionId) return;

    let ws = null;
    let isMounted = true;

    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8000/api/v1/ws/live-dashboard`
      ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        if (isMounted) console.log("WebSocket connected to live-dashboard");
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type) {
            setBackendEvents(prev => [{ timestamp: new Date().toLocaleTimeString(), ...data }, ...prev].slice(0, 50))
            
            if (data.type === 'ML_DETECTION' && data.data) {
               const stats = data.data.aggregate_stats || {};
               const counts = stats.total_by_class || {};
               const meta = data.data.frame_metadata || {};
               setAggregateStats(prev => ({
                  totalFrames: prev.totalFrames + 1,
                  maxCars: Math.max(prev.maxCars, counts.cars || 0),
                  maxTrucks: Math.max(prev.maxTrucks, counts.trucks || 0),
                  maxBuses: Math.max(prev.maxBuses, counts.buses || 0),
                  maxBikes: Math.max(prev.maxBikes, counts.motorcycles || 0),
                  anomaliesDetected: prev.anomaliesDetected + (data.data.anomalies?.length || 0),
                  avgProcessingTime: prev.totalFrames === 0 ? (meta.total_processing_time_ms || 0) : Math.round((prev.avgProcessingTime * prev.totalFrames + (meta.total_processing_time_ms || 0)) / (prev.totalFrames + 1)),
                  latestCongestion: stats.overall_congestion_level || prev.latestCongestion,
                  maxCongestionScore: Math.max(prev.maxCongestionScore, stats.overall_congestion_score || 0)
               }))
            }
          }
        } catch (e) {
          // ignore
        }
      }

      ws.onerror = (err) => {
        console.error("WebSocket Error:", err);
      }

      ws.onclose = () => {
        if (isMounted) {
          console.log("WebSocket closed, retrying in 2s...");
          setTimeout(connectWebSocket, 2000);
        }
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop on unmount
        if (ws.readyState === 1) { // OPEN
          ws.close();
        } else if (ws.readyState === 0) { // CONNECTING
          ws.onopen = () => ws.close();
        }
      }
    }
  }, [junctionId])

  const handleVideoUpload = (e) => {
    e.preventDefault()
    if (!videoFile) {
      setStatus('Please select a video file first.')
      return
    }
    
    setStatus('Uploading video and starting YOLO ML pipeline...')
    setUploadProgress(0)
    
    const formData = new FormData()
    formData.append('junction_id', junctionId)
    formData.append('device_id', deviceId)
    formData.append('video', videoFile)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percentComplete)
        if (percentComplete === 100) {
          setStatus('Processing on backend...')
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          setStatus(`Pipeline started on backend: ${data.message}`)
        } catch(err) {
          setStatus('Upload complete. Backend processing started.')
        }
      } else {
        setStatus(`Error: ${xhr.statusText}`)
      }
    }

    xhr.onerror = () => {
      setStatus('Error: Network Request Failed')
    }

    xhr.open('POST', 'http://localhost:8000/api/v1/simulation/process-video')
    xhr.send(formData)
  }

  const handleAnomaly = async (anomalyType) => {
    setStatus(`Injecting ${anomalyType} anomaly...`)
    try {
      const res = await fetch(`http://localhost:8000/api/v1/simulation/trigger-anomaly?junction_id=${junctionId}&device_id=${deviceId}&anomaly_type=${anomalyType}`, {
        method: 'POST'
      })
      const data = await res.json()
      setStatus(`Anomaly injected: ${data.message}`)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
  }

  const handleAmbulance = async (e) => {
    e.preventDefault()
    const form = e.target
    const origin = { lat: parseFloat(form.startLat.value), lng: parseFloat(form.startLng.value) }
    const dest = { lat: parseFloat(form.endLat.value), lng: parseFloat(form.endLng.value) }
    
    setStatus('Dispatching ambulance routing...')
    try {
      const res = await fetch(`http://localhost:8000/api/v1/simulation/dispatch-ambulance?ambulance_id=AMB-${Date.now()}&origin_lat=${origin.lat}&origin_lng=${origin.lng}&dest_lat=${dest.lat}&dest_lng=${dest.lng}`, {
        method: 'POST'
      })
      const data = await res.json()
      setStatus(`Ambulance Dispatched: ${data.message}`)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-blue-500" size={32} />
            Edge Device Simulator
          </h1>
          <p className="text-slate-400 mt-2">Simulate real-time camera feeds, anomalies, and emergency vehicles for I²TMS.</p>
        </header>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('camera')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'camera' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Camera size={20} />
              ML Pipeline
            </button>
            <button 
              onClick={() => setActiveTab('anomaly')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'anomaly' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <AlertTriangle size={20} />
              Anomalies
            </button>
            <button 
              onClick={() => setActiveTab('ambulance')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'ambulance' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Truck size={20} />
              Ambulance
            </button>
          </div>

          <div className="col-span-3 bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
            {status && (
              <div className="mb-6 p-4 rounded-lg bg-slate-700/50 border border-slate-600 text-sm font-mono text-emerald-400">
                &gt; {status}
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Simulate Live Camera Feed</h2>
                  <p className="text-slate-400 text-sm">Upload a CCTV footage snippet to push frames to the main YOLOv8 backend pipeline.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Junction ID</label>
                    <input type="text" value={junctionId} onChange={e => setJunctionId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Device ID</label>
                    <input type="text" value={deviceId} onChange={e => setDeviceId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <form onSubmit={handleVideoUpload} className="mt-4 border-2 border-dashed border-slate-600 rounded-xl p-8 text-center bg-slate-900/50">
                  <div className="relative cursor-pointer group py-6 hover:border-blue-500 transition-colors border-2 border-transparent rounded-lg">
                    <input 
                      type="file" 
                      accept="video/mp4,video/avi,video/x-m4v,video/*" 
                      onChange={e => setVideoFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Upload className="mx-auto text-slate-400 group-hover:text-blue-500 transition-colors mb-3" size={32} />
                    <p className="text-slate-300 font-medium">
                      {videoFile ? (
                        <span className="flex items-center justify-center gap-2 text-blue-400">
                          <CheckCircle size={16} /> {videoFile.name}
                        </span>
                      ) : (
                        "Click to select video or drag and drop"
                      )}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">MP4, AVI up to 50MB</p>
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress <= 100 && (
                    <div className="mt-4 w-full bg-slate-800 rounded-full h-2.5 max-w-xs mx-auto overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                  
                  <button type="submit" className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors relative z-20">
                    Upload & Process
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'anomaly' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Inject Trajectory Anomalies</h2>
                  <p className="text-slate-400 text-sm">Trigger real-time anomaly alerts on the command panel dashboard.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Junction ID</label>
                    <input type="text" value={junctionId} onChange={e => setJunctionId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Device ID</label>
                    <input type="text" value={deviceId} onChange={e => setDeviceId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleAnomaly('WRONG_WAY')} className="p-4 bg-slate-900 border border-red-900 hover:border-red-500 rounded-xl text-left transition-colors group">
                    <div className="font-bold text-red-400 group-hover:text-red-300">Wrong Way Driving</div>
                    <div className="text-sm text-slate-500 mt-1">Simulate a vehicle driving against traffic flow</div>
                  </button>
                  <button onClick={() => handleAnomaly('ILLEGAL_U_TURN')} className="p-4 bg-slate-900 border border-orange-900 hover:border-orange-500 rounded-xl text-left transition-colors group">
                    <div className="font-bold text-orange-400 group-hover:text-orange-300">Illegal U-Turn</div>
                    <div className="text-sm text-slate-500 mt-1">Vehicle makes a prohibited U-turn</div>
                  </button>
                  <button onClick={() => handleAnomaly('OVERSPEEDING')} className="p-4 bg-slate-900 border border-yellow-900 hover:border-yellow-500 rounded-xl text-left transition-colors group">
                    <div className="font-bold text-yellow-400 group-hover:text-yellow-300">Overspeeding</div>
                    <div className="text-sm text-slate-500 mt-1">Vehicle exceeding lane speed limits</div>
                  </button>
                  <button onClick={() => handleAnomaly('STATIONARY_VEHICLE')} className="p-4 bg-slate-900 border border-blue-900 hover:border-blue-500 rounded-xl text-left transition-colors group">
                    <div className="font-bold text-blue-400 group-hover:text-blue-300">Stopped Vehicle</div>
                    <div className="text-sm text-slate-500 mt-1">Vehicle broken down causing congestion</div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ambulance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Dispatch Ambulance Route</h2>
                  <p className="text-slate-400 text-sm">Simulate a green corridor priority route across the city map.</p>
                </div>

                <form onSubmit={handleAmbulance} className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl">
                    <h3 className="font-medium text-emerald-400 mb-3">Origin Coordinates (Sitabuldi)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                        <input name="startLat" defaultValue="21.1425071" step="any" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                        <input name="startLng" defaultValue="79.0795768" step="any" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl">
                    <h3 className="font-medium text-emerald-400 mb-3">Destination Coordinates (AIIMS Nagpur)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                        <input name="endLat" defaultValue="21.0386" step="any" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                        <input name="endLng" defaultValue="79.0238" step="any" type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <Truck size={20} />
                    Dispatch Emergency Vehicle
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time backend stream log */}
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
              <h3 className="font-medium text-slate-300 flex items-center gap-2">
                <Database size={18} className="text-blue-500" />
                Live Output Stream
              </h3>
              <span className="text-xs font-mono px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">WebSocket Connected</span>
            </div>
            <div className="p-4 h-[500px] overflow-y-auto font-mono text-xs text-slate-400 space-y-2 custom-scrollbar">
              {backendEvents.length === 0 ? (
                <div className="text-center text-slate-600 py-10 italic">Waiting for simulation events...</div>
              ) : (
                backendEvents.map((evt, idx) => {
                  if (evt.type === 'ML_DETECTION' && evt.data) {
                    const data = evt.data;
                    const stats = data.aggregate_stats || {};
                    const counts = stats.total_by_class || {};
                    const metadata = data.frame_metadata || {};
                    const congestion = stats.overall_congestion_level || 'UNKNOWN';
                    const congestionColors = {
                      LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                      HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                      CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20'
                    };

                    return (
                      <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-blue-400 font-bold flex items-center gap-2">
                              YOLO Frame #{data.frame_id || evt.frame}
                              <span className="text-xs text-slate-500 font-normal">[{evt.timestamp}]</span>
                            </div>
                            <div className="text-slate-400 text-xs mt-1">Processing: {metadata.total_processing_time_ms || 0}ms</div>
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-bold ${congestionColors[congestion] || 'text-slate-400 bg-slate-800'}`}>
                            {congestion} Traffic ({(stats.overall_congestion_score || 0).toFixed(2)})
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-slate-800 rounded-lg p-2 text-center">
                            <div className="text-slate-400 text-xs uppercase">Cars</div>
                            <div className="text-white font-bold text-lg">{counts.cars || 0}</div>
                          </div>
                          <div className="bg-slate-800 rounded-lg p-2 text-center">
                            <div className="text-slate-400 text-xs uppercase">Bikes</div>
                            <div className="text-white font-bold text-lg">{counts.motorcycles || 0}</div>
                          </div>
                          <div className="bg-slate-800 rounded-lg p-2 text-center">
                            <div className="text-slate-400 text-xs uppercase">Buses</div>
                            <div className="text-white font-bold text-lg">{counts.buses || 0}</div>
                          </div>
                          <div className="bg-slate-800 rounded-lg p-2 text-center">
                            <div className="text-slate-400 text-xs uppercase">Trucks</div>
                            <div className="text-white font-bold text-lg">{counts.trucks || 0}</div>
                          </div>
                        </div>

                        {data.anomalies && data.anomalies.length > 0 && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="text-red-400 text-xs font-bold uppercase mb-1">Anomalies Detected ({data.anomalies.length})</div>
                            <ul className="text-slate-300 text-xs list-disc list-inside">
                              {data.anomalies.map((a, i) => <li key={i}>{a.anomaly_type} (Risk: {a.risk_score.toFixed(2)})</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-800 animate-in fade-in slide-in-from-top-2">
                      <div className="text-blue-400 mb-1 flex justify-between">
                        <span>[{evt.timestamp}] <span className="text-white font-bold">{evt.type}</span></span>
                        {evt.device_id && <span className="text-slate-500">{evt.device_id}</span>}
                      </div>
                      <pre className="overflow-x-auto text-emerald-300/80">
                        {JSON.stringify(evt.data || evt.message || evt, null, 2)}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Aggregate Stats Sidebar */}
          <div className="lg:col-span-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6 flex flex-col h-[565px]">
            <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-purple-400" />
              Aggregated Metrics
            </h3>
            
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Video Frames Processed</div>
                <div className="text-3xl font-black text-white">{aggregateStats.totalFrames}</div>
                <div className="text-emerald-400 text-xs mt-1">Avg {aggregateStats.avgProcessingTime}ms/frame</div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-3">Peak Vehicle Density</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-slate-800 rounded p-2 border border-slate-700">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Max Cars</div>
                    <div className="text-xl font-bold text-white mt-1">{aggregateStats.maxCars}</div>
                  </div>
                  <div className="text-center bg-slate-800 rounded p-2 border border-slate-700">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Max Trucks</div>
                    <div className="text-xl font-bold text-white mt-1">{aggregateStats.maxTrucks}</div>
                  </div>
                  <div className="text-center bg-slate-800 rounded p-2 border border-slate-700">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Max Buses</div>
                    <div className="text-xl font-bold text-white mt-1">{aggregateStats.maxBuses}</div>
                  </div>
                  <div className="text-center bg-slate-800 rounded p-2 border border-slate-700">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Max Bikes</div>
                    <div className="text-xl font-bold text-white mt-1">{aggregateStats.maxBikes}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Overall Congestion</div>
                <div className="flex items-end gap-3 mt-2">
                  <div className={`text-2xl font-black ${
                    aggregateStats.latestCongestion === 'CRITICAL' ? 'text-red-500' :
                    aggregateStats.latestCongestion === 'HIGH' ? 'text-orange-500' :
                    aggregateStats.latestCongestion === 'MEDIUM' ? 'text-yellow-500' :
                    'text-emerald-500'
                  }`}>
                    {aggregateStats.latestCongestion}
                  </div>
                  <div className="text-slate-500 text-xs mb-1">Max Score: {aggregateStats.maxCongestionScore.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Anomalies Logged</div>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle size={24} className={aggregateStats.anomaliesDetected > 0 ? 'text-red-500' : 'text-slate-600'} />
                  <span className="text-3xl font-black text-white">{aggregateStats.anomaliesDetected}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setAggregateStats({
                totalFrames: 0, maxCars: 0, maxTrucks: 0, maxBuses: 0, maxBikes: 0, 
                anomaliesDetected: 0, avgProcessingTime: 0, latestCongestion: 'NORMAL', maxCongestionScore: 0
              })}
              className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-600"
            >
              Reset Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
