import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedroute";
import LandingPage from "./components/landing";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Announcements from "./pages/announcements";
import Rooms from "./pages/rooms";
import DiscoverRooms from "./pages/discoverrooms";
import MyRooms from "./pages/myrooms";
import Room from "./pages/room";
import Profile from "./pages/profile";
import Createpost from "./pages/createpost";
import CreateRoom from "./pages/createroom";
import RoomInvitations from "./pages/invitations";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppLayout />}>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/announcements" element={ 
            <ProtectedRoute> <Announcements /> </ProtectedRoute> 
          } />
          
          <Route path="/posts/create" element={
            <ProtectedRoute> <Createpost /> </ProtectedRoute> 
          } />
          
          <Route path="/rooms/create" element={ 
            <ProtectedRoute> <CreateRoom /> </ProtectedRoute> 
          } />

          <Route path="/profile" element={
            <ProtectedRoute> <Profile /> </ProtectedRoute> 
          } />

          <Route path="/rooms" element={ <ProtectedRoute> <Rooms /> </ProtectedRoute> } >
            <Route index element={<Navigate to="discover" replace />} />
            <Route path="discover" element={<DiscoverRooms />} />
            <Route path="my-rooms" element={<MyRooms />} />
            <Route path="invitations" element={ <RoomInvitations /> }/>
          </Route>

          <Route path="/rooms/:roomId" element={ 
            <ProtectedRoute> <Room /> </ProtectedRoute> 
          } />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;