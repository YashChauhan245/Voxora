import { ShipWheelIcon } from "lucide-react";

const BrandMark = ({ className = "size-9" }) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-xl bg-[#0f0f14] ${className}`}>
      <ShipWheelIcon className="size-[72%] text-green-500" strokeWidth={2.6} />
    </span>
  );
};

export default BrandMark;
