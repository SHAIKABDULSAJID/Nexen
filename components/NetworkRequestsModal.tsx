import React from "react";
import { X, UserCheck, UserX } from "lucide-react";
import { getAvatarSrc } from "../utils/avatar";

interface NetworkRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string) => void;
}

const NetworkRequestsModal: React.FC<NetworkRequestsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  const requests = [
    {
      id: "req1",
      name: "Tanay Pratap",
      role: "CEO @ Invact",
      avatar: "https://picsum.photos/id/101/100/100",
    },
    {
      id: "req2",
      name: "Suhas Motwani",
      role: "Founder @ The Product Folks",
      avatar: "https://picsum.photos/id/102/100/100",
    },
    {
      id: "req3",
      name: "Varun Mayya",
      role: "Founder @ Scenes",
      avatar: "https://picsum.photos/id/103/100/100",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-slate-900/90 backdrop-blur-xl w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="font-black text-white flex items-center gap-2">
            Network Requests{" "}
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              3
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarSrc(req.avatar)}
                  className="w-10 h-10 rounded-xl object-cover"
                  alt={req.name}
                />
                <div>
                  <p className="text-sm font-bold text-white leading-none mb-1">
                    {req.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {req.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                  <UserX className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition-colors">
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white/5 border-t border-white/10">
          <button className="w-full py-2.5 text-xs font-bold text-blue-400 hover:underline">
            Manage all network
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkRequestsModal;
