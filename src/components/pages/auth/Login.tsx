import React, { useState, FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const navigate = useNavigate();

  const handleLogin = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
     
     try {
        const url = await fetch("https://todo-list-collab-server.onrender.com/auth/login",{
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
            credentials:'include'
        });
        const response = await url.json();
        if(response?.message === "User logged in successfully" && response?.status === true){
            navigate("/dashboard");
        }else{
            alert("Invalid credentials");
        }
     } catch (error) {
        console.log(error)
     }

  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 bg-[length:400%_400%] animate-gradient" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10" />
      <Card className="z-20 w-full max-w-md p-6 border border-white/20 backdrop-blur-lg bg-white/10 shadow-2xl">
        <CardContent>
          <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow">
            Login to your account
          </h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 transition">
              Login
            </Button>
          </form>

          <p className="text-sm text-center mt-4 text-white">
            Don’t have an account?{" "}
             <Button type="button" onClick={()=>navigate("/register")}>
                Sign Up
             </Button>
            </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
