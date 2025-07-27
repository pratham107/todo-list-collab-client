import React, { useState } from "react";
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
import socket from "../../../socket.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

// Define Todo type
type Todo = {
  title: string;
  dueDate: string;
  isPrivate: boolean;
  description: string;
  status: string;
  _id: string;
};

type FetchMyTodosData = () => void;

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

// Reusable badge
const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses =
    "text-xs font-medium px-3 py-1 rounded-full w-fit inline-block";
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500 text-black",
    completed: "bg-green-500 text-white",
    inprogress: "bg-blue-500 text-white",
    "in-progress": "bg-blue-500 text-white",
  };

  return (
    <span className={`${baseClasses} ${statusStyles[status] || "bg-gray-500"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const TodoList: React.FC<TodoListProps> = ({ myTodos, fetchMyTodosData }) => {
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const changeStatusHandler = async (
    e: string,
    currentStatus: string,
    id: string
  ) => {
    if (e !== currentStatus)
      try {
        const res = await fetch(
          "https://todo-list-collab-server.onrender.com/todo/update-status",
          {
            method: "PATCH",
            body: JSON.stringify({
              id,
              status: e,
            }),
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.message === "Task status updated successfully" && data.status) {
          toast.success("Task Updated Successfully");
          fetchMyTodosData();
          if (!data.task?.isPrivate) {
            socket.emit("task-update", { task: data.task });
          }
        } else {
          toast.error("Failed to update task");
        }
      } catch (error) {
        console.log(error);
      }
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://todo-list-collab-server.onrender.com/todo/edit-todo",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id,
            title: editTitle,
            description: editDescription,
            dueDate: editDueDate,
            isPrivate: visibility === "private",
          }),
        }
      );

      const data = await res.json();
      if (data.status === true) {
        toast.success("Todo updated successfully");
        setEditDialogOpen(false);
        fetchMyTodosData();
        if (!data.task?.isPrivate) {
          socket.emit("task-update", { task: data.task });
        }
      } else {
        toast.error(data.message || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white w-full max-w-5xl shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold tracking-wide">Your Todos</h2>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-700">
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
                  <TableHead className="text-white">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTodos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400">
                      No todos found.
                    </TableCell>
                  </TableRow>
                ) : (
                  myTodos.map((todo, index) => (
                    <TableRow key={index}>
                      <TableCell
                        className={`font-medium ${
                          todo.status === "completed"
                            ? "line-through text-gray-400 opacity-70"
                            : ""
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
                          onValueChange={(e) =>
                            changeStatusHandler(e, todo.status, todo?._id)
                          }
                        >
                          <SelectTrigger className="w-[100px] bg-gray-800 text-white rounded-full">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In-Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-gray-700 text-white hover:bg-gray-600"
                              onClick={() => {
                                setEditTitle(todo.title);
                                setEditDueDate(todo.dueDate.slice(0, 10));
                                setEditDescription(todo.description);
                                setVisibility(todo.isPrivate ? "private" : "public");
                                setCurrentEditingId(todo._id);
                                setEditDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border border-gray-700 text-white">
                            <DialogHeader>
                              <DialogTitle>Edit Todo</DialogTitle>
                              <DialogDescription>
                                Update the details for this task.
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={(e) =>
                                currentEditingId &&
                                handleEditSubmit(e, currentEditingId)
                              }
                            >
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="title" className="text-right">
                                    Title
                                  </Label>
                                  <Input
                                    id="title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="col-span-3"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="dueDate" className="text-right">
                                    Due Date
                                  </Label>
                                  <Input
                                    id="dueDate"
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) =>
                                      setEditDueDate(e.target.value)
                                    }
                                    className="col-span-3"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="description" className="text-right">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="description"
                                    value={editDescription}
                                    onChange={(e) =>
                                      setEditDescription(e.target.value)
                                    }
                                    className="col-span-3"
                                    rows={3}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Select Visibility</Label>
                                  <Select
                                    value={visibility}
                                    onValueChange={setVisibility}
                                  >
                                    <SelectTrigger className="w-[180px] bg-gray-800 text-white">
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="private">Private</SelectItem>
                                      <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save changes</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoList;
