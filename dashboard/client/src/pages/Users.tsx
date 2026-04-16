import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, MoreHorizontal, Ban, ArrowUpDown, Shield } from "lucide-react";
import { mockUsers } from "../data/mock-data";
import type { User } from "../types";

const planColors: Record<string, string> = {
  Free: "bg-muted text-muted-foreground",
  Pro: "bg-primary/15 text-primary",
  Ultra: "bg-chart-2/15 text-chart-2",
  Enterprise: "bg-chart-3/15 text-chart-3",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/15 text-green-500",
  inactive: "bg-yellow-500/15 text-yellow-500",
  banned: "bg-red-500/15 text-red-500",
};

export default function Users() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">User Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage platform users and their plans</p>
      </div>

      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 w-64 text-sm"
                  data-testid="input-search-users"
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="h-8 w-32 text-sm" data-testid="select-plan-filter">
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Ultra">Ultra</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredUsers.length} users
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">API Calls</TableHead>
                <TableHead className="text-xs">Last Active</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                  data-testid={`row-user-${user.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] font-medium ${planColors[user.plan]}`}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] font-medium capitalize ${statusColors[user.status]}`}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {user.apiCalls.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.lastActive)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-user-actions-${user.id}`}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                          Change plan
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-3.5 w-3.5" />
                          Ban user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="text-sm font-medium mt-0.5">{selectedUser.plan}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">{selectedUser.status}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">API Calls</p>
                  <p className="text-sm font-medium mt-0.5">{selectedUser.apiCalls.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm font-medium mt-0.5">{new Date(selectedUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="text-xs">
                  <ArrowUpDown className="mr-1.5 h-3 w-3" />
                  Change Plan
                </Button>
                <Button variant="secondary" size="sm" className="text-xs">
                  <Shield className="mr-1.5 h-3 w-3" />
                  Reset Password
                </Button>
                <Button variant="destructive" size="sm" className="text-xs">
                  <Ban className="mr-1.5 h-3 w-3" />
                  Ban
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
