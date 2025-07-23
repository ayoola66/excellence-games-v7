import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: string;
  gameId: number;
  category?: string;
}

interface QuestionCardProps {
  question: Question;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuestionCard({
  question,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="space-y-4">
          {/* Question Text */}
          <p className="font-medium line-clamp-3">{question.text}</p>

          {/* Options */}
          <div className="space-y-2 text-sm">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${
                  option === question.correctOption
                    ? "bg-green-100 dark:bg-green-900/20"
                    : "bg-muted"
                }`}
              >
                {option}
              </div>
            ))}
          </div>

          {/* Category Badge */}
          {question.category && (
            <Badge variant="outline" className="mt-2">
              {question.category}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex justify-end space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(question.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
