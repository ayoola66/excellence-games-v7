import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Game } from "@/types/game";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: string;
  gameId: number;
  category?: string;
}

interface QuestionFormProps {
  question?: Question;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  game?: Game;
  selectedCategory?: string;
}

const formSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctOption: z.enum(["optionA", "optionB", "optionC", "optionD"], {
    required_error: "Please select the correct answer",
  }),
});

type FormData = z.infer<typeof formSchema>;

const getCorrectOptionValue = (
  option: string | undefined
): "optionA" | "optionB" | "optionC" | "optionD" | undefined => {
  if (!option) return undefined;
  const optionMap: Record<
    string,
    "optionA" | "optionB" | "optionC" | "optionD"
  > = {
    A: "optionA",
    B: "optionB",
    C: "optionC",
    D: "optionD",
  };
  return optionMap[option.charAt(0).toUpperCase()];
};

export function QuestionForm({
  question,
  onSubmit,
  onCancel,
  game,
  selectedCategory,
}: QuestionFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: question?.text || "",
      optionA: question?.options[0] || "",
      optionB: question?.options[1] || "",
      optionC: question?.options[2] || "",
      optionD: question?.options[3] || "",
      correctOption: getCorrectOptionValue(question?.correctOption),
    },
  });

  const handleSubmit = form.handleSubmit(async (values: FormData) => {
    const formattedData = {
      text: values.text,
      options: [values.optionA, values.optionB, values.optionC, values.optionD],
      correctOption: values[values.correctOption],
      gameId: game?.id,
      category: game?.type === "nested" ? selectedCategory : undefined,
    };

    await onSubmit(formattedData);
  });

  if (!game) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please select a game first
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="optionA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option A</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionB"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option B</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option C</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionD"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option D</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="correctOption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="optionA">Option A</SelectItem>
                  <SelectItem value="optionB">Option B</SelectItem>
                  <SelectItem value="optionC">Option C</SelectItem>
                  <SelectItem value="optionD">Option D</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
