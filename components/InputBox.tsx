"use client";

import { UseFormReturn } from "react-hook-form";

import { Input } from "./ui/Input";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "./ui/Form";
import { QuestionPayload } from "@/lib/validators/question";

interface InputBoxProps {
    title: string;
    description: string;
    placeholder: string;
    name: "title";
    form: UseFormReturn<QuestionPayload, any, QuestionPayload>;
    isLoading: boolean;
}

const InputBox = ({
    title,
    description,
    placeholder,
    name,
    form,
    isLoading
}: InputBoxProps) => {
    return (
        <div className="border border-zinc-200 bg-white p-6 rounded-sm max-w-4xl">
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel children={
                            <>
                                <h3 className="font-bold text-zinc-800 text-base">{title}</h3>
                                <p className="text-[13px] text-zinc-600 mt-1">{description}</p>
                            </>
                        } />
                        <FormControl>
                            <Input
                                {...field}
                                placeholder={placeholder}
                                type='text'
                                disabled={isLoading}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
};

export default InputBox;