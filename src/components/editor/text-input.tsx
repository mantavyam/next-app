"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { textInputSchema } from "@/lib/validations/handwriting-schema"
import type { TextInputSchema } from "@/lib/validations/handwriting-schema"
import { toast } from "sonner"

interface TextInputProps {
  value: string
  onChange: (value: string) => void
}

export function TextInput({ value, onChange }: TextInputProps) {
  const form = useForm<TextInputSchema>({
    resolver: zodResolver(textInputSchema),
    defaultValues: {
      text: value,
    },
  })

  const onSubmit = (data: TextInputSchema) => {
    onChange(data.text)
    toast.success("Text updated successfully")
  }

  const onError = () => {
    toast.error("Invalid text input", {
      description: "Please check the validation errors below.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Text</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-2">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="text">Type or paste your text here</Label>
            <Textarea
              id="text"
              {...form.register("text")}
              placeholder="Enter the text you want to convert to handwriting..."
              className="min-h-[200px]"
              onChange={(e) => {
                form.setValue("text", e.target.value)
                onChange(e.target.value)
              }}
            />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive">
                {form.formState.errors.text.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}