import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PlayerProvider } from './player/PlayerContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Home from './pages/Home';
import Songs from './pages/Songs';
import SongDetail from './pages/SongDetail';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyPlaylists from './pages/MyPlaylists';
import MyPlaylistDetail from './pages/MyPlaylistDetail';
import Likes from './pages/Likes';
import History from './pages/History';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSongs from './pages/admin/AdminSongs';
import AdminSongForm from './pages/admin/AdminSongForm';
import AdminArtists from './pages/admin/AdminArtists';
import AdminPlaylists from './pages/admin/AdminPlaylists';
import AdminMembers from './pages/admin/AdminMembers';

function App() {
  return (
    // AuthProvider ครอบทั้งแอป (ทุกหน้าเรียก useAuth() ได้) PlayerProvider อยู่ข้างใน เพราะต้องใช้ token ตอนบันทึกประวัติการฟัง
    <AuthProvider>
      <PlayerProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* guest: ดูได้ทุกคน */}
              <Route path="/" element={<Home />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/songs/:id" element={<SongDetail />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/:id" element={<ArtistDetail />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />

              {/* member: ต้อง login */}
              <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/me/playlists" element={<ProtectedRoute><MyPlaylists /></ProtectedRoute>} />
              <Route path="/me/playlists/:id" element={<ProtectedRoute><MyPlaylistDetail /></ProtectedRoute>} />
              <Route path="/me/likes" element={<ProtectedRoute><Likes /></ProtectedRoute>} />
              <Route path="/me/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

              {/* admin: ครอบทั้งกิ่งด้วย RequireRole ครั้งเดียว ลูกทุกหน้าได้รับการป้องกัน */}
              <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
                <Route index element={<AdminDashboard />} />
                <Route path="songs" element={<AdminSongs />} />
                <Route path="songs/new" element={<AdminSongForm />} />
                <Route path="songs/:id" element={<AdminSongForm />} />
                <Route path="artists" element={<AdminArtists />} />
                <Route path="playlists" element={<AdminPlaylists />} />
                <Route path="members" element={<AdminMembers />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
