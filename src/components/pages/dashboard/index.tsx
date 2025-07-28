import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TodoList from "./TodoList";
import OthersTodo from "./OthersTodo";
import socket from "../../../socket.ts";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [todoName, setTodoName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [visibility, setVisibility] = useState("");
  const [myTodos, SetMyTodos] = useState([]);
  const [othersTodo, SetOthersTodos] = useState([])
  const navigate = useNavigate();


  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState<null | { type: "success" | "error"; message: string }>(null);
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("https://todo-list-collab-server.onrender.com/todo/add-todo", {
        method: "POST",
        body: JSON.stringify({
            title: todoName,
            description: description,
            dueDate: dueDate, 
            isPrivate: visibility === "private",
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        });
      const response = await res.json();

      if (response?.message === "Task created successfully" && response.status === true) {
         if(visibility === "public"){
              socket.emit("new-task", { task: response.data });
          }
          toast.success("Task Added Successfully")
        
        setAlert({ type: "success", message: "Task Added Successfully" });
        fetchMyTodosData();
        // Close Dialog
        setOpenDialog(false);

        // Reset form
        setTodoName("");
        setDescription("");
        setDueDate("");
        setVisibility("");

        // Auto-dismiss alert after 3 seconds
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({ type: "error", message: "Something went wrong!" });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.log(error);
      setAlert({ type: "error", message: "Server error!" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const fetchMyTodosData=async()=>{
      try{
         const url = await fetch("https://todo-list-collab-server.onrender.com/todo/all-my-tasks",{
            credentials: 'include',
            method:'GET'
         });
         const response = await url.json();
         if(response?.message==="All tasks fetched successfully" && response.status === true){
            SetMyTodos(response?.data);
         }else{
            toast.error(response?.message)
            setAlert({type:"error",message:"Something went wrong!"});
            SetMyTodos([]);
         }
      }catch(error){
          console.log(error)
      }
  }

  

  const fetchOtherTodosData=async()=>{
      try{
         const url = await fetch("https://todo-list-collab-server.onrender.com/todo/all-other-task",{
            credentials: 'include',
            method:'GET'
         });
         const response = await url.json();
         if(response?.message==="Public tasks from other users fetched successfully" && response.status === true){
            SetOthersTodos(response?.data);
         }else{
          toast.error(response?.message)
            setAlert({type:"error",message:"Something went wrong!"});
            SetOthersTodos([]);
         }
      }catch(error){
          console.log(error)
      }
  }

  const fetchInitialTodos = () => {
  fetchMyTodosData();
  fetchOtherTodosData();
};

useEffect(() => {
  fetchInitialTodos();
}, []);

  // type TaskPayload ={
  //   id: string;
  //   title: string;
  //   description: string;  
  //   status:string
  // }

 useEffect(() => {
  const taskAddedHandler = () => {
    fetchOtherTodosData();
    toast.success("A new public task was added by someone!");
  };

  const taskUpdatedHandler = () => {
    fetchOtherTodosData();
    toast.success(`Someone updated their task`);
  };

  socket.on("task-added-by-other", taskAddedHandler);
  socket.on("Some Update their Task", taskUpdatedHandler);

  return () => {
    socket.off("task-added-by-other", taskAddedHandler);
    socket.off("Some Update their Task", taskUpdatedHandler);
  };
}, [socket]);

  const logoutHandler=async()=>{
      try {
        const url = await fetch("https://todo-list-collab-server.onrender.com/auth/logout",{
          method:"POST",
          credentials:'include'
        })
        const response = await url.json();
        if(response?.message === "User logged out successfully" && response?.status === true){
          toast.success("Logged out successfully");
          localStorage.clear();
          navigate('/login')
        }else{
          toast.error("Failed to log out");
        }
      } catch (error) {
        console.log(error)
      }
  }



  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 w-screen min-h-screen">
       <div className="">
         🟢 <p  className="text-white">Live</p>
       </div>
      <div className="flex items-center flex-col">
         <Button className="bg-red-500 text-while" onClick={logoutHandler}>
          Logout
        </Button>
        <Card className="border border-gray-700 shadow-2xl bg-[#111] w-full max-w-md p-4 m-6">
          <CardHeader>
            <h1 className="text-white text-3xl font-semibold text-center">Dashboard</h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Label className="text-white text-lg">Welcome! Ready to be productive?</Label>

            {alert && (
              <Alert
                variant={alert.type === "success" ? "default" : "destructive"}
                className="bg-gray-800 text-white border-none"
              >
                {alert.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  Add Todo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Todo</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label>Todo Name</Label>
                    <Input
                      type="text"
                      value={todoName}
                      onChange={(e) => setTodoName(e.target.value)}
                      className="bg-gray-800 text-white mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-gray-800 text-white mt-1"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-gray-800 text-white mt-1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Visibility</Label>
                    <Select value={visibility} onValueChange={setVisibility}>
                      <SelectTrigger className="w-[180px] bg-gray-800 text-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full">
                    Submit Todo
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <TodoList myTodos={myTodos} fetchMyTodosData={fetchMyTodosData}/>
        <Separator />
        <OthersTodo othersTodo={othersTodo}/>
      </div>
    </div>
  );
};

export default Dashboard;
