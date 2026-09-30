"use client";

import { ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import AuthLayout from "@/components/auth/auth-layout";
import RouteGuard from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useWebSocket } from "@/services/socket/WebSocketContext";

export default function ConnectedPage() {
    const { user_data } = usePosterReducers();
    const { isConnected, sendMessage } = useWebSocket();

    useEffect(() => {
        if (!isConnected) return;
        sendMessage("action", { type: "userService", action: "get", payload: {} });
    }, [isConnected, sendMessage]);

    const user = user_data?.user;
    const relationship = user?.relationships?.[0];
    const partner = relationship?.partner;

    const userName = `${user?.firstName ?? ""}`.trim() || "You";
    const userInitial = userName
        ? userName?.charAt(0)?.toUpperCase()
        : "?";
    const partnerName =
        `${partner?.firstName ?? ""}`.trim() ||
        "Your Partner";

    const partnerInitial = partnerName
        ? partnerName?.charAt(0)?.toUpperCase()
        : "?";

    return (
        <RouteGuard>
            <AuthLayout>
                <div className="h-full overflow-y-auto scrollbar-hidden">
                    <div className="mx-auto min-h-full w-full max-w-2xl items-center justify-center px-4 sm:px-6 lg:px-8">
                        <div className="w-full max-w-xl text-center sm:p-8 lg:p-10">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                                <Image
                                    width={80}
                                    height={80}
                                    src={APP_URL.IMAGES.LOGO_BADGE}
                                    alt="UnionAI"
                                />
                            </div>

                            <p className="mt-2 text-base font-medium text-muted-foreground">
                                Union Created Successfully
                            </p>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-wide text-foreground sm:text-3xl">
                                You&apos;re Connected!
                            </h1>

                            <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-6">
                                <div className="min-w-0">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xl font-semibold text-primary ring-4 ring-primary/5">
                                        {user?.profileImage ? (
                                            <Image
                                                width={70}
                                                height={70}
                                                src={API_BASE_URL + user?.profileImage}
                                                alt={userName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            userInitial
                                        )}
                                    </div>
                                    <p className="mt-3 truncate sm:text-xl text-lg font-bold text-muted-foreground" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                                        {userName}
                                    </p>
                                </div>

                                <div className="mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/30 sm:mt-6 sm:h-12 sm:w-12">
                                    <Heart className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
                                </div>

                                <div className="min-w-0">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xl font-semibold text-primary ring-4 ring-primary/5">
                                        {partner?.profileImage ? (
                                            <Image
                                                width={80}
                                                height={80}
                                                src={API_BASE_URL + partner?.profileImage}
                                                alt={partnerName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            partnerInitial
                                        )}
                                    </div>
                                    <p className="mt-3 truncate sm:text-xl text-lg font-bold text-muted-foreground" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                                        {partnerName}
                                    </p>
                                </div>
                            </div>

                            <p className="mx-auto mt-7 max-w-sm text-sm leading-6 text-muted-foreground sm:mt-8">
                                The foundation of your shared sanctuary is set. Today marks the beginning of a deeper, more intentional journey together.
                            </p>

                            <Button asChild className="auth-submit mt-8 w-full sm:mt-10 sm:max-w-sm">
                                <Link href={APP_URL.LINKS.DASHBOARD}>
                                    Start Your Journey
                                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </AuthLayout>
        </RouteGuard>
    );
}
