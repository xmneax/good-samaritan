import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg bg-gray-100">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800 text-center">Welcome, Pioneer!</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Many Pioneers face a common issue: they lack the crucial <span className="font-semibold text-indigo-600">0.01 Pi</span> required to move their locked-up
                        funds to their available balance. This app is designed to help you overcome that hurdle!
                    </p>

                    <p className="text-gray-700 leading-relaxed">Here&#39;s how you can get your lockups released:</p>

                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                        {/*                        <li>
                            <span className="font-semibold">Login with Pi Account:</span> Securely connect your Pi account.
                        </li>*/}
                        <li>
                            <span className="font-semibold">Enter Wallet Address:</span> Provide your Pi wallet address for verification.
                        </li>
                        <li>
                            <span className="font-semibold">Watch an Ad:</span> A short ad will play. Watching it fully helps support the ecosystem.
                        </li>
                        <li>
                            <span className="font-semibold">Receive 0.01 Pi:</span> Once the ad is complete, we&#39;ll facilitate the 0.01 Pi transfer to your wallet, enabling your
                            lockup release!
                        </li>
                    </ol>
                </div>

                <DialogFooter className="flex justify-center items-center">
                    <DialogClose asChild>
                        <button className="!w-fit bg-red-400 !text-white py-2 px-6 cursor-pointer rounded-md font-semibold">Close</button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
