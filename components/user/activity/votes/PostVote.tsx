import moment from "moment";
import Link from "next/link";
import {
    IoMdArrowDropdown,
    IoMdArrowDropup
} from "react-icons/io";
import {
    RiQuestionnaireFill,
    RiChatCheckFill
} from "react-icons/ri";

import { VoteType } from "@/types/user";
import { Badge } from "@/components/ui/Badge";

interface PostVoteProps {
    type: VoteType;
    postType: "QUESTION" | "ANSWER";
    answerId?: string;
    questionId: string;
    votes: {
        type: VoteType;
    }[];
    answers?: {
        id: string;
    }[];
    views?: string[];
    title: string;
    tags: {
        name: string;
    }[];
    votedAt: Date;
    isLast: boolean;
}

const PostVote = ({
    type,
    postType,
    answerId,
    questionId,
    votes,
    answers,
    views,
    title,
    tags,
    votedAt,
    isLast
}: PostVoteProps) => {
    const votesAmt = votes.reduce((acc, vote) => {
        if (vote.type === 'UP') return acc + 1;
        if (vote.type === 'DOWN') return acc - 1;
        return acc;
    }, 0);

    return (
        <li className={`p-4 ${isLast ? "" : "border-b border-zinc-300"} flex flex-col lg:flex-row gap-3`}>
            <div className="flex flex-row lg:flex-col items-center gap-2">
                {type === "UP" ? (
                    <IoMdArrowDropup
                        title="up voted"
                        className="h-9 w-9 border border-slate-300 text-slate-800 rounded-full"
                    />
                ) : (
                    <IoMdArrowDropdown
                        title="down voted"
                        className="h-9 w-9 border border-slate-300 text-slate-800 rounded-full"
                    />
                )}
                {postType === "ANSWER" ? (
                    <RiChatCheckFill
                        title="answer"
                        className="h-6 w-6 text-emerald-800"
                    />
                ) : (
                    <RiQuestionnaireFill
                        title="question"
                        className="h-6 w-6 text-emerald-800"
                    />
                )}
            </div>
            <div className="flex-1">
                <div className="flex gap-3">
                    <span className="text-sm text-zinc-700" title={`Score of ${votesAmt}`}>
                        {votesAmt === 1 ? "1 vote" : `${votesAmt} votes`}
                    </span>
                    {answers && (
                        <span className="text-sm text-emerald-700" title={answers.length === 1 ? "1 answer" : `${answers.length} answers`}>
                            {answers.length === 1 ? "1 answer" : `${answers.length} answers`}
                        </span>
                    )}
                    {views && (
                        <span className="text-sm text-amber-700" title={views.length === 1 ? "1 view" : `${views.length} views`}>
                            {views.length === 1 ? "1 view" : `${views.length} views`}
                        </span>
                    )}
                </div>
                <Link href={`/questions/${questionId}${answerId ? `#${answerId}` : ""}`} className="inline-block text-blue-700 line-clamp-1 -mb-1 hover:text-blue-800">
                    {title}
                </Link>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-x-1.5">
                        {tags.map((tag) => (
                            <Link key={tag.name} href={`/questions/tagged/${tag.name}`}>
                                <Badge variant="secondary">{tag.name}</Badge>
                            </Link>
                        ))}
                    </div>
                    <div className="text-zinc-600 text-sm">voted on {moment(votedAt).calendar()}</div>
                </div>
            </div>
        </li>
    )
};

export default PostVote;