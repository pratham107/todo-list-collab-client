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
import { Card, CardContent, CardHeader } from "@/components/ui/card";



// Define Todo type
type Todo = {
  title: string;
  dueDate: string;
  isPrivate: boolean;
  description: string;
  status:string;
};

// Props for this component
type TodoListProps = {
  othersTodo: Todo[];
};

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

const OthersTodo: React.FC<TodoListProps> = ({ othersTodo }) => {
  function formatToDDMMYYYY(isoDateStr : string) {
  const date = new Date(isoDateStr);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}
  return (
   <div className="p-4 flex justify-center">
         <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white w-full max-w-5xl shadow-xl">
           <CardHeader>
             <h2 className="text-2xl font-semibold tracking-wide">Other Todos</h2>
           </CardHeader>
           <CardContent>
             <Table>
               <TableCaption className="text-gray-400">
                 Overview of your latest tasks.
               </TableCaption>
               <TableHeader>
                 <TableRow>
                   <TableHead className="text-white">Title</TableHead>
                   <TableHead className="text-white">Due Date</TableHead>
                   <TableHead className="text-white">Visibility</TableHead>
                   <TableHead className="text-white">Description</TableHead>
                   <TableHead className="text-white">Status</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {othersTodo.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={5} className="text-center text-gray-400">
                       No todos found.
                     </TableCell>
                   </TableRow>
                 ) : (
                   othersTodo.map((todo, index) => (
                     <TableRow key={index}>
                       <TableCell className="font-medium">{todo.title}</TableCell>
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

export default OthersTodo;
