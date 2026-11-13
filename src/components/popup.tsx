"use client";

import Image from "next/image";
import { useEffect, useId, useState, type FormEvent } from "react";
import { X } from "lucide-react";

export function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const titleId = useId();

    useEffect(() => {
        const popupKey = "zinnaNewsletterShown";

        const navigationEntry = performance.getEntriesByType(
            "navigation",
        )[0] as PerformanceNavigationTiming | undefined;

        const isReload = navigationEntry?.type === "reload";

        if (isReload) {
            sessionStorage.removeItem(popupKey);
        }

        if (sessionStorage.getItem(popupKey)) {
            return;
        }

        let timeoutId: ReturnType<typeof setTimeout>;

        function openAfterPageLoad() {
            timeoutId = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem(popupKey, "true");
            }, 2000);
        }

        if (document.readyState === "complete") {
            openAfterPageLoad();
        } else {
            window.addEventListener("load", openAfterPageLoad);
        }

        return () => {
            window.removeEventListener("load", openAfterPageLoad);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setSubmitted(true);
        } catch {
            setErrorMessage(
                "We could not subscribe you right now. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="newsletterPopupBackdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-2 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    setIsOpen(false);
                }
            }}
        >
            <div className="newsletterPopupCard relative grid max-h-[60vh] w-full max-w-2xl overflow-y-auto bg-white text-black sm:grid-cols-2 sm:overflow-hidden">
                <div className="relative min-h-[100px] lg:min-h-[200px] lg:min-w-[50px]">
                    <Image
                        src="/images/moody.png"
                        alt="Zinna clothing collection"
                        fill
                        sizes="(max-width: 100px) 100vw, 50vw"
                        className="object-contain"
                        priority
                    />
                </div>

                <div className="relative flex min-h-[360px] flex-col justify-center px-7 py-12 sm:px-12">
                    <button
                        type="button"
                        aria-label="Close newsletter popup"
                        onClick={() => setIsOpen(false)}
                        className="absolute right-5 top-5 text-black/40 transition-colors hover:text-black"
                    >
                        <X className="size-6" />
                    </button>

                    <p className="text-sm uppercase tracking-[0.18em] text-black/60">
                        Sign up to newsletter
                    </p>

                    <h2
                        id={titleId}
                        className="mt-5 max-w-sm text-2xl font-medium leading-tight sm:text-4xl lg:text-2xl lg:pb-10"
                    >
                        Enjoy 15% off from your first order.
                    </h2>

                    {submitted ? (
                        <p className="mt-8 text-sm text-black/70">
                            Thank you for joining the Zinna community.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8">
                            <label
                                htmlFor="newsletterEmail"
                                className="mb-2 block text-sm text-black/70"
                            >
                                Email
                            </label>

                            <input
                                id="newsletterEmail"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                className="h-12 w-full border border-black/15 bg-black/[0.03] px-4 text-sm outline-none transition-colors focus:border-black"
                            />
                            {errorMessage && (
                                <p className="mt-3 text-sm text-red-600">
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-5 h-12 w-full bg-black text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button> 
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}