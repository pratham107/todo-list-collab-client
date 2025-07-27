import { useEffect, useState } from 'react'
import Login from './components/pages/auth/Login'
import { BrowserRouter,Routes ,Route, Navigate } from 'react-router-dom'
import Register from './components/pages/auth/Register'
import Dashboard from './components/pages/dashboard'
import { Toaster } from 'react-hot-toast';

function App() {
    
  const [isAuth, setIsAuth] = useState(false);

  const checkIsLoggedIn=async()=>{
        try {
           const url = await fetch("https://todo-list-collab-server.onrender.com/auth/isLoggedIn",{
            method:"GET",
            credentials:"include"
           });
           const data = await url.json();
           if(data.message === "User is logged in" && data.status===true){
            setIsAuth(true);
           }else{
            setIsAuth(false);
           }
        } catch (error) {
          console.log(error)
           setIsAuth(false);
        }
  }

  useEffect(()=>{
      checkIsLoggedIn();
  },[])

  return (
    <>
      <Toaster position="top-right" 
       toastOptions={{
          duration: 3000, 
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
           />
           <Route
            path="/login" 
            element={isAuth ? <Navigate to="/dashboard" />: <Login />} />
           <Route 
            path="/register" 
            element={isAuth ? <Navigate to="/dashboard" /> : <Register />} />
           <Route path="/dashboard" 
            element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
           <Route path="/*" element={<div>
            <h1>Page Not Found</h1>
           </div>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
