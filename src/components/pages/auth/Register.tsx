import React, { useState } from "react"
import type { FormEvent } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const navigate = useNavigate();

  const handleRegister = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
     try {
        const url = await fetch("https://todo-list-collab-server.onrender.com/auth/register",{
            method: 'POST',
            body: JSON.stringify({ email, password, username: userName }),
            headers: { "Content-Type": "application/json" },
            credentials:'include'
        });
        const response = await url.json();
        console.log(response)
        if(response.message === "User created successfully" && response?.status === true){
            toast.success("User Created Successfully")
            navigate("/login");
        }else{
            alert(response?.message);
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
            Register
          </h1>
          <form onSubmit={handleRegister} className="space-y-5">
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
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your Username Here"
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
              Register
            </Button>
          </form>

          <p className="text-sm text-center mt-4 text-white">
            <Button type="button" onClick={()=>navigate("/")}>
                Back to login
            </Button>
            </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register;
