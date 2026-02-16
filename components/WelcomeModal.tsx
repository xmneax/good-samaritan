import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg bg-white border-violet-100 shadow-xl shadow-violet-100/30">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800 text-center">Welcome, Pioneer!</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 text-gray-600">
                    <p className="leading-relaxed">
                        Many Pioneers face a common issue: they lack the crucial <span className="font-semibold text-violet-600">0.01 Pi</span> required to move their locked-up
                        funds to their available balance. This app is designed to help you overcome that hurdle!
                    </p>

                    <p className="leading-relaxed">Here&#39;s how you can get your lockups released:</p>

                    <ol className="list-decimal list-inside space-y-3 pl-1">
                        <li>
                            <span className="font-semibold text-gray-800">Enter Wallet Address:</span> Provide your Pi wallet address for verification.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Watch an Ad:</span> A short ad will play. Watching it fully helps support the ecosystem.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Receive 0.01 Pi:</span> Once the ad is complete, we&#39;ll facilitate the 0.01 Pi transfer to your wallet, enabling your
                            lockup release!
                        </li>
                    </ol>
                </div>

                <DialogFooter className="flex justify-center items-center pt-2">
                    <DialogClose asChild>
                        <button className="w-fit bg-violet-500 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-violet-600 transition-colors cursor-pointer">Close</button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
