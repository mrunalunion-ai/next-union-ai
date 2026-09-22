"use client";

import AuthLayout from "@/components/auth/auth-layout";
import { RegistrationStepIndicator } from "@/components/auth/registration-step-indicator";
import RouteGuard from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { ArrowBigUpDash, Copy, RefreshCw, UserRoundCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function CodeCreate() {
    const router = useRouter();
    const { user_data } = usePosterReducers();
    const { isConnected, lastEvent, sendMessage } = useWebSocket();
    const UNIONCODE = user_data?.user?.relationships?.[0]?.unionCode;
    const currentUser = user_data?.user;
    const relationship = currentUser?.relationships?.[0];
    const partner = relationship?.partner;
    const partnerName = partner
        ? `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim()
        : "";

    useEffect(() => {
        if (!isConnected) return;
        sendMessage("action", {
            type: "relationStatusService",
            action: "list",
            payload: { page: 1, limit: 10, search: "", active: true },
        });
        sendMessage("action", { type: "userService", action: "get", payload: {} });
    }, [isConnected]);

    const copyCode = async () => {
        await navigator.clipboard?.writeText(UNIONCODE);
        toast.success("Union Code copied.");
    };

    const DeleteUnionCode = () => {
        sendMessage("action", {
            type: "userService",
            action: "delete",
            payload: { unionCode: UNIONCODE },
        });
    };

    const acceptConnection = () => {
        sendMessage("action", {
            type: "userService",
            action: "acceptConnection",
            payload: { unionCode: UNIONCODE, partnerId: relationship?.partner?.id },
        });
    };

    const rejectConnection = () => {
        sendMessage("action", {
            type: "userService",
            action: "cancelConnection",
            payload: { unionCode: UNIONCODE },
        });
    };

    useEffect(() => {
        if (
            lastEvent?.data?.status &&
            lastEvent?.data?.request?.type === "userService"
        ) {
            if (lastEvent?.data?.request?.action === "delete") {
                router.push(APP_URL.LINKS.CREATE_UNION);
            }
            if (lastEvent?.data?.request?.action === "acceptConnection") {
                router.push(APP_URL.LINKS.CONNECTED)
            }
            if (lastEvent?.data?.request?.action === "cancelConnection") {
                sendMessage("action", { type: "userService", action: "get", payload: {} });
            }
        }
        if (lastEvent?.event === "send_request") {
            sendMessage("action", { type: "userService", action: "get", payload: {} });
        }
    }, [lastEvent]);

    return (
        <RouteGuard>
            <AuthLayout>
                <div className="h-full overflow-y-auto scrollbar-hidden">
                    <div className="mx-auto w-full max-w-[600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                        <header className="mb-7 text-center">
                            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                                Union Connection
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                 Share this Union Code with your partner. Once they enter the code, you&apos;ll receive a connection request. Accept the request to link your accounts and start using the app together.
                            </p>
                        </header>
                        <RegistrationStepIndicator
                            currentStep={3}
                            className="mb-8 w-full max-w-[600px]"
                        />
                        <div className="mx-auto max-w-[600px] space-y-4">
                            <section className="rounded-2xl border border-border/70 bg-surface p-5 text-center shadow-sm sm:p-6">
                                <div className="mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground font-semibold uppercase tracking-[0.12em]">
                                    Your Code
                                </div>
                                <p className="mt-3 break-all text-3xl font-extrabold tracking-[0.12em] text-foreground sm:text-4xl">
                                    {UNIONCODE}
                                </p>
                                <div className="flex justify-center gap-5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-5 h-10 rounded-lg px-5"
                                        onClick={copyCode}
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy code
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-5 h-10 rounded-lg !px-10"
                                        onClick={copyCode}
                                    >
                                        <ArrowBigUpDash className="mr-2 h-5 w-5" />
                                        Invite
                                    </Button>
                                </div>
                            </section>
                            {user_data?.user?.onboardingStep === "connectionRequestReceived" ? (
                                <>
                                    <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 shadow-sm sm:p-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                                                <UserRoundCheck className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <h2 className="mt-3 text-sm font-medium text-foreground">
                                                Union Connection Request
                                            </h2>
                                            <p className="mt-1 text-sm leading-5 text-foreground">
                                                You have received a connection request
                                                <br />
                                                for your Union Code from:
                                            </p>
                                            <div className="mt-1 text-sm leading-5 text-foreground">
                                                <p>{partnerName}</p>
                                                <a
                                                    href={`mailto:${partner?.email}`}
                                                    className="underline underline-offset-2"
                                                >
                                                    {partner?.email}
                                                </a>
                                            </div>
                                            <p className="mt-1 text-sm text-foreground">
                                                Is this your partner?
                                            </p>
                                            <Button
                                                type="button"
                                                variant="green"
                                                className="!h-11 mt-5 w-full rounded-lg shadow-sm"
                                                onClick={acceptConnection}
                                            >
                                                Yes, This Is My Partner
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="!h-11 mt-4 w-full rounded-lg shadow-sm"
                                                onClick={rejectConnection}
                                            >
                                                No, This Is Not My Partner
                                            </Button>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <>
                                    <section className="rounded-2xl border border-primary/25 bg-primary/10 p-5 shadow-sm sm:p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center text-primary">
                                                <RefreshCw
                                                    className="h-4 w-4 animate-spin"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <p className="text-base font-medium text-primary">
                                                Awaiting Partner...
                                            </p>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-sm text-justify leading-[1.45] text-muted-foreground">
                                                Waiting for Your Partner <br />  Your partner needs to enter your Union Code and send you a
                                                connection request. Once you receive the request, accept it to
                                                link your accounts and start using the app together.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            className="auth-submit !mt-5"
                                            disabled={true}
                                        >
                                             Let&apos;s Start
                                        </Button>
                                    </section>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="h-11 w-full rounded-lg shadow-sm"
                                        onClick={DeleteUnionCode}
                                    >
                                        Cancel This Union Code
                                    </Button>
                                </>)}
                        </div>
                    </div>
                </div>
            </AuthLayout>
        </RouteGuard >
    );
}
