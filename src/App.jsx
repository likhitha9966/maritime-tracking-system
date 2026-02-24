import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Fix for Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [vessels, setVessels] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // 'Admin', 'Operator', or 'Viewer'
  const [formData, setFormData] = useState({ vesselId: '', name: '', type: 'Cargo', latitude: '', longitude: '', speed: '' });
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) { setIsLoggedIn(true); setUserRole(savedRole); fetchVessels(); }
  }, []);

  const fetchVessels = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vessels');
      const data = await res.json();
      setVessels(data);
    } catch (err) { console.error("Server connection failed"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const result = await res.json();
      if (res.ok) {
        setIsLoggedIn(true);
        setUserRole(result.role);
        localStorage.setItem('userRole', result.role);
        fetchVessels();
      } else { alert("Login Error: Incorrect credentials"); }
    } catch (err) { alert("Backend server not responding"); }
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`http://localhost:5000/api/vessels/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchVessels();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/vessels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ vesselId: '', name: '', type: 'Cargo', latitude: '', longitude: '', speed: '' });
    fetchVessels();
  };

  const handleDelete = async (id) => {
    if (window.confirm("CONFIRMATION: Delete this vessel from the system?")) {
      await fetch(`http://localhost:5000/api/vessels/${id}`, { method: 'DELETE' });
      fetchVessels();
    }
  };

  // --- 1. LOGIN PAGE (PERFECTLY CENTERED FIX) ---
  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001f3f', position: 'fixed', top: 0, left: 0 }}>
        <div style={{ background: 'white', padding: '60px 40px', borderRadius: '25px', textAlign: 'center', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <span style={{ fontSize: '4rem' }}>🚢</span>
          <h2 style={{ color: '#001f3f', marginBottom: '10px', fontWeight: '900' }}>NAVAL LOGIN</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Secure Fleet Operations Terminal</p>
          <form onSubmit={handleLogin}>
            <input style={inputStyle} placeholder="Username" onChange={e => setLoginData({...loginData, username: e.target.value})} required />
            <input style={inputStyle} type="password" placeholder="Password" onChange={e => setLoginData({...loginData, password: e.target.value})} required />
            <button style={btnStyle} type="submit">AUTHENTICATE</button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. DASHBOARD PAGE (CENTERED & ROLE-BASED) ---
  return (
    <div style={{ background: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Centered Top Navbar */}
      <nav style={{ background: '#001f3f', color: 'white', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>⚓ NAVAL OPERATIONS: {userRole.toUpperCase()}</h2>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
      </nav>

      {/* Main Content Container - Centered */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '30px' }}>
        
        {/* ROW 1: Map and Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '25px' }}>
          <div style={cardStyle}>
             <h3 style={{marginTop: 0, color: '#001f3f'}}>Live Strategic Tracking</h3>
             <div style={{ height: '400px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {vessels.map(v => v.latitude && (
                    <React.Fragment key={v._id}>
                      <Marker position={[v.latitude, v.longitude]}>
                        <Popup><b>{v.name}</b><br/>Status: {v.status}</Popup>
                      </Marker>
                      <Polyline positions={[[v.latitude, v.longitude], [v.latitude + 3, v.longitude + 4]]} color="#3498db" />
                    </React.Fragment>
                  ))}
                </MapContainer>
             </div>
          </div>
          <div style={cardStyle}>
            <Doughnut data={{ labels: ['Cargo', 'Naval', 'Sub'], datasets: [{ data: [vessels.filter(v=>v.type==='Cargo').length, vessels.filter(v=>v.type==='Naval Ship').length, vessels.filter(v=>v.type==='Submarine').length], backgroundColor: ['#3498db', '#e67e22', '#2ecc71'] }] }} />
            <div style={{marginTop: '20px'}}>
                <Bar data={{ labels: vessels.map(v => v.name), datasets: [{ label: 'Speed (kn)', data: vessels.map(v => v.speed), backgroundColor: '#001f3f' }] }} />
            </div>
          </div>
        </div>

        {/* ROW 2: MANAGEMENT - Centered logic applied here */}
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: userRole === 'Admin' ? '1fr 3fr' : '1fr', 
            gap: '25px' 
        }}>
          
          {/* --- ADMIN ONLY: REGISTRATION BOX --- */}
          {userRole === 'Admin' ? (
            <div style={cardStyle}>
              <h3 style={{marginTop: 0, color: '#001f3f'}}>➕ Register Vessel</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={inputStyle} placeholder="Vessel ID" value={formData.vesselId} onChange={e => setFormData({...formData, vesselId: e.target.value})} required />
                <input style={inputStyle} placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input style={inputStyle} type="number" placeholder="Lat" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} required />
                <input style={inputStyle} type="number" placeholder="Long" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} required />
                <input style={inputStyle} type="number" placeholder="Speed" value={formData.speed} onChange={e => setFormData({...formData, speed: e.target.value})} required />
                <button style={btnStyle} type="submit">COMMIT TO FLEET</button>
              </form>
            </div>
          ) : null }

          {/* --- FLEET REGISTRY TABLE --- */}
          <div style={cardStyle}>
            <h3 style={{marginTop: 0, color: '#001f3f'}}>📋 Active Fleet Registry</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #001f3f' }}>
                  <th style={{padding: '12px'}}>Vessel ID</th>
                  <th style={{padding: '12px'}}>Name</th>
                  <th style={{padding: '12px'}}>Status</th>
                  <th style={{padding: '12px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map(v => (
                  <tr key={v._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 12px' }}>{v.vesselId || "UNSET"}</td>
                    <td style={{ padding: '15px 12px' }}><b>{v.name}</b></td>
                    <td style={{ padding: '15px 12px' }}>
                        <span style={{ background: '#e1f5fe', color: '#0288d1', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {v.status}
                        </span>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      
                      {/* Only Admin & Operator can Update Status */}
                      {(userRole === 'Admin' || userRole === 'Operator') ? (
                        <select 
                            onChange={(e) => updateStatus(v._id, e.target.value)} 
                            style={{ padding: '6px', borderRadius: '4px', marginRight: '15px', border: '1px solid #ddd' }}
                            defaultValue={v.status}
                        >
                          <option value="In Transit">In Transit</option>
                          <option value="Docked">Docked</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      ) : null }

                      {/* ONLY Admin can Delete */}
                      {userRole === 'Admin' && (
                        <button onClick={() => handleDelete(v._id)} style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>DELETE</button>
                      )}

                      {/* User (Viewer) sees this */}
                      {userRole === 'Viewer' && <span style={{color: '#999', fontSize: '0.85rem', fontStyle: 'italic'}}>Read Only Access</span>}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling Constants
const inputStyle = { width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' };
const btnStyle = { background: '#001f3f', color: 'white', padding: '15px', border: 'none', borderRadius: '10px', width: '100%', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #eee' };

export default App;