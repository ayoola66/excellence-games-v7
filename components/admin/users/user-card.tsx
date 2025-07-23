import { User } from "@/types/game";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const displayName = `${user.firstName} ${user.lastName}`;
  const address = [user.address, user.city, user.country, user.postalCode]
    .filter(Boolean)
    .join(", ");

  const subscriptionColor =
    user.playerSubscription === "premium"
      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200";

  const statusColor =
    user.confirmed && !user.blocked
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg truncate">{displayName}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <Badge className={cn("ml-2", subscriptionColor)}>
            {user.playerSubscription.charAt(0).toUpperCase() +
              user.playerSubscription.slice(1)}
          </Badge>
        </div>
        <Badge className={statusColor}>
          {user.confirmed && !user.blocked ? "Active" : "Blocked"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {user.phoneNumber && (
          <p className="text-sm">
            <span className="font-medium">Phone:</span> {user.phoneNumber}
          </p>
        )}
        {address && (
          <p className="text-sm break-words">
            <span className="font-medium">Address:</span> {address}
          </p>
        )}
        {user.subscriptionExpires && (
          <p className="text-sm">
            <span className="font-medium">Expires:</span>{" "}
            {new Date(user.subscriptionExpires).toLocaleDateString("en-GB")}
          </p>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit {displayName}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user)}
            className="text-red-600 hover:text-red-800 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete {displayName}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
