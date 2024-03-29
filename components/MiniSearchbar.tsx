"use client";

import { Dispatch, SetStateAction } from "react";

import { Command, CommandInput } from "./ui/Command";

interface SearchbarProps {
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    placeholder: string;
}

const Searchbar = ({ input, setInput, placeholder }: SearchbarProps) => {
    return (
        <Command className="shrink relative w-[250px] rounded-lg border max-w-xl overflow-visible">
            <CommandInput
                className="outline-none border-none focus:border-none focus:outline-none ring-0 py-2"
                placeholder={placeholder}
                value={input}
                onValueChange={(text) => {
                    setInput(text);
                }}
            />
        </Command>
    )
};

export default Searchbar;