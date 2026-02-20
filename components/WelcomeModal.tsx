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
                    <p className="leading-relaxed">Get 0.01 Pi in two steps:</p>

                    <ol className="list-decimal list-inside space-y-3 pl-1">
                        <li>
                            <span className="font-semibold text-gray-800">Login</span> – Connect your Pi account. Your wallet is detected automatically when available.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Claim</span> – One tap to receive 0.01 Pi and release your lockups. If your wallet wasn’t detected, you’ll be asked to enter it first.
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
