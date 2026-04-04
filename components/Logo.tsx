import React from "react";

const Logo: React.FC<{
  className?: string;
  iconOnly?: boolean;
  textColor?: string;
}> = ({ className = "h-8", iconOnly = false, textColor }) => {
  const [logoSrc, setLogoSrc] = React.useState("/logo.svg");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Nexen Logo"
        className="h-full w-auto object-contain"
        onError={() => {
          if (logoSrc !== "/nexen%20connecting%20founders.png") {
            setLogoSrc("/nexen%20connecting%20founders.png");
          }
        }}
      />
      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`text-xs font-black tracking-tighter leading-none uppercase ${textColor || "text-slate-900 dark:text-white"}`}
            style={{ letterSpacing: "0.05em", fontSize: "25px" }}
          >
            NEXEN
          </span>
          <span className="text-[12px] font-bold tracking-[0.2em] text-blue-600 dark:text-cyan-400 uppercase leading-none mt-0.5">
            Connecting Founders
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
