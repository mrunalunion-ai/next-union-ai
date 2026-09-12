"use client";

import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

import AuthLayout from "@/components/auth/auth-layout";
import RouteGuard from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useEffect } from "react";
import { useWebSocket } from "@/services/socket/WebSocketContext";

export default function ConnectedPage() {
    const { user_data } = usePosterReducers();
    const { isConnected, lastEvent, sendMessage } = useWebSocket();

    useEffect(() => {
        if (!isConnected) return;
        sendMessage("action", { type: "userService", action: "get", payload: {} });
    }, [isConnected]);

    const user = user_data?.user;
    const relationship = user?.relationships?.[0];
    const partner = relationship?.partner;

    const userName = user?.firstName?.trim() || "You";

    const partnerName =
        `${partner?.firstName ?? ""} ${partner?.lastName ?? ""}`.trim() ||
        "Your Partner";

    return (
        <RouteGuard>
            <AuthLayout>
                <div className="h-full overflow-y-auto scrollbar-hidden">
                    <div className="mx-auto flex min-h-full w-full max-w-[450px] flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">

                        {/* Main Content */}
                        <div className="flex flex-col items-center text-center">

                            {/* Logo */}
                            <div className="flex items-center justify-center">
                                <img
                                    src={APP_URL.IMAGES.LOGO_BADGE}
                                    alt="UnionAI"
                                    className="h-20 w-20"
                                />
                            </div>

                            {/* Success Text */}
                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                Union Created Successfully
                            </p>

                            {/* Heading */}
                            <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-foreground sm:text-3xl">
                                You&apos;re Connected!
                            </h1>

                            {/* Couple Names */}
                            <div
                                className="mt-6 flex items-center justify-center gap-1.5 text-xl text-muted-foreground sm:text-2xl"
                                style={{ fontFamily: '"Kaushan Script", cursive' }}
                            >
                                <span>{userName}</span>
                                <span className="text-2xl" aria-hidden="true">
                                    ❤️
                                </span>
                                <span>{partnerName}</span>
                            </div>

                            {/* Description */}
                            <p className="mx-auto mt-6 text-xs leading-[1.5] text-muted-foreground sm:text-sm">
                                The foundation of your shared sanctuary is <br />
                                set. Today marks the beginning of a
                                <br className="hidden sm:block" />
                                deeper, more intentional journey together.
                            </p>
                        </div>

                        {/* Start Button */}
                        <Button
                            asChild
                            className="
                                auth-submit !mt-10
                            "
                        >
                            <Link href={APP_URL.LINKS.DASHBOARD}>
                                Start Your Journey
                                <ArrowRight
                                    className="ml-2 h-4 w-4"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                            </Link>
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        </RouteGuard>
    );
}
