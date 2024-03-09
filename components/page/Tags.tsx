"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { notFound, useSearchParams } from "next/navigation";

import Loader from "../Loader";
import TabsBox from "../TabsBox";
import Searchbar from "../Searchbar";
import TagDetails from "../TagDetails";
import AuthModal from "../auth/AuthModal";
import PaginationBox from "../PaginationBox";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger
} from "../ui/HoverCard";
import { Badge } from "../ui/Badge";
import { getTags } from "@/actions/tag/getTags";
import { watchTag } from "@/actions/tag/watchTag";
import { ignoreTag } from "@/actions/tag/ignoreTag";
import { GetTagsPayload } from "@/lib/validators/tag";
import { TAGS_PER_PAGE, tagsTabs } from "@/constants";
import { useCurrentUser } from "@/hooks/use-current-user";
import { IgnoreValues, TagData, WatchValues } from "@/types/tag";

type Tab = "popular" | "name" | "new";

const isValidTab = (value: string) => {
    const isValid = tagsTabs.find((tab) => tab.value === value);
    if (!!isValid) return true;
    return false;
};

const Tags = () => {
    const user = useCurrentUser();
    const [input, setInput] = useState("");
    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";
    const tab = searchParams.get("tab") || "popular";
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [ignoredTagIds, setIgnoredTagIds] = useState(user?.ignoredTagIds || []);
    const [watchedTagIds, setWatchedTagIds] = useState(user?.watchedTagIds || []);

    const fetchTags = async () => {
        if (isValidTab(tab)) {
            const payload: GetTagsPayload = { tab: tab as Tab, page: Number(page), limit: TAGS_PER_PAGE };
            const data = await getTags(payload);
            return data as TagData;
        } else {
            throw new Error("Invalid tab");
        }
    };

    const {
        data,
        isFetching
    } = useQuery({
        queryKey: ["tags", { tab, page }],
        queryFn: fetchTags
    });

    const {
        mutate: watch,
        isPending: isWatchLoading
    } = useMutation({
        mutationFn: async (values: WatchValues) => {
            const payload = { tagId: values.tagId };
            await watchTag(payload);
        },
        onSuccess: (_, values: WatchValues) => {
            if(values.type === "watch") {
                // If the user is clicking the `Watch tag` button,
                // Remove the tag id from the ignoredTagIds (in case if they have ignored the tag) & add it to watchedTagIds
                const newIgnoredTagIds = ignoredTagIds.filter((id) => id !== values.tagId);
                const newWatchedTagIds = [...watchedTagIds, values.tagId];
                setIgnoredTagIds(newIgnoredTagIds);
                setWatchedTagIds(newWatchedTagIds);
                values.setWatchersCount((prev: number) => prev + 1); // Increament the watchers count
            } else if(values.type === "unwatch") {
                // If the user is clicking the `Unwatch tag` button,
                // Simply remove the tag id from the watchedTagIds
                const newWatchedTagIds = watchedTagIds.filter((id) => id !== values.tagId);
                setWatchedTagIds(newWatchedTagIds);
                values.setWatchersCount((prev: number) => prev - 1); // Decreament the watchers count
            }
        },
        onError: (error) => {
            // TODO - Alert the user about the error
            console.log("Something went wrong", error);
        }
    });

    const {
        mutate: ignore,
        isPending: isIgnoreLoading
    } = useMutation({
        mutationFn: async (values: IgnoreValues) => {
            if(user && user.id) {
                const payload = { tagId: values.tagId };
                await ignoreTag(payload);
            } else {
                setShowAuthModal(true);
            }
        },
        onSuccess: (_, values: IgnoreValues) => {
            if(values.type === "ignore") {
                // If the user is clicking the `Ignore tag` button,
                // Remove the tag id from the watchedTagIds (in case if they have watched the tag) & add it to ignoredTagIds
                const newWatchedTagIds = watchedTagIds.filter((id) => id !== values.tagId);
                const newIgnoredTagIds = [...ignoredTagIds, values.tagId];
                if(newWatchedTagIds.length < watchedTagIds.length) {
                    // If the user had previously watched the tag, decreament the watchers count
                    values.setWatchersCount((prev: number) => prev - 1);
                }
                setWatchedTagIds(newWatchedTagIds);
                setIgnoredTagIds(newIgnoredTagIds);
            } else if(values.type === "unignore") {
                // If the user is clicking the `Unignore tag` button,
                // Simply remove the tag id from the ignoredTagIds
                const newIgnoredTagIds = ignoredTagIds.filter((id) => id !== values.tagId);
                setIgnoredTagIds(newIgnoredTagIds);
            }
        },
        onError: (error) => {
            // TODO - Alert the user about the error
            console.log("Something went wrong", error);
        }
    });

    if (!isValidTab(tab)) return notFound();

    return (
        <>
            {showAuthModal && (
                <AuthModal setShow={setShowAuthModal} />
            )}
            <section className="flex-1 p-4">
                <header>
                    <h1 className="text-2xl font-medium text-zinc-800">Tags</h1>
                    <p className="text-[15px] text-zinc-800 my-3 max-w-2xl">A tag is a keyword or label that categorizes your question with other, similar questions. Using the right tags makes it easier for others to find and answer your question.</p>
                </header>

                <div className="flex items-center justify-between mb-3">
                    <Searchbar
                        input={input}
                        setInput={setInput}
                        placeholder="Filter by tag name"
                    />
                    <TabsBox
                        route="/tags"
                        tabs={tagsTabs}
                        value={tab}
                    />
                </div>

                {isFetching ? (
                    <Loader type="half" />
                ) : (
                    data?.tags && data.tags.length ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-px mb-3">
                            {data.tags.map((tag) => {
                                if (tag.name.includes(input)) {
                                    const isWatchedTag = watchedTagIds.find((id) => id === tag.id);
                                    const isIgnoredTag = ignoredTagIds.find((id) => id === tag.id);

                                    return (
                                        <li key={tag.id} className="border border-zinc-300 p-3 rounded-sm">
                                            <HoverCard>
                                                <HoverCardTrigger>
                                                    <Link href={`/questions/tagged/${tag.name}`}>
                                                        <Badge variant={isIgnoredTag ? "outline" : "secondary"}>
                                                            {isWatchedTag && (
                                                                <IoMdEye className="h-4 w-4 mr-0.5" />
                                                            )}
                                                            {isIgnoredTag && (
                                                                <IoMdEyeOff className="h-4 w-4 mr-0.5" />
                                                            )}
                                                            {tag.name}
                                                        </Badge>
                                                    </Link>
                                                </HoverCardTrigger>
                                                <HoverCardContent>
                                                    <TagDetails
                                                        tagId={tag.id}
                                                        tagName={tag.name}
                                                        watcherIds={tag.watcherIds}
                                                        questionIds={tag.questionIds}
                                                        description={tag.description}
                                                        isWatchedTag={!!isWatchedTag}
                                                        isIgnoredTag={!!isIgnoredTag}
                                                        isWatchLoading={isWatchLoading}
                                                        isIgnoreLoading={isIgnoreLoading}
                                                        handleWatch={watch}
                                                        handleIgnore={ignore}
                                                        isLoggedIn={!!user}
                                                        setShowAuthModal={setShowAuthModal}
                                                    />
                                                </HoverCardContent>
                                            </HoverCard>
                                            {/* <Link href={`/questions/tagged/${tag.name}`}>
                                                <Badge variant="secondary">{tag.name}</Badge>
                                            </Link> */}
                                            <p className="text-sm text-zinc-700 my-3 line-clamp-4">{tag.description ? tag.description : ""}</p>
                                            <div className="flex justify-between gap-3 text-[13px] text-zinc-500">
                                                <span>{tag.questionIds.length} questions</span>
                                                <span>1 asked today, 2 this week</span>
                                            </div>
                                        </li>
                                    )
                                }
                                return null;
                            })}
                        </ul>
                    ) : (
                        <div className="text-center text-zinc-400 text-[15px] py-10">No tags to show</div>
                    )
                )}

                {data?.tags && (
                    <PaginationBox
                        isFiltering={input.length > 0}
                        location={`/tags?tab=${tab}&`}
                        currentPage={Number(page)}
                        lastPage={data?.lastPage}
                    />
                )}
            </section>
        </>
    )
};

export default Tags;