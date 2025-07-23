import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionForm } from "./question-form";
import { Game } from "@/types/game";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: string;
  gameId: number;
  category?: string;
}

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question;
  onSave: (data: any) => Promise<void>;
  game?: Game;
  selectedCategory?: string;
}

export function EditDialog({
  open,
  onOpenChange,
  question,
  onSave,
  game,
  selectedCategory,
}: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {question ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        <QuestionForm
          question={question}
          onSubmit={onSave}
          onCancel={() => onOpenChange(false)}
          game={game}
          selectedCategory={selectedCategory}
        />
      </DialogContent>
    </Dialog>
  );
}
