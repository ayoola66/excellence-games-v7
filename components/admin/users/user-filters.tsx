import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserFiltersProps {
  onSearch: (query: string) => void;
  onRoleChange: (role: string) => void;
}

export function UserFilters({ onSearch, onRoleChange }: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search users..."
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <select
        onChange={(e) => onRoleChange(e.target.value)}
        defaultValue=""
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="premium">Premium User</option>
      </select>
    </div>
  );
}
