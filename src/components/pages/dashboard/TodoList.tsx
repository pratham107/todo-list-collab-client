import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";
import socket from "../../../socket.ts"

// Define Todo type
type Todo = {
  title: string;
  dueDate: string;
  isPrivate: boolean;
  description: string;
  status: string;
  _id:string
};
type FetchMyTodosData = () => void;

// Props for this component
type TodoListProps = {
  myTodos: Todo[];
  fetchMyTodosData: FetchMyTodosData;
  
};

// Format ISO date to DD-MM-YYYY
function formatToDDMMYYYY(isoDateStr: string) {
  const date = new Date(isoDateStr);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

// Reusable badge component
const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses =
    "text-xs font-medium px-3 py-1 rounded-full w-fit inline-block";
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500 text-black",
    completed: "bg-green-500 text-white",
    inprogress: "bg-blue-500 text-white",
  };

  return (
    <span className={`${baseClasses} ${statusStyles[status] || "bg-gray-500"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};



const TodoList: React.FC<TodoListProps> = ({ myTodos, fetchMyTodosData }) => {

   const changeStatusHandler=async(e:string, currentStatus:string, id:string)=>{
      console.log(e);
      console.log(currentStatus);
      if(e != currentStatus)
       try {
          const url = await fetch("https://todo-list-collab-server.onrender.com/todo/update-status",{
            method: "PATCH",
             body: JSON.stringify({
              id: id,
              status: e,
            }),
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            });
            const data = await url.json();
            if(data.message === "Task status updated successfully" && data.status === true){
              toast.success("Task Updated Successfully")
              fetchMyTodosData();
              if(data?.task?.isPrivate === false){
                  socket.emit("task-update", { task: data.task });
              }
            }else{
              toast.error("Failed to update task")
            }
       } catch (error) {
          console.log(error)
       }

   }

  return (
    <div className="p-4 flex justify-center">
      <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white w-full max-w-5xl shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold tracking-wide">Your Todos</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="text-gray-400">
              These are your created task. Stay updated with real-time changes!
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Title</TableHead>
                <TableHead className="text-white">Due Date</TableHead>
                <TableHead className="text-white">Visibility</TableHead>
                <TableHead className="text-white">Description</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTodos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    No todos found.
                  </TableCell>
                </TableRow>
              ) : (
                myTodos.map((todo, index) => (
                  <TableRow key={index}>
                  <TableCell
                    className={`font-medium ${
                      todo.status === "completed" ? "line-through text-gray-400 opacity-70" : ""
                    }`}
                  >
                    {todo.title}
                  </TableCell>
                    <TableCell>{formatToDDMMYYYY(todo.dueDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          todo.isPrivate
                            ? "bg-red-500 text-white"
                            : "bg-indigo-500 text-white"
                        }`}
                      >
                        {todo.isPrivate ? "Private" : "Public"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {todo.description}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={todo.status} />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={todo.status} 
                        onValueChange={(e)=>changeStatusHandler(e, todo.status, todo?._id)}
                       >
                      <SelectTrigger className="w-[100px] bg-gray-800 text-white rounded-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In-Progess</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoList;
